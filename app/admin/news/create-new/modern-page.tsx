"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
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
  Lightbulb,
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
  const [authorQuery, setAuthorQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");

  const filteredAuthors = useMemo(
    () =>
      authors.filter((a) =>
        (a.name || "").toLowerCase().includes(authorQuery.toLowerCase())
      ),
    [authors, authorQuery]
  );

  const filteredCategories = useMemo(
    () =>
      categories.filter((c) =>
        ((c.name_ar || c.name) || "").toLowerCase().includes(categoryQuery.toLowerCase())
      ),
    [categories, categoryQuery]
  );

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
                        className="flex-1 h-8 text-sm bg-gray-100 dark:bg-gray-800 rounded-md focus-visible:ring-2 focus-visible:ring-blue-500 px-2"
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
                        className="border rounded-md focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-gray-400"
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
                      className="resize-none rounded-md focus-visible:ring-2 focus-visible:ring-blue-500"
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
              {/* Publishing Options - تحسين بصري كامل */}
              <Collapsible
                open={expandedSections.publishing}
                onOpenChange={() => toggleSection("publishing")}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200">
                          <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                            <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          النشر
                        </CardTitle>
                        <motion.div
                          animate={{ rotate: expandedSections.publishing ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </motion.div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <AnimatePresence>
                    {expandedSections.publishing && (
                      <CollapsibleContent forceMount>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <CardContent className="space-y-6 pt-0">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <Label className="font-medium text-gray-700 dark:text-gray-300">الحالة</Label>
                              <Badge
                                variant={
                                  formData.status === "published"
                                    ? "default"
                                    : "secondary"
                                }
                                className={cn(
                                  "px-3 py-1.5 font-semibold transition-all",
                                  formData.status === "published"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                )}
                              >
                                {formData.status === "published" ? (
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    منشور
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    مسودة
                                  </div>
                                )}
                              </Badge>
                            </div>

                            <div className="space-y-3">
                              <Label className="font-medium text-gray-700 dark:text-gray-300">توقيت النشر</Label>
                              <Select
                                value={formData.publishType}
                                onValueChange={(value: "now" | "scheduled") =>
                                  setFormData({ ...formData, publishType: value })
                                }
                              >
                                <SelectTrigger className="rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[100] shadow-xl border-0 rounded-lg overflow-hidden">
                                  <SelectItem value="now" className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="p-1 rounded bg-green-100 dark:bg-green-900/30">
                                        <Zap className="w-3 h-3 text-green-600 dark:text-green-400" />
                                      </div>
                                      <div>
                                        <div className="font-medium">نشر فوري</div>
                                        <div className="text-xs text-gray-500">يتم النشر مباشرة</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="scheduled" className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30">
                                        <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <div>
                                        <div className="font-medium">جدولة</div>
                                        <div className="text-xs text-gray-500">تحديد وقت النشر</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <AnimatePresence>
                              {formData.publishType === "scheduled" && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="space-y-3"
                                >
                                  <Label className="font-medium text-gray-700 dark:text-gray-300">تاريخ ووقت النشر</Label>
                                  <Input
                                    type="datetime-local"
                                    value={formData.scheduledDate}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        scheduledDate: e.target.value,
                                      })
                                    }
                                    className="rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                              <Button 
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all" 
                                size="sm"
                              >
                                <Eye className="w-4 h-4 ml-2" />
                                معاينة قبل النشر
                              </Button>
                            </div>
                          </CardContent>
                        </motion.div>
                      </CollapsibleContent>
                    )}
                  </AnimatePresence>
                </Card>
              </Collapsible>

              {/* Post Attributes - تحسين تجربة الاستخدام */}
              <Collapsible
                open={expandedSections.attributes}
                onOpenChange={() => toggleSection("attributes")}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200">
                          <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30">
                            <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          خصائص الخبر
                        </CardTitle>
                        <motion.div
                          animate={{ rotate: expandedSections.attributes ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </motion.div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <AnimatePresence>
                    {expandedSections.attributes && (
                      <CollapsibleContent forceMount>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <CardContent className="space-y-6 pt-0">
                            <div className="space-y-3">
                              <Label className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <User className="w-3 h-3" />
                                المؤلف
                              </Label>
                              {/* حقل بحث محسن للمؤلف */}
                              <div className="relative">
                                <Input
                                  placeholder="ابحث عن مؤلف..."
                                  value={authorQuery}
                                  onChange={(e) => setAuthorQuery(e.target.value)}
                                  className="rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all pl-10"
                                />
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              </div>
                              <Select
                                value={formData.authorId}
                                onValueChange={(value) =>
                                  setFormData({ ...formData, authorId: value })
                                }
                              >
                                <SelectTrigger className="rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all">
                                  <SelectValue placeholder="اختر المؤلف" />
                                </SelectTrigger>
                                <SelectContent className="z-[100] shadow-xl border-0 rounded-lg overflow-hidden">
                                  {filteredAuthors.map((author) => (
                                    <SelectItem key={author.id} value={author.id} className="py-3 px-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                                          {author.name?.charAt(0) || "؟"}
                                        </div>
                                        <div>
                                          <div className="font-medium">{author.name}</div>
                                          {author.email && (
                                            <div className="text-xs text-gray-500">{author.email}</div>
                                          )}
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-3">
                              <Label className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Hash className="w-3 h-3" />
                                التصنيف
                              </Label>
                              {/* حقل بحث محسن للتصنيف */}
                              <div className="relative">
                                <Input
                                  placeholder="ابحث عن تصنيف..."
                                  value={categoryQuery}
                                  onChange={(e) => setCategoryQuery(e.target.value)}
                                  className="rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all pl-10"
                                />
                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              </div>
                              <Select
                                value={formData.categoryId}
                                onValueChange={(value) =>
                                  setFormData({ ...formData, categoryId: value })
                                }
                              >
                                <SelectTrigger className="rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all">
                                  <SelectValue placeholder="اختر التصنيف" />
                                </SelectTrigger>
                                <SelectContent className="z-[100] shadow-xl border-0 rounded-lg overflow-hidden">
                                  {filteredCategories.map((category) => (
                                    <SelectItem key={category.id} value={category.id} className="py-3 px-4">
                                      <div className="flex items-center gap-3">
                                        <div
                                          className="w-4 h-4 rounded-full shadow-sm"
                                          style={{
                                            backgroundColor: category.color || "#6B7280",
                                          }}
                                        />
                                        <div>
                                          <div className="font-medium">{category.name_ar || category.name}</div>
                                          <div className="text-xs text-gray-500 capitalize">{category.slug}</div>
                                        </div>
                                        {formData.categoryId === category.id && (
                                          <CheckCircle className="w-4 h-4 text-green-500 mr-auto" />
                                        )}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* تحسين المفاتيح (Toggles) */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-red-100 dark:bg-red-900/30">
                                      <Zap className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                      <Label htmlFor="breaking" className="cursor-pointer font-semibold text-red-800 dark:text-red-300">
                                        خبر عاجل
                                      </Label>
                                      <p className="text-xs text-red-600 dark:text-red-400">يظهر بأولوية عالية في الموقع</p>
                                    </div>
                                  </div>
                                  <Switch
                                    id="breaking"
                                    checked={formData.isBreaking}
                                    onCheckedChange={(checked) =>
                                      setFormData({ ...formData, isBreaking: checked })
                                    }
                                    className="scale-125 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                  />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-yellow-100 dark:bg-yellow-900/30">
                                      <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div>
                                      <Label htmlFor="featured" className="cursor-pointer font-semibold text-yellow-800 dark:text-yellow-300">
                                        خبر مميز
                                      </Label>
                                      <p className="text-xs text-yellow-600 dark:text-yellow-400">يعرض في المقالات المميزة</p>
                                    </div>
                                  </div>
                                  <Switch
                                    id="featured"
                                    checked={formData.isFeatured}
                                    onCheckedChange={(checked) =>
                                      setFormData({ ...formData, isFeatured: checked })
                                    }
                                    className="scale-125 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </motion.div>
                      </CollapsibleContent>
                    )}
                  </AnimatePresence>
                </Card>
              </Collapsible>

              {/* Featured Image - تحسين تجربة رفع الصور */}
              <Collapsible
                open={expandedSections.featuredImage}
                onOpenChange={() => toggleSection("featuredImage")}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200">
                          <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30">
                            <ImageIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          الصورة البارزة
                        </CardTitle>
                        <motion.div
                          animate={{ rotate: expandedSections.featuredImage ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </motion.div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <AnimatePresence>
                    {expandedSections.featuredImage && (
                      <CollapsibleContent forceMount>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <CardContent className="pt-0">
                            {formData.featuredImage ? (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative group"
                              >
                                <Image
                                  src={formData.featuredImage}
                                  alt="Featured"
                                  width={400}
                                  height={192}
                                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                                  <MediaPickerButton
                                    onSelect={(url) =>
                                      setFormData({ ...formData, featuredImage: url })
                                    }
                                    buttonText="تغيير"
                                    className="bg-white/90 hover:bg-white text-gray-900 font-medium px-4 py-2 rounded-lg shadow-lg"
                                  />
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() =>
                                      setFormData({ ...formData, featuredImage: "" })
                                    }
                                    className="bg-white/90 hover:bg-white text-gray-900 font-medium px-4 py-2 rounded-lg shadow-lg"
                                  >
                                    <X className="w-4 h-4 ml-1" />
                                    حذف
                                  </Button>
                                </div>
                                <div className="absolute top-3 right-3">
                                  <Badge className="bg-green-500 text-white shadow-lg">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    مُحددة
                                  </Badge>
                                </div>
                              </motion.div>
                            ) : (
                              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-800/50 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all">
                                <div className="mb-4">
                                  <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                                  </div>
                                </div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                  اختر الصورة البارزة
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                  اختر صورة جذابة لتمثيل المحتوى بأفضل شكل
                                </p>
                                <MediaPickerButton
                                  onSelect={(url) =>
                                    setFormData({ ...formData, featuredImage: url })
                                  }
                                  buttonText="اختر صورة"
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
                                />
                                <div className="mt-3 text-xs text-gray-400">
                                  الحد الأقصى: 5MB • JPG, PNG, WebP
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </motion.div>
                      </CollapsibleContent>
                    )}
                  </AnimatePresence>
                </Card>
              </Collapsible>

              {/* Keywords - تحسين إضافة وإدارة الكلمات المفتاحية */}
              <Collapsible
                open={expandedSections.keywords}
                onOpenChange={() => toggleSection("keywords")}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200">
                          <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30">
                            <Tag className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          الكلمات المفتاحية
                        </CardTitle>
                        <motion.div
                          animate={{ rotate: expandedSections.keywords ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </motion.div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <AnimatePresence>
                    {expandedSections.keywords && (
                      <CollapsibleContent forceMount>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <CardContent className="pt-0 space-y-6">
                            {/* Keywords Input */}
                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                                أضف كلمات مفتاحية لتحسين SEO
                              </label>
                              <div className="relative">
                                <div className="absolute right-3 top-3 z-10">
                                  <Hash className="w-4 h-4 text-gray-400" />
                                </div>
                                <Input
                                  placeholder="اكتب كلمة مفتاحية واضغط Enter"
                                  value={keywordInput}
                                  onChange={(e) => setKeywordInput(e.target.value)}
                                  onKeyDown={handleAddKeyword}
                                  className="pl-3 pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                                />
                              </div>
                            </div>

                            {/* Keywords Display */}
                            {formData.keywords.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <Tag className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                  <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                    الكلمات المفتاحية المضافة ({formData.keywords.length})
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {formData.keywords.map((keyword, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      className="flex items-center gap-1 bg-orange-100 dark:bg-orange-800/50 text-orange-800 dark:text-orange-200 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-200 dark:border-orange-700"
                                    >
                                      <Hash className="w-3 h-3" />
                                      {keyword}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeKeyword(index)}
                                        className="p-0 ml-1 hover:bg-orange-200 dark:hover:bg-orange-700 rounded-full w-4 h-4"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}

                            {/* SEO Tips */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <div className="flex items-start gap-3">
                                <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30">
                                  <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                                    نصائح لتحسين محركات البحث
                                  </h4>
                                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    <li>• استخدم 3-5 كلمات مفتاحية ذات صلة بالمحتوى</li>
                                    <li>• اختر كلمات يبحث عنها الجمهور المستهدف</li>
                                    <li>• تجنب الحشو المفرط للكلمات المفتاحية</li>
                                    <li>• استخدم كلمات باللغة العربية والإنجليزية حسب المحتوى</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </motion.div>
                      </CollapsibleContent>
                    )}
                  </AnimatePresence>
                </Card>
              </Collapsible>

              {/* SEO Settings - تحسين إعدادات محركات البحث */}
              <Collapsible
                open={expandedSections.seo}
                onOpenChange={() => toggleSection("seo")}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200">
                          <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          إعدادات تحسين محركات البحث (SEO)
                        </CardTitle>
                        <motion.div
                          animate={{ rotate: expandedSections.seo ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </motion.div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <AnimatePresence>
                    {expandedSections.seo && (
                      <CollapsibleContent forceMount>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <CardContent className="pt-0 space-y-6">
                            {/* SEO Title */}
                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                عنوان SEO
                              </label>
                              <div className="relative">
                                <Input
                                  placeholder="اتركه فارغاً لاستخدام العنوان الرئيسي"
                                  value={formData.seoTitle}
                                  onChange={(e) =>
                                    setFormData({ ...formData, seoTitle: e.target.value })
                                  }
                                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                />
                                <div className="absolute left-3 top-3">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                الحد المثالي: 50-60 حرف
                                {formData.seoTitle && (
                                  <span className={`ml-2 ${formData.seoTitle.length > 60 ? 'text-red-500' : 'text-green-500'}`}>
                                    ({formData.seoTitle.length} حرف)
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* SEO Description */}
                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                وصف SEO
                              </label>
                              <div className="relative">
                                <Textarea
                                  placeholder="اتركه فارغاً لاستخدام الموجز"
                                  value={formData.seoDescription}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      seoDescription: e.target.value,
                                    })
                                  }
                                  rows={4}
                                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                                />
                              </div>
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                الحد المثالي: 150-160 حرف
                                {formData.seoDescription && (
                                  <span className={`ml-2 ${formData.seoDescription.length > 160 ? 'text-red-500' : 'text-green-500'}`}>
                                    ({formData.seoDescription.length} حرف)
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* SEO Preview */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2 mb-3">
                                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                  معاينة نتيجة البحث
                                </span>
                              </div>
                              <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-600">
                                <div className="text-blue-600 text-lg font-medium mb-1 truncate">
                                  {formData.seoTitle || formData.title || "عنوان المقال"}
                                </div>
                                <div className="text-green-600 text-sm mb-2">
                                  https://sabq.org/article/news/{formData.slug || "article-slug"}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                  {formData.seoDescription || formData.excerpt || "وصف المقال سيظهر هنا..."}
                                </div>
                              </div>
                            </div>

                            {/* SEO Tips */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                              <div className="flex items-start gap-3">
                                <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30">
                                  <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                                    نصائح لتحسين SEO
                                  </h4>
                                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                    <li>• استخدم عنوان جذاب ووصفي (50-60 حرف)</li>
                                    <li>• اكتب وصف واضح يلخص المحتوى (150-160 حرف)</li>
                                    <li>• تأكد من وجود الكلمات المفتاحية في العنوان والوصف</li>
                                    <li>• اجعل المحتوى فريد وذو قيمة للقارئ</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </motion.div>
                      </CollapsibleContent>
                    )}
                  </AnimatePresence>
                </Card>
              </Collapsible>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
