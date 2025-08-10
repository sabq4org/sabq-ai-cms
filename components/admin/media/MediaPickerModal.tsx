"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Upload, FolderOpen, Search, Image as ImageIcon, Video, FileAudio, FileText, ChevronRight, Home, Check } from "lucide-react";
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
}

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  title?: string;
  acceptedTypes?: string[];
  multiple?: boolean;
}

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
  title = "اختر ملف من مكتبة الوسائط",
  acceptedTypes,
  multiple = false,
}: MediaPickerModalProps) {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<MediaFolder | null>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch folders
      const foldersRes = await fetch("/api/admin/media/folders");
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

      const assetsRes = await fetch(`/api/admin/media/assets?${params}`);
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
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentFolder, searchQuery, acceptedTypes]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        if (currentFolder) {
          formData.append("folderId", currentFolder.id);
        }

        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        
        const newAsset = await res.json();
        
        // Auto-select the uploaded file
        if (!multiple) {
          setSelectedAsset(newAsset);
        } else {
          setSelectedAssets(prev => new Set([...prev, newAsset.id]));
        }
      }
      
      fetchData();
    } catch (error) {
      console.error("Upload error:", error);
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
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="browse" className="flex-1 flex flex-col">
          <TabsList className="mx-6">
            <TabsTrigger value="browse">تصفح المكتبة</TabsTrigger>
            <TabsTrigger value="upload">رفع جديد</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="flex-1 flex flex-col m-0">
            {/* Search Bar */}
            <div className="px-6 py-3 border-b">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في الملفات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                />
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="px-6 py-2 border-b bg-gray-50">
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
            <ScrollArea className="flex-1 px-6 py-4">
              {loading ? (
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Folders */}
                  {currentFolders.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">المجلدات</h3>
                      <div className="grid grid-cols-4 gap-3">
                        {currentFolders.map(folder => (
                          <motion.div
                            key={folder.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="cursor-pointer"
                            onClick={() => setCurrentFolder(folder)}
                          >
                            <div className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors border">
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
                    <div>
                      {currentFolders.length > 0 && (
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">الملفات</h3>
                      )}
                      <div className="grid grid-cols-4 gap-3">
                        {assets.map(asset => {
                          const isSelected = multiple 
                            ? selectedAssets.has(asset.id)
                            : selectedAsset?.id === asset.id;

                          return (
                            <motion.div
                              key={asset.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={cn(
                                "cursor-pointer rounded-lg border overflow-hidden transition-all",
                                isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
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
                            >
                              <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                                {asset.type === "IMAGE" ? (
                                  <img
                                    src={asset.thumbnailUrl || asset.cloudinaryUrl}
                                    alt={asset.filename}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="text-gray-400">
                                    {getAssetIcon(asset.type)}
                                  </div>
                                )}
                                {isSelected && (
                                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="p-2">
                                <p className="text-xs font-medium line-clamp-1" title={asset.filename}>
                                  {asset.filename}
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
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upload" className="flex-1 flex items-center justify-center m-0">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <Label htmlFor="picker-upload" className="cursor-pointer">
                <Button variant="default" disabled={uploading} asChild>
                  <span>
                    {uploading ? "جاري الرفع..." : "اختر ملفات للرفع"}
                  </span>
                </Button>
              </Label>
              <Input
                id="picker-upload"
                type="file"
                multiple={multiple}
                accept={acceptedTypes?.join(",")}
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
              <p className="text-sm text-muted-foreground mt-2">
                أو اسحب الملفات وأفلتها هنا
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="p-6 pt-0 flex justify-between border-t">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button 
            onClick={handleSelect} 
            disabled={multiple ? selectedAssets.size === 0 : !selectedAsset}
          >
            {multiple ? `اختيار (${selectedAssets.size})` : "اختيار"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
