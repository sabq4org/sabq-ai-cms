"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Save,
  Send,
  Eye,
  Clock,
  Image as ImageIcon,
  Upload,
  X,
  Tag,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles,
  FileText,
  Settings,
  Hash,
  Type,
  Link,
  ChevronDown,
  ChevronUp,
  Zap,
  Star,
  Globe,
  TrendingUp,
  Info,
  PenTool,
} from "lucide-react";
import { MediaPickerButton } from "@/components/admin/media/MediaPickerButton";

// تحميل المحرر بشكل ديناميكي
const Editor = dynamic(() => import("@/components/Editor/Editor"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-50 dark:bg-gray-800/50 animate-pulse rounded-lg flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  ),
});

interface Category {
  id: string;
  name: string;
  name_ar?: string;
  slug: string;
  color?: string;
}

interface Author {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export default function ModernCreateNewsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const editorRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  // حالات التحميل
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);

  // حالة النموذج
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    slug: "",
    excerpt: "",
    content: "",
    authorId: "",
    categoryId: "",
    featuredImage: "",
    keywords: [] as string[],
    seoTitle: "",
    seoDescription: "",
    publishType: "now" as "now" | "scheduled",
    scheduledDate: "",
    isBreaking: false,
    isFeatured: false,
    status: "draft" as "draft" | "published",
  });

  // Keyword input state
  const [keywordInput, setKeywordInput] = useState("");

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    publishing: true,
    attributes: true,
    featuredImage: true,
    keywords: true,
    seo: false,
  });

  // Auto-save indicator
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  useEffect(() => {
    setIsClient(true);
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, authorsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/admin/article-authors"),
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }

      if (authorsRes.ok) {
        const authorsData = await authorsRes.json();
        setAuthors(authorsData.authors || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\u0621-\u064A\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title]);

  // Calculate completion score
  const calculateCompletion = () => {
    let score = 0;
    if (formData.title) score += 20;
    if (formData.content && formData.content.length > 100) score += 30;
    if (formData.excerpt) score += 10;
    if (formData.categoryId) score += 10;
    if (formData.authorId) score += 10;
    if (formData.featuredImage) score += 10;
    if (formData.keywords.length > 0) score += 10;
    return score;
  };

  const completionScore = calculateCompletion();

  // Toggle section
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle keyword addition
  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  // Remove keyword
  const removeKeyword = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }));
  };

  // Handle form submission
  const handleSubmit = async (action: "draft" | "publish" | "review") => {
    setSaving(true);

    try {
      const payload = {
        ...formData,
        status: action === "publish" ? "published" : "draft",
        published_at: action === "publish" ? new Date().toISOString() : null,
      };

      const response = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save");

      const result = await response.json();

      toast({
        title: "تم الحفظ بنجاح",
        description:
          action === "publish"
            ? "تم نشر الخبر بنجاح"
            : action === "draft"
            ? "تم حفظ المسودة"
            : "تم إرسال الخبر للمراجعة",
      });

      // Redirect to news list or edit page
      if (result.id) {
        router.push(`/admin/news/edit/${result.id}`);
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الخبر",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !formData.title || !formData.content) return;

    const timer = setTimeout(() => {
      // Implement auto-save logic here
      setLastSaved(new Date());
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(timer);
  }, [formData, autoSaveEnabled]);

  if (!isClient) return null;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  إنشاء خبر جديد
                </h1>
                <Badge variant="secondary" className="gap-1">
                  <Progress value={completionScore} className="w-20 h-2" />
                  <span className="text-xs">{completionScore}%</span>
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                {/* Auto-save indicator */}
                {lastSaved && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    حُفظ تلقائياً {lastSaved.toLocaleTimeString("ar-SA")}
                  </div>
                )}

                {/* Action buttons */}
                <Button
                  variant="outline"
                  onClick={() => handleSubmit("draft")}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 ml-2" />
                  حفظ مسودة
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleSubmit("review")}
                  disabled={saving}
                >
                  <Eye className="w-4 h-4 ml-2" />
                  طلب مراجعة
                </Button>
                <Button
                  onClick={() => handleSubmit("publish")}
                  disabled={saving || completionScore < 60}
                  className="bg-gradient-to-l from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 ml-2" />
                  )}
                  نشر فوري
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Title & Slug */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Input
                        placeholder="العنوان الرئيسي..."
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="text-2xl font-bold border-0 px-0 focus-visible:ring-0 placeholder:text-gray-400"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Link className="w-4 h-4" />
                      <span>sabq.io/news/</span>
                      <Input
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        className="flex-1 h-7 text-sm border-0 px-2 bg-gray-100 dark:bg-gray-800"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <Input
                        placeholder="العنوان الفرعي (اختياري)"
                        value={formData.subtitle}
                        onChange={(e) =>
                          setFormData({ ...formData, subtitle: e.target.value })
                        }
                        className="border-0 px-0 focus-visible:ring-0 placeholder:text-gray-400"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Content Editor */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">محتوى الخبر</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-purple-600"
                          >
                            <Sparkles className="w-4 h-4" />
                            مساعد AI
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>اكتب 50 حرفاً على الأقل لتفعيل المساعد</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="min-h-[400px]">
                      <Editor
                        ref={editorRef}
                        content={formData.content}
                        onChange={(content) =>
                          setFormData({ ...formData, content })
                        }
                        placeholder="اكتب محتوى الخبر هنا..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Excerpt */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      موجز الخبر
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="اكتب موجزاً قصيراً للخبر..."
                      value={formData.excerpt}
                      onChange={(e) =>
                        setFormData({ ...formData, excerpt: e.target.value })
                      }
                      rows={3}
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {formData.excerpt.length}/160 حرف
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Publishing Options */}
              <Collapsible
                open={expandedSections.publishing}
                onOpenChange={() => toggleSection("publishing")}
              >
                <Card className="border-0 shadow-sm">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          النشر
                        </CardTitle>
                        {expandedSections.publishing ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>الحالة</Label>
                        <Badge
                          variant={
                            formData.status === "published"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {formData.status === "published" ? "منشور" : "مسودة"}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <Label>توقيت النشر</Label>
                        <Select
                          value={formData.publishType}
                          onValueChange={(value: "now" | "scheduled") =>
                            setFormData({ ...formData, publishType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="now">نشر فوري</SelectItem>
                            <SelectItem value="scheduled">جدولة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.publishType === "scheduled" && (
                        <div className="space-y-2">
                          <Label>تاريخ ووقت النشر</Label>
                          <Input
                            type="datetime-local"
                            value={formData.scheduledDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                scheduledDate: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}

                      <div className="pt-2 space-y-3">
                        <Button className="w-full" variant="secondary" size="sm">
                          <Eye className="w-4 h-4 ml-2" />
                          معاينة
                        </Button>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Post Attributes */}
              <Collapsible
                open={expandedSections.attributes}
                onOpenChange={() => toggleSection("attributes")}
              >
                <Card className="border-0 shadow-sm">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          خصائص الخبر
                        </CardTitle>
                        {expandedSections.attributes ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>المؤلف</Label>
                        <Select
                          value={formData.authorId}
                          onValueChange={(value) =>
                            setFormData({ ...formData, authorId: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المؤلف" />
                          </SelectTrigger>
                          <SelectContent>
                            {authors.map((author) => (
                              <SelectItem key={author.id} value={author.id}>
                                <div className="flex items-center gap-2">
                                  <User className="w-3 h-3" />
                                  {author.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>التصنيف</Label>
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) =>
                            setFormData({ ...formData, categoryId: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر التصنيف" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor:
                                        category.color || "#6B7280",
                                    }}
                                  />
                                  {category.name_ar || category.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="breaking" className="cursor-pointer">
                            خبر عاجل
                          </Label>
                          <Switch
                            id="breaking"
                            checked={formData.isBreaking}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, isBreaking: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="featured" className="cursor-pointer">
                            خبر مميز
                          </Label>
                          <Switch
                            id="featured"
                            checked={formData.isFeatured}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, isFeatured: checked })
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Featured Image */}
              <Collapsible
                open={expandedSections.featuredImage}
                onOpenChange={() => toggleSection("featuredImage")}
              >
                <Card className="border-0 shadow-sm">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          الصورة البارزة
                        </CardTitle>
                        {expandedSections.featuredImage ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      {formData.featuredImage ? (
                        <div className="relative group">
                          <img
                            src={formData.featuredImage}
                            alt="Featured"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <MediaPickerButton
                              onSelect={(url) =>
                                setFormData({ ...formData, featuredImage: url })
                              }
                              buttonText="تغيير"
                              className="bg-white/90 hover:bg-white text-gray-900"
                            />
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                setFormData({ ...formData, featuredImage: "" })
                              }
                              className="bg-white/90 hover:bg-white text-gray-900"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <MediaPickerButton
                            onSelect={(url) =>
                              setFormData({ ...formData, featuredImage: url })
                            }
                            buttonText="اختر صورة"
                            className="mx-auto"
                          />
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Keywords */}
              <Collapsible
                open={expandedSections.keywords}
                onOpenChange={() => toggleSection("keywords")}
              >
                <Card className="border-0 shadow-sm">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          الكلمات المفتاحية
                        </CardTitle>
                        {expandedSections.keywords ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="اكتب كلمة واضغط Enter"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={handleAddKeyword}
                      />
                      {formData.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.keywords.map((keyword, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="gap-1 pr-1"
                            >
                              {keyword}
                              <button
                                onClick={() => removeKeyword(index)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* SEO Settings */}
              <Collapsible
                open={expandedSections.seo}
                onOpenChange={() => toggleSection("seo")}
              >
                <Card className="border-0 shadow-sm">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          إعدادات SEO
                        </CardTitle>
                        {expandedSections.seo ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>عنوان SEO</Label>
                        <Input
                          placeholder="اتركه فارغاً لاستخدام العنوان الرئيسي"
                          value={formData.seoTitle}
                          onChange={(e) =>
                            setFormData({ ...formData, seoTitle: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>وصف SEO</Label>
                        <Textarea
                          placeholder="اتركه فارغاً لاستخدام الموجز"
                          value={formData.seoDescription}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              seoDescription: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
