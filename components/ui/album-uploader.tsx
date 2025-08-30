'use client'

import React, { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  ImagePlus, 
  Upload, 
  X, 
  Eye, 
  Download, 
  Copy, 
  Check, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash2,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface UploadedImage {
  success: boolean
  url: string
  publicId: string
  width: number
  height: number
  format: string
  size: number
  originalName: string
}

interface AlbumUploaderProps {
  maxFiles?: number
  onUpload?: (images: UploadedImage[]) => void
  onInsert?: (imageHtml: string) => void // للصور المفردة
  albumType?: 'gallery' | 'editor-single' | 'editor-album'
  className?: string
}

export function AlbumUploader({ 
  maxFiles = 10, 
  onUpload, 
  onInsert,
  albumType = 'gallery',
  className 
}: AlbumUploaderProps) {
  // إعدادات الرفع
  const maxSizePerFile = 5 // ميجابايت
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // اختيار الملفات
  const handleFileSelect = useCallback((files: FileList) => {
    const newFiles = Array.from(files)
    
    // فحص نوع الملفات
    const imageFiles = newFiles.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length !== newFiles.length) {
      toast.error('يرجى اختيار ملفات صور فقط')
    }

    // فحص العدد الأقصى
    const totalFiles = selectedFiles.length + imageFiles.length
    if (totalFiles > maxFiles) {
      toast.error(`يمكن رفع حد أقصى ${maxFiles} صور`)
      return
    }

    // فحص حجم الملفات
    const oversizedFiles = imageFiles.filter(file => file.size > maxSizePerFile * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast.error(`حجم الصور يجب أن يكون أقل من ${maxSizePerFile} ميجابايت`)
      return
    }

    // إضافة الملفات الجديدة
    setSelectedFiles(prev => [...prev, ...imageFiles])

    // إنشاء معاينات
    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }, [selectedFiles, maxFiles, maxSizePerFile])

  // التعامل مع اختيار الملفات
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFileSelect(event.target.files)
    }
    // إعادة تعيين قيمة input
    event.target.value = ''
  }, [handleFileSelect])

  // التعامل مع drag and drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    if (event.dataTransfer.files) {
      handleFileSelect(event.dataTransfer.files)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  // إزالة ملف
  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }, [])

  // رفع الألبوم
  const uploadAlbum = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error('يرجى اختيار صور للرفع')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      selectedFiles.forEach(file => {
        formData.append('files', file)
      })
      formData.append('type', albumType)

      // محاكاة تقدم الرفع
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 500)

      const response = await fetch('/api/upload/album', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (data.success) {
        setUploadedImages(data.images)
        onUpload?.(data.images)
        
        if (data.failed > 0) {
          toast.warning(`تم رفع ${data.successful} صور، فشل في رفع ${data.failed} صور`)
        } else {
          toast.success(`تم رفع ${data.successful} صور بنجاح`)
        }
      } else {
        toast.error(data.error || 'فشل في رفع الألبوم')
      }
    } catch (error) {
      console.error('Error uploading album:', error)
      toast.error('حدث خطأ أثناء رفع الألبوم')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [selectedFiles, albumType, onUpload])

  // نسخ رابط الصورة
  const copyImageUrl = (image: UploadedImage) => {
    navigator.clipboard.writeText(image.url)
    toast.success('تم نسخ الرابط')
  }

  // إدراج صورة في المحرر (للصور المفردة)
  const insertSingleImage = (image: UploadedImage) => {
    const imageHtml = `
      <div style="margin: 20px 0; text-align: center;">
        <img 
          src="${image.url}" 
          alt="${image.originalName}"
          style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);"
          loading="lazy"
        />
        <p style="margin-top: 8px; font-size: 14px; color: #6b7280; font-style: italic;">
          ${image.originalName}
        </p>
      </div>
    `
    
    if (onInsert) {
      onInsert(imageHtml)
      toast.success('تم إدراج الصورة في المحرر')
    }
  }

  // إدراج الألبوم كاملاً
  const insertFullAlbum = () => {
    if (onUpload && uploadedImages.length > 0) {
      onUpload(uploadedImages)
      toast.success('تم إدراج الألبوم في المحرر')
    }
  }  // إدراج صورة في المحرر
  const insertImage = useCallback((image: UploadedImage) => {
    const imageHtml = `<img src="${image.url}" alt="${image.originalName}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" />`
    onInsert?.(imageHtml)
    toast.success('تم إدراج الصورة')
  }, [onInsert])

  // مسح الكل
  const clearAll = useCallback(() => {
    setSelectedFiles([])
    setPreviews([])
    setUploadedImages([])
    setUploadProgress(0)
  }, [])

  return (
    <div className={cn("space-y-4", className)}>
      {/* منطقة رفع الملفات */}
      <Card>
        <CardContent className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              اختر صور الألبوم
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              اسحب وأفلت الصور هنا أو اضغط للاختيار
            </p>
            <div className="flex justify-center gap-4 text-sm text-gray-500">
              <span>حد أقصى {maxFiles} صور</span>
              <span>•</span>
              <span>حد أقصى {maxSizePerFile} ميجابايت لكل صورة</span>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* معاينة الصور المختارة */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                الصور المختارة ({selectedFiles.length})
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={uploadAlbum}
                  disabled={isUploading || selectedFiles.length === 0}
                  className="flex items-center gap-2"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  رفع الألبوم
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  مسح الكل
                </Button>
              </div>
            </div>

            {/* شريط التقدم */}
            {isUploading && (
              <div className="mb-4">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                  جاري الرفع... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}

            {/* شبكة معاينة الصور */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  {/* استخدام img عادية للمعاينات المحلية */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt={`معاينة ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="absolute bottom-2 left-2 right-2">
                    <Badge variant="secondary" className="text-xs truncate w-full">
                      {selectedFiles[index]?.name}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* الصور المرفوعة */}
      {uploadedImages.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                تم رفع الألبوم ({uploadedImages.length} صور)
              </h3>
              <Badge variant="success">مكتمل</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedImages.map((image, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="relative">
                    <Image
                      src={image.url}
                      alt={image.originalName}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => copyImageUrl(image)}
                        >
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        {onInsert && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => insertImage(image)}
                          >
                            <ImagePlus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{image.originalName}</p>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{image.width} × {image.height}</span>
                      <span>{Math.round(image.size / 1024)} KB</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* أزرار إضافية للألبوم */}
      {uploadedImages.length > 0 && albumType === 'editor-album' && onUpload && (
        <div className="mt-4 flex justify-center">
          <Button 
            onClick={insertFullAlbum} 
            size="lg"
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            إدراج الألبوم كاملاً ({uploadedImages.length} صور)
          </Button>
        </div>
      )}
    </div>
  )
}
