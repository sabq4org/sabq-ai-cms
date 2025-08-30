'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EnhancedRichTextEditor } from "./enhanced-rich-text-editor"
import { AlbumUploader } from "./album-uploader"
import { 
  ImagePlus, 
  Images, 
  Type,
  Smile,
  Upload
} from "lucide-react"

interface AdvancedEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function AdvancedEditor({ 
  value, 
  onChange, 
  placeholder = "اكتب محتوى المقال...", 
  className 
}: AdvancedEditorProps) {
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showAlbumDialog, setShowAlbumDialog] = useState(false)

  // إدراج صورة واحدة في المحرر
  const handleInsertImage = useCallback((imageHtml: string) => {
    onChange(value + imageHtml)
    setShowImageDialog(false)
  }, [value, onChange])

  // إدراج ألبوم في المحرر
  const handleInsertAlbum = useCallback((images: any[]) => {
    if (images.length === 0) return

    // إنشاء HTML للألبوم
    const albumHtml = `
      <div class="image-gallery" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin: 20px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb;">
        <div style="grid-column: 1 / -1; text-align: center; margin-bottom: 16px;">
          <h3 style="color: #374151; font-size: 18px; font-weight: 600; margin: 0;">ألبوم الصور (${images.length} صور)</h3>
        </div>
        ${images.map((image, index) => `
          <div style="position: relative; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
            <img 
              src="${image.url}" 
              alt="${image.originalName || `صورة ${index + 1}`}"
              style="width: 100%; height: 200px; object-fit: cover; display: block;"
              loading="lazy"
            />
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0, 0, 0, 0.7)); color: white; padding: 8px 12px; font-size: 14px;">
              ${image.originalName || `صورة ${index + 1}`}
            </div>
          </div>
        `).join('')}
      </div>
    `

    onChange(value + albumHtml)
    setShowAlbumDialog(false)
  }, [value, onChange])

  return (
    <div className={className}>
      {/* شريط أدوات إضافي للوسائط */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ImagePlus className="h-4 w-4" />
              رفع صورة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>رفع صورة واحدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <AlbumUploader
                maxFiles={1}
                albumType="editor-single"
                onInsert={handleInsertImage}
              />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAlbumDialog} onOpenChange={setShowAlbumDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Images className="h-4 w-4" />
              رفع ألبوم صور
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>رفع ألبوم صور</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <AlbumUploader
                maxFiles={10}
                albumType="editor-album"
                onUpload={handleInsertAlbum}
              />
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex-1" />
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Type className="h-4 w-4" />
          <span>محرر متقدم</span>
        </div>
      </div>

      {/* المحرر الأساسي */}
      <EnhancedRichTextEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        enableImageUpload={true}
        enableEmoji={true}
        className="border-2 border-gray-200 dark:border-gray-700 rounded-lg focus-within:border-blue-500 dark:focus-within:border-blue-400"
      />

      {/* نصائح الاستخدام */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          💡 نصائح الاستخدام:
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• اسحب وأفلت الصور مباشرة في المحرر</li>
          <li>• استخدم أزرار "رفع صورة" و "رفع ألبوم" للمزيد من الخيارات</li>
          <li>• اضغط على زر الإيموجي 😀 لإضافة تعبيرات متنوعة</li>
          <li>• يمكنك البحث عن الإيموجي بالكلمات العربية</li>
          <li>• جميع الصور يتم تحسينها تلقائياً للويب</li>
        </ul>
      </div>
    </div>
  )
}
