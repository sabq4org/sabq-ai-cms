"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderPlus,
  Upload,
  Search,
  Grid3X3,
  List,
  Filter,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaHeaderProps {
  selectedCount: number;
  onClearSelection: () => void;
  onCreateFolder: () => void;
  onFileUpload: (files: FileList) => void;
  uploading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: string | null;
  onFilterChange: (type: string | null) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function MediaHeader({
  selectedCount,
  onClearSelection,
  onCreateFolder,
  onFileUpload,
  uploading,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  viewMode,
  onViewModeChange,
}: MediaHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left side - Actions */}
        <div className="flex items-center gap-2 flex-1">
          <Button onClick={onCreateFolder} variant="outline">
            <FolderPlus className="w-4 h-4 ml-2" />
            مجلد جديد
          </Button>

          <div>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button variant="default" disabled={uploading} className="pointer-events-none">
                <Upload className="w-4 h-4 ml-2" />
                {uploading ? "جاري الرفع..." : "رفع ملفات"}
              </Button>
            </label>
            <Input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={(e) => e.target.files && onFileUpload(e.target.files)}
            />
          </div>

          {selectedCount > 0 && (
            <>
              <div className="h-8 w-px bg-gray-200" />
              <Badge variant="secondary" className="px-3">
                {selectedCount} محدد
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* Right side - Search and View */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث في الملفات..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64 pr-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onFilterChange(null)}>
                <Check className={cn("w-4 h-4 ml-2", !filterType && "opacity-100", filterType && "opacity-0")} />
                جميع الأنواع
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onFilterChange("IMAGE")}>
                <Check className={cn("w-4 h-4 ml-2", filterType === "IMAGE" && "opacity-100", filterType !== "IMAGE" && "opacity-0")} />
                الصور
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange("VIDEO")}>
                <Check className={cn("w-4 h-4 ml-2", filterType === "VIDEO" && "opacity-100", filterType !== "VIDEO" && "opacity-0")} />
                الفيديو
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange("AUDIO")}>
                <Check className={cn("w-4 h-4 ml-2", filterType === "AUDIO" && "opacity-100", filterType !== "AUDIO" && "opacity-0")} />
                الصوت
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange("DOCUMENT")}>
                <Check className={cn("w-4 h-4 ml-2", filterType === "DOCUMENT" && "opacity-100", filterType !== "DOCUMENT" && "opacity-0")} />
                المستندات
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center rounded-md border">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="rounded-none rounded-r-md"
              onClick={() => onViewModeChange("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="rounded-none rounded-l-md"
              onClick={() => onViewModeChange("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
