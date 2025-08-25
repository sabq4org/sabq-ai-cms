"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { getAuthHeaders } from "@/lib/utils/auth-headers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Upload, FolderOpen, Search, Image as ImageIcon, Video, FileAudio, FileText, ChevronRight, Home, Check, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";

interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  path: string;
  parentId: string | null;
  _count: {
    assets: number;
    subfolders: number;
  };
  children?: MediaFolder[];
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
  altText?: string;
  metadata?: any;
}

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  title?: string;
  acceptedTypes?: string[];
  multiple?: boolean;
  articleContent?: string;
  articleTitle?: string;
}

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
  title = "اختر ملف من مكتبة الوسائط",
  acceptedTypes,
  multiple = false,
  articleContent,
  articleTitle,
}: MediaPickerModalProps) {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<MediaFolder | null>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; altText: string }[]>([]);
  const [showAltTextModal, setShowAltTextModal] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [totalPages, setTotalPages] = useState(1);
  // Advanced filters
  const [ratio, setRatio] = useState<"all" | "3:4" | "4:3">("all");
  const [minW, setMinW] = useState<number | "">("");
  const [minH, setMinH] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "size" | "width" | "height">("latest");
  // AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState<MediaAsset[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch folders
      const foldersRes = await fetch("/api/admin/media/folders", { 
        credentials: 'include',
        headers: getAuthHeaders()
      });
      if (!foldersRes.ok) throw new Error("Failed to fetch folders");
      const foldersData = await foldersRes.json();
      setFolders(foldersData.hierarchy);

      // Fetch assets
      const params = new URLSearchParams();
      if (currentFolder) {
        params.set("folderId", currentFolder.id);
      }
      if (searchQuery) {
        params.set("search", searchQuery);
      }
      params.set("page", String(page));
      params.set("limit", String(limit));

      const assetsRes = await fetch(`/api/admin/media/assets?${params}`, { 
        credentials: 'include',
        headers: getAuthHeaders()
      });
      if (!assetsRes.ok) throw new Error("Failed to fetch assets");
      const assetsData = await assetsRes.json();
      
      // Filter by accepted types if specified
      let filteredAssets = assetsData.assets;
      if (acceptedTypes && acceptedTypes.length > 0) {
        filteredAssets = assetsData.assets.filter((asset: MediaAsset) =>
          acceptedTypes.some(type => asset.mimeType.startsWith(type))
        );
      }
      
      setAssets(filteredAssets);
      setTotalPages(assetsData.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentFolder, searchQuery, acceptedTypes, page, limit]);

  useEffect(() => {
    if (!open) return;
    fetchData();
  }, [open]);

  // جلب مهدأ عند تغيير البحث/المجلد لتفادي كثرة الطلبات + إعادة التمرير للأعلى
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      try { contentRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); } catch {}
      fetchData();
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery, currentFolder, page, limit]);

  // Fetch AI suggestions when opening and when content/title changes
  useEffect(() => {
    const run = async () => {
      if (!open) return;
      if (!articleContent && !articleTitle) return;
      try {
        setAiLoading(true);
        // استخدم نفس بنية الطلب الموجودة في SmartMediaPicker
        const minimalAssets = assets.map((a) => ({
          id: a.id,
          filename: a.filename,
          originalName: a.originalName,
          metadata: (a as any)?.metadata || {},
          tags: ((a as any)?.metadata?.tags || []) as string[],
        }));
        const response = await fetch("/api/ai/suggest-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: articleContent,
            title: articleTitle,
            availableImages: minimalAssets,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          // اربط النتائج بالصور الموجودة لدينا إن أمكن
          const suggestions: MediaAsset[] = (data.suggestions || [])
            .map((s: any) => assets.find((a) => a.id === s.assetId) || null)
            .filter(Boolean);
          setAiSuggestions(suggestions);
        }
      } catch (e) {
        console.warn("AI suggestions fetch failed", e);
      } finally {
        setAiLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, articleContent, articleTitle, assets]);

  const getAspectBadge = (asset: MediaAsset): "3:4" | "4:3" | "other" => {
    const w = asset.width || 0;
    const h = asset.height || 0;
    if (!w || !h) return "other";
    const r = w / h;
    const d34 = Math.abs(r - 0.75);
    const d43 = Math.abs(r - 1.3333333);
    if (d34 < 0.08) return "3:4";
    if (d43 < 0.08) return "4:3";
    return "other";
  };

  const filteredAndSortedAssets = React.useMemo(() => {
    let list = [...assets];
    // ratio filter (client-side)
    if (ratio !== "all") {
      list = list.filter((a) => getAspectBadge(a) === ratio);
    }
    if (typeof minW === "number" && minW > 0) {
      list = list.filter((a) => (a.width || 0) >= minW);
    }
    if (typeof minH === "number" && minH > 0) {
      list = list.filter((a) => (a.height || 0) >= minH);
    }
    // sorting
    list.sort((a, b) => {
      if (sortBy === "latest") return new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt as any).getTime() - new Date(b.createdAt as any).getTime();
      if (sortBy === "size") return (b.size || (b as any).size) - (a.size || (a as any).size);
      if (sortBy === "width") return (b.width || 0) - (a.width || 0);
      if (sortBy === "height") return (b.height || 0) - (a.height || 0);
      return 0;
    });
    return list;
  }, [assets, ratio, minW, minH, sortBy]);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handle file upload
  const handleFileUpload = async (filesWithAltText: { file: File; altText: string }[]) => {
    console.log("🚀 Starting file upload, files:", filesWithAltText);
    setUploading(true);
    
    try {
      for (const { file, altText } of filesWithAltText) {
        console.log("📤 Uploading file:", {
          name: file.name,
          type: file.type,
          size: file.size,
          altText: altText,
          lastModified: file.lastModified
        });
        
        // إنشاء FormData بدلاً من تحويل إلى base64
        const formData = new FormData();
        formData.append("file", file);
        formData.append("altText", altText);
        if (currentFolder?.id) {
          formData.append("folderId", currentFolder.id);
        }
        
        console.log("📤 Sending request with FormData (multipart/form-data)");
        
        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            // لا نضع Content-Type عند استخدام FormData - المتصفح يضعه تلقائياً
            "Accept": "application/json"
          },
          credentials: 'include',
          body: formData,
        });

        console.log("📡 Response status:", res.status, res.statusText);
        console.log("📡 Response headers:", Object.fromEntries(res.headers.entries()));

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
          console.error("Upload failed:", {
            status: res.status,
            statusText: res.statusText,
            errorData: errorData
          });
          
          let errorMessage = `Upload failed: ${res.status}`;
          if (res.status === 415) {
            errorMessage = "نوع المحتوى غير مدعوم. تأكد من أن الملف بصيغة صحيحة.";
          } else if (res.status === 413) {
            errorMessage = "حجم الملف كبير جداً. الحد الأقصى 50 ميجابايت.";
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
          
          throw new Error(errorMessage);
        }
        
        const newAsset = await res.json();
        
        // Auto-select the uploaded file
        if (!multiple) {
          setSelectedAsset(newAsset);
        } else {
          setSelectedAssets(prev => new Set([...prev, newAsset.id]));
        }
      }
      
      fetchData();
      setUploadedFiles([]); // مسح قائمة الملفات بعد الرفع الناجح
      alert(`تم رفع ${filesWithAltText.length} ملف بنجاح!`);
    } catch (error) {
      console.error("Upload error:", error);
      // عرض رسالة خطأ للمستخدم
      alert(error instanceof Error ? error.message : "حدث خطأ أثناء رفع الملف");
    } finally {
      setUploading(false);
    }
  };

  // Handle selection
  const handleSelect = () => {
    if (!multiple && selectedAsset) {
      onSelect(selectedAsset);
      onClose();
    } else if (multiple && selectedAssets.size > 0) {
      const selected = assets.filter(asset => selectedAssets.has(asset.id));
      selected.forEach(asset => onSelect(asset));
      onClose();
    }
  };

  // Get icon for asset type
  const getAssetIcon = (type: string) => {
    switch (type) {
      case "IMAGE":
        return <ImageIcon className="w-4 h-4" />;
      case "VIDEO":
        return <Video className="w-4 h-4" />;
      case "AUDIO":
        return <FileAudio className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Build breadcrumb
  const buildBreadcrumb = () => {
    const path = [];
    let folder = currentFolder;
    while (folder) {
      path.unshift(folder);
      folder = folders.find(f => f.children?.some(c => c.id === folder!.id)) || null;
    }
    return path;
  };

  const currentFolders = folders.filter(f => f.parentId === currentFolder?.id);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="w-[98vw] max-w-[1400px] h-[96vh] max-h-[96vh] p-0 overflow-hidden bg-white dark:bg-gray-900 flex flex-col">
        <DialogHeader className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={articleContent || articleTitle ? "ai" : "browse"} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-2 mt-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger value="upload" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm px-6 py-2 rounded-md transition-all">
              <Upload className="w-4 h-4 ml-2" />
              رفع جديد
            </TabsTrigger>
            <TabsTrigger value="browse" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm px-6 py-2 rounded-md transition-all">
              <FolderOpen className="w-4 h-4 ml-2" />
              تصفح المكتبة
            </TabsTrigger>
            {(articleContent || articleTitle) && (
              <TabsTrigger value="ai" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm px-6 py-2 rounded-md transition-all">
                <ImageIcon className="w-4 h-4 ml-2" />
                اقتراحات AI
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="browse" className="flex-1 flex flex-col min-h-0 m-0 w-full">
            {/* Search Bar */}
            <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                <div className="relative md:col-span-2">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="بحث دقيق بالاسم أو الوصف..."
                    value={searchQuery}
                    onChange={(e) => { setPage(1); setSearchQuery(e.target.value); }}
                    className="pr-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-gray-600 dark:text-gray-400">النسبة</Label>
                  <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm"
                          value={ratio}
                          onChange={(e) => { setPage(1); setRatio(e.target.value as any); }}>
                    <option value="all">الكل</option>
                    <option value="3:4">3:4</option>
                    <option value="4:3">4:3</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-gray-600 dark:text-gray-400">الحجم</Label>
                  <Input placeholder="min W" value={minW as any} onChange={(e)=>setMinW(e.target.value? Number(e.target.value):"")} className="w-24" />
                  <Input placeholder="min H" value={minH as any} onChange={(e)=>setMinH(e.target.value? Number(e.target.value):"")} className="w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-gray-600 dark:text-gray-400">الفرز</Label>
                  <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm"
                          value={sortBy}
                          onChange={(e)=>setSortBy(e.target.value as any)}>
                    <option value="latest">الأحدث</option>
                    <option value="oldest">الأقدم</option>
                    <option value="size">الحجم</option>
                    <option value="width">العرض</option>
                    <option value="height">الارتفاع</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Label className="text-sm text-gray-600 dark:text-gray-400">عدد لكل صفحة</Label>
                  <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm"
                          value={limit}
                          onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value || '24')); }}>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                    <option value={96}>96</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-1 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentFolder(null)}
                  className="p-1 h-auto"
                >
                  <Home className="w-3 h-3" />
                </Button>
                {buildBreadcrumb().map((folder) => (
                  <React.Fragment key={folder.id}>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentFolder(folder)}
                      className="p-1 h-auto"
                    >
                      {folder.name}
                    </Button>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Content */}
            <div ref={contentRef} className="flex-1 overflow-y-auto px-2 py-2 min-h-[60vh] sm:min-h-[65vh] lg:min-h-[70vh] w-full h-full">
              {loading ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-2 w-full">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Folders */}
                  {currentFolders.length > 0 && (
                    <div className="mb-4 w-full">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">المجلدات</h3>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-2 w-full">
                        {currentFolders.map(folder => (
                          <motion.div
                            key={folder.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="cursor-pointer"
                            onClick={() => setCurrentFolder(folder)}
                          >
                            <div className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
                              <FolderOpen className="w-10 h-10 text-blue-500 mb-2" />
                              <span className="text-sm font-medium text-center line-clamp-1">
                                {folder.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {folder._count.assets} ملف
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assets */}
                  {assets.length > 0 ? (
                    <div className="w-full">
                      {currentFolders.length > 0 && (
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">الملفات</h3>
                      )}
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-2 w-full">
                        {filteredAndSortedAssets.map(asset => {
                          const isSelected = multiple 
                            ? selectedAssets.has(asset.id)
                            : selectedAsset?.id === asset.id;

                          return (
                            <motion.div
                              key={asset.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={cn(
                                "cursor-pointer rounded-xl border overflow-hidden transition-all group",
                                isSelected 
                                  ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg"
                              )}
                              onClick={() => {
                                if (multiple) {
                                  const newSelection = new Set(selectedAssets);
                                  if (newSelection.has(asset.id)) {
                                    newSelection.delete(asset.id);
                                  } else {
                                    newSelection.add(asset.id);
                                  }
                                  setSelectedAssets(newSelection);
                                } else {
                                  setSelectedAsset(asset);
                                }
                              }}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/uri-list', asset.cloudinaryUrl);
                                e.dataTransfer.setData('text/plain', asset.cloudinaryUrl);
                                e.dataTransfer.setData('text/html', `<img src="${asset.cloudinaryUrl}" alt="${asset.altText || asset.originalName}" />`);
                              }}
                            >
                              <div className={cn(
                                "bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden rounded-lg w-full h-full",
                                getAspectBadge(asset) === '4:3' && 'aspect-[4/3]',
                                getAspectBadge(asset) === '3:4' && 'aspect-[3/4]',
                                getAspectBadge(asset) === 'other' && 'aspect-square'
                              )}>
                                {asset.type === "IMAGE" ? (
                                  <img
                                    src={asset.thumbnailUrl || asset.cloudinaryUrl}
                                    alt={asset.altText || (asset.metadata as any)?.altText || asset.filename}
                                    className="w-full h-full object-cover object-center transition-opacity duration-300"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="text-gray-400">
                                    {getAssetIcon(asset.type)}
                                  </div>
                                )}
                                {/* Ratio badge */}
                                <div className="absolute top-2 left-2 px-2 py-0.5 text-[10px] rounded bg-black/50 text-white">
                                  {getAspectBadge(asset) === 'other' ? '—' : getAspectBadge(asset)}
                                </div>
                                <div className={cn(
                                  "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity",
                                  isSelected && "opacity-100 bg-blue-500/30"
                                )} />
                                {isSelected && (
                                  <div className="absolute top-3 right-3 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="p-3 bg-white dark:bg-gray-900" title={`${asset.originalName}\n${asset.altText || ''}\n${asset.width}×${asset.height} • ${(asset.size/1024/1024).toFixed(1)} MB`}>
                                {(asset.altText || (asset.metadata as any)?.altText) && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-1" title={asset.altText || (asset.metadata as any)?.altText}>
                                    {asset.altText || (asset.metadata as any)?.altText}
                                  </p>
                                )}
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-1 font-mono" title={asset.filename}>
                                  {asset.filename}
                                </p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-between">
                                  <span>{(asset.size / 1024 / 1024).toFixed(1)} MB</span>
                                  <span>{asset.width}×{asset.height}</span>
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">لا توجد ملفات</p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Pagination - خارج منطقة التمرير */}
            {!loading && filteredAndSortedAssets.length > 0 && (
              <div className="px-2 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">صفحة {page} من {totalPages}</div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs"
                      onClick={() => setPage(1)} 
                      disabled={page <= 1}
                    >
                      الأولى
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs"
                      onClick={() => setPage(p => Math.max(1, p - 1))} 
                      disabled={page <= 1}
                    >
                      السابق
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                      disabled={page >= totalPages}
                    >
                      التالي
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs"
                      onClick={() => setPage(totalPages)} 
                      disabled={page >= totalPages}
                    >
                      الأخيرة
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* AI Suggestions */}
          {(articleContent || articleTitle) && (
            <TabsContent value="ai" className="flex-1 flex flex-col min-h-0 m-0 w-full">
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm">اقتراحات بناءً على محتوى الخبر</span>
                {aiLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
              <div className="flex-1 overflow-y-auto px-2 py-2">
                {aiLoading ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-2 w-full">
                    {[...Array(8)].map((_, i) => (
                      <Skeleton key={i} className="h-24" />
                    ))}
                  </div>
                ) : aiSuggestions.length === 0 ? (
                  <div className="text-center py-10 text-sm text-muted-foreground">لا توجد اقتراحات حالياً</div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-2 w-full">
                    {aiSuggestions.map((asset) => {
                      const isSelected = multiple 
                        ? selectedAssets.has(asset.id)
                        : selectedAsset?.id === asset.id;
                      return (
                        <motion.div
                          key={asset.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={cn(
                            "cursor-pointer rounded-xl border overflow-hidden transition-all group",
                            isSelected 
                              ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg"
                          )}
                          onClick={() => {
                            if (multiple) {
                              const newSelection = new Set(selectedAssets);
                              if (newSelection.has(asset.id)) newSelection.delete(asset.id); else newSelection.add(asset.id);
                              setSelectedAssets(newSelection);
                            } else {
                              setSelectedAsset(asset);
                            }
                          }}
                        >
                          <div className={cn(
                            "bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden rounded-lg w-full h-full",
                            getAspectBadge(asset) === '4:3' && 'aspect-[4/3]',
                            getAspectBadge(asset) === '3:4' && 'aspect-[3/4]',
                            getAspectBadge(asset) === 'other' && 'aspect-square'
                          )}>
                            <img src={asset.thumbnailUrl || asset.cloudinaryUrl} alt={asset.altText || asset.originalName} className="w-full h-full object-cover" loading="lazy" />
                            <div className="absolute top-2 left-2 px-2 py-0.5 text-[10px] rounded bg-black/50 text-white">{getAspectBadge(asset) === 'other' ? '—' : getAspectBadge(asset)}</div>
                            {isSelected && (
                              <div className="absolute top-3 right-3 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"><Check className="w-4 h-4 text-white" /></div>
                            )}
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-900">
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-1 font-mono" title={asset.filename}>{asset.filename}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          <TabsContent value="upload" className="flex-1 flex flex-col m-0 p-6">
            {uploadedFiles.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors bg-gray-50/50 dark:bg-gray-800/50">
                    <Upload className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      رفع الملفات
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      اسحب الملفات وأفلتها هنا أو
                    </p>
                    <Label htmlFor="picker-upload" className="cursor-pointer">
                      <div 
                        className={cn(
                          "inline-flex items-center justify-center gap-2 px-6 py-2 rounded-md text-white font-medium transition-colors",
                          uploading 
                            ? "bg-gray-500 cursor-not-allowed" 
                            : "bg-blue-600 hover:bg-blue-700"
                        )}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            جاري الرفع...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            اختر الملفات
                          </>
                        )}
                      </div>
                    </Label>
                    <input
                      id="picker-upload"
                      type="file"
                      multiple={true} // دائماً تفعيل الرفع المتعدد
                      accept={acceptedTypes?.join(",") || "image/*"}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const newFiles = Array.from(e.target.files).map(file => ({
                            file,
                            altText: ""
                          }));
                          setUploadedFiles(newFiles);
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                      الحد الأقصى: 10MB لكل ملف • يمكنك رفع عدة ملفات دفعة واحدة
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">الملفات المختارة ({uploadedFiles.length})</h3>
                <div className="space-y-3 mb-6">
                  {uploadedFiles.map((item, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={URL.createObjectURL(item.file)}
                            alt={item.file.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{item.file.name}</p>
                          <Input
                            placeholder="أضف وصف للصورة (اختياري)"
                            value={item.altText}
                            onChange={(e) => {
                              const newFiles = [...uploadedFiles];
                              newFiles[index].altText = e.target.value;
                              setUploadedFiles(newFiles);
                            }}
                            className="text-sm"
                          />
                          <p className="text-xs text-gray-500 mt-1">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleFileUpload(uploadedFiles)}
                    disabled={uploading}
                    className="flex-1"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري رفع {uploadedFiles.length} ملف...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 ml-2" />
                        رفع جميع الملفات
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setUploadedFiles([])}
                    disabled={uploading}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-6"
          >
            إلغاء
          </Button>
          
          <div className="flex items-center gap-3">
            {(multiple ? selectedAssets.size > 0 : selectedAsset) && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {multiple ? `${selectedAssets.size} ملف محدد` : "ملف واحد محدد"}
              </span>
            )}
            <Button 
              onClick={handleSelect} 
              disabled={multiple ? selectedAssets.size === 0 : !selectedAsset}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 disabled:bg-gray-300 dark:disabled:bg-gray-700"
            >
              <Check className="w-4 h-4 ml-2" />
              {multiple ? "اختيار الملفات" : "اختيار الملف"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
