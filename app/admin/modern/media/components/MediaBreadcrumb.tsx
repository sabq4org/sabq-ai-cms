"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Home, ChevronRight } from "lucide-react";
import { MediaFolder } from "../types";

interface MediaBreadcrumbProps {
  currentFolder: MediaFolder | null;
  folders: MediaFolder[];
  onNavigate: (folder: MediaFolder | null) => void;
}

export function MediaBreadcrumb({ currentFolder, folders, onNavigate }: MediaBreadcrumbProps) {
  // Build breadcrumb path
  const buildBreadcrumb = () => {
    const path = [];
    let folder = currentFolder;
    while (folder) {
      path.unshift(folder);
      folder = folders.find(f => f.children?.some(c => c.id === folder!.id)) || null;
    }
    return path;
  };

  return (
    <div className="border-b p-4">
      <div className="flex items-center gap-2 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate(null)}
          className="p-1"
        >
          <Home className="w-4 h-4" />
        </Button>
        {buildBreadcrumb().map((folder, index) => (
          <React.Fragment key={folder.id}>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(folder)}
              className="p-1"
            >
              {folder.name}
            </Button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
