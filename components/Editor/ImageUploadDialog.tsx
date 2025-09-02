"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Link,
  Loader2,
  Upload,
} from "lucide-react";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";

interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected: (url: string, alt?: string, title?: string) => void;
}

export default function ImageUploadDialog({
  isOpen,
  onClose,
  onImageSelected,
}: ImageUploadDialogProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    console.log("� [EDITOR] بدء رفع ملف في المحرر:", {
      name: file.name,
      size: file.size,
      type: file.type,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      const error = "يرجى اختيار ملف صورة صالح";
      setUploadError(error);
      toast.error(error);
      return;
    }

    // التحقق من حجم الملف (5MB كحد أقصى للصور داخل المحرر)
    if (file.size > 5 * 1024 * 1024) {
      const error = "حجم الصورة يجب أن يكون أقل من 5MB";
      setUploadError(error);
      toast.error(error);
      return;
    }

    setUploading(true);
    setUploadError(null);

    const uploadToast = toast.loading("🔄 جاري رفع الصورة...", {
      duration: 30000,
    });

    try {
      // إنشاء FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "article"); // نوع الرفع للمقالات

      console.log("📤 [EDITOR] محاولة رفع باستخدام الـ APIs بالترتيب الصحيح...");

      // الأولوية للـ API الصحيح - رفع صور المحرر
      console.log("🎯 [EDITOR] محاولة #1: /api/upload-editor");
      let response = await fetch("/api/upload-editor", {
        method: "POST",
        body: formData,
      });

      console.log("📊 [EDITOR] نتيجة upload-editor:", {
        status: response.status,
        ok: response.ok
      });

      // تجربة APIs بديلة إذا فشل الأول
      if (!response.ok) {
        console.log("⚠️ [EDITOR] فشل upload-editor، محاولة #2: /api/upload-image");
        response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });
        
        console.log("📊 [EDITOR] نتيجة upload-image:", {
          status: response.status,
          ok: response.ok
        });
      }

      if (!response.ok) {
        console.log("⚠️ [EDITOR] فشل upload-image، محاولة #3: /api/upload");
        response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        console.log("📊 [EDITOR] نتيجة upload عام:", {
          status: response.status,
          ok: response.ok
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `فشل رفع الصورة: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success && data.url) {
        console.log("✅ تم رفع الصورة بنجاح:", data.url);

        // تعيين الرابط والمعاينة
        setImageUrl(data.url);
        setPreviewUrl(data.url);

        // تعيين نص بديل تلقائي من اسم الملف
        if (!imageAlt) {
          const fileName = file.name.replace(/\.[^/.]+$/, ""); // إزالة الامتداد
          setImageAlt(fileName);
        }

        toast.success("✅ تم رفع الصورة بنجاح!", { id: uploadToast });
      } else {
        throw new Error(data.error || "فشل في الحصول على رابط الصورة");
      }
    } catch (error) {
      console.error("❌ خطأ في رفع الصورة:", error);
      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ أثناء رفع الصورة";
      setUploadError(errorMessage);
      toast.error(`❌ ${errorMessage}`, { id: uploadToast });
    } finally {
      setUploading(false);

      // إعادة تعيين قيمة input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    if (url.trim()) {
      setPreviewUrl(url.trim());
      setUploadError(null);
    } else {
      setPreviewUrl("");
    }
  };

  const handleInsertImage = () => {
    if (!imageUrl.trim()) {
      toast.error("يرجى إدخال رابط صورة أو رفع ملف");
      return;
    }

    console.log("🖼️ إدراج صورة في المحرر:", {
      url: imageUrl.trim(),
      alt: imageAlt.trim(),
      title: imageTitle.trim(),
    });

    onImageSelected(
      imageUrl.trim(),
      imageAlt.trim() || undefined,
      imageTitle.trim() || undefined
    );

    // إعادة تعيين النموذج
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setImageUrl("");
    setImageAlt("");
    setImageTitle("");
    setPreviewUrl("");
    setUploadError(null);
    setActiveTab("upload");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "max-w-2xl",
          darkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
        )}
      >
        <DialogHeader>
          <DialogTitle
            className={cn(
              "text-lg font-semibold flex items-center gap-2",
              darkMode ? "text-white" : "text-slate-900"
            )}
          >
            <ImageIcon className="w-5 h-5" />
            إدراج صورة في المقال
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* تبويبات */}
          <div className="flex space-x-1 rtl:space-x-reverse bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("upload")}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                activeTab === "upload"
                  ? darkMode
                    ? "bg-slate-600 text-white shadow-sm"
                    : "bg-white text-slate-900 shadow-sm"
                  : darkMode
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Upload className="w-4 h-4" />
              رفع من الجهاز
            </button>
            <button
              onClick={() => setActiveTab("url")}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                activeTab === "url"
                  ? darkMode
                    ? "bg-slate-600 text-white shadow-sm"
                    : "bg-white text-slate-900 shadow-sm"
                  : darkMode
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Link className="w-4 h-4" />
              رابط خارجي
            </button>
          </div>

          {/* محتوى التبويب */}
          <div className="min-h-[200px]">
            {activeTab === "upload" ? (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!previewUrl ? (
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                      darkMode
                        ? "border-slate-600 hover:border-slate-500 bg-slate-700/50 hover:bg-slate-700"
                        : "border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon
                      className={cn(
                        "w-16 h-16 mx-auto mb-4",
                        darkMode ? "text-slate-400" : "text-slate-500"
                      )}
                    />

                    <div className="space-y-2">
                      <p
                        className={cn(
                          "text-lg font-medium",
                          darkMode ? "text-slate-200" : "text-slate-700"
                        )}
                      >
                        {uploading ? "جاري الرفع..." : "اختر صورة من جهازك"}
                      </p>
                      <p
                        className={cn(
                          "text-sm",
                          darkMode ? "text-slate-400" : "text-slate-500"
                        )}
                      >
                        JPG, PNG, GIF, WebP (أقصى حجم: 5MB)
                      </p>

                      {uploading && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                          <span className="text-blue-500">
                            جاري رفع الصورة...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative group">
                      <img
                        src={previewUrl}
                        alt="معاينة الصورة"
                        className="w-full h-48 object-cover rounded-xl border"
                        onError={() => {
                          setUploadError("فشل في تحميل الصورة");
                          setPreviewUrl("");
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <div className="bg-green-500 text-white p-1 rounded-full">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <Button
                          onClick={() => {
                            setPreviewUrl("");
                            setImageUrl("");
                            fileInputRef.current?.click();
                          }}
                          variant="secondary"
                          size="sm"
                          className="gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          تغيير الصورة
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="image-url"
                    className="text-sm font-medium mb-2 block"
                  >
                    رابط الصورة
                  </Label>
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={cn(
                      "w-full",
                      darkMode
                        ? "bg-slate-700 border-slate-600"
                        : "bg-white border-slate-300"
                    )}
                  />
                </div>

                {previewUrl && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">معاينة الصورة</Label>
                    <img
                      src={previewUrl}
                      alt="معاينة الصورة"
                      className="w-full h-48 object-cover rounded-xl border"
                      onError={() => {
                        setUploadError(
                          "رابط الصورة غير صالح أو لا يمكن الوصول إليه"
                        );
                      }}
                      onLoad={() => setUploadError(null)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* رسالة الخطأ */}
          {uploadError && (
            <div
              className={cn(
                "p-3 rounded-lg flex items-center gap-2",
                darkMode
                  ? "bg-red-900/50 text-red-300 border border-red-700"
                  : "bg-red-50 text-red-600 border border-red-200"
              )}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{uploadError}</span>
            </div>
          )}

          {/* حقول إضافية */}
          {previewUrl && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <Label
                  htmlFor="image-alt"
                  className="text-sm font-medium mb-2 block"
                >
                  النص البديل (Alt Text) *
                </Label>
                <Input
                  id="image-alt"
                  placeholder="وصف مختصر للصورة"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className={cn(
                    darkMode
                      ? "bg-slate-700 border-slate-600"
                      : "bg-white border-slate-300"
                  )}
                />
                <p
                  className={cn(
                    "text-xs mt-1",
                    darkMode ? "text-slate-400" : "text-slate-500"
                  )}
                >
                  مهم لمحركات البحث وإمكانية الوصول
                </p>
              </div>

              <div>
                <Label
                  htmlFor="image-title"
                  className="text-sm font-medium mb-2 block"
                >
                  عنوان الصورة (اختياري)
                </Label>
                <Input
                  id="image-title"
                  placeholder="عنوان يظهر عند تمرير المؤشر"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                  className={cn(
                    darkMode
                      ? "bg-slate-700 border-slate-600"
                      : "bg-white border-slate-300"
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {/* أزرار التحكم */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
            className={cn(
              darkMode
                ? "border-slate-600 hover:bg-slate-700"
                : "border-slate-300 hover:bg-slate-50"
            )}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleInsertImage}
            disabled={!previewUrl || uploading || !imageAlt.trim()}
            className={cn(
              "gap-2",
              (!previewUrl || uploading || !imageAlt.trim()) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الرفع...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                إدراج الصورة
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
