"use client";

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
  BarChart3,
  MoreVertical,
  Check,
  X,
  FolderOpen,
  Download,
  Share2,
  Info,
  Eye,
  Grid3X3,
  List,
  Search,
  Filter,
  ChevronRight,
  Copy,
  FileEdit
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
import { motion, AnimatePresence } from "framer-motion";

interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  path: string;
  createdAt: string;
  _count: {
    assets: number;
    subfolders: number;
  };
}

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
  folderId: string | null;
  createdAt: string;
  metadata?: any;
  folder?: MediaFolder;
}

interface MediaStats {
  totalAssets: number;
  totalFolders: number;
  totalSize: number;
  assetsByType: {
    IMAGE: number;
    VIDEO: number;
    AUDIO: number;
    DOCUMENT: number;
  };
  recentUploads: number;
  storageUsed: number;
  storageLimit: number;
}

export default function EnhancedMediaLibraryPage() {
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
  const [stats, setStats] = useState<MediaStats | null>(null);
  
  // Dialog states
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [renameFolderOpen, setRenameFolderOpen] = useState(false);
  const [moveItemsOpen, setMoveItemsOpen] = useState(false);
  const [editAssetOpen, setEditAssetOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  
  // Form states
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<MediaFolder | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [assetAltText, setAssetAltText] = useState("");
  
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch folders
      const foldersRes = await fetch("/api/admin/media/folders");
      if (!foldersRes.ok) throw new Error("Failed to fetch folders");
      const foldersData = await foldersRes.json();
      setFolders(foldersData.folders);

      // Fetch assets
      const params = new URLSearchParams();
      if (currentFolder) {
        params.set("folderId", currentFolder.id);
      }
      if (searchQuery) {
        params.set("search", searchQuery);
      }
      if (filterType) {
        params.set("type", filterType);
      }

      const assetsRes = await fetch(`/api/admin/media/assets?${params}`);
      if (!assetsRes.ok) throw new Error("Failed to fetch assets");
      const assetsData = await assetsRes.json();
      setAssets(assetsData.assets);
      
      // Fetch stats
      const statsRes = await fetch("/api/admin/media/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
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
    fetchData();
  }, [fetchData]);

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of Array.from(files)) {
      try {
        // Convert to base64
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: {
              name: file.name,
              type: file.type,
              size: file.size,
              data: base64Data
            },
            folderId: currentFolder?.id || null,
            altText: ""
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Upload failed");
        }

        successCount++;
      } catch (error) {
        console.error("Error uploading file:", error);
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

  // Create folder
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

      if (!res.ok) throw new Error("Failed to create folder");

      toast({
        title: "تم إنشاء المجلد",
        description: `تم إنشاء مجلد "${newFolderName}" بنجاح`,
      });

      setCreateFolderOpen(false);
      setNewFolderName("");
      fetchData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إنشاء المجلد",
        variant: "destructive",
      });
    }
  };

  // Rename folder
  const handleRenameFolder = async () => {
    if (!selectedFolder || !newFolderName.trim()) return;

    try {
      const res = await fetch(`/api/admin/media/folders/${selectedFolder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName }),
      });

      if (!res.ok) throw new Error("Failed to rename folder");

      toast({
        title: "تم تعديل الاسم",
        description: "تم تغيير اسم المجلد بنجاح",
      });

      setRenameFolderOpen(false);
      setNewFolderName("");
      setSelectedFolder(null);
      fetchData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تعديل اسم المجلد",
        variant: "destructive",
      });
    }
  };

  // Delete folders
  const handleDeleteFolders = async () => {
    if (selectedFolders.size === 0) return;
    
    if (!confirm(`هل أنت متأكد من حذف ${selectedFolders.size} مجلد؟`)) return;

    let successCount = 0;
    for (const folderId of selectedFolders) {
      try {
        const res = await fetch(`/api/admin/media/folders/${folderId}`, {
          method: "DELETE",
        });
        if (res.ok) successCount++;
      } catch (error) {
        console.error("Error deleting folder:", error);
      }
    }

    toast({
      title: "تم الحذف",
      description: `تم حذف ${successCount} مجلد`,
    });

    setSelectedFolders(new Set());
    fetchData();
  };

  // Delete assets
  const handleDeleteAssets = async () => {
    if (selectedAssets.size === 0) return;
    
    if (!confirm(`هل أنت متأكد من حذف ${selectedAssets.size} ملف؟`)) return;

    let successCount = 0;
    for (const assetId of selectedAssets) {
      try {
        const res = await fetch(`/api/admin/media/assets/${assetId}`, {
          method: "DELETE",
        });
        if (res.ok) successCount++;
      } catch (error) {
        console.error("Error deleting asset:", error);
      }
    }

    toast({
      title: "تم الحذف",
      description: `تم حذف ${successCount} ملف`,
    });

    setSelectedAssets(new Set());
    fetchData();
  };

  // Move items
  const handleMoveItems = async () => {
    if (selectedAssets.size === 0 && selectedFolders.size === 0) return;

    try {
      // Move assets
      for (const assetId of selectedAssets) {
        await fetch(`/api/admin/media/assets/${assetId}/move`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId: targetFolderId }),
        });
      }

      // Move folders
      for (const folderId of selectedFolders) {
        await fetch(`/api/admin/media/folders/${folderId}/move`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parentId: targetFolderId }),
        });
      }

      toast({
        title: "تم النقل",
        description: "تم نقل العناصر المحددة بنجاح",
      });

      setMoveItemsOpen(false);
      setSelectedAssets(new Set());
      setSelectedFolders(new Set());
      fetchData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل نقل بعض العناصر",
        variant: "destructive",
      });
    }
  };

  // Update asset
  const handleUpdateAsset = async () => {
    if (!selectedAsset) return;

    try {
      const res = await fetch(`/api/admin/media/assets/${selectedAsset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          altText: assetAltText,
          metadata: {
            ...selectedAsset.metadata,
            altText: assetAltText
          }
        }),
      });

      if (!res.ok) throw new Error("Failed to update asset");

      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات الملف بنجاح",
      });

      setEditAssetOpen(false);
      setSelectedAsset(null);
      setAssetAltText("");
      fetchData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث بيانات الملف",
        variant: "destructive",
      });
    }
  };

  // Toggle selection
  const toggleAssetSelection = (assetId: string) => {
    const newSelection = new Set(selectedAssets);
    if (newSelection.has(assetId)) {
      newSelection.delete(assetId);
    } else {
      newSelection.add(assetId);
    }
    setSelectedAssets(newSelection);
  };

  const toggleFolderSelection = (folderId: string) => {
    const newSelection = new Set(selectedFolders);
    if (newSelection.has(folderId)) {
      newSelection.delete(folderId);
    } else {
      newSelection.add(folderId);
    }
    setSelectedFolders(newSelection);
  };

  // Select all
  const selectAll = () => {
    setSelectedAssets(new Set(assets.map(a => a.id)));
    setSelectedFolders(new Set(folders.filter(f => f.parentId === currentFolder?.id).map(f => f.id)));
  };

  const clearSelection = () => {
    setSelectedAssets(new Set());
    setSelectedFolders(new Set());
  };

  // Get icon for file type
  const getFileIcon = (type: string) => {
    switch (type) {
      case "IMAGE": return <ImageIcon className="w-5 h-5" />;
      case "VIDEO": return <Film className="w-5 h-5" />;
      case "AUDIO": return <Music className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 max-w-[1800px]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">مكتبة الوسائط المتقدمة</h1>
              <p className="text-muted-foreground mt-1">
                إدارة شاملة لجميع ملفات الوسائط مع إحصائيات مفصلة
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              >
                {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                onClick={() => setCreateFolderOpen(true)}
              >
                <FolderPlus className="w-4 h-4 ml-2" />
                مجلد جديد
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                disabled={uploading}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="w-4 h-4 ml-2" />
                {uploading ? "جاري الرفع..." : "رفع ملفات"}
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    إجمالي الملفات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{stats.totalAssets}</span>
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">صور</span>
                      <span>{stats.assetsByType.IMAGE}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">فيديو</span>
                      <span>{stats.assetsByType.VIDEO}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">مستندات</span>
                      <span>{stats.assetsByType.DOCUMENT}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    المجلدات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{stats.totalFolders}</span>
                    <FolderOpen className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    مجلدات منظمة للوسائط
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    المساحة المستخدمة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatFileSize(stats.storageUsed)}
                    </span>
                    <Info className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="mt-2">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(stats.storageUsed / stats.storageLimit) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      من أصل {formatFileSize(stats.storageLimit)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    رفعات جديدة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{stats.recentUploads}</span>
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    خلال آخر 7 أيام
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Toolbar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="بحث في الملفات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={filterType || "all"} onValueChange={(v) => setFilterType(v === "all" ? null : v)}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="نوع الملف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="IMAGE">صور</SelectItem>
                    <SelectItem value="VIDEO">فيديو</SelectItem>
                    <SelectItem value="AUDIO">صوت</SelectItem>
                    <SelectItem value="DOCUMENT">مستندات</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedAssets.size > 0 || selectedFolders.size > 0) && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-3">
                    {selectedAssets.size + selectedFolders.size} محدد
                  </Badge>
                  <Button size="sm" variant="outline" onClick={clearSelection}>
                    إلغاء التحديد
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setMoveItemsOpen(true)}>
                    <Move className="w-4 h-4 ml-1" />
                    نقل
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => {
                      if (selectedFolders.size > 0) handleDeleteFolders();
                      if (selectedAssets.size > 0) handleDeleteAssets();
                    }}
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-4 py-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentFolder(null)}
                className="px-2"
              >
                <FolderOpen className="w-4 h-4 ml-1" />
                الرئيسية
              </Button>
              {currentFolder && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{currentFolder.name}</span>
                </>
              )}
              {(assets.length > 0 || folders.filter(f => f.parentId === currentFolder?.id).length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                  className="mr-auto"
                >
                  تحديد الكل
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={cn(
            "bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-[500px] relative",
            dragOver && "ring-2 ring-blue-500 ring-offset-2"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {loading ? (
            <div className="p-6">
              <div className={cn(
                "grid gap-4",
                viewMode === "grid" 
                  ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" 
                  : "grid-cols-1"
              )}>
                {[...Array(12)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {viewMode === "grid" ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
                    >
                      {/* Folders */}
                      {folders
                        .filter(f => f.parentId === currentFolder?.id)
                        .map((folder) => (
                          <motion.div
                            key={folder.id}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            className={cn(
                              "relative group cursor-pointer",
                              selectedFolders.has(folder.id) && "ring-2 ring-blue-500 rounded-lg"
                            )}
                          >
                            <div
                              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                              onDoubleClick={() => setCurrentFolder(folder)}
                            >
                              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Checkbox
                                  checked={selectedFolders.has(folder.id)}
                                  onCheckedChange={() => toggleFolderSelection(folder.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setCurrentFolder(folder)}>
                                      <FolderOpen className="w-4 h-4 ml-2" />
                                      فتح
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedFolder(folder);
                                      setNewFolderName(folder.name);
                                      setRenameFolderOpen(true);
                                    }}>
                                      <Edit3 className="w-4 h-4 ml-2" />
                                      إعادة تسمية
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedFolders(new Set([folder.id]));
                                      setMoveItemsOpen(true);
                                    }}>
                                      <Move className="w-4 h-4 ml-2" />
                                      نقل
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => {
                                        setSelectedFolders(new Set([folder.id]));
                                        handleDeleteFolders();
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 ml-2" />
                                      حذف
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <FolderOpen className="w-12 h-12 mx-auto mb-2 text-blue-500" />
                              <p className="text-sm font-medium text-center truncate">
                                {folder.name}
                              </p>
                              <p className="text-xs text-gray-500 text-center mt-1">
                                {folder._count.assets} ملف
                              </p>
                            </div>
                          </motion.div>
                        ))}

                      {/* Assets */}
                      {assets.map((asset) => (
                        <motion.div
                          key={asset.id}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.05 }}
                          className={cn(
                            "relative group cursor-pointer",
                            selectedAssets.has(asset.id) && "ring-2 ring-blue-500 rounded-lg"
                          )}
                        >
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                            <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Checkbox
                                checked={selectedAssets.has(asset.id)}
                                onCheckedChange={() => toggleAssetSelection(asset.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/80 backdrop-blur">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedAsset(asset);
                                    setViewDetailsOpen(true);
                                  }}>
                                    <Eye className="w-4 h-4 ml-2" />
                                    عرض التفاصيل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedAsset(asset);
                                    setAssetAltText(asset.metadata?.altText || "");
                                    setEditAssetOpen(true);
                                  }}>
                                    <FileEdit className="w-4 h-4 ml-2" />
                                    تعديل الوصف
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    navigator.clipboard.writeText(asset.cloudinaryUrl);
                                    toast({
                                      title: "تم النسخ",
                                      description: "تم نسخ رابط الملف",
                                    });
                                  }}>
                                    <Copy className="w-4 h-4 ml-2" />
                                    نسخ الرابط
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <a href={asset.cloudinaryUrl} download target="_blank">
                                      <Download className="w-4 h-4 ml-2" />
                                      تحميل
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedAssets(new Set([asset.id]));
                                    setMoveItemsOpen(true);
                                  }}>
                                    <Move className="w-4 h-4 ml-2" />
                                    نقل
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedAssets(new Set([asset.id]));
                                      handleDeleteAssets();
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    حذف
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            {asset.type === "IMAGE" ? (
                              <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                                <img
                                  src={asset.thumbnailUrl || asset.cloudinaryUrl}
                                  alt={asset.metadata?.altText || asset.filename}
                                  className="w-full h-full object-contain"
                                  onClick={() => {
                                    setSelectedAsset(asset);
                                    setViewDetailsOpen(true);
                                  }}
                                />
                              </div>
                            ) : (
                              <div 
                                className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                                onClick={() => {
                                  setSelectedAsset(asset);
                                  setViewDetailsOpen(true);
                                }}
                              >
                                {getFileIcon(asset.type)}
                              </div>
                            )}
                            
                            <div className="p-2">
                              <p className="text-xs truncate" title={asset.filename}>
                                {asset.filename}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(asset.size)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      {/* List Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-gray-600 border-b">
                        <div className="col-span-1"></div>
                        <div className="col-span-5">الاسم</div>
                        <div className="col-span-2">النوع</div>
                        <div className="col-span-2">الحجم</div>
                        <div className="col-span-2">تاريخ الرفع</div>
                      </div>

                      {/* Folders */}
                      {folders
                        .filter(f => f.parentId === currentFolder?.id)
                        .map((folder) => (
                          <div
                            key={folder.id}
                            className={cn(
                              "grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer",
                              selectedFolders.has(folder.id) && "bg-blue-50 dark:bg-blue-900/20"
                            )}
                            onDoubleClick={() => setCurrentFolder(folder)}
                          >
                            <div className="col-span-1">
                              <Checkbox
                                checked={selectedFolders.has(folder.id)}
                                onCheckedChange={() => toggleFolderSelection(folder.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="col-span-5 flex items-center gap-2">
                              <FolderOpen className="w-5 h-5 text-blue-500" />
                              <span className="font-medium">{folder.name}</span>
                            </div>
                            <div className="col-span-2">مجلد</div>
                            <div className="col-span-2">{folder._count.assets} ملف</div>
                            <div className="col-span-2">
                              {new Date(folder.createdAt).toLocaleDateString("ar-SA")}
                            </div>
                          </div>
                        ))}

                      {/* Assets */}
                      {assets.map((asset) => (
                        <div
                          key={asset.id}
                          className={cn(
                            "grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer",
                            selectedAssets.has(asset.id) && "bg-blue-50 dark:bg-blue-900/20"
                          )}
                          onClick={() => {
                            setSelectedAsset(asset);
                            setViewDetailsOpen(true);
                          }}
                        >
                          <div className="col-span-1">
                            <Checkbox
                              checked={selectedAssets.has(asset.id)}
                              onCheckedChange={() => toggleAssetSelection(asset.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="col-span-5 flex items-center gap-2">
                            {getFileIcon(asset.type)}
                            <span className="truncate">{asset.filename}</span>
                          </div>
                          <div className="col-span-2">
                            <Badge variant="secondary" className="text-xs">
                              {asset.type}
                            </Badge>
                          </div>
                          <div className="col-span-2">{formatFileSize(asset.size)}</div>
                          <div className="col-span-2">
                            {new Date(asset.createdAt).toLocaleDateString("ar-SA")}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty State */}
                {assets.length === 0 && folders.filter(f => f.parentId === currentFolder?.id).length === 0 && (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">لا توجد ملفات في هذا المجلد</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      <Upload className="w-4 h-4 ml-2" />
                      رفع ملفات
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {/* Drag & Drop Overlay */}
          {dragOver && (
            <div className="absolute inset-0 bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <Upload className="w-16 h-16 mx-auto mb-3 text-blue-500" />
                <p className="text-lg font-medium">أفلت الملفات هنا للرفع</p>
              </div>
            </div>
          )}
        </div>

        {/* Dialogs */}
        
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
                <Label htmlFor="rename-folder">اسم المجلد</Label>
                <Input
                  id="rename-folder"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="الاسم الجديد"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRenameFolderOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleRenameFolder} disabled={!newFolderName.trim()}>
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
                اختر المجلد المراد نقل العناصر إليه
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>المجلد الهدف</Label>
                <Select value={targetFolderId || ""} onValueChange={setTargetFolderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر مجلد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__root">المجلد الرئيسي</SelectItem>
                    {folders
                      .filter(f => !selectedFolders.has(f.id))
                      .map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-600">
                سيتم نقل {selectedAssets.size + selectedFolders.size} عنصر
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMoveItemsOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleMoveItems}>
                نقل
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Asset Dialog */}
        <Dialog open={editAssetOpen} onOpenChange={setEditAssetOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل بيانات الملف</DialogTitle>
              <DialogDescription>
                تحديث وصف الملف للبحث وتحسين SEO
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedAsset?.type === "IMAGE" && (
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={selectedAsset.thumbnailUrl || selectedAsset.cloudinaryUrl}
                    alt={selectedAsset.metadata?.altText || selectedAsset.filename}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="alt-text">وصف الصورة (Alt Text)</Label>
                <Textarea
                  id="alt-text"
                  value={assetAltText}
                  onChange={(e) => setAssetAltText(e.target.value)}
                  placeholder="وصف مختصر للصورة يساعد في البحث وتحسين SEO"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditAssetOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleUpdateAsset}>
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>تفاصيل الملف</DialogTitle>
            </DialogHeader>
            {selectedAsset && (
              <div className="space-y-4">
                {selectedAsset.type === "IMAGE" && (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={selectedAsset.cloudinaryUrl}
                      alt={selectedAsset.metadata?.altText || selectedAsset.filename}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">اسم الملف</Label>
                    <p className="font-medium">{selectedAsset.filename}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">النوع</Label>
                    <p className="font-medium">{selectedAsset.type}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">الحجم</Label>
                    <p className="font-medium">{formatFileSize(selectedAsset.size)}</p>
                  </div>
                  {selectedAsset.width && selectedAsset.height && (
                    <div>
                      <Label className="text-gray-600">الأبعاد</Label>
                      <p className="font-medium">{selectedAsset.width} × {selectedAsset.height}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-600">تاريخ الرفع</Label>
                    <p className="font-medium">
                      {new Date(selectedAsset.createdAt).toLocaleString("ar-SA")}
                    </p>
                  </div>
                  {selectedAsset.folder && (
                    <div>
                      <Label className="text-gray-600">المجلد</Label>
                      <p className="font-medium">{selectedAsset.folder.name}</p>
                    </div>
                  )}
                </div>
                {selectedAsset.metadata?.altText && (
                  <div>
                    <Label className="text-gray-600">الوصف</Label>
                    <p className="mt-1">{selectedAsset.metadata.altText}</p>
                  </div>
                )}
                <div>
                  <Label className="text-gray-600">رابط الملف</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={selectedAsset.cloudinaryUrl} readOnly />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedAsset.cloudinaryUrl);
                        toast({
                          title: "تم النسخ",
                          description: "تم نسخ رابط الملف",
                        });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>
                إغلاق
              </Button>
              <Button asChild>
                <a href={selectedAsset?.cloudinaryUrl} download target="_blank">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل
                </a>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
