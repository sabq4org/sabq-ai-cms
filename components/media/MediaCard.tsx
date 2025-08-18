"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MoreVertical,
  CheckCircle2,
  Image as ImageIcon,
  FileImage,
  Info,
  Copy,
  Edit2,
  Star,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

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

interface MediaCardProps {
  media: MediaItem;
  viewMode: "grid" | "list";
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

export default function MediaCard({
  media,
  viewMode,
  selected,
  onSelect,
  onEdit,
}: MediaCardProps) {
  const aspectRatioClass = {
    ratio_3_4: "aspect-[3/4]",
    ratio_4_3: "aspect-[4/3]",
    ratio_16_9: "aspect-[16/9]",
    ratio_1_1: "aspect-square",
    other: "aspect-video",
  }[media.aspectRatio] || "aspect-video";

  const aspectRatioLabel = {
    ratio_3_4: "3:4",
    ratio_4_3: "4:3",
    ratio_16_9: "16:9",
    ratio_1_1: "1:1",
    other: "مخصص",
  }[media.aspectRatio] || "مخصص";

  const licenseLabel = {
    all_rights: "جميع الحقوق",
    editorial: "تحريري",
    royalty_free: "بدون حقوق",
    public_domain: "ملك عام",
  }[media.license || "all_rights"] || "جميع الحقوق";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(media.url);
    // يمكن إضافة toast notification هنا
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border ${
          selected
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-gray-200 dark:border-gray-700"
        } hover:shadow-lg transition-all cursor-pointer group`}
        onClick={onSelect}
      >
        {/* صورة مصغرة */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <div className={`relative w-full h-full ${aspectRatioClass} rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700`}>
            {media.thumbnailUrl || media.url ? (
              <Image
                src={media.thumbnailUrl || media.url}
                alt={media.alt || media.filename}
                fill
                className="object-cover"
                sizes="96px"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <FileImage className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          {selected && (
            <div className="absolute -top-2 -right-2 z-10">
              <CheckCircle2 className="w-6 h-6 text-blue-500 bg-white rounded-full" />
            </div>
          )}
        </div>

        {/* معلومات الصورة */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {media.title || media.filename}
          </h3>
          {media.alt && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {media.alt}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
            <span>{media.width} × {media.height}</span>
            <span>{formatBytes(media.sizeBytes)}</span>
            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              {aspectRatioLabel}
            </span>
            {media.usageCount > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {media.usageCount}
              </span>
            )}
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopyLink();
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="نسخ الرابط"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="تعديل البيانات"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  // عرض الشبكة
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative bg-white dark:bg-gray-800 rounded-lg border ${
        selected
          ? "border-blue-500 ring-2 ring-blue-500/20"
          : "border-gray-200 dark:border-gray-700"
      } hover:shadow-lg transition-all cursor-pointer group overflow-hidden`}
      onClick={onSelect}
    >
      {/* الصورة */}
      <div className={`relative ${aspectRatioClass} bg-gray-100 dark:bg-gray-700`}>
        {media.thumbnailUrl || media.url ? (
          <Image
            src={media.thumbnailUrl || media.url}
            alt={media.alt || media.filename}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FileImage className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* شارات */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between pointer-events-none">
          <div className="flex flex-col gap-1">
            <span className="bg-black/70 text-white text-xs px-2 py-0.5 rounded backdrop-blur-sm">
              {aspectRatioLabel}
            </span>
            {media.usageCount > 0 && (
              <span className="bg-black/70 text-white text-xs px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                <Star className="w-3 h-3" />
                {media.usageCount}
              </span>
            )}
          </div>
          {selected && (
            <CheckCircle2 className="w-6 h-6 text-blue-500 bg-white rounded-full" />
          )}
        </div>

        {/* أزرار سريعة عند الhover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyLink();
              }}
              className="p-1.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
              title="نسخ الرابط"
            >
              <Copy className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
              title="تعديل البيانات"
            >
              <Edit2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* معلومات الصورة */}
      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate" title={media.title || media.filename}>
          {media.title || media.filename}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {media.width} × {media.height}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatBytes(media.sizeBytes)}
          </span>
        </div>
        {media.tags.length > 0 && (
          <div className="flex gap-1 mt-2 overflow-hidden">
            {media.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
            {media.tags.length > 2 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{media.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
