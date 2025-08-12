/**
 * مكون رفع الصور المتقدم
 * Advanced Image Upload Component
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Check, AlertCircle, Tag, FileText } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  id: string;
  altText?: string;
  tags?: string[];
  description?: string;
  aiSuggestions?: {
    altText: string;
    tags: string[];
    description: string;
    confidence: number;
  };
}

interface AdvancedImageUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (assets: any[]) => void;
  selectedFolder?: string | null;
  articleContent?: string; // لتحليل المحتوى واقتراح الصور
}

export default function AdvancedImageUpload({
  open,
  onOpenChange,
  onUploadComplete,
  selectedFolder,
  articleContent
}: AdvancedImageUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const { toast } = useToast();

  // تحليل المحتوى بالذكاء الاصطناعي
  const analyzeContentWithAI = useCallback(async (content: string) => {
    if (!content) return null;

    try {
      setAiAnalyzing(true);
      const response = await fetch("/api/ai/analyze-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const data = await response.json();
        return data.suggestions;
      }
    } catch (error) {
      console.error("Error analyzing content:", error);
    } finally {
      setAiAnalyzing(false);
    }
    return null;
  }, []);

  // تحليل الصورة بالذكاء الاصطناعي
  const analyzeImageWithAI = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/ai/analyze-image", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.suggestions;
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
    }
    return null;
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: "pending" as const,
      id: Math.random().toString(36).substr(2, 9),
      tags: [],
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // تحليل كل صورة بالذكاء الاصطناعي
    for (const uploadFile of newFiles) {
      const aiSuggestions = await analyzeImageWithAI(uploadFile.file);
      if (aiSuggestions) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, aiSuggestions }
              : f
          )
        );
      }
    }
  }, [analyzeImageWithAI]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const updateFileMetadata = (id: string, metadata: Partial<UploadFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...metadata } : f))
    );
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const uploadedAssets = [];

    try {
      for (const uploadFile of files) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "uploading" } : f
          )
        );

        const formData = new FormData();
        formData.append("file", uploadFile.file);
        formData.append("altText", uploadFile.altText || "");
        formData.append("description", uploadFile.description || "");
        formData.append("tags", JSON.stringify(uploadFile.tags || []));
        if (selectedFolder) {
          formData.append("folderId", selectedFolder);
        }

        try {
          const response = await fetch("/api/admin/media/upload", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            uploadedAssets.push(result.asset);
            
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id
                  ? { ...f, status: "success", progress: 100 }
                  : f
              )
            );
          } else {
            throw new Error("Upload failed");
          }
        } catch (error) {
          console.error("Upload error:", error);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, status: "error" } : f
            )
          );
        }
      }

      if (uploadedAssets.length > 0) {
        onUploadComplete(uploadedAssets);
        toast({
          title: "نجح الرفع",
          description: `تم رفع ${uploadedAssets.length} صورة بنجاح`,
        });
        handleClose();
      }
    } catch (error) {
      console.error("Upload process error:", error);
      toast({
        title: "خطأ في الرفع",
        description: "حدث خطأ أثناء رفع الصور",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    onOpenChange(false);
  };

  const applySuggestion = (fileId: string, suggestion: "altText" | "tags" | "description") => {
    const file = files.find(f => f.id === fileId);
    if (!file?.aiSuggestions) return;

    const updates: Partial<UploadFile> = {};
    
    switch (suggestion) {
      case "altText":
        updates.altText = file.aiSuggestions.altText;
        break;
      case "tags":
        updates.tags = file.aiSuggestions.tags;
        break;
      case "description":
        updates.description = file.aiSuggestions.description;
        break;
    }

    updateFileMetadata(fileId, updates);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            رفع صور متقدم
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* منطقة السحب والإفلات */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {isDragActive ? "اسحب الصور هنا" : "اختر صور أو اسحبها هنا"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              PNG, JPG, JPEG, GIF, WebP حتى 10MB
            </p>
          </div>

          {/* قائمة الصور المرفوعة */}
          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">الصور المحددة ({files.length})</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {files.map((file) => (
                  <Card key={file.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* معاينة الصورة */}
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Image
                            src={file.preview}
                            alt="Preview"
                            fill
                            className="object-cover rounded-lg"
                          />
                          {file.status === "success" && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-lg">
                              <Check className="w-6 h-6 text-green-600" />
                            </div>
                          )}
                          {file.status === "error" && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center rounded-lg">
                              <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                          )}
                          {file.status === "uploading" && (
                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center rounded-lg">
                              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                            </div>
                          )}
                        </div>

                        {/* تفاصيل الصورة */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm truncate">
                              {file.file.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              disabled={uploading}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* النص البديل */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`alt-${file.id}`} className="text-xs">
                                النص البديل
                              </Label>
                              {file.aiSuggestions?.altText && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => applySuggestion(file.id, "altText")}
                                >
                                  <tag className="w-3 h-3 mr-1" />
                                  اقتراح AI
                                </Button>
                              )}
                            </div>
                            <Input
                              id={`alt-${file.id}`}
                              value={file.altText || ""}
                              onChange={(e) =>
                                updateFileMetadata(file.id, { altText: e.target.value })
                              }
                              placeholder="وصف الصورة..."
                              className="text-sm"
                              disabled={uploading}
                            />
                            {file.aiSuggestions?.altText && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                اقتراح AI: {file.aiSuggestions.altText}
                              </p>
                            )}
                          </div>

                          {/* الوسوم */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">الوسوم</Label>
                              {file.aiSuggestions?.tags && file.aiSuggestions.tags.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => applySuggestion(file.id, "tags")}
                                >
                                  <Tag className="w-3 h-3 mr-1" />
                                  اقتراح AI
                                </Button>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {file.tags?.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                  <button
                                    onClick={() =>
                                      updateFileMetadata(file.id, {
                                        tags: file.tags?.filter((_, i) => i !== index),
                                      })
                                    }
                                    className="ml-1 hover:text-red-500"
                                    disabled={uploading}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            {file.aiSuggestions?.tags && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                اقتراحات AI: {file.aiSuggestions.tags.join(", ")}
                              </div>
                            )}
                          </div>

                          {/* الوصف */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`desc-${file.id}`} className="text-xs">
                                الوصف
                              </Label>
                              {file.aiSuggestions?.description && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => applySuggestion(file.id, "description")}
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  اقتراح AI
                                </Button>
                              )}
                            </div>
                            <Textarea
                              id={`desc-${file.id}`}
                              value={file.description || ""}
                              onChange={(e) =>
                                updateFileMetadata(file.id, { description: e.target.value })
                              }
                              placeholder="وصف تفصيلي للصورة..."
                              className="text-sm h-20"
                              disabled={uploading}
                            />
                          </div>

                          {/* شريط التقدم */}
                          {file.status === "uploading" && (
                            <Progress value={file.progress} className="h-2" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* أزرار التحكم */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {aiAnalyzing && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  تحليل المحتوى...
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} disabled={uploading}>
                إلغاء
              </Button>
              <Button
                onClick={uploadFiles}
                disabled={files.length === 0 || uploading}
                className="min-w-[100px]"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    رفع ({files.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
