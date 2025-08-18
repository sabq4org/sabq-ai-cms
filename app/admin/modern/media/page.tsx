"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { 
  Search, 
  Upload, 
  Grid, 
  List, 
  Folder, 
  RefreshCw, 
  Download, 
  Filter, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileText, 
  FolderOpen, 
  Trash2, 
  MoreVertical, 
  X, 
  Sparkles, 
  Eye, 
  Edit, 
  Copy, 
  ArrowLeft, 
  Plus, 
  Check,
  ArrowUpRight,
  Zap,
  HardDrive,
  Clock
} from "lucide-react";
import { toast } from "react-hot-toast";

interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  cloudinaryUrl: string;
  thumbnailUrl?: string;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";
  metadata?: any;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  folder?: {
    id: string;
    name: string;
    path: string;
  };
}

interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  _count: {
    assets: number;
    subfolders: number;
  };
}

// مكون بطاقة إحصائية
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: { value: number; label: string };
}) => {
  return (
    <div className="card" style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: `${color}10`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color
        }}>
          <Icon style={{ width: '24px', height: '24px' }} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>{title}</div>
          <div className="heading-3" style={{ margin: '4px 0', color: color }}>
            {value}
          </div>
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpRight style={{ 
                width: '14px', 
                height: '14px',
                color: '#10b981'
              }} />
              <span className="text-xs" style={{ color: '#10b981' }}>
                {trend.value}%
              </span>
              <span className="text-xs text-muted">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// مكون بطاقة الوسائط
