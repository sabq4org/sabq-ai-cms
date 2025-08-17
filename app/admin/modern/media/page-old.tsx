"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { 
  Upload, 
  FolderPlus, 
  Trash2, 
  Edit3, 
  Move, 
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  MoreVertical,
  Check,
  X,
  FolderOpen,
  Download,
  Info,
  Eye,
  Grid3X3,
  List,
  Search,
  Filter
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

import { MediaFolder, MediaAsset } from "./types";
import { MediaHeader } from "./components/MediaHeader";
import { MediaBreadcrumb } from "./components/MediaBreadcrumb";
import { MediaGrid } from "./components/MediaGrid";

export default function MediaLibraryPage() {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<MediaFolder | null>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  
  // New state for advanced features
  const [renameFolderOpen, setRenameFolderOpen] = useState(false);
  const [moveItemsOpen, setMoveItemsOpen] = useState(false);
  const [assetInfoOpen, setAssetInfoOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editMetadataOpen, setEditMetadataOpen] = useState(false);
  const [selectedFolderObj, setSelectedFolderObj] = useState<MediaFolder | null>(null);
  const [selectedAssetObj, setSelectedAssetObj] = useState<MediaAsset | null>(null);
  const [moveTargetFolder, setMoveTargetFolder] = useState<string | null>(null);
  const [editingAltText, setEditingAltText] = useState("");
  const [editingTags, setEditingTags] = useState<string[]>([]);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const { toast } = useToast();

  // Debounced search effect
  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    
    const timer = setTimeout(() => {
      fetchData();
    }, 500); // 500ms debounce
    
    setSearchDebounceTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchQuery, filterType]); // Remove fetchData from dependencies to avoid infinite loop

  // Fetch folders and assets with improved search
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch folders
      const foldersRes = await fetch("/api/admin/media/folders");
      if (!foldersRes.ok) throw new Error("Failed to fetch folders");
      const foldersData = await foldersRes.json();
      setFolders(foldersData.folders);

      // Fetch assets for current folder with improved search parameters
      const params = new URLSearchParams();
      if (currentFolder) {
        params.set("folderId", currentFolder.id);
      }
      if (searchQuery && searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }
      if (filterType && filterType !== "all") {
        params.set("type", filterType);
      }

      const assetsRes = await fetch(`/api/admin/media/assets?${params}`);
      if (!assetsRes.ok) throw new Error("Failed to fetch assets");
      const assetsData = await assetsRes.json();
      setAssets(assetsData.assets || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentFolder, searchQuery, filterType, toast]);

  useEffect(() => {
    // Only fetch on currentFolder change, not search/filter changes
    fetchData();
  }, [currentFolder]); // Remove searchQuery and filterType from dependencies

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    console.log("🚀 بدء رفع الملفات:", files.length, "ملف");
    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of Array.from(files)) {
      console.log("📎 رفع ملف:", file.name, "حجم:", file.size, "نوع:", file.type);
      
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolder) {
        formData.append("folderId", currentFolder.id);
        console.log("📁 رفع في مجلد:", currentFolder.name);
      }

      try {
        console.log("🌐 إرسال طلب رفع...");
        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });

        console.log("📥 استجابة الخادم:", res.status, res.statusText);

        if (!res.ok) {
          const error = await res.json();
          console.error("❌ خطأ في الخادم:", error);
          throw new Error(error.error || "Upload failed");
        }

        const result = await res.json();
        console.log("✅ تم رفع الملف بنجاح:", result.filename);
        successCount++;
      } catch (error) {
        console.error("💥 خطأ في رفع الملف:", file.name, error);
        errorCount++;
      }
    }

    setUploading(false);
    
    if (successCount > 0) {
      toast({
        title: "تم الرفع بنجاح",
        description: `تم رفع ${successCount} ملف${successCount > 1 ? "ات" : ""}`,
      });
      fetchData();
    }
    
    if (errorCount > 0) {
      toast({
        title: "خطأ في الرفع",
        description: `فشل رفع ${errorCount} ملف${errorCount > 1 ? "ات" : ""}`,
        variant: "destructive",
      });
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch("/api/admin/media/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName,
          parentId: currentFolder?.id || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create folder");
      }

      toast({
        title: "تم إنشاء المجلد",
        description: `تم إنشاء مجلد "${newFolderName}" بنجاح`,
      });

      setCreateFolderOpen(false);
      setNewFolderName("");
      fetchData();
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل إنشاء المجلد",
        variant: "destructive",
      });
    }
  };

  // Delete asset with improved confirmation
  const handleDeleteAsset = async (assetId: string) => {
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/media/assets/${assetId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete asset");
      }

      toast({
        title: "تم الحذف",
        description: "تم حذف الملف بنجاح",
      });

      // Remove from local state immediately for better UX
      setAssets(prev => prev.filter(asset => asset.id !== assetId));
      setSelectedAssets(prev => {
        const newSet = new Set(prev);
        newSet.delete(assetId);
        return newSet;
      });
      
      // Refresh data to ensure consistency
      fetchData();
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل حذف الملف",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Delete folder with improved confirmation
  const handleDeleteFolder = async (folderId: string) => {
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/media/folders/${folderId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete folder");
      }

      toast({
        title: "تم الحذف",
        description: "تم حذف المجلد بنجاح",
      });

      // Remove from local state immediately for better UX
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      setSelectedFolders(prev => {
        const newSet = new Set(prev);
        newSet.delete(folderId);
        return newSet;
      });
      
      // Refresh data to ensure consistency
      fetchData();
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل حذف المجلد",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Enhanced functions for advanced features
  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      const response = await fetch(`/api/admin/media/folders/${folderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error("فشل في إعادة التسمية");
      }

      toast({
        title: "تم التحديث",
        description: "تم تغيير اسم المجلد بنجاح",
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تغيير اسم المجلد",
        variant: "destructive",
      });
    }
  };

  const handleRenameAsset = async (assetId: string, newName: string) => {
    try {
      const response = await fetch(`/api/admin/media/assets/${assetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error("فشل في إعادة التسمية");
      }

      toast({
        title: "تم التحديث",
        description: "تم تغيير اسم الملف بنجاح",
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تغيير اسم الملف",
        variant: "destructive",
      });
    }
  };

  const handleMoveItems = async (targetFolderId: string | null) => {
    try {
      const folderIds = Array.from(selectedFolders);
      const assetIds = Array.from(selectedAssets);

      if (folderIds.length === 0 && assetIds.length === 0) return;

      const response = await fetch("/api/admin/media/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderIds,
          assetIds,
          targetFolderId,
        }),
      });

      if (!response.ok) {
        throw new Error("فشل في نقل العناصر");
      }

      setSelectedFolders(new Set());
      setSelectedAssets(new Set());
      
      toast({
        title: "تم النقل",
        description: "تم نقل العناصر بنجاح",
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في نقل العناصر",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSelected = async () => {
    const folderIds = Array.from(selectedFolders);
    const assetIds = Array.from(selectedAssets);

    if (folderIds.length === 0 && assetIds.length === 0) return;

    const totalItems = folderIds.length + assetIds.length;

    try {
      setDeleting(true);
      
      // Show progress toast
      toast({
        title: "جاري الحذف...",
        description: `جاري حذف ${totalItems} عنصر`,
      });

      // Improved batch deletion with better error handling
      const results = await Promise.allSettled([
        // Delete assets
        ...assetIds.map(async (assetId) => {
          const res = await fetch(`/api/admin/media/assets/${assetId}`, { 
            method: "DELETE",
            headers: {
              'Content-Type': 'application/json',
            }
          });
          if (!res.ok) {
            const error = await res.json();
            throw new Error(`Asset ${assetId}: ${error.error || 'Unknown error'}`);
          }
          return { type: 'asset', id: assetId, success: true };
        }),
        
        // Delete folders
        ...folderIds.map(async (folderId) => {
          const res = await fetch(`/api/admin/media/folders/${folderId}`, { 
            method: "DELETE",
            headers: {
              'Content-Type': 'application/json',
            }
          });
          if (!res.ok) {
            const error = await res.json();
            throw new Error(`Folder ${folderId}: ${error.error || 'Unknown error'}`);
          }
          return { type: 'folder', id: folderId, success: true };
        })
      ]);
      
      // Count successful and failed deletions
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      const failedResults = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];

      // Update local state immediately for successful deletions
      if (successful > 0) {
        // Remove successful assets
        const successfulAssets = results
          .filter((r, i) => r.status === 'fulfilled' && i < assetIds.length)
          .map((r, i) => assetIds[i]);
        
        // Remove successful folders  
        const successfulFolders = results
          .filter((r, i) => r.status === 'fulfilled' && i >= assetIds.length)
          .map((r, i) => folderIds[i]);

        setAssets(prev => prev.filter(asset => !successfulAssets.includes(asset.id)));
        setFolders(prev => prev.filter(folder => !successfulFolders.includes(folder.id)));
      }

      // Clear selections
      setSelectedFolders(new Set());
      setSelectedAssets(new Set());
      
      if (successful > 0 && failed === 0) {
        toast({
          title: "تم الحذف بنجاح",
          description: `تم حذف جميع العناصر (${successful}) بنجاح`,
        });
      } else if (successful > 0 && failed > 0) {
        toast({
          title: "حذف جزئي",
          description: `تم حذف ${successful} عنصر وفشل حذف ${failed} عنصر`,
          variant: "destructive",
        });
        console.error("Failed deletions:", failedResults.map(r => r.reason));
      } else {
        toast({
          title: "فشل الحذف",
          description: "فشل في حذف جميع العناصر المحددة",
          variant: "destructive",
        });
        console.error("All deletions failed:", failedResults.map(r => r.reason));
      }
      
      // Refresh data to ensure consistency
      await fetchData();
    } catch (error) {
      console.error("Error in batch deletion:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع أثناء عملية الحذف",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateMetadata = async () => {
    if (!selectedAssetObj) return;

    try {
      const response = await fetch(`/api/admin/media/assets/${selectedAssetObj.id}/metadata`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          altText: editingAltText,
          tags: editingTags,
        }),
      });

      if (!response.ok) {
        throw new Error("فشل في تحديث المعلومات");
      }

      toast({
        title: "تم التحديث",
        description: "تم تحديث معلومات الملف بنجاح",
      });
      
      setEditMetadataOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث المعلومات",
        variant: "destructive",
      });
    }
  };

  // Handle asset selection
  const handleAssetSelect = (assetId: string, selected: boolean) => {
    const newSelection = new Set(selectedAssets);
    if (selected) {
      newSelection.add(assetId);
    } else {
      newSelection.delete(assetId);
    }
    setSelectedAssets(newSelection);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Modern Header - Similar to main site */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-[1600px]">
          <div className="flex flex-col space-y-4">
            {/* Page Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  مكتبة الوسائط
                </h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                  إدارة وتنظيم جميع ملفات الوسائط الخاصة بك
                </p>
              </div>
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-4 space-x-reverse">
                <div className="text-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {assets.length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">ملف</div>
                </div>
                <div className="text-center px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {folders.length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">مجلد</div>
                </div>
              </div>
            </div>

            {/* Enhanced Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في الملفات والمجلدات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <Select value={filterType || "all"} onValueChange={(value) => setFilterType(value === "all" ? null : value)}>
                  <SelectTrigger className="w-full sm:w-40 h-11">
                    <Filter className="h-4 w-4 ml-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="image">صور</SelectItem>
                    <SelectItem value="video">فيديو</SelectItem>
                    <SelectItem value="audio">صوت</SelectItem>
                    <SelectItem value="document">مستندات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-11"
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">شبكة</span>
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-11"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">قائمة</span>
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setCreateFolderOpen(true)} size="sm" className="h-10">
                  <FolderPlus className="h-4 w-4 ml-2" />
                  مجلد جديد
                </Button>
                
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileUpload(e.target.files);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <Button disabled={uploading} size="sm" className="h-10">
                    <Upload className="h-4 w-4 ml-2" />
                    {uploading ? "جاري الرفع..." : "رفع ملفات"}
                  </Button>
                </div>
              </div>

              {/* Selection Actions */}
              {(selectedAssets.size > 0 || selectedFolders.size > 0) && (
                <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Badge variant="secondary" className="px-3 py-1">
                    {selectedAssets.size + selectedFolders.size} محدد
                  </Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMoveItemsOpen(true)}
                    className="h-8"
                  >
                    <Move className="h-4 w-4 ml-2" />
                    نقل
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="h-8"
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    {deleting ? "جاري الحذف..." : "حذف"}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedAssets(new Set());
                      setSelectedFolders(new Set());
                    }}
                    className="h-8"
                  >
                    <X className="h-4 w-4 ml-2" />
                    إلغاء التحديد
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6 max-w-[1600px]">
        {/* Breadcrumb */}
        <div className="mb-6">
          <MediaBreadcrumb
            currentFolder={currentFolder}
            folders={folders}
            onNavigate={setCurrentFolder}
          />
        </div>

        {/* Content Area with Fixed Height and Scrolling */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div
            className={cn(
              "min-h-[calc(100vh-300px)] max-h-[calc(100vh-300px)] overflow-y-auto p-6",
              dragOver && "bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {loading ? (
              <div className={cn(
                "grid gap-4",
                viewMode === "grid" 
                  ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8" 
                  : "grid-cols-1"
              )}>
                {[...Array(16)].map((_, i) => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : (
              <MediaGrid
                folders={folders}
                assets={assets}
                currentFolder={currentFolder}
                selectedAssets={selectedAssets}
                selectedFolders={selectedFolders}
                viewMode={viewMode}
                onFolderClick={setCurrentFolder}
                onFolderSelect={(folderId, selected) => {
                  const newSelection = new Set(selectedFolders);
                  if (selected) {
                    newSelection.add(folderId);
                  } else {
                    newSelection.delete(folderId);
                  }
                  setSelectedFolders(newSelection);
                }}
                onAssetSelect={handleAssetSelect}
                onAssetDelete={(assetId) => {
                  if (confirm("هل أنت متأكد من حذف هذا الملف؟")) {
                    handleDeleteAsset(assetId);
                  }
                }}
                onFolderDelete={(folderId) => {
                  if (confirm("هل أنت متأكد من حذف هذا المجلد؟ سيتم حذف جميع الملفات بداخله أيضاً.")) {
                    handleDeleteFolder(folderId);
                  }
                }}
                onAssetInfo={(asset) => {
                  setSelectedAssetObj(asset);
                  setAssetInfoOpen(true);
                }}
                onAssetRename={(asset) => {
                  setSelectedAssetObj(asset);
                  setNewFolderName(asset.filename);
                  // TODO: Create asset rename dialog
                }}
                onAssetEditMetadata={(asset) => {
                  setSelectedAssetObj(asset);
                  setEditingAltText(asset.metadata?.altText || "");
                  setEditingTags(asset.metadata?.tags || []);
                  setEditMetadataOpen(true);
                }}
                onFolderRename={(folder) => {
                  setSelectedFolderObj(folder);
                  setNewFolderName(folder.name);
                  setRenameFolderOpen(true);
                }}
              />
            )}

            {/* Drag & Drop Overlay */}
            {dragOver && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                  <p className="text-xl font-medium text-blue-600 dark:text-blue-400">
                    أفلت الملفات هنا للرفع
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    يمكن رفع الصور والفيديوهات والمستندات
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء مجلد جديد</DialogTitle>
            <DialogDescription>
              أدخل اسم المجلد الجديد
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">اسم المجلد</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="مثال: صور الأخبار"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFolderOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              إنشاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={renameFolderOpen} onOpenChange={setRenameFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إعادة تسمية المجلد</DialogTitle>
            <DialogDescription>
              أدخل الاسم الجديد للمجلد
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-folder">الاسم الجديد</Label>
              <Input
                id="rename-folder"
                defaultValue={selectedFolderObj?.name || ""}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="اسم المجلد الجديد"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameFolderOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={() => {
                if (selectedFolderObj && newFolderName.trim()) {
                  handleRenameFolder(selectedFolderObj.id, newFolderName);
                  setRenameFolderOpen(false);
                  setNewFolderName("");
                }
              }}
              disabled={!newFolderName.trim()}
            >
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Items Dialog */}
      <Dialog open={moveItemsOpen} onOpenChange={setMoveItemsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>نقل العناصر</DialogTitle>
            <DialogDescription>
              اختر المجلد الوجهة لنقل العناصر المحددة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>المجلد الوجهة</Label>
              <Select value={moveTargetFolder || "root"} onValueChange={setMoveTargetFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المجلد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">المجلد الرئيسي</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveItemsOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={() => {
                handleMoveItems(moveTargetFolder === "root" ? null : moveTargetFolder);
                setMoveItemsOpen(false);
                setMoveTargetFolder(null);
              }}
            >
              نقل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asset Info Dialog */}
      <Dialog open={assetInfoOpen} onOpenChange={setAssetInfoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>معلومات الملف</DialogTitle>
          </DialogHeader>
          {selectedAssetObj && (
            <div className="space-y-4 py-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {selectedAssetObj.type === 'IMAGE' ? (
                    <Image
                      src={selectedAssetObj.cloudinaryUrl}
                      alt={selectedAssetObj.originalName}
                      width={128}
                      height={128}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <Label>اسم الملف</Label>
                    <p className="text-sm font-medium">{selectedAssetObj.originalName}</p>
                  </div>
                  <div>
                    <Label>النوع</Label>
                    <p className="text-sm text-muted-foreground">{selectedAssetObj.mimeType}</p>
                  </div>
                  <div>
                    <Label>الحجم</Label>
                    <p className="text-sm text-muted-foreground">
                      {(selectedAssetObj.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div>
                    <Label>تاريخ الإنشاء</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedAssetObj.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>الرابط</Label>
                <div className="flex gap-2">
                  <Input 
                    value={selectedAssetObj.cloudinaryUrl} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(selectedAssetObj.cloudinaryUrl)}
                  >
                    نسخ
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setAssetInfoOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription className="text-base">
              هل أنت متأكد من حذف العناصر المحددة؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-full">
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">
                    سيتم حذف {selectedAssets.size + selectedFolders.size} عنصر
                  </p>
                  <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {selectedAssets.size > 0 && <span>• {selectedAssets.size} ملف</span>}
                    {selectedAssets.size > 0 && selectedFolders.size > 0 && <br />}
                    {selectedFolders.size > 0 && (
                      <span>• {selectedFolders.size} مجلد (مع جميع محتوياته)</span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">
                ⚠️ تنبيه: حذف المجلدات سيؤدي إلى حذف جميع الملفات والمجلدات الفرعية بداخلها.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              إلغاء
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                handleDeleteSelected();
                setDeleteConfirmOpen(false);
              }}
              disabled={deleting}
            >
              {deleting ? "جاري الحذف..." : "حذف نهائي"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Metadata Dialog */}
      <Dialog open={editMetadataOpen} onOpenChange={setEditMetadataOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تحرير معلومات الملف</DialogTitle>
            <DialogDescription>
              قم بتحديث الوصف والوسوم للملف
            </DialogDescription>
          </DialogHeader>
          {selectedAssetObj && (
            <div className="space-y-4 py-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {selectedAssetObj.type === 'IMAGE' ? (
                    <Image
                      src={selectedAssetObj.cloudinaryUrl}
                      alt={selectedAssetObj.originalName}
                      width={96}
                      height={96}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{selectedAssetObj.originalName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedAssetObj.mimeType}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alt-text">النص البديل (Alt Text)</Label>
                  <Textarea
                    id="alt-text"
                    value={editingAltText}
                    onChange={(e) => setEditingAltText(e.target.value)}
                    placeholder="وصف الصورة للأشخاص ذوي الإعاقة البصرية..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    النص البديل يساعد في الوصول وتحسين محركات البحث
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">الوسوم</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editingTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => setEditingTags(prev => prev.filter((_, i) => i !== index))}
                        />
                      </Badge>
                    ))}
                  </div>
                  <Input
                    id="tags"
                    placeholder="أضف وسم واضغط Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = e.currentTarget.value.trim();
                        if (value && !editingTags.includes(value)) {
                          setEditingTags(prev => [...prev, value]);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    الوسوم تساعد في تصنيف وإيجاد الملفات
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMetadataOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpdateMetadata}>
              حفظ المعلومات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}