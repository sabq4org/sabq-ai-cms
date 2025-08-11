"use client";

import { motion } from "framer-motion";
import { FolderOpen, Image as ImageIcon, Video, FileAudio, FileText, MoreVertical, Download, Edit2, Move, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MediaAsset, MediaFolder } from "../types";

interface MediaGridProps {
  folders: MediaFolder[];
  assets: MediaAsset[];
  currentFolder: MediaFolder | null;
  selectedAssets: Set<string>;
  viewMode: "grid" | "list";
  onFolderClick: (folder: MediaFolder) => void;
  onAssetSelect: (assetId: string, selected: boolean) => void;
  onAssetDelete: (assetId: string) => void;
}

export function MediaGrid({
  folders,
  assets,
  currentFolder,
  selectedAssets,
  viewMode,
  onFolderClick,
  onAssetSelect,
  onAssetDelete,
}: MediaGridProps) {
  // Get icon for asset type
  const getAssetIcon = (type: string) => {
    switch (type) {
      case "IMAGE":
        return <ImageIcon className="w-5 h-5" />;
      case "VIDEO":
        return <Video className="w-5 h-5" />;
      case "AUDIO":
        return <FileAudio className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const currentFolders = folders.filter(f => f.parentId === (currentFolder?.id || null));

  return (
    <>
      {/* Folders */}
      {currentFolders.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">المجلدات</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {currentFolders.map(folder => (
              <motion.div
                key={folder.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group cursor-pointer"
                onClick={() => onFolderClick(folder)}
              >
                <div className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <FolderOpen className="w-12 h-12 text-blue-500 mb-2" />
                  <span className="text-sm font-medium text-center line-clamp-2">
                    {folder.name}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
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
          <div className={cn(
            "grid gap-4",
            viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" : "grid-cols-1"
          )}>
            {assets.map(asset => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "group relative rounded-lg overflow-hidden border transition-all",
                  selectedAssets.has(asset.id) ? "border-blue-500 bg-blue-50" : "hover:shadow-md"
                )}
              >
                {viewMode === "grid" ? (
                  // Grid View
                  <>
                    {/* Selection Checkbox */}
                    <div className="absolute top-2 right-2 z-10">
                      <Checkbox
                        checked={selectedAssets.has(asset.id)}
                        onCheckedChange={(checked) => onAssetSelect(asset.id, !!checked)}
                        className="bg-white"
                      />
                    </div>

                    {/* Asset Preview */}
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
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
                    </div>

                    {/* Asset Info */}
                    <div className="p-3">
                      <p className="text-sm font-medium line-clamp-1" title={asset.filename}>
                        {asset.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(asset.size)}
                      </p>
                    </div>

                    {/* Actions Menu */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 ml-2" />
                            تحميل
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit2 className="w-4 h-4 ml-2" />
                            إعادة تسمية
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Move className="w-4 h-4 ml-2" />
                            نقل إلى...
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onAssetDelete(asset.id)}
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                ) : (
                  // List View
                  <div className="flex items-center gap-4 p-4">
                    <Checkbox
                      checked={selectedAssets.has(asset.id)}
                      onCheckedChange={(checked) => onAssetSelect(asset.id, !!checked)}
                    />
                    
                    <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {asset.type === "IMAGE" && asset.thumbnailUrl ? (
                        <img
                          src={asset.thumbnailUrl}
                          alt={asset.filename}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        getAssetIcon(asset.type)
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{asset.filename}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(asset.size)}</span>
                        {asset.width && asset.height && (
                          <span>{asset.width} × {asset.height}</span>
                        )}
                        <span>{new Date(asset.createdAt).toLocaleDateString("ar-SA")}</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 ml-2" />
                          تحميل
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit2 className="w-4 h-4 ml-2" />
                          إعادة تسمية
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Move className="w-4 h-4 ml-2" />
                          نقل إلى...
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onAssetDelete(asset.id)}
                        >
                          <Trash2 className="w-4 h-4 ml-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            لا توجد ملفات في هذا المجلد
          </p>
        </div>
      )}
    </>
  );
}