const MediaCard = ({
  asset,
  isSelected,
  onSelect,
  onPreview,
  viewMode
}: {
  asset: MediaAsset;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  viewMode: "grid" | "list";
}) => {
  const getTypeIcon = () => {
    switch (asset.type) {
      case "IMAGE": return ImageIcon;
      case "VIDEO": return Video;
      case "AUDIO": return Music;
      case "DOCUMENT": return FileText;
      default: return FileText;
    }
  };

  const TypeIcon = getTypeIcon();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (viewMode === "list") {
    return (
      <div 
        className="card"
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: isSelected ? '2px solid hsl(var(--accent))' : '1px solid hsl(var(--line))'
        }}
        onClick={onSelect}
      >
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          overflow: 'hidden',
          background: 'hsl(var(--muted) / 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {asset.type === "IMAGE" && asset.thumbnailUrl ? (
            <Image
              src={asset.thumbnailUrl}
              alt={asset.originalName}
              width={48}
              height={48}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <TypeIcon style={{ width: '24px', height: '24px', color: 'hsl(var(--muted))' }} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="text-sm" style={{ fontWeight: '600', marginBottom: '4px' }}>
            {asset.originalName}
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span className="text-xs text-muted">{formatFileSize(asset.size)}</span>
            {asset.width && asset.height && (
              <span className="text-xs text-muted">{asset.width} × {asset.height}</span>
            )}
            <span className="text-xs text-muted">
              {new Date(asset.createdAt).toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="btn btn-sm btn-ghost"
          >
            <Eye style={{ width: '16px', height: '16px' }} />
          </button>
          <button className="btn btn-sm btn-ghost">
            <MoreVertical style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="card"
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: isSelected ? '2px solid hsl(var(--accent))' : '1px solid hsl(var(--line))',
        padding: '0'
      }}
      onClick={onSelect}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div style={{
        aspectRatio: '1',
        background: 'hsl(var(--muted) / 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderBottom: '1px solid hsl(var(--line))'
      }}>
        {asset.type === "IMAGE" && asset.thumbnailUrl ? (
          <Image
            src={asset.thumbnailUrl}
            alt={asset.originalName}
            width={200}
            height={200}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <TypeIcon style={{ width: '48px', height: '48px', color: 'hsl(var(--muted))' }} />
        )}
      </div>

      <div style={{ padding: '12px' }}>
        <div className="text-sm" style={{ 
          fontWeight: '600', 
          marginBottom: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {asset.originalName}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="text-xs text-muted">{formatFileSize(asset.size)}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="btn btn-xs btn-ghost"
          >
            <Eye style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

// مكون بطاقة المجلد
const FolderCard = ({
  folder,
  onClick
}: {
  folder: MediaFolder;
  onClick: () => void;
}) => {
  return (
    <div 
      className="card"
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        padding: '20px'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'hsl(var(--accent) / 0.1)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Folder style={{ width: '24px', height: '24px', color: 'hsl(var(--accent))' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="heading-3" style={{ marginBottom: '4px' }}>{folder.name}</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span className="text-xs text-muted">
              {folder._count.assets} ملف
            </span>
            {folder._count.subfolders > 0 && (
              <span className="text-xs text-muted">
                {folder._count.subfolders} مجلد
              </span>
            )}
          </div>
        </div>
        <ArrowLeft style={{ width: '20px', height: '20px', color: 'hsl(var(--muted))' }} />
      </div>
    </div>
  );
};

export default function MediaLibraryPage() {
  const [allAssets, setAllAssets] = useState<MediaAsset[]>([]);
  const [allFolders, setAllFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [foldersResponse, assetsResponse] = await Promise.all([
        fetch("/api/admin/media/folders", { credentials: 'include' }),
        fetch("/api/admin/media/assets", { credentials: 'include' })
      ]);

      if (foldersResponse.ok && assetsResponse.ok) {
        const [foldersData, assetsData] = await Promise.all([
          foldersResponse.json(),
          assetsResponse.json()
        ]);
        
        setAllFolders(foldersData.folders || []);
        setAllAssets(assetsData.assets || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data
  const { filteredAssets, filteredFolders } = useMemo(() => {
    let assets = allAssets;
    let folders = allFolders;

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const searchLower = debouncedSearchQuery.toLowerCase().trim();
      
      assets = assets.filter(asset => {
        const searchableFields = [
          asset.originalName,
          asset.filename,
          asset.type,
          asset.metadata?.altText || '',
          asset.metadata?.description || '',
          ...(asset.metadata?.tags || [])
        ].filter(Boolean);
        
        return searchableFields.some(field => 
          field.toLowerCase().includes(searchLower)
        );
      });

      folders = folders.filter(folder =>
        folder.name.toLowerCase().includes(searchLower) ||
        folder.path.toLowerCase().includes(searchLower)
      );
    }

    // Apply folder filter
    if (selectedFolder) {
      assets = assets.filter(asset => asset.folderId === selectedFolder);
      folders = folders.filter(folder => folder.parentId === selectedFolder);
    } else {
      folders = folders.filter(folder => !folder.parentId);
    }

    // Apply type filter
    if (filterType) {
      assets = assets.filter(asset => asset.type === filterType);
    }

    return { filteredAssets: assets, filteredFolders: folders };
  }, [allAssets, allFolders, debouncedSearchQuery, selectedFolder, filterType]);

  // Get current folder path
  const currentFolderPath = useMemo(() => {
    if (!selectedFolder) return [{ id: null, name: "الجذر" }];
    
    const path = [];
    let currentId: string | null = selectedFolder;
    
    while (currentId) {
      const folder = allFolders.find(f => f.id === currentId);
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId || null;
      } else {
        break;
      }
    }
    
    path.unshift({ id: null, name: "الجذر" });
    return path;
  }, [selectedFolder, allFolders]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSize = allAssets.reduce((sum, asset) => sum + asset.size, 0);
    const imageCount = allAssets.filter(a => a.type === "IMAGE").length;
    const videoCount = allAssets.filter(a => a.type === "VIDEO").length;
    const docCount = allAssets.filter(a => a.type === "DOCUMENT").length;
    
    return {
      totalAssets: allAssets.length,
      totalSize,
      imageCount,
      videoCount,
      docCount,
      folderCount: allFolders.length
    };
  }, [allAssets, allFolders]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(var(--bg))', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* رسالة الترحيب */}
        <div className="card card-accent" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ImageIcon style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 className="heading-2" style={{ marginBottom: '4px' }}>
                  مكتبة الوسائط الذكية
                </h1>
                <p className="text-muted" style={{ fontSize: '14px' }}>
                  إدارة وتنظيم جميع ملفات الوسائط بذكاء اصطناعي
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowUpload(true)}
                className="btn"
                style={{ background: 'hsl(var(--accent))', color: 'white' }}
              >
                <Upload style={{ width: '16px', height: '16px' }} />
                رفع ملفات
              </button>
              <button
                onClick={fetchData}
                className="btn btn-outline"
              >
                <RefreshCw style={{ width: '16px', height: '16px' }} />
                تحديث
              </button>
            </div>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          <StatCard
            title="إجمالي الملفات"
            value={stats.totalAssets}
            icon={FileText}
            color="hsl(var(--accent))"
            trend={{ value: 12, label: "هذا الشهر" }}
          />
          <StatCard
            title="المساحة المستخدمة"
            value={formatFileSize(stats.totalSize)}
            icon={HardDrive}
            color="#10b981"
          />
          <StatCard
            title="الصور"
            value={stats.imageCount}
            icon={ImageIcon}
            color="#8b5cf6"
          />
          <StatCard
            title="الفيديوهات"
            value={stats.videoCount}
            icon={Video}
            color="#f97316"
          />
        </div>

        {/* شريط الأدوات */}
        <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* بحث */}
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <Search style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                color: 'hsl(var(--muted))'
              }} />
              <input
                type="text"
                placeholder="ابحث في الملفات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{ width: '100%', paddingRight: '40px' }}
              />
            </div>

            {/* فلاتر */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setFilterType(null)}
                className={`btn ${!filterType ? '' : 'btn-outline'}`}
                style={!filterType ? { background: 'hsl(var(--accent))', color: 'white' } : {}}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterType("IMAGE")}
                className={`btn ${filterType === "IMAGE" ? '' : 'btn-outline'}`}
                style={filterType === "IMAGE" ? { background: 'hsl(var(--accent))', color: 'white' } : {}}
              >
                <ImageIcon style={{ width: '16px', height: '16px' }} />
                صور
              </button>
              <button
                onClick={() => setFilterType("VIDEO")}
                className={`btn ${filterType === "VIDEO" ? '' : 'btn-outline'}`}
                style={filterType === "VIDEO" ? { background: 'hsl(var(--accent))', color: 'white' } : {}}
              >
                <Video style={{ width: '16px', height: '16px' }} />
                فيديو
              </button>
              <button
                onClick={() => setFilterType("DOCUMENT")}
                className={`btn ${filterType === "DOCUMENT" ? '' : 'btn-outline'}`}
                style={filterType === "DOCUMENT" ? { background: 'hsl(var(--accent))', color: 'white' } : {}}
              >
                <FileText style={{ width: '16px', height: '16px' }} />
                مستندات
              </button>
            </div>

            {/* عرض */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setViewMode("grid")}
                className={`btn btn-sm ${viewMode === "grid" ? '' : 'btn-ghost'}`}
                style={viewMode === "grid" ? { background: 'hsl(var(--accent))', color: 'white' } : {}}
              >
                <Grid style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`btn btn-sm ${viewMode === "list" ? '' : 'btn-ghost'}`}
                style={viewMode === "list" ? { background: 'hsl(var(--accent))', color: 'white' } : {}}
              >
                <List style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        {currentFolderPath.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
            {currentFolderPath.map((item, index) => (
              <React.Fragment key={item.id || 'root'}>
                <button
                  onClick={() => setSelectedFolder(item.id)}
                  className="text-sm text-muted hover:text-foreground"
                  style={{ cursor: 'pointer' }}
                >
                  {item.name}
                </button>
                {index < currentFolderPath.length - 1 && (
                  <span className="text-muted">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* المحتوى */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <div className="animate-spin">
              <RefreshCw style={{ width: '32px', height: '32px', color: 'hsl(var(--accent))' }} />
            </div>
          </div>
        ) : (
          <>
            {/* المجلدات */}
            {filteredFolders.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 className="heading-3" style={{ marginBottom: '16px' }}>المجلدات</h2>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                  gap: '16px' 
                }}>
                  {filteredFolders.map(folder => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      onClick={() => setSelectedFolder(folder.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* الملفات */}
            {filteredAssets.length > 0 ? (
              <div>
                <h2 className="heading-3" style={{ marginBottom: '16px' }}>
                  الملفات ({filteredAssets.length})
                </h2>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: viewMode === "grid" 
                    ? 'repeat(auto-fill, minmax(200px, 1fr))' 
                    : '1fr', 
                  gap: '16px' 
                }}>
                  {filteredAssets.map(asset => (
                    <MediaCard
                      key={asset.id}
                      asset={asset}
                      isSelected={selectedAssets.includes(asset.id)}
                      onSelect={() => {
                        setSelectedAssets(prev => 
                          prev.includes(asset.id)
                            ? prev.filter(id => id !== asset.id)
                            : [...prev, asset.id]
                        );
                      }}
                      onPreview={() => setPreviewAsset(asset)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '80px', textAlign: 'center' }}>
                <ImageIcon style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: 'hsl(var(--muted))' }} />
                <h3 className="heading-3" style={{ marginBottom: '8px' }}>لا توجد ملفات</h3>
                <p className="text-muted">ابدأ برفع بعض الملفات إلى مكتبتك</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewAsset && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setPreviewAsset(null)}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button
              onClick={() => setPreviewAsset(null)}
              className="btn btn-sm"
              style={{
                position: 'absolute',
                top: '-40px',
                right: 0,
                background: 'white',
                color: 'black'
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
            
            {previewAsset.type === "IMAGE" ? (
              <Image
                src={previewAsset.cloudinaryUrl}
                alt={previewAsset.originalName}
                width={previewAsset.width || 800}
                height={previewAsset.height || 600}
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  width: 'auto',
                  height: 'auto',
                  borderRadius: '8px'
                }}
              />
            ) : (
              <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <FileText style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: 'hsl(var(--muted))' }} />
                <h3 className="heading-3">{previewAsset.originalName}</h3>
                <p className="text-muted">{formatFileSize(previewAsset.size)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
