/**
 * محرر النصوص المحسّن مع إدراج الصور والذكاء الاصطناعي
 * Enhanced Text Editor with Image Insertion and AI Integration
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Image as ImageIcon, Upload, Sparkles, Type, Bold, Italic, Link, List, Quote, Code, Maximize2, Minimize2, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import AdvancedImageUpload from "./AdvancedImageUpload";
import SmartMediaPicker from "./SmartMediaPicker";
import Image from "next/image";

interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  cloudinaryUrl: string;
  thumbnailUrl?: string;
  metadata?: {
    altText?: string;
    description?: string;
    tags?: string[];
  };
  width?: number;
  height?: number;
}

interface EnhancedEditorProps {
  content: string;
  onChange: (content: string) => void;
  title?: string;
  placeholder?: string;
  className?: string;
  enableAI?: boolean;
  enableImageUpload?: boolean;
  enableMediaLibrary?: boolean;
}

export default function EnhancedEditor({
  content,
  onChange,
  title,
  placeholder = "اكتب محتوى المقال...",
  className,
  enableAI = true,
  enableImageUpload = true,
  enableMediaLibrary = true
}: EnhancedEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [insertedImages, setInsertedImages] = useState<MediaAsset[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // حفظ موضع المؤشر
  const handleSelectionChange = useCallback(() => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart || 0);
    }
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('selectionchange', handleSelectionChange);
      textarea.addEventListener('click', handleSelectionChange);
      textarea.addEventListener('keyup', handleSelectionChange);
      
      return () => {
        textarea.removeEventListener('selectionchange', handleSelectionChange);
        textarea.removeEventListener('click', handleSelectionChange);
        textarea.removeEventListener('keyup', handleSelectionChange);
      };
    }
  }, [handleSelectionChange]);

  // إدراج نص في موضع المؤشر
  const insertTextAtCursor = useCallback((textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const before = content.substring(0, startPos);
    const after = content.substring(endPos);
    
    const newContent = before + textToInsert + after;
    onChange(newContent);

    // تحديد موضع المؤشر الجديد
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        startPos + textToInsert.length,
        startPos + textToInsert.length
      );
    }, 0);
  }, [content, onChange]);

  // إدراج تنسيق النص
  const insertFormatting = useCallback((format: string, wrap: boolean = true) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const selectedText = content.substring(startPos, endPos);

    let textToInsert = "";
    switch (format) {
      case "bold":
        textToInsert = wrap ? `**${selectedText || "نص عريض"}**` : "**";
        break;
      case "italic":
        textToInsert = wrap ? `*${selectedText || "نص مائل"}*` : "*";
        break;
      case "link":
        textToInsert = `[${selectedText || "نص الرابط"}](https://example.com)`;
        break;
      case "list":
        textToInsert = selectedText ? 
          selectedText.split('\n').map(line => `- ${line}`).join('\n') :
          "- عنصر القائمة";
        break;
      case "quote":
        textToInsert = selectedText ? 
          selectedText.split('\n').map(line => `> ${line}`).join('\n') :
          "> اقتباس";
        break;
      case "code":
        textToInsert = wrap ? `\`${selectedText || "كود"}\`` : "`";
        break;
      default:
        return;
    }

    insertTextAtCursor(textToInsert);
  }, [content, insertTextAtCursor]);

  // إدراج صورة واحدة
  const insertSingleImage = useCallback((image: MediaAsset) => {
    const imageMarkdown = `\n\n![${image.metadata?.altText || image.originalName}](${image.cloudinaryUrl})\n\n`;
    insertTextAtCursor(imageMarkdown);
    
    setInsertedImages(prev => {
      if (!prev.find(img => img.id === image.id)) {
        return [...prev, image];
      }
      return prev;
    });

    toast({
      title: "تم إدراج الصورة",
      description: `تم إدراج ${image.originalName} في المحتوى`,
    });
  }, [insertTextAtCursor, toast]);

  // إنشاء HTML لمعرض صور (ألبوم)
  const buildGalleryHtml = (images: MediaAsset[]) => {
    const items = images.map((image) => {
      const alt = image.metadata?.altText || image.originalName;
      const caption = image.metadata?.description || "";
      return `\n  <figure class=\"relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900\">\n    <img src=\"${image.cloudinaryUrl}\" alt=\"${alt.replace(/\"/g, '&quot;')}\" class=\"w-full h-auto object-cover\" loading=\"lazy\" />\n    ${caption ? `<figcaption class=\"text-xs text-gray-500 dark:text-gray-400 mt-1 px-1\">${caption}</figcaption>` : ""}\n  </figure>`;
    }).join("");

    return `\n\n<!-- gallery:start -->\n<div class=\"article-album grid grid-cols-2 md:grid-cols-3 gap-3 my-6\">${items}\n</div>\n<!-- gallery:end -->\n`;
  };

  // إدراج صور متعددة
  const insertMultipleImages = useCallback((images: MediaAsset[]) => {
    if (images.length === 0) return;

    let imagesToInsert = "";
    
    if (images.length === 1) {
      const image = images[0];
      imagesToInsert = `\n\n![${image.metadata?.altText || image.originalName}](${image.cloudinaryUrl})\n\n`;
    } else {
      // إنشاء معرض صور (HTML) ليظهر مباشرة في صفحة المقال
      imagesToInsert = buildGalleryHtml(images);
    }

    insertTextAtCursor(imagesToInsert);
    
    setInsertedImages(prev => {
      const newImages = images.filter(img => !prev.find(existing => existing.id === img.id));
      return [...prev, ...newImages];
    });

    toast({
      title: "تم إدراج الصور",
      description: `تم إدراج ${images.length} صورة في المحتوى`,
    });
  }, [insertTextAtCursor, toast]);

  // معالجة تحميل الصور الجديدة
  const handleImageUploadComplete = useCallback((uploadedImages: MediaAsset[]) => {
    insertMultipleImages(uploadedImages);
    setShowImageUpload(false);
  }, [insertMultipleImages]);

  // معالجة اختيار الصور من المكتبة
  const handleMediaSelection = useCallback((selectedImages: MediaAsset[]) => {
    insertMultipleImages(selectedImages);
    setShowMediaPicker(false);
  }, [insertMultipleImages]);

  return (
    <div className={cn(
      "relative border rounded-lg overflow-hidden bg-white dark:bg-gray-950",
      isFullscreen && "fixed inset-0 z-50 rounded-none",
      className
    )}>
      {/* شريط الأدوات */}
      <div className="border-b bg-gray-50 dark:bg-gray-900 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* أدوات التنسيق */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting("bold")}
                title="عريض"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting("italic")}
                title="مائل"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting("link")}
                title="رابط"
              >
                <Link className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* أدوات المحتوى */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting("list")}
                title="قائمة"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting("quote")}
                title="اقتباس"
              >
                <Quote className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting("code")}
                title="كود"
              >
                <Code className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* أدوات الصور */}
            <div className="flex items-center gap-1">
              {enableImageUpload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImageUpload(true)}
                  title="رفع صورة جديدة"
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  رفع صورة
                </Button>
              )}
              
              {enableMediaLibrary && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMediaPicker(true)}
                  title="اختيار من المكتبة"
                  className="gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  من المكتبة
                  {enableAI && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* أدوات العرض */}
          <div className="flex items-center gap-2">
            {insertedImages.length > 0 && (
              <Badge variant="outline" className="gap-1">
                <ImageIcon className="w-3 h-3" />
                {insertedImages.length} صورة
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "تصغير" : "ملء الشاشة"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* منطقة التحرير */}
      <div className={cn(
        "flex",
        isFullscreen ? "h-screen" : "min-h-[400px]"
      )}>
        {/* المحرر */}
        <div className="flex-1 flex flex-col">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "flex-1 resize-none border-0 rounded-none focus:ring-0",
              "text-base leading-relaxed p-6",
              isFullscreen && "h-full"
            )}
            style={{
              minHeight: isFullscreen ? "calc(100vh - 60px)" : "400px"
            }}
          />
        </div>

        {/* لوحة الصور المدرجة */}
        {insertedImages.length > 0 && (
          <div className="w-80 border-l bg-gray-50 dark:bg-gray-900">
            <Card className="h-full rounded-none border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  الصور المدرجة ({insertedImages.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {insertedImages.map((image) => (
                  <div key={image.id} className="group">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={image.thumbnailUrl || image.cloudinaryUrl}
                        alt={image.metadata?.altText || image.originalName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-medium truncate">
                        {image.originalName}
                      </div>
                      {image.metadata?.altText && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {image.metadata.altText}
                        </div>
                      )}
                      {image.metadata?.tags && image.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {image.metadata.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {image.metadata.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{image.metadata.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* مودال رفع الصور */}
      {showImageUpload && (
        <AdvancedImageUpload
          open={showImageUpload}
          onOpenChange={setShowImageUpload}
          onUploadComplete={handleImageUploadComplete}
        />
      )}

      {/* مودال اختيار الصور */}
      {showMediaPicker && (
        <SmartMediaPicker
          open={showMediaPicker}
          onOpenChange={setShowMediaPicker}
          onSelectImages={handleMediaSelection}
          multiSelect={true}
          articleContent={content}
          articleTitle={title}
        />
      )}
    </div>
  );
}
