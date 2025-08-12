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
  Circle,
  Loader2,
  Sparkles,
  Shield,
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
  Brain,
} from "lucide-react";
import { MediaPickerButton } from "@/components/admin/media/MediaPickerButton";
import { generateShortSlug } from "@/lib/slug";
import { toast } from "@/components/ui/use-toast";

// تحميل المحرر بشكل ديناميكي
const Editor = dynamic(
  () => import("@/components/Editor/Editor").catch((err) => {
    console.error("Failed to load Editor:", err);
    return { default: () => <div className="p-4 text-red-500">فشل تحميل المحرر. يرجى إعادة تحميل الصفحة.</div> };
  }),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-gray-50 dark:bg-gray-800/50 animate-pulse rounded-xl flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    ),
  }
);

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
  const [loading, setLoading] = useState(false); // تغيير من true إلى false
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [aiGenerating, setAIGenerating] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{
    valid: boolean;
    message: string;
    details?: string;
  } | null>(null);
  
  // حالات التحميل التدريجي
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingAuthors, setLoadingAuthors] = useState(true);

  // حالة النموذج
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    slug: "",
    excerpt: "",
    content: "" as string | any,
    authorId: "",
    categoryId: "",
    featuredImage: "",
    keywords: [] as string[],
    seoTitle: "",
    seoDescription: "",
    publishType: "immediate" as "immediate" | "scheduled",
    scheduledDate: "",
    isBreaking: false,
    isFeatured: false,
    status: "draft" as "draft" | "published",
  });

  // Keyword input state
  const [keywordInput, setKeywordInput] = useState("");
  // أزيلت حقول البحث عن المراسل والتصنيف بناء على طلب المستخدم

  const filteredAuthors = useMemo(() => authors, [authors]);

  const filteredCategories = useMemo(() => categories, [categories]);

  // كلاسات التصميم البسيط
  const inputClassName = "w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-800 focus:border-gray-400 focus:outline-none transition-colors duration-200";
  
  const textareaClassName = "w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-800 focus:border-gray-400 focus:outline-none transition-colors duration-200 resize-y min-h-[120px]";

  const cardClassName = "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl";
  const sidebarCardClassName = "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl";

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
  // حالات فتح القوائم المنسدلة المخصصة
  const [authorsOpen, setAuthorsOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // بدء تحميل البيانات بشكل تدريجي
    fetchCategoriesAsync();
    fetchAuthorsAsync();
  }, []);

  const fetchCategoriesAsync = async () => {
    try {
      console.log("🔄 بدء تحميل التصنيفات...");
      const startTime = Date.now();
      
      const response = await fetch("/api/categories");
      const loadTime = Date.now() - startTime;
      console.log(`📂 تم جلب التصنيفات في ${loadTime}ms`);

      if (response.ok) {
        const categoriesData = await response.json();
        const loadedCategories = categoriesData.categories || categoriesData || [];
        setCategories(loadedCategories);
        console.log(`📂 تم تحميل ${loadedCategories.length} تصنيف`);

        // تعيين تصنيف افتراضي
        if (loadedCategories.length > 0 && !formData.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: loadedCategories[0].id }));
        }
      } else {
        console.error("❌ فشل في تحميل التصنيفات");
        toast({
          title: "خطأ",
          description: "فشل في تحميل التصنيفات",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ خطأ في تحميل التصنيفات:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchAuthorsAsync = async () => {
    try {
      console.log("🔄 بدء تحميل المراسلين...");
      const startTime = Date.now();
      
      const response = await fetch("/api/admin/article-authors?active_only=true");
      const loadTime = Date.now() - startTime;
      console.log(`👥 تم جلب المراسلين في ${loadTime}ms`);

      if (response.ok) {
        const authorsData = await response.json();
        
        if (authorsData.success && authorsData.authors) {
          const convertedAuthors = authorsData.authors.map((author: any) => ({
            id: author.id,
            name: author.full_name || author.name,
            email: author.email || "",
            slug: author.slug,
            avatar: author.avatar_url || author.avatar,
          }));

          setAuthors(convertedAuthors);
          console.log(`👥 تم تحميل ${convertedAuthors.length} مراسل`);

          // تعيين مؤلف افتراضي
          if (convertedAuthors.length > 0 && !formData.authorId) {
            setFormData(prev => ({ ...prev, authorId: convertedAuthors[0].id }));
          }
        } else {
          console.log("⚠️ لا يوجد مؤلفين متاحين");
          setAuthors([]);
        }
      } else {
        console.error("❌ فشل في تحميل المؤلفين");
        toast({
          title: "خطأ",
          description: "فشل في تحميل المراسلين",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ خطأ في تحميل المراسلين:", error);
    } finally {
      setLoadingAuthors(false);
    }
  };

  // توليد سلاج قصير تلقائياً مرة واحدة عند التحميل إذا كان فارغاً
  useEffect(() => {
    if (!formData.slug) {
      setFormData((prev) => ({ ...prev, slug: generateShortSlug() }));
    }
    // تشغيل مرة واحدة فقط عند التحميل
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate completion score
  const calculateCompletion = () => {
    let score = 0;
    if (formData.title) score += 20;
    
    // حساب نقاط المحتوى بطريقة صحيحة
    if (formData.content) {
      let contentLength = 0;
      if (typeof formData.content === 'string') {
        contentLength = formData.content.length;
      } else if (typeof formData.content === 'object' && formData.content !== null) {
        if ((formData.content as any).html) {
          contentLength = (formData.content as any).html.length;
        } else if ((formData.content as any).content) {
          contentLength = JSON.stringify((formData.content as any).content).length;
        } else {
          contentLength = JSON.stringify(formData.content).length;
        }
      }
      if (contentLength > 100) score += 30;
    }
    
    if (formData.excerpt) score += 10;
    if (formData.categoryId) score += 10;
    if (formData.authorId) score += 10;
    if (formData.featuredImage) score += 10;
    if (formData.keywords.length > 0) score += 10;
    return score;
  };

  const completionScore = calculateCompletion();

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
  const handleAIGeneration = async () => {
    // تحقق من وجود محتوى
    if (!formData.content) {
      toast({
        title: "لا يوجد محتوى",
        description: "يرجى إضافة محتوى أولاً للتوليد التلقائي",
        variant: "destructive",
      });
      return;
    }

    // تحقق من طول المحتوى بطريقة صحيحة
    let contentLength = 0;
    if (typeof formData.content === 'string') {
      contentLength = formData.content.length;
    } else if (typeof formData.content === 'object' && formData.content !== null) {
      // إذا كان object، استخرج النص أو HTML للتحقق من الطول
      if ((formData.content as any).html) {
        contentLength = (formData.content as any).html.length;
      } else if ((formData.content as any).content) {
        contentLength = JSON.stringify((formData.content as any).content).length;
      } else {
        contentLength = JSON.stringify(formData.content).length;
      }
    }

    if (contentLength < 50) {
      toast({
        title: "المحتوى قصير جداً",
        description: "يجب أن يكون المحتوى 50 حرفاً على الأقل للتوليد التلقائي",
        variant: "destructive",
      });
      return;
    }
    
    setAIGenerating(true);
    
    try {
      console.log("بدء التوليد التلقائي للمحتوى...");
      
      // تحويل المحتوى إلى نص قابل للإرسال
      let contentToSend = '';
      if (typeof formData.content === 'string') {
        contentToSend = formData.content;
      } else if (typeof formData.content === 'object' && formData.content !== null) {
        // استخراج النص من object
        if ((formData.content as any).html) {
          contentToSend = (formData.content as any).html;
        } else if ((formData.content as any).content) {
          contentToSend = JSON.stringify((formData.content as any).content);
        } else {
          contentToSend = JSON.stringify(formData.content);
        }
      }
      
      console.log("المحتوى المرسل:", { type: typeof contentToSend, length: contentToSend.length, preview: contentToSend.substring(0, 100) });
      
      const response = await fetch("/api/admin/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentToSend }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("نتائج التوليد التلقائي:", data);
        
        // تطبيق جميع الحقول المولدة
        setFormData(prev => ({
          ...prev,
          title: data.title || prev.title,
          subtitle: data.subtitle || prev.subtitle,
          excerpt: data.excerpt || prev.excerpt,
          keywords: data.keywords || prev.keywords,
          // تحديث SEO أيضاً
          seoTitle: data.title || prev.seoTitle,
          seoDescription: data.excerpt || prev.seoDescription,
        }));
        
        toast({
          title: "تم التوليد بنجاح ✨",
          description: "تم توليد العنوان والموجز والكلمات المفتاحية",
        });
      } else {
        const error = await response.json();
        console.error("خطأ من الخادم:", error);
        toast({
          title: "خطأ في التوليد",
          description: error.error || "فشل في توليد المحتوى",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("خطأ في التوليد:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي",
        variant: "destructive",
      });
    } finally {
      setAIGenerating(false);
    }
  };

  // دالة اختبار صلاحية مفتاح OpenAI
  const handleTestOpenAIKey = async () => {
    setTestingKey(true);
    setKeyTestResult(null);
    
    try {
      const response = await fetch("/api/admin/ai/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      
      setKeyTestResult({
        valid: data.valid,
        message: data.valid ? data.message : data.error,
        details: data.details
      });

      toast({
        title: data.valid ? "✅ مفتاح صحيح" : "❌ مفتاح غير صحيح",
        description: data.valid ? data.message : data.error,
        variant: data.valid ? "default" : "destructive",
        duration: data.valid ? 5000 : 8000,
      });
      
    } catch (error) {
      console.error("خطأ في اختبار المفتاح:", error);
      setKeyTestResult({
        valid: false,
        message: "حدث خطأ أثناء اختبار المفتاح",
        details: "تحقق من الاتصال بالإنترنت"
      });
      
      toast({
        title: "❌ خطأ في الاختبار",
        description: "حدث خطأ أثناء اختبار صلاحية المفتاح",
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setTestingKey(false);
    }
  };



  const handleSubmit = async (action: "draft" | "publish" | "review") => {
    // التحقق من البيانات المطلوبة
    if (!formData.title || !formData.content) {
      toast({
        title: "خطأ في البيانات ❌",
        description: "يجب إدخال العنوان والمحتوى على الأقل",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    // التحقق من اكتمال البيانات للنشر
    if (action === "publish" && completionScore < 60) {
      toast({
        title: "البيانات غير مكتملة ⚠️",
        description: "يجب إكمال 60% من البيانات على الأقل للنشر. يرجى إضافة المحتوى والتصنيف والصورة.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setSaving(true);

    // عرض إشعار بداية العملية مع مؤثرات بصرية
    toast({
      title: action === "publish" ? "🚀 جاري النشر..." : action === "draft" ? "💾 جاري الحفظ..." : "📋 جاري الإرسال للمراجعة...",
      description: action === "publish" 
        ? "⏳ يتم نشر الخبر الآن، يرجى الانتظار..." 
        : action === "draft"
        ? "⏳ يتم حفظ البيانات كمسودة، يرجى الانتظار..."
        : "⏳ يتم إرسال المقال للمراجعة، يرجى الانتظار...",
      duration: 3000,
    });

    try {
      // معالجة المحتوى بناءً على نوعه
      let processedContent = formData.content;
      
      // إذا كان المحتوى object (من المحرر)، استخرج HTML
      if (typeof formData.content === 'object' && formData.content !== null) {
        if ((formData.content as any).html) {
          processedContent = (formData.content as any).html;
        } else if ((formData.content as any).content) {
          // إذا كان في تنسيق JSON، حول إلى HTML
          processedContent = JSON.stringify(formData.content);
        } else {
          // كـ fallback، حول الـ object كاملاً إلى JSON string
          processedContent = JSON.stringify(formData.content);
        }
      }

      // تأكد من أن المحتوى string
      if (typeof processedContent !== 'string') {
        processedContent = String(processedContent);
      }

      const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        excerpt: formData.excerpt,
        content: processedContent,
        author_id: formData.authorId,
        category_id: formData.categoryId,
        featured_image: formData.featuredImage,
        keywords: formData.keywords,
        seo_title: formData.seoTitle || formData.title,
        seo_description: formData.seoDescription || formData.excerpt,
        is_breaking: formData.isBreaking,
        is_featured: formData.isFeatured,
        status: action === "publish" ? "published" : "draft",
        published_at: action === "publish" ? new Date().toISOString() : null,
        metadata: {
          subtitle: formData.subtitle
        }
      };

      console.log("البيانات المرسلة:", payload);
      console.log("البيانات المرسلة (JSON):", JSON.stringify(payload, null, 2));

      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("رد الخادم:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("خطأ من الخادم:", error);
        console.error("تفاصيل الخطأ:", {
          status: response.status,
          error: error,
          payload: payload,
        });
        
        // عرض رسالة خطأ مفصلة مع معلومات إضافية
        toast({
          title: action === "publish" ? "❌ فشل في النشر" : "❌ فشل في الحفظ",
          description: `${error.error || error.details || "حدث خطأ أثناء العملية"}\n\n💡 تأكد من اتصالك بالإنترنت وحاول مرة أخرى`,
          variant: "destructive",
          duration: 8000, // إظهار أطول للأخطاء
        });
        return;
      }

      const result = await response.json();
      console.log("✅ نتيجة الحفظ:", result);

      // عرض إشعار النجاح مع معلومات إضافية ومؤثرات بصرية
      toast({
        title: action === "publish" ? "🎉 تم النشر بنجاح!" : action === "draft" ? "💾 تم الحفظ بنجاح!" : "📋 تم الإرسال للمراجعة!",
        description:
          action === "publish"
            ? `✨ تم نشر الخبر "${formData.title}" بنجاح، وتم أيضاً إرساله لنظام تتبع القصص الذكي للربط والتنبيه`
            : action === "draft"
            ? `📝 تم حفظ مسودة "${formData.title}" بنجاح، وسيتم تحليله لاحقاً للربط بقصة`
            : `👀 تم إرسال "${formData.title}" للمراجعة، وسيتم تحليله لربطه بقصة إذا لزم الأمر`,
        duration: 6000,
        variant: "default",
      });

      // إعادة توجيه واضحة ومحسنة
      setTimeout(() => {
        if (action === "publish") {
          // للأخبار المنشورة: توجيه لقائمة الأخبار
          console.log("🔄 إعادة توجيه لقائمة الأخبار...");
          router.push("/admin/news");
        } else if (result.article?.id || result.id) {
          // للمسودات: توجيه لصفحة التحرير
          const articleId = result.article?.id || result.id;
          console.log("🔄 إعادة توجيه لصفحة التحرير:", articleId);
          router.push(`/admin/news/edit/${articleId}`);
        } else {
          // fallback: توجيه لقائمة الأخبار
          console.log("🔄 إعادة توجيه احتياطية لقائمة الأخبار...");
          router.push("/admin/news");
        }
      }, 2000); // انتظار ثانيتين لقراءة الإشعار
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: action === "publish" ? "⚠️ خطأ في النشر" : "⚠️ خطأ في الحفظ",
        description: "حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.",
        variant: "destructive",
        duration: 8000,
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

  // إزالة loading screen المطول - السماح بالاستخدام أثناء التحميل
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
  //       <div className="text-center">
  //         <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
  //         <p className="text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  إنشاء خبر جديد
                </h1>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-3 cursor-help">
                      <span className="text-sm text-gray-600 dark:text-gray-400">إكمال الخبر</span>
                      <div className="flex items-center gap-3">
                        <div className="relative w-32 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "absolute inset-y-0 left-0 transition-all duration-500 rounded-full",
                              completionScore < 30 && "bg-red-500",
                              completionScore >= 30 && completionScore < 60 && "bg-amber-500",
                              completionScore >= 60 && completionScore < 100 && "bg-blue-500",
                              completionScore === 100 && "bg-green-500"
                            )}
                            style={{ width: `${completionScore}%` }}
                          />
                        </div>
                        <span className={cn(
                          "text-sm font-medium transition-colors",
                          completionScore < 30 && "text-red-600 dark:text-red-500",
                          completionScore >= 30 && completionScore < 60 && "text-amber-600 dark:text-amber-500",
                          completionScore >= 60 && completionScore < 100 && "text-blue-600 dark:text-blue-500",
                          completionScore === 100 && "text-green-600 dark:text-green-500"
                        )}>{completionScore}%</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-0 overflow-hidden z-50">
                    <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">متطلبات إكمال الخبر</p>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className={cn("flex items-center justify-between py-2 px-3 rounded-lg", formData.title ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800/50")}>
                        <span className={cn("text-sm font-medium", formData.title ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400")}>
                          العنوان الرئيسي
                        </span>
                        <span className={cn("text-xs font-semibold", formData.title ? "text-green-600 dark:text-green-500" : "text-gray-500 dark:text-gray-500")}>
                          20%
                        </span>
                      </div>
                      <div className={cn("flex items-center justify-between py-2 px-3 rounded-lg", formData.content && formData.content.length > 100 ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800/50")}>
                        <span className={cn("text-sm font-medium", formData.content && formData.content.length > 100 ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400")}>
                          محتوى الخبر (100+ حرف)
                        </span>
                        <span className={cn("text-xs font-semibold", formData.content && formData.content.length > 100 ? "text-green-600 dark:text-green-500" : "text-gray-500 dark:text-gray-500")}>
                          30%
                        </span>
                      </div>
                      <div className={cn("flex items-center justify-between py-2 px-3 rounded-lg", formData.excerpt ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800/50")}>
                        <span className={cn("text-sm font-medium", formData.excerpt ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400")}>
                          الموجز الذكي
                        </span>
                        <span className={cn("text-xs font-semibold", formData.excerpt ? "text-green-600 dark:text-green-500" : "text-gray-500 dark:text-gray-500")}>
                          10%
                        </span>
                      </div>
                      <div className={cn("flex items-center justify-between py-2 px-3 rounded-lg", formData.categoryId ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800/50")}>
                        <span className={cn("text-sm font-medium", formData.categoryId ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400")}>
                          التصنيف
                        </span>
                        <span className={cn("text-xs font-semibold", formData.categoryId ? "text-green-600 dark:text-green-500" : "text-gray-500 dark:text-gray-500")}>
                          10%
                        </span>
                      </div>
                      <div className={cn("flex items-center justify-between py-2 px-3 rounded-lg", formData.authorId ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800/50")}>
                        <span className={cn("text-sm font-medium", formData.authorId ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400")}>
                          المراسل
                        </span>
                        <span className={cn("text-xs font-semibold", formData.authorId ? "text-green-600 dark:text-green-500" : "text-gray-500 dark:text-gray-500")}>
                          10%
                        </span>
                      </div>
                      <div className={cn("flex items-center justify-between py-2 px-3 rounded-lg", formData.featuredImage ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800/50")}>
                        <span className={cn("text-sm font-medium", formData.featuredImage ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400")}>
                          الصورة البارزة
                        </span>
                        <span className={cn("text-xs font-semibold", formData.featuredImage ? "text-green-600 dark:text-green-500" : "text-gray-500 dark:text-gray-500")}>
                          10%
                        </span>
                      </div>
                      <div className={cn("flex items-center justify-between py-2 px-3 rounded-lg", formData.keywords.length > 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800/50")}>
                        <span className={cn("text-sm font-medium", formData.keywords.length > 0 ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400")}>
                          الكلمات المفتاحية
                        </span>
                        <span className={cn("text-xs font-semibold", formData.keywords.length > 0 ? "text-green-600 dark:text-green-500" : "text-gray-500 dark:text-gray-500")}>
                          10%
                        </span>
                      </div>
                      {completionScore < 60 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2 mt-3">
                          <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            يجب إكمال 60% على الأقل للنشر
                          </p>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-3">
                {/* Auto-save indicator */}
                {lastSaved && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    حُفظ تلقائياً {lastSaved.toLocaleTimeString("ar-SA")}
                  </div>
                )}

                {/* Action buttons */}
                <Button
                  variant="outline"
                  onClick={() => handleSubmit("draft")}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "جاري الحفظ..." : "حفظ مسودة"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleSubmit("review")}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  {saving ? "جاري الإرسال..." : "مراجعة"}
                </Button>
                <div className="flex items-center gap-2 border-r px-4">
                  <Button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, publishType: 'immediate' }));
                      handleSubmit("publish");
                    }}
                    disabled={saving || completionScore < 60}
                    className={cn(
                      "gap-2 transition-all",
                      formData.publishType === 'immediate' 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                    )}
                  >
                    {saving && formData.publishType === 'immediate' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {saving && formData.publishType === 'immediate' ? "جاري النشر..." : "نشر فوري"}
                  </Button>
                  <Button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, publishType: 'scheduled' }));
                      // سيتم إضافة منطق الجدولة لاحقاً
                    }}
                    disabled={saving || completionScore < 60}
                    className={cn(
                      "gap-2 transition-all",
                      formData.publishType === 'scheduled' 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                    )}
                  >
                    <Clock className="w-4 h-4" />
                    مجدول
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Subtitle Card */}
              <Card className={cardClassName}>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      العنوان الرئيسي
                    </Label>
                    <Input
                      placeholder="اكتب عنواناً جذاباً ومختصراً..."
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className={cn(inputClassName, "font-bold text-lg")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      العنوان الفرعي (اختياري)
                    </Label>
                    <Input
                      placeholder="أضف تفاصيل إضافية..."
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData({ ...formData, subtitle: e.target.value })
                      }
                      className={inputClassName}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Smart Excerpt Card */}
              <Card className={cardClassName}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    الموجز الذكي
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Textarea
                    placeholder="اكتب موجزاً ذكياً شاملاً يلخص محتوى الخبر..."
                    value={formData.excerpt}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        setFormData({ ...formData, excerpt: e.target.value })
                      }
                    }}
                    rows={5}
                    className={textareaClassName}
                    maxLength={500}
                  />
                  <div className="flex justify-start items-center mt-3">
                    <p className="text-xs text-gray-500">
                      {formData.excerpt.length}/500 حرف
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Content Editor Card */}
              <Card className={cardClassName}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">محتوى الخبر</CardTitle>
                    <div className="flex items-center gap-2">
                      {/* زر اختبار مفتاح OpenAI */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                              onClick={handleTestOpenAIKey}
                              disabled={testingKey || aiGenerating}
                            >
                              {testingKey ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  اختبار...
                                </>
                              ) : (
                                <>
                                  <Shield className="w-4 h-4" />
                                  {keyTestResult?.valid === true ? "✅" : keyTestResult?.valid === false ? "❌" : "🔑"}
                                </>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>اختبار صلاحية مفتاح OpenAI API</p>
                            {keyTestResult && (
                              <p className="text-xs mt-1 opacity-80">
                                {keyTestResult.message}
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* زر التوليد التلقائي */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-purple-600 hover:text-purple-700"
                        onClick={handleAIGeneration}
                        disabled={!formData.content || formData.content.length < 100 || aiGenerating || testingKey}
                      >
                        {aiGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            جاري التوليد...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            🤖 توليد تلقائي
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* حالة اختبار مفتاح OpenAI */}
                  {keyTestResult && (
                    <div className={`mb-4 p-4 rounded-lg border ${
                      keyTestResult.valid 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-start gap-3">
                        {keyTestResult.valid ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className={`text-sm font-medium ${
                            keyTestResult.valid 
                              ? 'text-green-700 dark:text-green-300' 
                              : 'text-red-700 dark:text-red-300'
                          }`}>
                            {keyTestResult.message}
                          </p>
                          {keyTestResult.details && (
                            <p className={`text-xs mt-1 ${
                              keyTestResult.valid 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {keyTestResult.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Generation Tip */}
                  <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        <span className="font-medium">نصيحة:</span> اكتب محتوى الخبر (100+ حرف) ثم اضغط "🤖 توليد تلقائي" لإنشاء العنوان والموجز والكلمات المفتاحية تلقائياً بواسطة الذكاء الاصطناعي. 
                        <br />
                        <span className="text-xs opacity-75">💡 كلما كان المحتوى أكثر تفصيلاً، كانت النتائج أكثر دقة وصلة بالموضوع</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="min-h-[500px] bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <Editor
                      ref={editorRef}
                      content={formData.content}
                      onChange={(content) => {
                        console.log("محتوى المحرر:", content);
                        setFormData(prev => ({ ...prev, content }));
                      }}
                      placeholder="ابدأ بكتابة محتوى الخبر هنا..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card className={cardClassName}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-green-600" />
                    الصورة البارزة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.featuredImage ? (
                    <div className="relative group">
                      <Image
                        src={formData.featuredImage}
                        alt="Featured"
                        width={800}
                        height={400}
                        className="w-full h-80 object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                        <MediaPickerButton
                          onSelect={(url) =>
                            setFormData({ ...formData, featuredImage: url })
                          }
                          buttonText="تغيير الصورة"
                          className="bg-white hover:bg-gray-50 text-gray-900 font-medium px-6 py-3 rounded-lg border border-gray-200"
                        />
                        <Button
                          variant="secondary"
                          size="default"
                          onClick={() =>
                            setFormData({ ...formData, featuredImage: "" })
                          }
                          className="bg-white hover:bg-gray-50 px-6 py-3 border border-gray-200"
                        >
                          <X className="w-5 h-5 ml-2" />
                          حذف الصورة
                        </Button>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-500 text-white px-3 py-1">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          تم اختيار الصورة
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-16 text-center">
                      <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        اختر الصورة البارزة للخبر
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        الصورة البارزة تظهر في الصفحة الرئيسية ومشاركات السوشيال ميديا
                      </p>
                      <MediaPickerButton
                        onSelect={(url) =>
                          setFormData({ ...formData, featuredImage: url })
                        }
                        buttonText="اختر صورة من المكتبة"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base"
                      />
                      <p className="text-xs text-gray-500 mt-4">
                        الحد الأقصى: 5MB • الصيغ المدعومة: JPG, PNG, WebP
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publishing Options */}
              <Card className={sidebarCardClassName}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-600" />
                    خيارات النشر
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الحالة</Label>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">مسودة</span>
                      <Badge
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        غير منشور
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">توقيت النشر</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, publishType: "immediate" })}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all",
                          formData.publishType === "immediate"
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        )}
                      >
                        <Zap className="w-4 h-4" />
                        نشر فوري
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, publishType: "scheduled" })}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all",
                          formData.publishType === "scheduled"
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        )}
                      >
                        <Calendar className="w-4 h-4" />
                        جدولة
                      </button>
                    </div>
                  </div>

                  {formData.publishType === "scheduled" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">تاريخ ووقت النشر</Label>
                      <Input
                        type="datetime-local"
                        value={formData.scheduledDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scheduledDate: e.target.value,
                          })
                        }
                        className={inputClassName}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Post Attributes */}
              <Card className={sidebarCardClassName}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-600" />
                    خصائص الخبر
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Author Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <User className="w-3 h-3" />
                      المراسل
                    </Label>
                    <div className="relative">
                      {loadingAuthors ? (
                        <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span className="text-sm text-gray-500">جاري تحميل المراسلين...</span>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setAuthorsOpen(!authorsOpen)}
                            className={cn(inputClassName, "text-right cursor-pointer")}
                          >
                            {authors.find(a => a.id === formData.authorId)?.name || "اختر المراسل"}
                            <ChevronDown className={cn(
                              "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform",
                              authorsOpen && "rotate-180"
                            )} />
                          </button>
                          {authorsOpen && (
                            <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto">
                              {filteredAuthors.map((author) => (
                            <div
                              key={author.id}
                              className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm"
                              onClick={() => {
                                setFormData({ ...formData, authorId: author.id });
                                setAuthorsOpen(false);
                              }}
                            >
                              {author.name}
                            </div>
                          ))}
                        </div>
                      )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Hash className="w-3 h-3" />
                      التصنيف
                    </Label>
                    <div className="relative">
                      {loadingCategories ? (
                        <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span className="text-sm text-gray-500">جاري تحميل الفئات...</span>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setCatsOpen(!catsOpen)}
                            className={cn(inputClassName, "text-right cursor-pointer")}
                          >
                            {categories.find(c => c.id === formData.categoryId)?.name_ar || categories.find(c => c.id === formData.categoryId)?.name || "اختر التصنيف"}
                            <ChevronDown className={cn(
                              "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform",
                              catsOpen && "rotate-180"
                            )} />
                          </button>
                          {catsOpen && (
                            <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto">
                              {filteredCategories.map((category) => (
                            <div
                              key={category.id}
                              className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm"
                              onClick={() => {
                                setFormData({ ...formData, categoryId: category.id });
                                setCatsOpen(false);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                {category.color && (
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: category.color }}
                                  />
                                )}
                                <span>{category.name_ar || category.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Special Flags */}
                  <div className="space-y-3 pt-3">
                    <div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isBreaking: !formData.isBreaking })}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all",
                          formData.isBreaking
                            ? "border-red-200 bg-red-50 dark:bg-red-900/20"
                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Zap className={cn("w-4 h-4", formData.isBreaking ? "text-red-600" : "text-gray-500")} />
                          <span className={cn("text-sm font-medium", formData.isBreaking ? "text-red-700" : "text-gray-700")}>
                            خبر عاجل
                          </span>
                        </div>
                        <Badge variant={formData.isBreaking ? "destructive" : "secondary"} className="text-xs">
                          {formData.isBreaking ? "مفعّل" : "غير مفعّل"}
                        </Badge>
                      </button>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 pr-1">
                        يظهر الخبر في شريط الأخبار العاجلة أعلى الموقع
                      </p>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all",
                          formData.isFeatured
                            ? "border-amber-200 bg-amber-50 dark:bg-amber-900/20"
                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Star className={cn("w-4 h-4", formData.isFeatured ? "text-amber-600" : "text-gray-500")} />
                          <span className={cn("text-sm font-medium", formData.isFeatured ? "text-amber-700" : "text-gray-700")}>
                            خبر مميز
                          </span>
                        </div>
                        <Badge variant={formData.isFeatured ? "default" : "secondary"} className="text-xs">
                          {formData.isFeatured ? "مفعّل" : "غير مفعّل"}
                        </Badge>
                      </button>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 pr-1">
                        يظهر الخبر في القسم المميز بالصفحة الرئيسية
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>



              {/* Keywords */}
              <Card className={sidebarCardClassName}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Tag className="w-4 h-4 text-orange-600" />
                    الكلمات المفتاحية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      أضف كلمات مفتاحية لتحسين SEO
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="اكتب كلمة مفتاحية واضغط Enter"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={handleAddKeyword}
                        className={`${inputClassName} pr-10`}
                      />
                      <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {formData.keywords.length > 0 && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          الكلمات المفتاحية ({formData.keywords.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.keywords.map((keyword, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 bg-white dark:bg-gray-800 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-200 dark:border-orange-700"
                          >
                            <Hash className="w-3 h-3" />
                            {keyword}
                            <button
                              onClick={() => removeKeyword(index)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Collapsible defaultOpen={false}>
                <Card className={sidebarCardClassName}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <CardTitle className="text-base flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-600" />
                          إعدادات SEO
                        </div>
                        <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      عنوان SEO
                    </Label>
                    <Input
                      placeholder="اتركه فارغاً لاستخدام العنوان الرئيسي"
                      value={formData.seoTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, seoTitle: e.target.value })
                      }
                      className={inputClassName}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.seoTitle.length}/60 حرف
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      وصف SEO
                    </Label>
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
                      className={`${textareaClassName} min-h-[80px]`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.seoDescription.length}/160 حرف
                    </p>
                  </div>

                  {/* SEO Preview */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      معاينة نتيجة البحث
                    </p>
                    <div className="text-blue-600 text-sm font-medium truncate">
                      {formData.seoTitle || formData.title || "عنوان المقال"}
                    </div>
                    <div className="text-green-600 text-xs mt-1">
                      sabq.io/news/{formData.slug}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                      {formData.seoDescription || formData.excerpt || "وصف المقال..."}
                    </div>
                  </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* SEO Tips & Guidelines */}
              <Card className={sidebarCardClassName}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    نصائح وإرشادات SEO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Keywords Tips */}
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-700">
                    <div className="flex items-start gap-2 mb-2">
                      <Tag className="w-4 h-4 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
                          نصائح الكلمات المفتاحية
                        </h4>
                        <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                          <li>• استخدم 3-5 كلمات مفتاحية مرتبطة بالمحتوى</li>
                          <li>• امزج بين كلمات عامة وأخرى محددة</li>
                          <li>• تجنب حشو الكلمات المفتاحية بشكل مفرط</li>
                          <li>• استخدم مرادفات وكلمات ذات صلة</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* SEO Best Practices */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-start gap-2 mb-2">
                      <Globe className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                          أفضل ممارسات SEO
                        </h4>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                          <li>• العنوان: 50-60 حرف (يظهر كاملاً في البحث)</li>
                          <li>• الوصف: 150-160 حرف (ملخص جذاب)</li>
                          <li>• استخدم الكلمات المفتاحية في العنوان والوصف</li>
                          <li>• اكتب محتوى أصلي وذو قيمة للقارئ</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Important Alerts */}
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-700">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                          تنبيهات مهمة
                        </h4>
                        <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                          <li>• تجنب نسخ المحتوى من مواقع أخرى</li>
                          <li>• لا تستخدم كلمات مفتاحية غير مرتبطة</li>
                          <li>• تأكد من وجود صورة بارزة عالية الجودة</li>
                          <li>• راجع الأخطاء الإملائية قبل النشر</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Success Tips */}
                  <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                          لنجاح خبرك
                        </h4>
                        <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                          <li>• عنوان جذاب يثير الفضول</li>
                          <li>• موجز واضح يلخص الخبر</li>
                          <li>• محتوى شامل ومفصل</li>
                          <li>• صورة بارزة معبرة عن المحتوى</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2">
                          إحصائيات سريعة
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white dark:bg-gray-800 rounded p-2 text-center">
                            <div className="font-bold text-purple-700 dark:text-purple-300">85%</div>
                            <div className="text-gray-600 dark:text-gray-400">نسبة القراءة مع صورة</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-2 text-center">
                            <div className="font-bold text-purple-700 dark:text-purple-300">3-5</div>
                            <div className="text-gray-600 dark:text-gray-400">كلمات مفتاحية مثالية</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
