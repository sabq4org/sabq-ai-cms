/**
 * صفحة مكتبة الوسائط - التصميم الحديث
 * Media Library Page - Modern Design
 */

"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { Search, Upload, Grid, List, Folder, RefreshCw, Download, Filter, Image as ImageIcon, Video, Music, FileText, FolderOpen, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DesignComponents } from "@/components/design-system/DesignSystemGuide";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

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
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch folders and assets in parallel
      const [foldersResponse, assetsResponse] = await Promise.all([
        fetch("/api/admin/media/folders"),
        fetch(`/api/admin/media/assets?${new URLSearchParams({
          ...(selectedFolder && { folderId: selectedFolder }),
          ...(searchQuery && { search: searchQuery }),
          ...(filterType && { type: filterType }),
        })}`)
      ]);

      if (foldersResponse.ok && assetsResponse.ok) {
        const [foldersData, assetsData] = await Promise.all([
          foldersResponse.json(),
          assetsResponse.json()
        ]);
        
        setFolders(foldersData.folders || []);
        setAssets(assetsData.assets || []);
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
  };

  useEffect(() => {
    fetchData();
  }, [selectedFolder, searchQuery, filterType]);

  // Get statistics
  const stats = useMemo(() => {
    const totalAssets = assets.length;
    const totalFolders = folders.length;
    const imageCount = assets.filter(a => a.type === "IMAGE").length;
    const videoCount = assets.filter(a => a.type === "VIDEO").length;
    const audioCount = assets.filter(a => a.type === "AUDIO").length;
    const documentCount = assets.filter(a => a.type === "DOCUMENT").length;
    const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);

    return {
      totalAssets,
      totalFolders,
      imageCount,
      videoCount,
      audioCount,
      documentCount,
      totalSize: formatFileSize(totalSize),
    };
  }, [assets, folders]);

  // Format file size
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

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
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 ml-2" />
                تصفية
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 ml-2" />
                تصدير
              </Button>
              <Button size="sm">
                <Upload className="w-4 h-4 ml-2" />
                رفع ملف
              </Button>
            </DesignComponents.ActionBar>
          }
        />

        {/* شريط البحث والتحكم */}
        <div className="w-full max-w-none flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="البحث في الملفات والمجلدات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
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
      <DesignComponents.StandardCard className="w-full max-w-none p-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* المجلدات */}
            {folders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  المجلدات ({folders.length})
                </h3>
                <div className={cn(
                  "grid gap-4",
                  viewMode === "grid" 
                    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
                    : "grid-cols-1"
                )}>
                  {folders.map((folder) => (
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                الملفات ({assets.length})
              </h3>
              <div className={cn(
                "grid gap-4",
                viewMode === "grid" 
                  ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
                  : "grid-cols-1"
              )}>
                {assets.map((asset) => {
                  const TypeIcon = getMediaTypeIcon(asset.type);
                  return (
                    <Card 
                      key={asset.id} 
                      className="group cursor-pointer hover:shadow-lg transition-all duration-200"
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-square overflow-hidden rounded-t-lg">
                          {asset.type === "IMAGE" ? (
                            <Image
                              src={asset.thumbnailUrl || asset.cloudinaryUrl}
                              alt={asset.originalName}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <TypeIcon className={cn("w-12 h-12", getMediaTypeColor(asset.type))} />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className={cn("text-xs", getMediaTypeColor(asset.type))}>
                              {asset.type}
                            </Badge>
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Button size="sm" variant="secondary">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                            {asset.originalName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatFileSize(asset.size)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
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
            {!loading && assets.length === 0 && folders.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  لا توجد ملفات
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  ابدأ برفع ملفات جديدة أو إنشاء مجلدات
                </p>
                <Button>
                  <Upload className="w-4 h-4 ml-2" />
                  رفع ملف
                </Button>
              </div>
            )}
          </div>
        )}
      </DesignComponents.StandardCard>
    </div>
  );
}
