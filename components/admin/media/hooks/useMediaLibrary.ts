import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MediaAsset, MediaFolder, MediaStats, MediaMetadata } from '@/app/admin/modern/media/types';

export interface UseMediaLibraryOptions {
  initialFolderId?: string | null;
  initialViewMode?: 'grid' | 'list';
  pageSize?: number;
  enableAutoRefresh?: boolean;
  refreshInterval?: number; // ms
}

export interface UseMediaLibraryFilters {
  search?: string;
  type?: string | null;
  sizeCategory?: 'small' | 'medium' | 'large' | null; // لاحقاً
  orientation?: 'portrait' | 'landscape' | 'square' | null; // لاحقاً
  dateRange?: { from: Date; to: Date } | null;
  tags?: string[];
}

export interface UseMediaLibraryState {
  folders: MediaFolder[];
  assets: MediaAsset[];
  stats: MediaStats | null;
  loading: boolean;
  uploading: boolean;
  currentFolder: MediaFolder | null;
  viewMode: 'grid' | 'list';
  filters: UseMediaLibraryFilters;
  selectedAssets: Set<string>; 
  selectedFolders: Set<string>;
}

export interface UseMediaLibraryApi {
  state: UseMediaLibraryState;
  setViewMode: (m: 'grid' | 'list') => void;
  setFilters: (f: Partial<UseMediaLibraryFilters>) => void;
  setCurrentFolderById: (id: string | null) => void;
  refresh: () => Promise<void>;
  selectAsset: (id: string, multi?: boolean) => void;
  selectFolder: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  uploadFiles: (files: FileList | File[]) => Promise<{ success: number; failed: number }>;
  createFolder: (name: string, parentId?: string | null) => Promise<boolean>;
  renameFolder: (id: string, name: string) => Promise<boolean>;
  deleteFolders: (ids: string[]) => Promise<number>;
  deleteAssets: (ids: string[]) => Promise<number>;
  moveAssets: (assetIds: string[], folderId: string | null) => Promise<void>;
  moveFolders: (folderIds: string[], parentId: string | null) => Promise<void>;
  updateAssetMeta: (assetId: string, meta: Partial<MediaMetadata>) => Promise<boolean>;
}

export function useMediaLibrary(options: UseMediaLibraryOptions = {}): UseMediaLibraryApi {
  const {
    initialFolderId = null,
    initialViewMode = 'grid',
    pageSize = 60,
    enableAutoRefresh = false,
    refreshInterval = 60_000,
  } = options;

  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<MediaFolder | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [filters, setFiltersState] = useState<UseMediaLibraryFilters>({});
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());

  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch logic
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      // Folders
      const foldersRes = await fetch('/api/admin/media/folders');
      if (foldersRes.ok) {
        const data = await foldersRes.json();
        setFolders(data.folders || []);
        if (initialFolderId && !currentFolder) {
          const f = data.folders.find((x: MediaFolder) => x.id === initialFolderId);
            if (f) setCurrentFolder(f);
        }
      }
      // Assets
      const params = new URLSearchParams();
      if (currentFolder) params.set('folderId', currentFolder.id);
      if (filters.search) params.set('search', filters.search);
      if (filters.type) params.set('type', filters.type);
      const assetsRes = await fetch(`/api/admin/media/assets?${params.toString()}`);
      if (assetsRes.ok) {
        const data = await assetsRes.json();
        const enriched = (data.assets || []).map((a: MediaAsset) => ({
          ...a,
          metadata: a.metadata || {},
        }));
        setAssets(enriched);
      }
      // Stats
      const statsRes = await fetch('/api/admin/media/stats');
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } finally {
      setLoading(false);
    }
  }, [currentFolder, filters, initialFolderId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto refresh
  useEffect(() => {
    if (!enableAutoRefresh) return;
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    refreshTimer.current = setInterval(() => { fetchAll(); }, refreshInterval);
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
  }, [enableAutoRefresh, refreshInterval, fetchAll]);

  const setFilters = (f: Partial<UseMediaLibraryFilters>) => {
    setFiltersState(prev => ({ ...prev, ...f }));
  };

  const setCurrentFolderById = (id: string | null) => {
    if (!id) { setCurrentFolder(null); return; }
    const f = folders.find(x => x.id === id) || null;
    setCurrentFolder(f);
  };

  const selectAsset = (id: string, multi = true) => {
    setSelectedAssets(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectFolder = (id: string, multi = true) => {
    setSelectedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const clearSelection = () => { setSelectedAssets(new Set()); setSelectedFolders(new Set()); };

  const uploadFiles = async (files: FileList | File[]) => {
    const arr: File[] = Array.isArray(files) ? files : Array.from(files as FileList);
    let success = 0, failed = 0;
    setUploading(true);
    for (const file of arr) {
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file as File);
        });
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: { name: file.name, type: file.type, size: file.size, data: base64 },
            folderId: currentFolder?.id || null,
          }),
        });
        if (res.ok) success++; else failed++;
      } catch { failed++; }
    }
    setUploading(false);
    fetchAll();
    return { success, failed };
  };

  const createFolder = async (name: string, parentId: string | null = currentFolder?.id || null) => {
    if (!name.trim()) return false;
    const res = await fetch('/api/admin/media/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parentId }),
    });
    if (res.ok) { await fetchAll(); return true; }
    return false;
  };

  const renameFolder = async (id: string, name: string) => {
    if (!name.trim()) return false;
    const res = await fetch(`/api/admin/media/folders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) { await fetchAll(); return true; }
    return false;
  };

  const deleteFolders = async (ids: string[]) => {
    let success = 0;
    for (const id of ids) {
      const res = await fetch(`/api/admin/media/folders/${id}`, { method: 'DELETE' });
      if (res.ok) success++;
    }
    if (success) fetchAll();
    return success;
  };

  const deleteAssets = async (ids: string[]) => {
    let success = 0;
    for (const id of ids) {
      const res = await fetch(`/api/admin/media/assets/${id}`, { method: 'DELETE' });
      if (res.ok) success++;
    }
    if (success) fetchAll();
    return success;
  };

  const moveAssets = async (assetIds: string[], folderId: string | null) => {
    for (const id of assetIds) {
      await fetch(`/api/admin/media/assets/${id}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId }),
      });
    }
    fetchAll();
  };

  const moveFolders = async (folderIds: string[], parentId: string | null) => {
    for (const id of folderIds) {
      await fetch(`/api/admin/media/folders/${id}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId }),
      });
    }
    fetchAll();
  };

  const updateAssetMeta = async (assetId: string, meta: Partial<MediaMetadata>) => {
    const res = await fetch(`/api/admin/media/assets/${assetId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: meta }),
    });
    if (res.ok) { fetchAll(); return true; }
    return false;
  };

  return {
    state: { folders, assets, stats, loading, uploading, currentFolder, viewMode, filters, selectedAssets, selectedFolders },
    setViewMode,
    setFilters,
    setCurrentFolderById,
    refresh: fetchAll,
    selectAsset,
    selectFolder,
    clearSelection,
    uploadFiles,
    createFolder,
    renameFolder,
    deleteFolders,
    deleteAssets,
    moveAssets,
    moveFolders,
    updateAssetMeta,
  };
}
