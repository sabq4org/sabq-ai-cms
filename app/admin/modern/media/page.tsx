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
  
  const { toast } = useToast();

  // Fetch folders and assets
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch folders
      const foldersRes = await fetch("/api/admin/media/folders");
      if (!foldersRes.ok) throw new Error("Failed to fetch folders");
      const foldersData = await foldersRes.json();
      setFolders(foldersData.folders);

      // Fetch assets for current folder
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

  // Delete asset
  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الملف؟")) return;

    try {
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

      fetchData();
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل حذف الملف",
        variant: "destructive",
      });
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
    if (!confirm(`هل أنت متأكد من حذف ${totalItems} عنصر؟`)) return;

    try {
      // Delete assets
      for (const assetId of assetIds) {
        await fetch(`/api/admin/media/assets/${assetId}`, { method: "DELETE" });
      }

      // Delete folders
      for (const folderId of folderIds) {
        await fetch(`/api/admin/media/folders/${folderId}`, { method: "DELETE" });
      }

      setSelectedFolders(new Set());
      setSelectedAssets(new Set());
      
      toast({
        title: "تم الحذف",
        description: "تم حذف العناصر المحددة بنجاح",
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف بعض العناصر",
        variant: "destructive",
      });
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
    <div className="container mx-auto p-6 max-w-[1600px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">مكتبة الوسائط</h1>
        <p className="text-muted-foreground">
          إدارة وتنظيم جميع ملفات الوسائط الخاصة بك
        </p>
      </div>

      {/* Enhanced Toolbar */}
      <div className="mb-6 space-y-4">
        {/* Search and Filter Row */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في الملفات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType || "all"} onValueChange={(value) => setFilterType(value === "all" ? null : value)}>
              <SelectTrigger className="w-40">
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
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={() => setCreateFolderOpen(true)} size="sm">
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
              <Button disabled={uploading} size="sm">
                <Upload className="h-4 w-4 ml-2" />
                {uploading ? "جاري الرفع..." : "رفع ملفات"}
              </Button>
            </div>
          </div>

          {/* Selection Actions */}
          {(selectedAssets.size > 0 || selectedFolders.size > 0) && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                {selectedAssets.size + selectedFolders.size} محدد
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMoveItemsOpen(true)}
              >
                <Move className="h-4 w-4 ml-2" />
                نقل
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                حذف
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedAssets(new Set());
                  setSelectedFolders(new Set());
                }}
              >
                <X className="h-4 w-4 ml-2" />
                إلغاء التحديد
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <MediaHeader
        selectedCount={selectedAssets.size}
        onClearSelection={() => setSelectedAssets(new Set())}
        onCreateFolder={() => setCreateFolderOpen(true)}
        onFileUpload={handleFileUpload}
        uploading={uploading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterChange={setFilterType}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Breadcrumb */}
        <MediaBreadcrumb
          currentFolder={currentFolder}
          folders={folders}
          onNavigate={setCurrentFolder}
        />

        {/* Content Area */}
        <div
          className={cn(
            "min-h-[500px] p-6",
            dragOver && "bg-blue-50 border-2 border-dashed border-blue-300"
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
              viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" : "grid-cols-1"
            )}>
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
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
              onAssetDelete={handleDeleteAsset}
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
                <Upload className="w-12 h-12 mx-auto mb-2 text-blue-500" />
                <p className="text-lg font-medium">أفلت الملفات هنا للرفع</p>
              </div>
            </div>
          )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف العناصر المحددة؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              سيتم حذف {selectedAssets.size + selectedFolders.size} عنصر
            </p>
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
            >
              حذف
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