/**
 * صفحة مكتبة الوسائط المحسّنة مع الذكاء الاصطناعي
 * Enhanced Media Library Page with AI Integration
 */

"use client";

import Image from "next/image";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Upload, Grid, List, Folder, RefreshCw, Download, Filter, Image as ImageIcon, Video, Music, FileText, FolderOpen, Trash2, MoreVertical, X, Sparkles, Eye, Edit, Copy, ArrowLeft, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DesignComponents } from "@/components/design-system/DesignSystemGuide";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdvancedImageUpload from "@/components/admin/media/AdvancedImageUpload";
import SmartMediaPicker from "@/components/admin/media/SmartMediaPicker";

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
  const [showSmartPicker, setShowSmartPicker] = useState(false);
  const { toast } = useToast();

  // Debounced search effect - تقليل الوقت لجعل البحث أسرع
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // تقليل من 500 إلى 300ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch folders and assets in parallel
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
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data based on search and filters - تحسين البحث ليكون أكثر فعالية
  const { filteredAssets, filteredFolders } = useMemo(() => {
    let assets = allAssets;
    let folders = allFolders;

    // Apply search filter - تحسين البحث ليشمل الوسوم والأوصاف
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
      // Show only root folders when no folder is selected
      folders = folders.filter(folder => !folder.parentId);
    }

    // Apply type filter
    if (filterType) {
      assets = assets.filter(asset => asset.type === filterType);
    }

    return { filteredAssets: assets, filteredFolders: folders };
  }, [allAssets, allFolders, debouncedSearchQuery, selectedFolder, filterType]);

  // Get current folder path for breadcrumb
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

  // Format file size
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get statistics
  const stats = useMemo(() => {
    const totalAssets = filteredAssets.length;
    const totalFolders = filteredFolders.length;
    const imageCount = filteredAssets.filter((a: MediaAsset) => a.type === "IMAGE").length;
    const videoCount = filteredAssets.filter((a: MediaAsset) => a.type === "VIDEO").length;
    const audioCount = filteredAssets.filter((a: MediaAsset) => a.type === "AUDIO").length;
    const documentCount = filteredAssets.filter((a: MediaAsset) => a.type === "DOCUMENT").length;
    const totalSize = filteredAssets.reduce((sum: number, asset: MediaAsset) => sum + asset.size, 0);

    return {
      totalAssets,
      totalFolders,
      imageCount,
      videoCount,
      audioCount,
      documentCount,
      totalSize: formatFileSize(totalSize),
    };
  }, [filteredAssets, filteredFolders]);

  // Get media type icon
  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case "IMAGE": return ImageIcon;
      case "VIDEO": return Video;
      case "AUDIO": return Music;
      case "DOCUMENT": return FileText;
      default: return FileText;
    }
  };

  // Get media type color
  const getMediaTypeColor = (type: string) => {
    switch (type) {
      case "IMAGE": return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case "VIDEO": return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
      case "AUDIO": return "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400";
      case "DOCUMENT": return "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400";
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  // Handle asset selection
  const handleAssetSelect = (assetId: string) => {
    setSelectedAssets(prev => {
      if (prev.includes(assetId)) {
        return prev.filter(id => id !== assetId);
      } else {
        return [...prev, assetId];
      }
    });
  };

  // Handle upload complete
  const handleUploadComplete = (uploadedAssets: MediaAsset[]) => {
    setAllAssets(prev => [...uploadedAssets, ...prev]);
    setShowUpload(false);
    toast({
      title: "تم رفع الصور بنجاح",
      description: `تم رفع ${uploadedAssets.length} صورة`,
    });
  };

  // Handle smart picker selection
  const handleSmartPickerSelection = (selectedImages: MediaAsset[]) => {
    setSelectedAssets(selectedImages.map(img => img.id));
    setShowSmartPicker(false);
    toast({
      title: "تم اختيار الصور",
      description: `تم اختيار ${selectedImages.length} صورة`,
    });
  };

  return (
    <div className="w-full max-w-none space-y-6">
      {/* رسالة الترحيب */}
      <DesignComponents.StandardCard className="w-full max-w-none p-6 bg-gradient-to-l from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              مكتبة الوسائط
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              إدارة وتنظيم جميع ملفات الوسائط الخاصة بك
            </p>
            <div className="flex gap-3">
              <DesignComponents.StatusIndicator
                status="success"
                text={`${stats.totalAssets} ملف`}
              />
              <DesignComponents.StatusIndicator
                status="info"
                text={`${stats.totalFolders} مجلد`}
              />
              <DesignComponents.StatusIndicator
                status="warning"
                text={stats.totalSize}
              />
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              آخر تحديث
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {new Date().toLocaleDateString("ar-SA")}
            </div>
          </div>
        </div>
      </DesignComponents.StandardCard>

      {/* شريط الأدوات */}
      <div className="w-full max-w-none">
        <DesignComponents.SectionHeader
          title="إدارة الملفات"
          description="رفع وتنظيم وإدارة ملفات الوسائط"
          action={
            <DesignComponents.ActionBar>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSmartPicker(true)}
              >
                <Sparkles className="w-4 h-4 ml-2" />
                اختيار ذكي
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 ml-2" />
                تصفية
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 ml-2" />
                تصدير
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowUpload(true)}
              >
                <Upload className="w-4 h-4 ml-2" />
                رفع ملف
              </Button>
            </DesignComponents.ActionBar>
          }
        />

        {/* شريط التنقل */}
        {selectedFolder && (
          <div className="w-full max-w-none mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFolder(null)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة للجذر
              </Button>
              <span>/</span>
              {currentFolderPath.slice(1).map((folder, index) => (
                <div key={folder.id || "root"} className="flex items-center gap-2">
                  {index > 0 && <span>/</span>}
                  <button
                    onClick={() => setSelectedFolder(folder.id)}
                    className={cn(
                      "hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                      index === currentFolderPath.length - 2 && "text-gray-900 dark:text-gray-100 font-medium"
                    )}
                  >
                    {folder.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* شريط البحث والتحكم المحسّن */}
        <div className="w-full max-w-none flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="البحث في الملفات والمجلدات... (اسم الملف، الوصف، الوسوم)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {/* مؤشر البحث النشط */}
            {debouncedSearchQuery && debouncedSearchQuery !== searchQuery && (
              <div className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-400">
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <select
              value={filterType || ""}
              onChange={(e) => setFilterType(e.target.value || null)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm min-w-[120px]"
            >
              <option value="">جميع الأنواع</option>
              <option value="IMAGE">صور ({stats.imageCount})</option>
              <option value="VIDEO">فيديو ({stats.videoCount})</option>
              <option value="AUDIO">صوت ({stats.audioCount})</option>
              <option value="DOCUMENT">مستندات ({stats.documentCount})</option>
            </select>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              title="عرض شبكي"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              title="عرض قائمة"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              title="تحديث"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* نتائج البحث */}
        {debouncedSearchQuery && (
          <div className="w-full max-w-none mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <Search className="w-4 h-4" />
              <span>
                نتائج البحث عن "{debouncedSearchQuery}": 
                <strong className="text-gray-900 dark:text-gray-100 ml-1">
                  {filteredAssets.length + filteredFolders.length} نتيجة
                </strong>
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="mr-auto text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                مسح البحث
              </button>
            </div>
          </div>
        )}
      </div>

      {/* الإحصائيات */}
      <div className="w-full max-w-none grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <DesignComponents.StandardCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.totalFolders}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                مجلد
              </div>
            </div>
          </div>
        </DesignComponents.StandardCard>

        <DesignComponents.StandardCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.imageCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                صورة
              </div>
            </div>
          </div>
        </DesignComponents.StandardCard>

        <DesignComponents.StandardCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.videoCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                فيديو
              </div>
            </div>
          </div>
        </DesignComponents.StandardCard>

        <DesignComponents.StandardCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.audioCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                صوت
              </div>
            </div>
          </div>
        </DesignComponents.StandardCard>

        <DesignComponents.StandardCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.documentCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                مستند
              </div>
            </div>
          </div>
        </DesignComponents.StandardCard>

        <DesignComponents.StandardCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.totalAssets}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                إجمالي
              </div>
            </div>
          </div>
        </DesignComponents.StandardCard>
      </div>

      {/* المحتوى الرئيسي */}
      <DesignComponents.StandardCard className="w-full max-w-none">
        <ScrollArea className="h-[70vh] p-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* المجلدات */}
              {filteredFolders.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Folder className="w-5 h-5" />
                    المجلدات ({filteredFolders.length})
                  </h3>
                  <div className={cn(
                    "grid gap-4 mb-6",
                    viewMode === "grid" 
                      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
                      : "grid-cols-1"
                  )}>
                    {filteredFolders.map((folder: MediaFolder) => (
                      <Card 
                        key={folder.id} 
                        className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-800"
                        onClick={() => setSelectedFolder(folder.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                              <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {folder.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {folder._count.assets} ملف
                              </div>
                            </div>
                            <MoreVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* الملفات */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    الملفات ({filteredAssets.length})
                  </h3>
                  {selectedAssets.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Check className="w-3 h-3" />
                        {selectedAssets.length} محدد
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAssets([])}
                      >
                        إلغاء التحديد
                      </Button>
                    </div>
                  )}
                </div>
                <div className={cn(
                  "grid gap-4",
                  viewMode === "grid" 
                    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
                    : "grid-cols-1"
                )}>
                  {filteredAssets.map((asset: MediaAsset) => {
                    const TypeIcon = getMediaTypeIcon(asset.type);
                    const isSelected = selectedAssets.includes(asset.id);
                    return (
                      <Card 
                        key={asset.id} 
                        className={cn(
                          "group cursor-pointer transition-all duration-200 border-2",
                          isSelected 
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                            : "border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-lg"
                        )}
                        onClick={() => handleAssetSelect(asset.id)}
                      >
                        <CardContent className="p-0">
                          <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                            {asset.type === "IMAGE" ? (
                              <Image
                                src={asset.thumbnailUrl || asset.cloudinaryUrl}
                                alt={asset.metadata?.altText || asset.originalName}
                                fill
                                className="object-cover object-center group-hover:scale-105 transition-transform duration-200"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <TypeIcon className={cn("w-12 h-12", getMediaTypeColor(asset.type))} />
                              </div>
                            )}
                            
                            {/* مؤشر الاختيار */}
                            <div className="absolute top-2 right-2">
                              <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                isSelected
                                  ? "bg-blue-500 border-blue-500 text-white"
                                  : "bg-white/80 border-gray-300 group-hover:border-blue-400"
                              )}>
                                {isSelected && <Check className="w-4 h-4" />}
                              </div>
                            </div>

                            {/* نوع الملف */}
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className={cn("text-xs", getMediaTypeColor(asset.type))}>
                                {asset.type}
                              </Badge>
                            </div>

                            {/* أزرار الإجراءات عند Hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="flex gap-2">
                                <Button size="sm" variant="secondary">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="secondary">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="secondary">
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-3">
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate mb-1">
                              {asset.originalName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              {formatFileSize(asset.size)}
                              {asset.width && asset.height && (
                                <> • {asset.width}×{asset.height}</>
                              )}
                            </div>
                            {asset.metadata?.altText && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {asset.metadata.altText}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(asset.createdAt).toLocaleDateString("ar-SA")}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* رسالة فارغة */}
              {!loading && filteredAssets.length === 0 && filteredFolders.length === 0 && (
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {searchQuery ? "لم يتم العثور على نتائج" : "لا توجد ملفات"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchQuery 
                      ? `لا توجد ملفات تحتوي على "${searchQuery}"`
                      : "ابدأ برفع ملفات جديدة أو إنشاء مجلدات"
                    }
                  </p>
                  {searchQuery ? (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="w-4 h-4 ml-2" />
                      مسح البحث
                    </Button>
                  ) : (
                    <Button onClick={() => setShowUpload(true)}>
                      <Upload className="w-4 h-4 ml-2" />
                      رفع ملف
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DesignComponents.StandardCard>

      {/* مودال رفع الصور */}
      <AdvancedImageUpload
        open={showUpload}
        onOpenChange={setShowUpload}
        onUploadComplete={handleUploadComplete}
        selectedFolder={selectedFolder}
      />

      {/* مودال الاختيار الذكي */}
      <SmartMediaPicker
        open={showSmartPicker}
        onOpenChange={setShowSmartPicker}
        onSelectImages={handleSmartPickerSelection}
        multiSelect={true}
      />
    </div>
  );
}
