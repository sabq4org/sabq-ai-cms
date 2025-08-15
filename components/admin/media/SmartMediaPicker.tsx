/**
 * مكون اختيار الصور من المكتبة مع الذكاء الاصطناعي
 * Smart Media Library Picker with AI Suggestions
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Grid, List, Folder, Image as ImageIcon, Sparkles, Star, Eye, Download, Tag, X, Check, Loader2, Filter, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
  metadata?: {
    altText?: string;
    description?: string;
    tags?: string[];
  };
  folderId?: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  folder?: {
    id: string;
    name: string;
    path: string;
  };
  aiRelevanceScore?: number; // نقاط الملاءمة من الذكاء الاصطناعي
  aiReasons?: string[]; // أسباب الاقتراح
}

interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    assets: number;
    subfolders: number;
  };
}

interface SmartMediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectImages: (images: MediaAsset[]) => void;
  multiSelect?: boolean;
  articleContent?: string; // محتوى المقال لتحليل الذكاء الاصطناعي
  articleTitle?: string; // عنوان المقال
  selectedImages?: string[]; // الصور المختارة حالياً
}

export default function SmartMediaPicker({
  open,
  onOpenChange,
  onSelectImages,
  multiSelect = false,
  articleContent,
  articleTitle,
  selectedImages = []
}: SmartMediaPickerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>(selectedImages);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<MediaAsset[]>([]);
  const { toast } = useToast();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // جلب البيانات
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [foldersResponse, assetsResponse] = await Promise.all([
        fetch("/api/admin/media/folders", { credentials: 'include' }),
        fetch("/api/admin/media/assets?type=IMAGE", { credentials: 'include' })
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
  }, [toast]);

  // تحليل المحتوى واقتراح الصور
  const getAISuggestions = useCallback(async () => {
    if (!articleContent && !articleTitle) return;

    try {
      setAiLoading(true);
      
      const response = await fetch("/api/ai/suggest-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: articleContent,
          title: articleTitle,
          availableImages: assets.map(asset => ({
            id: asset.id,
            filename: asset.filename,
            originalName: asset.originalName,
            metadata: asset.metadata,
            tags: asset.metadata?.tags || []
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // ربط النتائج بالصور الموجودة
        const suggestedAssets = data.suggestions
          .map((suggestion: any) => {
            const asset = assets.find(a => a.id === suggestion.assetId);
            if (asset) {
              return {
                ...asset,
                aiRelevanceScore: suggestion.relevanceScore,
                aiReasons: suggestion.reasons
              };
            }
            return null;
          })
          .filter(Boolean)
          .sort((a: any, b: any) => b.aiRelevanceScore - a.aiRelevanceScore);

        setAiSuggestions(suggestedAssets);
        
        if (suggestedAssets.length > 0) {
          toast({
            title: "تم العثور على اقتراحات",
            description: `وجد الذكاء الاصطناعي ${suggestedAssets.length} صورة مناسبة`,
          });
        }
      }
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
    } finally {
      setAiLoading(false);
    }
  }, [articleContent, articleTitle, assets, toast]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  useEffect(() => {
    if (assets.length > 0 && (articleContent || articleTitle)) {
      getAISuggestions();
    }
  }, [assets, getAISuggestions]);

  // تصفية البيانات
  const filteredData = useMemo(() => {
    let filteredAssets = assets;
    let filteredFolders = folders;

    // تطبيق البحث
    if (debouncedSearchQuery.trim()) {
      const searchLower = debouncedSearchQuery.toLowerCase();
      filteredAssets = filteredAssets.filter(asset =>
        asset.originalName.toLowerCase().includes(searchLower) ||
        asset.filename.toLowerCase().includes(searchLower) ||
        asset.metadata?.altText?.toLowerCase().includes(searchLower) ||
        asset.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );

      filteredFolders = filteredFolders.filter(folder =>
        folder.name.toLowerCase().includes(searchLower)
      );
    }

    // تطبيق فلتر المجلد
    if (selectedFolder) {
      filteredAssets = filteredAssets.filter(asset => asset.folderId === selectedFolder);
      filteredFolders = filteredFolders.filter(folder => folder.parentId === selectedFolder);
    } else {
      filteredFolders = filteredFolders.filter(folder => !folder.parentId);
    }

    return { assets: filteredAssets, folders: filteredFolders };
  }, [assets, folders, debouncedSearchQuery, selectedFolder]);

  const handleAssetSelect = (assetId: string) => {
    if (multiSelect) {
      setSelectedAssets(prev => 
        prev.includes(assetId) 
          ? prev.filter(id => id !== assetId)
          : [...prev, assetId]
      );
    } else {
      setSelectedAssets([assetId]);
    }
  };

  const handleConfirm = () => {
    const selected = assets.filter(asset => selectedAssets.includes(asset.id));
    onSelectImages(selected);
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            اختيار الصور من المكتبة
            {(articleContent || articleTitle) && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                مع اقتراحات AI
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[70vh]">
          {/* شريط الأدوات */}
          <div className="px-6 pb-4 border-b space-y-4">
            {/* شريط التنقل */}
            {selectedFolder && (
              <div className="flex items-center gap-2 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFolder(null)}
                >
                  <ArrowLeft className="w-4 h-4 ml-1" />
                  العودة للجذر
                </Button>
              </div>
            )}

            {/* البحث والتحكم */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث في الصور..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                {aiSuggestions.length > 0 && (
                  <Button
                    variant={showAISuggestions ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAISuggestions(!showAISuggestions)}
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    اقتراحات AI ({aiSuggestions.length})
                  </Button>
                )}
                
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
              </div>
            </div>
          </div>

          {/* المحتوى */}
          <ScrollArea className="flex-1 px-6">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-6 py-4">
                {/* اقتراحات الذكاء الاصطناعي */}
                {showAISuggestions && aiSuggestions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      <h3 className="text-lg font-semibold">اقتراحات الذكاء الاصطناعي</h3>
                      {aiLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    </div>
                    <div className={cn(
                      "grid gap-4 mb-6",
                      viewMode === "grid" 
                        ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                        : "grid-cols-1"
                    )}>
                      {aiSuggestions.slice(0, 6).map((asset) => (
                        <Card 
                          key={asset.id}
                          className={cn(
                            "group cursor-pointer transition-all duration-200 border-2",
                            selectedAssets.includes(asset.id)
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-transparent hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-lg"
                          )}
                          onClick={() => handleAssetSelect(asset.id)}
                        >
                          <CardContent className="p-0">
                            <div className="relative aspect-square overflow-hidden rounded-t-lg">
                              <Image
                                src={asset.thumbnailUrl || asset.cloudinaryUrl}
                                alt={asset.metadata?.altText || asset.originalName}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              
                              {/* أيقونة الذكاء الاصطناعي */}
                              <div className="absolute top-2 left-2">
                                <Badge variant="default" className="bg-purple-500 text-white gap-1">
                                  <Star className="w-3 h-3" />
                                  {Math.round((asset.aiRelevanceScore || 0) * 100)}%
                                </Badge>
                              </div>

                              {/* مؤشر الاختيار */}
                              <div className="absolute top-2 right-2">
                                <div className={cn(
                                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                  selectedAssets.includes(asset.id)
                                    ? "bg-blue-500 border-blue-500 text-white"
                                    : "bg-white/80 border-gray-300 group-hover:border-blue-400"
                                )}>
                                  {selectedAssets.includes(asset.id) && <Check className="w-4 h-4" />}
                                </div>
                              </div>

                              {/* عرض سريع عند Hover */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Button size="sm" variant="secondary" className="gap-2">
                                  <Eye className="w-4 h-4" />
                                  معاينة
                                </Button>
                              </div>
                            </div>
                            
                            <div className="p-3">
                              <div className="font-medium text-sm truncate mb-1">
                                {asset.originalName}
                              </div>
                              <div className="text-xs text-gray-500 mb-2">
                                {formatFileSize(asset.size)}
                              </div>
                              
                              {/* أسباب الاقتراح */}
                              {asset.aiReasons && asset.aiReasons.length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                    أسباب الاقتراح:
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {asset.aiReasons.slice(0, 2).join(", ")}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* المجلدات */}
                {filteredData.folders.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Folder className="w-5 h-5" />
                      المجلدات ({filteredData.folders.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                      {filteredData.folders.map((folder) => (
                        <Card
                          key={folder.id}
                          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-800"
                          onClick={() => setSelectedFolder(folder.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                  {folder.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {folder._count.assets} صورة
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* الصور */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    الصور ({filteredData.assets.length})
                  </h3>
                  <div className={cn(
                    "grid gap-4",
                    viewMode === "grid" 
                      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                      : "grid-cols-1"
                  )}>
                    {filteredData.assets.map((asset) => (
                      <Card 
                        key={asset.id}
                        className={cn(
                          "group cursor-pointer transition-all duration-200 border-2",
                          selectedAssets.includes(asset.id)
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-lg"
                        )}
                        onClick={() => handleAssetSelect(asset.id)}
                      >
                        <CardContent className="p-0">
                          <div className="relative aspect-square overflow-hidden rounded-t-lg">
                            <Image
                              src={asset.thumbnailUrl || asset.cloudinaryUrl}
                              alt={asset.metadata?.altText || asset.originalName}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            
                            {/* مؤشر الاختيار */}
                            <div className="absolute top-2 right-2">
                              <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                selectedAssets.includes(asset.id)
                                  ? "bg-blue-500 border-blue-500 text-white"
                                  : "bg-white/80 border-gray-300 group-hover:border-blue-400"
                              )}>
                                {selectedAssets.includes(asset.id) && <Check className="w-4 h-4" />}
                              </div>
                            </div>

                            {/* الوسوم */}
                            {asset.metadata?.tags && asset.metadata.tags.length > 0 && (
                              <div className="absolute bottom-2 left-2">
                                <Badge variant="secondary" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {asset.metadata.tags.length}
                                </Badge>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-3">
                            <div className="font-medium text-sm truncate">
                              {asset.originalName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatFileSize(asset.size)} • {asset.width}×{asset.height}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* رسالة فارغة */}
                {!loading && filteredData.assets.length === 0 && filteredData.folders.length === 0 && (
                  <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {searchQuery ? "لم يتم العثور على نتائج" : "لا توجد صور"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery 
                        ? `لا توجد صور تحتوي على "${searchQuery}"`
                        : "لا توجد صور في هذا المجلد"
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* أزرار التحكم */}
          <DialogFooter className="p-6 pt-4 border-t">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-500">
                {selectedAssets.length > 0 && (
                  `تم اختيار ${selectedAssets.length} صورة`
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={handleConfirm}
                  disabled={selectedAssets.length === 0}
                >
                  تأكيد الاختيار ({selectedAssets.length})
                </Button>
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
