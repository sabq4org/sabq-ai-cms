"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  // Fetch folders and assets
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch folders
      const foldersRes = await fetch("/api/admin/media/folders");
      if (!foldersRes.ok) throw new Error("Failed to fetch folders");
      const foldersData = await foldersRes.json();
      setFolders(foldersData.hierarchy);

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
    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolder) {
        formData.append("folderId", currentFolder.id);
      }

      try {
        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Upload failed");
        }

        successCount++;
      } catch (error) {
        console.error("Upload error:", error);
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
              viewMode={viewMode}
              onFolderClick={setCurrentFolder}
              onAssetSelect={handleAssetSelect}
              onAssetDelete={handleDeleteAsset}
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
    </div>
  );
}