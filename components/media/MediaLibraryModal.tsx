"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import MediaLibrary from "./MediaLibrary";

interface MediaItem {
  id: string;
  filename: string;
  title?: string;
  alt?: string;
  description?: string;
  width: number;
  height: number;
  aspectRatio: string;
  sizeBytes: number;
  mimeType: string;
  tags: string[];
  license?: string;
  uploaderId: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  url: string;
  thumbnailUrl?: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

interface MediaLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem | MediaItem[]) => void;
  title?: string;
  multiple?: boolean;
  acceptedTypes?: string[];
  articleContent?: string;
  articleTitle?: string;
}

export default function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  title = "مكتبة الوسائط",
  multiple = false,
  acceptedTypes = ["image/"],
  articleContent,
  articleTitle,
}: MediaLibraryModalProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] max-h-[800px] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* رأس النافذة */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* محتوى المكتبة */}
          <div className="flex-1 overflow-hidden">
            <MediaLibrary
              onSelect={(media) => {
                onSelect(media);
                if (!multiple) {
                  onClose();
                }
              }}
              multiple={multiple}
              acceptedTypes={acceptedTypes}
              articleContent={articleContent}
              articleTitle={articleTitle}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
