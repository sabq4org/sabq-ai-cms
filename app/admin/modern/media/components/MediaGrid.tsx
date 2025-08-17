"use client";

import { motion } from "framer-motion";
import { FolderOpen, Image as ImageIcon, Video, FileAudio, FileText, MoreVertical, Download, Edit2, Move, Trash2, Info } from "lucide-react";
import Image from "next/image";
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
  onFolderDelete?: (folderId: string) => void;
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
  onFolderDelete,
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
            <div className={cn(
              "grid gap-4",
              viewMode === "grid" 
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8" 
                : "grid-cols-1"
            )}>
              {currentFolders.map(folder => (
                <motion.div
                  key={folder.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "group relative cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg",
                    selectedFolders.has(folder.id) 
                      ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  )}
                >
                  {/* Selection Checkbox */}
                  {onFolderSelect && (
                    <div className="absolute top-3 right-3 z-10">
                      <Checkbox
                        checked={selectedFolders.has(folder.id)}
                        onCheckedChange={(checked) => onFolderSelect(folder.id, !!checked)}
                        className="bg-white dark:bg-gray-800 shadow-sm"
                      />
                    </div>
                  )}

                  {/* Folder Actions */}
                  <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
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
                        {onFolderDelete && (
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => onFolderDelete(folder.id)}
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div
                    className="flex flex-col items-center p-4 sm:p-6"
                    onClick={() => onFolderClick(folder)}
                  >
                    <FolderOpen className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 dark:text-blue-400 mb-3" />
                    <span className="text-sm sm:text-base font-medium text-center line-clamp-2 text-gray-900 dark:text-white">
                      {folder.name}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
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
            "grid gap-3 sm:gap-4",
            viewMode === "grid" 
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8" 
              : "grid-cols-1"
          )}>
            {assets.map(asset => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "group relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg",
                  selectedAssets.has(asset.id) 
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                    : "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600",
                  viewMode === "list" && "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                )}
              >
                {viewMode === "grid" ? (
                  // Enhanced Grid View
                  <>
                    {/* Selection Checkbox */}
                    <div className="absolute top-3 right-3 z-10">
                      <Checkbox
                        checked={selectedAssets.has(asset.id)}
                        onCheckedChange={(checked) => onAssetSelect(asset.id, !!checked)}
                        className="bg-white/90 dark:bg-gray-800/90 shadow-sm backdrop-blur-sm"
                      />
                    </div>

                    {/* Enhanced Asset Preview */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative group/preview">
                          {asset.type === "IMAGE" ? (
                            <>
                              <Image
                                src={asset.thumbnailUrl || asset.cloudinaryUrl}
                                alt={asset.originalName}
                                width={300}
                                height={300}
                                className="w-full h-full object-cover cursor-pointer transition-transform group-hover/preview:scale-105"
                                onClick={() => onAssetInfo?.(asset)}
                              />
                              {/* Enhanced Quick Info Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-3 left-3 right-3 text-white">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{asset.width} × {asset.height}</span>
                                    <span className="bg-black/50 px-2 py-1 rounded-md text-xs">
                                      {formatFileSize(asset.size)}
                                    </span>
                                  </div>
                                  {asset.metadata?.altText && (
                                    <p className="text-xs mt-1 line-clamp-1 opacity-90">
                                      {asset.metadata.altText}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-400 dark:text-gray-500 cursor-pointer transition-transform group-hover/preview:scale-110" onClick={() => onAssetInfo?.(asset)}>
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
                            <p className="text-green-600 dark:text-green-400">الوصف: {asset.metadata.altText}</p>
                          )}
                          {asset.metadata?.tags && asset.metadata.tags.length > 0 && (
                            <p>الوسوم: {asset.metadata.tags.join(', ')}</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    {/* Enhanced Asset Info */}
                    <div className="p-3 sm:p-4">
                      <div className="space-y-2">
                        <p className="text-sm sm:text-base font-medium line-clamp-1 text-gray-900 dark:text-white" title={asset.originalName}>
                          {asset.originalName}
                        </p>
                        
                        {/* File Details Row 1 */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                              {asset.type}
                            </span>
                            <span>{formatFileSize(asset.size)}</span>
                          </div>
                          
                          {/* Dimensions and Date */}
                          {asset.width && asset.height && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                              {asset.width} × {asset.height}
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(asset.createdAt).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>

                        {/* Enhanced Metadata Display */}
                        {asset.metadata?.altText && (
                          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-md border border-green-200 dark:border-green-800">
                            <p className="text-xs text-green-700 dark:text-green-300 line-clamp-2" title={asset.metadata.altText}>
                              <span className="font-medium">📝 الوصف:</span> {asset.metadata.altText}
                            </p>
                          </div>
                        )}
                        
                        {asset.metadata?.tags && asset.metadata.tags.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {asset.metadata.tags.slice(0, 3).map((tag, index) => (
                                <span 
                                  key={index} 
                                  className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium"
                                  title={tag}
                                >
                                  {tag.length > 8 ? tag.substring(0, 8) + '...' : tag}
                                </span>
                              ))}
                              {asset.metadata.tags.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                  +{asset.metadata.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Info Badge */}
                    {(asset.metadata?.altText || (asset.metadata?.tags && asset.metadata.tags.length > 0)) && (
                      <div className="absolute bottom-3 right-3">
                        <div className="bg-green-500 dark:bg-green-600 text-white rounded-full p-1.5 shadow-lg">
                          <Info className="w-3 h-3" />
                        </div>
                      </div>
                    )}

                    {/* Enhanced Actions Menu */}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm">
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
                  // Enhanced List View
                  <div className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                    <Checkbox
                      checked={selectedAssets.has(asset.id)}
                      onCheckedChange={(checked) => onAssetSelect(asset.id, !!checked)}
                    />
                    
                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {asset.type === "IMAGE" && asset.thumbnailUrl ? (
                        <Image
                          src={asset.thumbnailUrl}
                          alt={asset.filename}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 dark:text-gray-500">
                          {getAssetIcon(asset.type)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-gray-900 dark:text-white truncate pr-4" title={asset.originalName}>
                          {asset.originalName}
                        </p>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {formatFileSize(asset.size)}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium">
                          {asset.type}
                        </span>
                        {asset.width && asset.height && (
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {asset.width} × {asset.height}
                          </span>
                        )}
                        <span className="text-xs">
                          {new Date(asset.createdAt).toLocaleDateString("ar-SA", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      {/* Enhanced metadata for list view */}
                      {(asset.metadata?.altText || (asset.metadata?.tags && asset.metadata.tags.length > 0)) && (
                        <div className="space-y-1">
                          {asset.metadata.altText && (
                            <div className="flex items-start gap-2">
                              <span className="text-green-600 dark:text-green-400 text-xs font-medium">📝 الوصف:</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-1" title={asset.metadata.altText}>
                                {asset.metadata.altText}
                              </p>
                            </div>
                          )}
                          {asset.metadata.tags && asset.metadata.tags.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">🏷️ الوسوم:</span>
                              <div className="flex flex-wrap gap-1">
                                {asset.metadata.tags.map((tag, index) => (
                                  <span 
                                    key={index} 
                                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
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
