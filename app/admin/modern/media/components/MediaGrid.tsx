"use client";

import { motion } from "framer-motion";
import { FolderOpen, Image as ImageIcon, Video, FileAudio, FileText, MoreVertical, Download, Edit2, Move, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  selectedFolders?: Set<string>;
  viewMode: "grid" | "list";
  onFolderClick: (folder: MediaFolder) => void;
  onFolderSelect?: (folderId: string, selected: boolean) => void;
  onAssetSelect: (assetId: string, selected: boolean) => void;
  onAssetDelete: (assetId: string) => void;
  onAssetInfo?: (asset: MediaAsset) => void;
  onAssetRename?: (asset: MediaAsset) => void;
  onAssetEditMetadata?: (asset: MediaAsset) => void;
  onFolderRename?: (folder: MediaFolder) => void;
}

export function MediaGrid({
  folders,
  assets,
  currentFolder,
  selectedAssets,
  selectedFolders = new Set(),
  viewMode,
  onFolderClick,
  onFolderSelect,
  onAssetSelect,
  onAssetDelete,
  onAssetInfo,
  onAssetRename,
  onAssetEditMetadata,
  onFolderRename,
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
    <TooltipProvider>
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
                className={cn(
                  "group relative cursor-pointer rounded-lg border transition-all",
                  selectedFolders.has(folder.id) ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                )}
              >
                {/* Selection Checkbox */}
                {onFolderSelect && (
                  <div className="absolute top-2 right-2 z-10">
                    <Checkbox
                      checked={selectedFolders.has(folder.id)}
                      onCheckedChange={(checked) => onFolderSelect(folder.id, !!checked)}
                      className="bg-white"
                    />
                  </div>
                )}

                {/* Folder Actions */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => onFolderClick(folder)}>
                        <FolderOpen className="w-4 h-4 ml-2" />
                        فتح
                      </DropdownMenuItem>
                      {onFolderRename && (
                        <DropdownMenuItem onClick={() => onFolderRename(folder)}>
                          <Edit2 className="w-4 h-4 ml-2" />
                          إعادة تسمية
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Move className="w-4 h-4 ml-2" />
                        نقل إلى...
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div
                  className="flex flex-col items-center p-4"
                  onClick={() => onFolderClick(folder)}
                >
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="aspect-square bg-gray-100 flex items-center justify-center relative group/preview">
                          {asset.type === "IMAGE" ? (
                            <>
                              <img
                                src={asset.thumbnailUrl || asset.cloudinaryUrl}
                                alt={asset.originalName}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => onAssetInfo?.(asset)}
                              />
                              {/* Quick Info Overlay */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="text-white text-center text-sm">
                                  <p className="font-medium">{asset.width} × {asset.height}</p>
                                  <p className="text-xs">{formatFileSize(asset.size)}</p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-400 cursor-pointer" onClick={() => onAssetInfo?.(asset)}>
                              {getAssetIcon(asset.type)}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{asset.originalName}</p>
                          <p>النوع: {asset.type}</p>
                          <p>الحجم: {formatFileSize(asset.size)}</p>
                          {asset.width && asset.height && (
                            <p>الأبعاد: {asset.width} × {asset.height}</p>
                          )}
                          <p>التاريخ: {new Date(asset.createdAt).toLocaleDateString('ar-SA')}</p>
                          {asset.metadata?.altText && (
                            <p className="text-green-600">الوصف: {asset.metadata.altText}</p>
                          )}
                          {asset.metadata?.tags && asset.metadata.tags.length > 0 && (
                            <p>الوسوم: {asset.metadata.tags.join(', ')}</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    {/* Asset Info */}
                    <div className="p-3">
                      <p className="text-sm font-medium line-clamp-1" title={asset.originalName}>
                        {asset.originalName}
                      </p>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(asset.size)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-600">
                            {asset.type}
                          </span>
                          {asset.width && asset.height && (
                            <span className="text-blue-600">
                              {asset.width} × {asset.height}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(asset.createdAt).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        {asset.metadata?.altText && (
                          <p className="text-xs text-green-600 line-clamp-1" title={asset.metadata.altText}>
                            📝 {asset.metadata.altText}
                          </p>
                        )}
                        {asset.metadata?.tags && asset.metadata.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {asset.metadata.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="text-xs px-1 py-0.5 bg-blue-100 text-blue-600 rounded">
                                {tag}
                              </span>
                            ))}
                            {asset.metadata.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{asset.metadata.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info Badge */}
                    {(asset.metadata?.altText || (asset.metadata?.tags && asset.metadata.tags.length > 0)) && (
                      <div className="absolute bottom-2 right-2">
                        <div className="bg-green-500 text-white rounded-full p-1">
                          <Info className="w-3 h-3" />
                        </div>
                      </div>
                    )}

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
                          {onAssetInfo && (
                            <DropdownMenuItem onClick={() => onAssetInfo(asset)}>
                              <ImageIcon className="w-4 h-4 ml-2" />
                              معلومات الملف
                            </DropdownMenuItem>
                          )}
                          {onAssetRename && (
                            <DropdownMenuItem onClick={() => onAssetRename(asset)}>
                              <Edit2 className="w-4 h-4 ml-2" />
                              إعادة تسمية
                            </DropdownMenuItem>
                          )}
                          {onAssetEditMetadata && (
                            <DropdownMenuItem onClick={() => onAssetEditMetadata(asset)}>
                              <Info className="w-4 h-4 ml-2" />
                              تحرير المعلومات
                            </DropdownMenuItem>
                          )}
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
                      <p className="font-medium truncate" title={asset.originalName}>
                        {asset.originalName}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="px-2 py-1 rounded-sm bg-gray-100 text-gray-600 text-xs">
                          {asset.type}
                        </span>
                        <span>{formatFileSize(asset.size)}</span>
                        {asset.width && asset.height && (
                          <span className="text-blue-600">{asset.width} × {asset.height}</span>
                        )}
                        <span>{new Date(asset.createdAt).toLocaleDateString("ar-SA", {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                      {asset.metadata?.altText && (
                        <p className="text-sm text-green-600 truncate mt-1" title={asset.metadata.altText}>
                          📝 {asset.metadata.altText}
                        </p>
                      )}
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
                        {onAssetInfo && (
                          <DropdownMenuItem onClick={() => onAssetInfo(asset)}>
                            <ImageIcon className="w-4 h-4 ml-2" />
                            معلومات الملف
                          </DropdownMenuItem>
                        )}
                        {onAssetRename && (
                          <DropdownMenuItem onClick={() => onAssetRename(asset)}>
                            <Edit2 className="w-4 h-4 ml-2" />
                            إعادة تسمية
                          </DropdownMenuItem>
                        )}
                        {onAssetEditMetadata && (
                          <DropdownMenuItem onClick={() => onAssetEditMetadata(asset)}>
                            <Info className="w-4 h-4 ml-2" />
                            تحرير المعلومات
                          </DropdownMenuItem>
                        )}
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
    </TooltipProvider>
  );
}
