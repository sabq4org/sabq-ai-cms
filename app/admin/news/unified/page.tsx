"use client";

import FeaturedImageUpload from "@/components/FeaturedImageUpload";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Send,
  Sparkles,
  Star,
  Tag,
  User,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

// تحميل المحرر بشكل ديناميكي
const Editor = dynamic(() => import("@/components/Editor/Editor"), {
  ssr: false,
});

interface Category {
  id: string;
  name: string;
  name_ar?: string;
  slug: string;
  color?: string;
}

interface Reporter {
  id: string;
  name: string;
  email?: string;
  avatar?: string | null;
  role?: string;
  title?: string;
  slug?: string;
  is_verified?: boolean;
  verification_badge?: string | null;
}

export default function ManusNewsCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editorRef = useRef<any>(null);
  const [openMediaPicker, setOpenMediaPicker] = useState(false);

  // الحصول على معرف المقال من URL
  const articleId = searchParams.get("id");
  const isEditMode = !!articleId;

  // حالات التحميل
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);

  // حالة رسائل النجاح والخطأ
  const [message, setMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  // تتبع اكتمال المقال
  const [completionScore, setCompletionScore] = useState(0);

  // تتبع الحقول المولدة حديثاً لإظهار مؤشرات بصرية
  const [recentlyGenerated, setRecentlyGenerated] = useState<{
    title: boolean;
    excerpt: boolean;
    keywords: boolean;
    seo: boolean;
  }>({
    title: false,
    excerpt: false,
    keywords: false,
    seo: false,
  });

  // حالة النموذج
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    excerpt: "",
    content: "",
    authorId: "",
    categoryId: "",
    type: "local" as "local" | "external",
    featuredImage: "",
    featuredImageCaption: "",
    gallery: [] as string[],
    externalLink: "",
    keywords: [] as string[],
    seoTitle: "",
    seoDescription: "",
    publishType: "now" as "now" | "scheduled",
    scheduledDate: "",
    isBreaking: false,
    isFeatured: false,
    status: "draft" as "draft" | "published",
  });

  // حساب نسبة الاكتمال
  const calculateCompletion = useCallback(() => {
    let score = 0;
    const checks = [
      { field: formData.title, weight: 20 },
      { field: formData.excerpt, weight: 15 },
      { field: formData.content, weight: 25 },
      { field: formData.authorId, weight: 10 },
      { field: formData.categoryId, weight: 10 },
      { field: formData.featuredImage, weight: 10 },
      { field: formData.keywords.length > 0, weight: 5 },
      { field: formData.seoTitle, weight: 5 },
    ];

    checks.forEach((check) => {
      if (check.field) {
        score += check.weight;
      }
    });

    setCompletionScore(Math.min(score, 100));
  }, [formData]);

  // تحديث نسبة الاكتمال عند تغيير البيانات
  useEffect(() => {
    calculateCompletion();
  }, [calculateCompletion]);

  // تتبع تغييرات المحتوى
  const handleContentChange = useCallback((newContent: string) => {
    setFormData((prev) => ({ ...prev, content: newContent }));
  }, []);

  // دالة اقتراح فردية
  const suggestWithAI = async (field: "title" | "excerpt") => {
    try {
      setIsAILoading(true);
      
      let endpoint = "/api/ai/editor";
      let requestBody: any = {};

      switch (field) {
        case "title":
          requestBody = {
            service: "generate_title",
            content: formData.content || formData.excerpt || "",
            context: {
              excerpt: formData.excerpt,
              category: categories.find((c) => c.id === formData.categoryId)?.name,
            },
          };
          break;

        case "excerpt":
          requestBody = {
            service: "summarize",
            content: formData.content || "",
            context: {
              title: formData.title,
              targetLength: "100-140",
            },
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        const generatedText = result.result || result.text || "";
        
        if (generatedText) {
          setFormData((prev) => ({
        ...prev,
            [field]: generatedText,
          }));
          toast.success(`✨ تم توليد ${field === "title" ? "العنوان" : "الموجز"} بنجاح`);
        } else {
          toast.error("لم يتم توليد محتوى");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل في التوليد");
      }
    } catch (error) {
      console.error("❌ خطأ في الذكاء الاصطناعي:", error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ في الذكاء الاصطناعي");
    } finally {
      setIsAILoading(false);
    }
  };

  // دالة التوليد التلقائي الشامل
  const generateFromContent = async () => {
    try {
      setIsAILoading(true);
      
      // الحصول على المحتوى من المحرر مع تحقق متقدم
      let contentText = "";
      
      console.log("🔍 فحص المحرر:", {
        editorExists: !!editorRef.current,
        editorMethods: editorRef.current ? Object.keys(editorRef.current) : [],
        formDataContent: (formData.content && typeof formData.content === 'string') 
          ? formData.content.substring(0, 100) 
          : (formData.content ? "محتوى غير نصي" : "فارغ")
      });

      // طرق متعددة للحصول على المحتوى
      if (editorRef.current) {
        if (editorRef.current.getHTML) {
          contentText = editorRef.current.getHTML() || "";
          console.log("✅ استخدام getHTML:", contentText.length);
        } else if (editorRef.current.editor?.getHTML) {
          contentText = editorRef.current.editor.getHTML() || "";
          console.log("✅ استخدام editor.getHTML:", contentText.length);
        } else if (editorRef.current.editor?.getText) {
          contentText = editorRef.current.editor.getText() || "";
          console.log("✅ استخدام editor.getText:", contentText.length);
        }
      }
      
      // fallback للمحتوى المحفوظ
      if (!contentText && formData.content && typeof formData.content === 'string') {
        contentText = formData.content;
        console.log("✅ استخدام formData.content:", contentText.length);
      }

      // تنظيف HTML للحصول على النص الخام
      let cleanText = "";
      if (contentText && typeof contentText === 'string') {
        cleanText = contentText
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]*>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/&[a-z]+;/gi, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
      
      // إذا لم نحصل على محتوى كافٍ، جرب النص المباشر من editorRef
      if (cleanText.length < 50 && editorRef.current?.editor?.getText) {
        cleanText = editorRef.current.editor.getText() || cleanText;
        console.log("📝 استخدام getText مباشرة:", cleanText.length);
      }

      console.log("📝 المحتوى النهائي:", {
        originalLength: contentText ? contentText.length : 0,
        cleanedLength: cleanText ? cleanText.length : 0,
        preview: cleanText && cleanText.length > 0 ? cleanText.substring(0, 100) : "فارغ",
        fullText: cleanText && cleanText.length > 0 ? cleanText.substring(0, 500) : "لا يوجد محتوى"
      });

      if (cleanText.length < 50) {
        toast.error(
          `المحتوى قصير جداً للتوليد!\n• الحد الأدنى: 50 حرف\n• الحالي: ${cleanText.length} حرف\n• اكتب محتوى أكثر في المحرر`,
          { duration: 6000 }
        );
        setIsAILoading(false);
        return;
      }

      toast.success("🤖 بدء التوليد الشامل...");

      // المحاولة الأولى: استخدام API الذكي الموحد للحصول على مخرجات كاملة
      try {
        const categoryName = categories.find((c) => c.id === formData.categoryId)?.name_ar ||
          categories.find((c) => c.id === formData.categoryId)?.name || "";

        const smartRes = await fetch("/api/ai/smart-editor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title_hint: formData.title || "",
            raw_content: cleanText,
            category: categoryName,
            entities: [],
            published_at: new Date().toISOString(),
          }),
        });

        if (smartRes.ok) {
          const smartData = await smartRes.json();
          console.log("🔍 استجابة smart-editor:", smartData);
          
          const variant = Array.isArray(smartData.variants) && smartData.variants.length > 0
            ? smartData.variants[0]
            : null;

                    if (variant) {
            console.log("✅ variant موجود:", variant);
            
            // نسخة مصغرة من الموجز للعرض (400 حرف)
            const displayExcerpt = variant.smart_summary 
              ? String(variant.smart_summary).slice(0, 400).trim() + (variant.smart_summary.length > 400 ? "..." : "") 
              : "";
              
            setFormData((prev) => ({
              ...prev,
              title: variant.title || prev.title,
              subtitle: variant.subtitle || prev.subtitle,
              // قصّ الموجز إلى 400 حرف لتحديث الحقل دائماً بشكل مناسب للعرض
              excerpt: displayExcerpt || prev.excerpt,
              // دمج الكلمات والوسوم إن توفرت
              keywords: [
                ...new Set([
                  ...prev.keywords,
                  ...(Array.isArray(variant.keywords) ? variant.keywords : []),
                  ...(Array.isArray(variant.tags) ? variant.tags : []),
                ]),
              ],
              seoTitle: variant.seo_title || prev.seoTitle || variant.title || prev.title,
              seoDescription: variant.meta_description ? String(variant.meta_description).slice(0, 160).trim() : (prev.seoDescription || (variant.smart_summary ? String(variant.smart_summary).slice(0, 160).trim() : prev.seoDescription)),
            }));

            setRecentlyGenerated({
              title: !!variant.title,
              excerpt: !!variant.smart_summary,
              keywords: (Array.isArray(variant.keywords) && variant.keywords.length > 0) || (Array.isArray(variant.tags) && variant.tags.length > 0),
              seo: !!(variant.seo_title || variant.meta_description),
            });

            toast.success(
              "🎉 تم التوليد التلقائي بنجاح!\n\n📝 العنوان الرئيسي\n📄 الموجز الذكي\n🏷️ الكلمات المفتاحية\n🔍 عناصر SEO\n\n✅ تحقق من الحقول أعلاه لرؤية النتائج",
              { duration: 6000 }
            );

            // إزالة المؤشرات بعد 5 ثوان
            setTimeout(() => {
              setRecentlyGenerated({ title: false, excerpt: false, keywords: false, seo: false });
            }, 5000);

            setIsAILoading(false);
            return; // لا نكمل لباقي المحاولات إذا نجح الذكي الموحد
          }
        } else {
          console.warn("smart-editor API returned status:", smartRes.status);
        }
      } catch (e) {
        console.warn("محاولة smart-editor فشلت، الانتقال لبدائل:", e);
      }

            // طلبات متوازية مع APIs متعددة للضمان
      const [titleResponse, excerptResponse, keywordsResponse] = await Promise.allSettled([
        // توليد العنوان - جرب APIs متعددة
        (async () => {
          // المحاولة الأولى: /api/ai/editor
          try {
            const response = await fetch("/api/ai/editor", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                service: "generate_title",
                content: cleanText.substring(0, 300),
                context: { autoGenerated: true }
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log("📝 استجابة ai/editor للعنوان:", data);
              if (data.success && data.result && !data.mock) {
                return { ok: true, json: async () => data };
              }
            }
          } catch (e) {
            console.warn("محاولة ai/editor فشلت للعنوان:", e);
          }

          // المحاولة الثانية: /api/ai/generate
          try {
            const response = await fetch("/api/ai/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "title",
                content: cleanText.substring(0, 300)
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log("📝 استجابة ai/generate للعنوان:", data);
              return { 
                ok: true, 
                json: async () => ({ result: data.suggestion }) 
              };
            }
          } catch (e) {
            console.warn("محاولة ai/generate فشلت للعنوان:", e);
          }

          return { ok: false };
        })(),

        // توليد الموجز - جرب APIs متعددة
        (async () => {
          // المحاولة الأولى: /api/ai/editor
          try {
            const response = await fetch("/api/ai/editor", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                service: "summarize",
                content: cleanText.substring(0, 500),
                context: { targetLength: "100-140", autoGenerated: true }
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log("📄 استجابة ai/editor للموجز:", data);
              if (data.success && data.result && !data.mock) {
                return { ok: true, json: async () => data };
              }
            }
          } catch (e) {
            console.warn("محاولة ai/editor فشلت للموجز:", e);
          }

          // المحاولة الثانية: /api/ai/generate
          try {
            const response = await fetch("/api/ai/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "excerpt",
                content: cleanText.substring(0, 500),
                title: formData.title
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log("📄 استجابة ai/generate للموجز:", data);
              return { 
                ok: true, 
                json: async () => ({ result: data.suggestion }) 
              };
            }
          } catch (e) {
            console.warn("محاولة ai/generate فشلت للموجز:", e);
          }

          return { ok: false };
        })(),

        // توليد الكلمات المفتاحية
            fetch("/api/ai/keywords", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: formData.title,
            content: cleanText.substring(0, 400),
                excerpt: formData.excerpt,
              }),
            }),
          ]);

            let generatedCount = 0;
      let generatedTitle = "";
      let generatedExcerpt = "";

            // إعادة تعيين المؤشرات البصرية
      setRecentlyGenerated({
        title: false,
        excerpt: false,
        keywords: false,
        seo: false,
      });

      // معالجة العنوان
        if (titleResponse.status === "fulfilled" && titleResponse.value.ok) {
        try {
          const titleData = await titleResponse.value.json();
          console.log("📝 استجابة العنوان:", titleData);
          if (titleData.result) {
            generatedTitle = titleData.result.trim();
            generatedCount++;
          }
        } catch (e) {
          console.warn("خطأ في معالجة العنوان:", e);
        }
      } else {
        console.log("❌ فشل توليد العنوان:", titleResponse);
      }

      // معالجة الموجز
      if (excerptResponse.status === "fulfilled" && excerptResponse.value.ok) {
        try {
          const excerptData = await excerptResponse.value.json();
          console.log("📄 استجابة الموجز:", excerptData);
          if (excerptData.result && excerptData.result.length <= 160) {
            generatedExcerpt = excerptData.result.trim();
            generatedCount++;
          }
        } catch (e) {
          console.warn("خطأ في معالجة الموجز:", e);
        }
      } else {
        console.log("❌ فشل توليد الموجز:", excerptResponse);
        }

        // معالجة الكلمات المفتاحية
      let generatedKeywords: string[] = [];
      if (keywordsResponse.status === "fulfilled" && keywordsResponse.value.ok) {
        try {
          const keywordsData = await keywordsResponse.value.json();
          console.log("🏷️ استجابة الكلمات المفتاحية:", keywordsData);
          if (keywordsData.keywords && Array.isArray(keywordsData.keywords)) {
            generatedKeywords = keywordsData.keywords.slice(0, 8);
            generatedCount++;
          }
        } catch (e) {
          console.warn("خطأ في معالجة الكلمات المفتاحية:", e);
        }
      } else {
        console.log("❌ فشل توليد الكلمات المفتاحية:", keywordsResponse);
        }

      // تطبيق جميع النتائج معاً في تحديث واحد
      if (generatedTitle || generatedExcerpt || generatedKeywords.length > 0) {
        setFormData((prev) => ({
          ...prev,
          ...(generatedTitle && { title: generatedTitle }),
          ...(generatedExcerpt && { excerpt: generatedExcerpt }),
          ...(generatedKeywords.length > 0 && { 
            keywords: [...new Set([...prev.keywords, ...generatedKeywords])]
          }),
          // إنشاء العنوان الفرعي من العنوان المولد
          ...(generatedTitle && { 
            subtitle: `${generatedTitle.substring(0, 60)}...`,
            seoTitle: generatedTitle
          }),
          // إنشاء وصف SEO من الموجز المولد
          ...(generatedExcerpt && { 
            seoDescription: generatedExcerpt
          }),
        }));

        // تطبيق المؤشرات البصرية
        setRecentlyGenerated({
          title: !!generatedTitle,
          excerpt: !!generatedExcerpt,
          keywords: generatedKeywords.length > 0,
          seo: !!(generatedTitle || generatedExcerpt),
        });
      }

      // تجميع رسالة مفصلة للمستخدم
      const generatedItems = [];
      if (generatedTitle) generatedItems.push("📝 العنوان الرئيسي");
      if (generatedExcerpt) generatedItems.push("📄 الموجز");
      if (keywordsResponse.status === "fulfilled") generatedItems.push("🏷️ الكلمات المفتاحية");
      if (generatedTitle || generatedExcerpt) generatedItems.push("🔍 عناصر SEO");

      if (generatedCount > 0) {
        toast.success(
          `🎉 تم التوليد التلقائي بنجاح!\n\n${generatedItems.join('\n')}\n\n✅ تحقق من الحقول أعلاه لرؤية النتائج`,
          { duration: 6000 }
        );
        
        // إزالة المؤشرات البصرية بعد 5 ثوان
        setTimeout(() => {
          setRecentlyGenerated({
            title: false,
            excerpt: false,
            keywords: false,
            seo: false,
          });
        }, 5000);
            } else {
        // Fallback محلي ذكي إذا فشلت جميع APIs
        console.log("🔄 تطبيق Fallback محلي ذكي...");
        
        // توليد عنوان ذكي محلياً
        const sentences = cleanText.split(/[.!؟\n]+/).filter(s => s.trim().length > 20);
        let localTitle = "";
        
        if (sentences.length > 0) {
          // أخذ أول جملة مفيدة وتحسينها
          const firstSentence = sentences[0].trim();
          // إزالة كلمات الربط من البداية
          localTitle = firstSentence
            .replace(/^(في|من|على|إلى|مع|عن|حول|ضد|بعد|قبل|أثناء|خلال)\s+/i, '')
            .substring(0, 70);
          
          // إضافة كلمات قوية إذا لم تكن موجودة
          if (!localTitle.includes('يكشف') && !localTitle.includes('يؤكد') && !localTitle.includes('يعلن')) {
            localTitle = `تقرير: ${localTitle}`;
          }
        } else {
          localTitle = "تقرير إخباري جديد";
        }

        // توليد موجز ذكي محلياً
        const paragraphs = cleanText.split(/\n+/).filter(p => p.trim().length > 30);
        let localExcerpt = "";
        
        if (paragraphs.length > 0) {
          // أخذ أفضل فقرة للموجز
          const bestParagraph = paragraphs[0].trim();
          localExcerpt = bestParagraph.substring(0, 130);
          
          // إضافة نقاط أساسية من باقي الفقرات
          if (paragraphs.length > 1) {
            const keyPoints = paragraphs.slice(1, 3).map(p => {
              const words = p.trim().split(' ');
              return words.slice(0, 8).join(' ');
            }).join(', ');
            
            if (localExcerpt.length + keyPoints.length < 150) {
              localExcerpt += `, ${keyPoints}`;
            }
          }
          
          localExcerpt += '...';
        } else {
          localExcerpt = cleanText.substring(0, 130) + '...';
        }

        // استخراج كلمات مفتاحية ذكية محلياً
        const words = cleanText
          .replace(/[^\u0600-\u06FF\s]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 3)
          .filter((w) => !['الذي', 'التي', 'التي', 'الذين', 'اللذان', 'اللتان', 'بحيث', 'حتى', 'كيف', 'متى', 'أين'].includes(w));
        
        const freq: Record<string, number> = {};
        words.forEach(w => freq[w] = (freq[w] || 0) + 1);
        
        const localKeywords = Object.entries(freq)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 8)
          .map(([word]) => word)
          .filter(word => word.length > 2);

        // توليد عنوان فرعي من المحتوى
        const secondSentence = sentences[1]?.trim().substring(0, 45) || "";
        const localSubtitle = secondSentence ? `${secondSentence}...` : `تفاصيل حول ${localTitle.substring(0, 30)}...`;

          setFormData((prev) => ({
            ...prev,
          title: localTitle,
          excerpt: localExcerpt,
          subtitle: localSubtitle,
          keywords: [...new Set([...prev.keywords, ...localKeywords])],
          seoTitle: localTitle,
          seoDescription: localExcerpt,
        }));

        setRecentlyGenerated({
          title: true,
          excerpt: true,
          keywords: true,
          seo: true,
        });

        toast.success(
          "✨ تم التوليد المحلي الذكي بنجاح!\n📝 العنوان الرئيسي\n📄 الموجز\n🏷️ الكلمات المفتاحية\n📋 العنوان الفرعي\n🔍 عناصر SEO", 
          { duration: 6000 }
        );
        
        setTimeout(() => {
          setRecentlyGenerated({
            title: false,
            excerpt: false,
            keywords: false,
            seo: false,
          });
        }, 5000);
      }

    } catch (error) {
      console.error("❌ خطأ في التوليد التلقائي:", error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ في التوليد التلقائي");
    } finally {
      setIsAILoading(false);
    }
  };

  // تحميل البيانات الأولية
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // تحميل التصنيفات والمراسلين
        const [categoriesResponse, reportersResponse] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/admin/article-authors?active_only=true"),
        ]);

        let defaultCategoryId = "";
        let defaultReporterId = "";

        // معالجة التصنيفات
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          const loadedCategories = categoriesData.categories || categoriesData || [];
          setCategories(loadedCategories);

          if (loadedCategories.length > 0) {
            defaultCategoryId = loadedCategories[0].id;
          }
        }

        // معالجة المؤلفين
        if (reportersResponse.ok) {
          const authorsData = await reportersResponse.json();

          if (authorsData.success && authorsData.authors) {
            const convertedReporters = authorsData.authors.map((author: any) => ({
              id: author.id,
              name: author.full_name || author.name,
              email: author.email || "",
              role: "reporter",
              avatar: author.avatar_url || author.avatar,
              title: author.title,
              slug: author.slug,
              is_verified: false,
              verification_badge: null,
            }));

            setReporters(convertedReporters);

            if (convertedReporters.length > 0) {
              defaultReporterId = convertedReporters[0].id;
            }
          }
        }

        // تعيين القيم الافتراضية
        if (defaultCategoryId || defaultReporterId) {
          setFormData((prev) => ({
              ...prev,
              ...(defaultCategoryId && { categoryId: defaultCategoryId }),
              ...(defaultReporterId && { authorId: defaultReporterId }),
          }));
        }

          } catch (error) {
        console.error("❌ خطأ في تحميل البيانات:", error);
        toast.error("فشل في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // حفظ المقال
  const handleSave = async (status: "draft" | "published" | "scheduled") => {
    try {
      setSaving(true);

      let editorContent = "";
      if (editorRef.current?.getHTML) {
        editorContent = editorRef.current.getHTML() || "";
      }

      if (!editorContent && formData.content) {
        editorContent = `<p>${formData.content}</p>`;
      }

      if (!formData.title || (!editorContent && !formData.content)) {
        toast.error("يرجى إدخال العنوان والمحتوى على الأقل");
        setSaving(false);
        return;
      }

      const articleData: any = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: editorContent,
        featured_image: formData.featuredImage || null,
        category_id: formData.categoryId,
        article_author_id: formData.authorId,
        status,
        featured: formData.isFeatured || false,
        breaking: formData.isBreaking || false,
        seo_title: formData.seoTitle || null,
        seo_description: formData.seoDescription || null,
        seo_keywords: formData.keywords.length > 0 ? formData.keywords.join(", ") : null,
        metadata: {
          subtitle: formData.subtitle || null,
          type: formData.type || "local",
          image_caption: formData.featuredImageCaption || null,
          keywords: formData.keywords,
          gallery: formData.gallery || [],
          external_link: formData.externalLink || null,
        },
      };

      // دعم الجدولة: عند اختيار النشر المجدول نمرّر وقت الجدولة إلى الـ API
      if ((status === "scheduled" || formData.publishType === "scheduled")) {
        if (!formData.scheduledDate) {
          toast.error("يرجى تحديد التاريخ والوقت للجدولة أولاً");
          setSaving(false);
          return;
        }
        // يقرأ الـ API الحقول scheduled_for أو publish_at أو publishAt
        (articleData as any).scheduled_for = formData.scheduledDate;
        (articleData as any).publish_at = formData.scheduledDate;
      }

      if (!articleData.category_id) {
        toast.error("خطأ: يجب اختيار تصنيف للمقال");
        setSaving(false);
        return;
      }

        const url = isEditMode ? `/api/articles/${articleId}` : "/api/articles";
        const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
          method: method,
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify(articleData),
      });

      if (response?.ok) {
        setMessage({
          type: "success",
          text: isEditMode
            ? status === "draft"
              ? "💾 تم تحديث المسودة بنجاح"
              : "🎉 تم تحديث المقال بنجاح!"
            : status === "draft"
            ? "💾 تم حفظ المسودة بنجاح"
            : "🎉 تم نشر المقال بنجاح!",
        });

        toast.success(isEditMode ? "تم التحديث بنجاح!" : "تم الحفظ بنجاح!", {
          duration: 4000,
          style: {
            background: '#10B981',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
          },
        });

        setTimeout(() => {
          router.push("/admin/news");
        }, 1500);
      } else {
        throw new Error("فشل في الحفظ");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء الحفظ";
      
      setMessage({
        type: "error",
        text: errorMessage,
      });

      toast.error("❌ فشل في العملية", {
        duration: 6000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <link rel="stylesheet" href="/manus-ui.css" />
        <div style={{ 
          minHeight: '100vh',
          background: 'hsl(var(--bg))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', color: 'hsl(var(--fg))' }}>
            <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: 'hsl(var(--accent))' }} />
            <p style={{ marginTop: '16px', color: 'hsl(var(--muted))' }}>جاري تحميل البيانات...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      
      <div style={{ 
        background: 'hsl(var(--bg))', 
        minHeight: '100vh', 
        padding: '24px',
        color: 'hsl(var(--fg))'
      }}>
        {/* هيدر الصفحة */}
        <div className="card card-accent" style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 className="heading-2" style={{ margin: 0 }}>
                {isEditMode ? "تعديل الخبر" : "إنشاء خبر"}
              </h1>
              <p className="text-muted" style={{ margin: '8px 0 0 0' }}>
                أدخل تفاصيل الخبر، أضف الصورة والكلمات المفتاحية ثم انشر
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {/* شريط التقدم المحسن */}
              <div className="card" style={{ 
                width: '200px', 
                padding: '16px',
                background: completionScore >= 60 
                  ? 'hsl(var(--accent) / 0.05)' 
                  : 'hsl(46 91% 95%)', /* لون أصفر فاتح للتحذير */
                border: `1px solid ${completionScore >= 60 
                  ? 'hsl(var(--accent) / 0.2)' 
                  : 'hsl(46 91% 80%)'}`
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: completionScore >= 60 ? 'hsl(var(--accent))' : 'hsl(46 91% 40%)'
                  }}>
                    {completionScore}% مكتمل
                  </span>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: completionScore >= 60 ? 'hsl(var(--accent))' : '#f59e0b'
                    }}
                  />
                </div>
                
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    background: 'hsl(var(--line))',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '8px'
                  }}
                >
                  <div
                    style={{
                      width: `${completionScore}%`,
                      height: '100%',
                      background: completionScore >= 60 
                        ? 'linear-gradient(to right, hsl(var(--accent)), hsl(var(--accent-2)))' 
                        : 'linear-gradient(to right, #f59e0b, #f97316)',
                      transition: 'width 0.5s ease',
                      borderRadius: '3px'
                    }}
                  />
                </div>
                
                {completionScore < 60 && (
                  <p style={{
                    fontSize: '11px',
                    color: 'hsl(46 91% 40%)',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    يجب {60 - completionScore}% إضافية للنشر
                  </p>
                )}
                
                {completionScore >= 60 && (
                  <p style={{
                    fontSize: '11px',
                    color: 'hsl(var(--accent))',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    ✅ جاهز للنشر
                  </p>
                )}
              </div>

              {/* أزرار النشر */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleSave("draft")}
        disabled={saving}
                  className="btn"
                  style={{
                    background: 'hsl(var(--bg-card))',
                    border: '1px solid hsl(var(--line))'
                  }}
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            حفظ مسودة
          </>
        )}
                </button>

                <button
                  onClick={() => {
                    if (completionScore < 60) {
                      toast.error(`المقال غير مكتمل بما يكفي للنشر (${completionScore}%). يرجى إكمال البيانات المطلوبة.`);
                      return;
                    }
                    if (formData.publishType === "scheduled") {
                      if (!formData.scheduledDate) {
                        toast.error("يرجى تحديد التاريخ والوقت للجدولة أولاً");
                        return;
                      }
                      handleSave("scheduled");
                    } else {
                      handleSave("published");
                    }
                  }}
                  disabled={saving || loading}
                  className="btn btn-primary"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {formData.publishType === "scheduled" ? "جاري الجدولة..." : "جاري النشر..."}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {formData.publishType === "scheduled" ? "نشر مجدول" : "نشر فوري"}
                    </>
                  )}
                </button>
    </div>
        </div>
      </div>
            </div>

      {/* رسالة النجاح أو الخطأ */}
      {message.type && (
          <div 
            className="card"
            style={{
              marginBottom: '24px',
              background: message.type === "success" 
                ? 'hsl(120 60% 95%)' 
                : 'hsl(0 60% 95%)',
              border: `1px solid ${message.type === "success" ? 'hsl(120 60% 80%)' : 'hsl(0 60% 80%)'}`,
              padding: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {message.type === "success" ? (
                <CheckCircle className="h-5 w-5" style={{ color: 'hsl(120 60% 40%)' }} />
              ) : (
                <AlertCircle className="h-5 w-5" style={{ color: 'hsl(0 60% 40%)' }} />
              )}
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '500',
                color: message.type === "success" ? 'hsl(120 60% 30%)' : 'hsl(0 60% 30%)'
              }}>
            {message.text}
              </span>
            </div>
          </div>
      )}

      {/* المحتوى الرئيسي */}
        <div className="grid grid-3" style={{ gap: '32px', alignItems: 'start' }}>
          {/* العمود الرئيسي (67%) */}
          <div style={{ gridColumn: '1 / 3', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
          {/* العنوان والموجز */}
            <div className="card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                  <label className="label" htmlFor="title" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px' 
                  }}>
                  العنوان الرئيسي *
                    {recentlyGenerated.title && (
                      <span 
                        className="chip"
                        style={{
                          background: 'hsl(var(--accent) / 0.1)',
                          color: 'hsl(var(--accent))',
                          border: '1px solid hsl(var(--accent) / 0.2)',
                          fontSize: '10px',
                          padding: '2px 6px',
                          animation: 'pulse 2s infinite'
                        }}
                      >
                        ✨ مولد حديثاً
                      </span>
                    )}
                  </label>
                  <input
                  id="title"
                    type="text"
                  value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="أدخل عنوان الخبر..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: recentlyGenerated.title 
                        ? '2px solid hsl(var(--accent))' 
                        : '1px solid hsl(var(--line))',
                      borderRadius: '8px',
                      background: recentlyGenerated.title
                        ? 'hsl(var(--accent) / 0.03)'
                        : 'hsl(var(--bg-card))',
                      color: 'hsl(var(--fg))',
                      fontSize: '18px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  />
              </div>

              <div>
                  <label className="label" htmlFor="subtitle">
                  العنوان الفرعي
                  </label>
                  <input
                  id="subtitle"
                    type="text"
                  value={formData.subtitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="عنوان فرعي اختياري..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid hsl(var(--line))',
                      borderRadius: '8px',
                      background: 'hsl(var(--bg-card))',
                      color: 'hsl(var(--fg))'
                    }}
                />
              </div>

              <div>
                  <label className="label" htmlFor="excerpt" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px' 
                  }}>
                  موجز الخبر *
                    {recentlyGenerated.excerpt && (
                      <span 
                        className="chip"
                        style={{
                          background: 'hsl(var(--accent) / 0.1)',
                          color: 'hsl(var(--accent))',
                          border: '1px solid hsl(var(--accent) / 0.2)',
                          fontSize: '10px',
                          padding: '2px 6px',
                          animation: 'pulse 2s infinite'
                        }}
                      >
                        ✨ مولد حديثاً
                      </span>
                    )}
                  </label>
                  <textarea
                  id="excerpt"
                  value={formData.excerpt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="اكتب موجزاً مختصراً للخبر..."
                  rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: recentlyGenerated.excerpt 
                        ? '2px solid hsl(var(--accent))' 
                        : '1px solid hsl(var(--line))',
                      borderRadius: '8px',
                      background: recentlyGenerated.excerpt
                        ? 'hsl(var(--accent) / 0.03)'
                        : 'hsl(var(--bg-card))',
                      color: 'hsl(var(--fg))',
                      resize: 'vertical',
                      transition: 'all 0.3s ease'
                    }}
                  />
                    </div>
                      </div>
                    </div>

          {/* محرر المحتوى */}
             <div className="card">
               <div className="card-header">
                 <div className="card-title">
                <FileText className="w-5 h-5" />
                   محتوى الخبر *
                 </div>
                 
                 <button
                   onClick={generateFromContent}
                  disabled={isAILoading}
                   className="btn btn-sm"
                   style={{
                     background: 'linear-gradient(to right, hsl(var(--accent)), hsl(var(--accent-2)))',
                     color: 'white',
                     marginRight: 'auto'
                   }}
                >
                  {isAILoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      🤖 توليد تلقائي
                    </>
                  )}
                 </button>
               </div>
               
               {/* العبارة الإرشادية */}
               <div 
                 className="card"
                 style={{
                   background: 'linear-gradient(135deg, hsl(var(--accent) / 0.03), hsl(var(--accent-2) / 0.03))',
                   border: '1px solid hsl(var(--accent) / 0.15)',
                   padding: '16px',
                   margin: '0 0 16px 0',
                   borderRadius: '12px'
                 }}
               >
                 <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                   <div
                     style={{
                       width: '28px',
                       height: '28px',
                       borderRadius: '50%',
                       background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-2)))',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       flexShrink: 0
                     }}
                   >
                     <span style={{ fontSize: '14px' }}>💡</span>
                   </div>
                   <div style={{ flex: 1 }}>
                     <div style={{ 
                       fontSize: '13px', 
                       fontWeight: '600',
                       color: 'hsl(var(--accent))',
                       marginBottom: '4px'
                     }}>
                       نصيحة ذكية
                     </div>
                     <p style={{ 
                       fontSize: '12px', 
                       color: 'hsl(var(--fg))',
                       lineHeight: '1.5',
                       margin: 0
                     }}>
                       اكتب محتوى الخبر (50+ حرف) ثم اضغط 
                       <span style={{ 
                         background: 'hsl(var(--accent) / 0.1)',
                         padding: '2px 6px',
                         borderRadius: '4px',
                         fontWeight: '600',
                         color: 'hsl(var(--accent))',
                         margin: '0 4px'
                       }}>
                         🤖 توليد تلقائي
                       </span>
                       لإنشاء العنوان والموجز والكلمات المفتاحية تلقائياً
                     </p>
                   </div>
                 </div>
               </div>
               
               <div style={{
                 minHeight: '400px',
                 borderRadius: '8px',
                 background: 'hsl(var(--bg-card))',
                 border: '1px solid hsl(var(--line))'
               }}>
                <Editor
                  ref={editorRef}
                  content={formData.content}
                  onChange={handleContentChange}
                   placeholder="ابدأ بكتابة محتوى الخبر هنا... استخدم محرر النصوص الغني لتنسيق المحتوى"
                />
              </div>
               
               {/* نصائح وإرشادات الكتابة */}
               <div className="grid grid-2" style={{ gap: '16px', marginTop: '16px' }}>
                 
                 {/* نصائح الكتابة */}
                 <div 
                   className="card"
                   style={{
                     background: 'linear-gradient(135deg, hsl(120 60% 97%), hsl(120 60% 95%))',
                     border: '1px solid hsl(120 60% 85%)',
                     padding: '16px'
                   }}
                 >
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                     <div style={{
                       width: '24px',
                       height: '24px',
                       borderRadius: '50%',
                       background: 'linear-gradient(135deg, #10b981, #059669)',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center'
                     }}>
                       <span style={{ fontSize: '12px', color: 'white' }}>✍️</span>
                     </div>
                     <span style={{ fontSize: '13px', fontWeight: '600', color: '#065f46' }}>
                       نصائح الكتابة
                     </span>
        </div>

                   <ul style={{ 
                     fontSize: '12px', 
                     color: '#047857',
                     lineHeight: '1.6',
                     margin: 0,
                     paddingRight: '16px'
                   }}>
                     <li style={{ marginBottom: '6px' }}>ابدأ بمقدمة قوية تلخص الخبر</li>
                     <li style={{ marginBottom: '6px' }}>استخدم فقرات قصيرة (2-3 جمل)</li>
                     <li style={{ marginBottom: '6px' }}>أضف التفاصيل بالترتيب الزمني</li>
                     <li style={{ marginBottom: '6px' }}>اختتم بخلاصة أو توقعات</li>
                   </ul>
                 </div>

                 {/* نصائح SEO */}
                 <div 
                   className="card"
                   style={{
                     background: 'linear-gradient(135deg, hsl(var(--accent) / 0.03), hsl(var(--accent-2) / 0.03))',
                     border: '1px solid hsl(var(--accent) / 0.15)',
                     padding: '16px'
                   }}
                 >
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                     <div style={{
                       width: '24px',
                       height: '24px',
                       borderRadius: '50%',
                       background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-2)))',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center'
                     }}>
                       <span style={{ fontSize: '12px', color: 'white' }}>🔍</span>
                     </div>
                     <span style={{ fontSize: '13px', fontWeight: '600', color: 'hsl(var(--accent))' }}>
                       تحسين SEO
                     </span>
                   </div>
                   
                   <ul style={{ 
                     fontSize: '12px', 
                     color: 'hsl(var(--fg))',
                     lineHeight: '1.6',
                     margin: 0,
                     paddingRight: '16px'
                   }}>
                     <li style={{ marginBottom: '6px' }}>استخدم كلمات مفتاحية في العنوان</li>
                     <li style={{ marginBottom: '6px' }}>اكتب موجز واضح ومختصر</li>
                     <li style={{ marginBottom: '6px' }}>أضف صورة مميزة عالية الجودة</li>
                     <li style={{ marginBottom: '6px' }}>تأكد من اكتمال جميع الحقول</li>
                   </ul>
                 </div>

                 {/* إحصائيات سريعة */}
                 <div 
                   className="card"
                   style={{
                     background: 'linear-gradient(135deg, hsl(262 83% 97%), hsl(262 83% 95%))',
                     border: '1px solid hsl(262 83% 85%)',
                     padding: '16px'
                   }}
                 >
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                     <div style={{
                       width: '24px',
                       height: '24px',
                       borderRadius: '50%',
                       background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center'
                     }}>
                       <span style={{ fontSize: '12px', color: 'white' }}>📊</span>
                     </div>
                     <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b21a8' }}>
                       إحصائيات المحتوى
                     </span>
                   </div>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                       <span style={{ color: '#7c2d92' }}>العنوان:</span>
                       <span style={{ color: '#6b21a8', fontWeight: '500' }}>
                         {formData.title.length}/80 حرف
                       </span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                       <span style={{ color: '#7c2d92' }}>الموجز:</span>
                       <span style={{ color: '#6b21a8', fontWeight: '500' }}>
                         {formData.excerpt.length}/160 حرف
                       </span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                       <span style={{ color: '#7c2d92' }}>الكلمات المفتاحية:</span>
                       <span style={{ color: '#6b21a8', fontWeight: '500' }}>
                         {formData.keywords.length}/8 كلمات
                       </span>
                     </div>
                   </div>
                 </div>

                 {/* حالة المقال */}
                 <div 
                   className="card"
                   style={{
                     background: completionScore >= 60 
                       ? 'linear-gradient(135deg, hsl(120 60% 97%), hsl(120 60% 95%))'
                       : 'linear-gradient(135deg, hsl(46 91% 97%), hsl(46 91% 95%))',
                     border: completionScore >= 60
                       ? '1px solid hsl(120 60% 85%)'
                       : '1px solid hsl(46 91% 80%)',
                     padding: '16px'
                   }}
                 >
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                     <div style={{
                       width: '24px',
                       height: '24px',
                       borderRadius: '50%',
                       background: completionScore >= 60
                         ? 'linear-gradient(135deg, #10b981, #059669)'
                         : 'linear-gradient(135deg, #f59e0b, #f97316)',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center'
                     }}>
                       <span style={{ fontSize: '12px', color: 'white' }}>
                         {completionScore >= 60 ? '✅' : '⚠️'}
                       </span>
                     </div>
                     <span style={{ 
                       fontSize: '13px', 
                       fontWeight: '600', 
                       color: completionScore >= 60 ? '#065f46' : '#92400e'
                     }}>
                       حالة المقال
                     </span>
                   </div>
                   
                   <p style={{ 
                     fontSize: '12px', 
                     color: completionScore >= 60 ? '#047857' : '#a16207',
                     lineHeight: '1.5',
                     margin: 0
                   }}>
                     {completionScore >= 60 
                       ? "🎉 المقال جاهز للنشر! جميع العناصر الأساسية مكتملة."
                       : `⏳ يحتاج ${60 - completionScore}% إضافية. أكمل الحقول المطلوبة للنشر.`
                     }
                   </p>
                 </div>
               </div>
             </div>
        </div>

          {/* الشريط الجانبي (33%) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
          {/* نوع الخبر */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                <Zap className="w-4 h-4" />
                نوع الخبر
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${formData.isBreaking ? 'hsl(var(--accent))' : 'hsl(var(--line))'}`,
                  background: formData.isBreaking ? 'hsl(var(--accent) / 0.05)' : 'hsl(var(--bg-card))',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.isBreaking}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isBreaking: e.target.checked }))}
                    style={{ accentColor: 'hsl(var(--accent))' }}
                  />
                  <Zap className="w-5 h-5" style={{ color: formData.isBreaking ? 'hsl(var(--accent))' : 'hsl(var(--muted))' }} />
                  <span style={{ fontWeight: '500', color: formData.isBreaking ? 'hsl(var(--accent))' : 'hsl(var(--fg))' }}>عاجل</span>
                </label>

                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${formData.isFeatured ? '#f59e0b' : 'hsl(var(--line))'}`,
                  background: formData.isFeatured ? 'rgba(245, 158, 11, 0.05)' : 'hsl(var(--bg-card))',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                    style={{ accentColor: '#f59e0b' }}
                  />
                  <Star className="w-5 h-5" style={{ color: formData.isFeatured ? '#f59e0b' : 'hsl(var(--muted))' }} />
                  <span style={{ fontWeight: '500', color: formData.isFeatured ? '#f59e0b' : 'hsl(var(--fg))' }}>مميز</span>
                </label>
              </div>
            </div>

            {/* المراسل والتصنيف */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                <User className="w-4 h-4" />
                المراسل والتصنيف
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                  <label className="label" htmlFor="reporter">المراسل *</label>
                <select
                  id="reporter"
                  value={formData.authorId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, authorId: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid hsl(var(--line))',
                      borderRadius: '8px',
                      background: 'hsl(var(--bg-card))',
                      color: 'hsl(var(--fg))'
                    }}
                >
                  <option value="">اختر المراسل</option>
                    {reporters.map((reporter) => (
                      <option key={reporter.id} value={reporter.id}>
                        {reporter.name}
                        {reporter.title && ` - ${reporter.title}`}
                        {reporter.is_verified && " ✓ معتمد"}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                  <label className="label" htmlFor="category">التصنيف *</label>
                <select
                  id="category"
                  value={formData.categoryId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid hsl(var(--line))',
                      borderRadius: '8px',
                      background: 'hsl(var(--bg-card))',
                      color: 'hsl(var(--fg))'
                    }}
                >
                  <option value="">اختر التصنيف</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name_ar || category.name}
                      </option>
                    ))}
                </select>
              </div>
              </div>
            </div>

            {/* طريقة النشر */}
            <div className="card card-accent">
              <div className="card-header">
                <div className="card-title" style={{ color: 'hsl(var(--accent))' }}>
                  <Calendar className="w-4 h-4" />
                  طريقة النشر
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${formData.publishType === "now" ? '#10b981' : 'hsl(var(--line))'}`,
                  background: formData.publishType === "now" ? 'rgba(16, 185, 129, 0.05)' : 'hsl(var(--bg-card))',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="publish-type"
                    value="now"
                    checked={formData.publishType === "now"}
                    onChange={() => setFormData((prev) => ({ ...prev, publishType: "now" }))}
                    style={{ accentColor: '#10b981' }}
                  />
                  <Send className="w-5 h-5" style={{ color: formData.publishType === "now" ? '#10b981' : 'hsl(var(--muted))' }} />
                  <div>
                    <span style={{ fontWeight: '600' }}>نشر فوري</span>
                    <p style={{ fontSize: '12px', color: 'hsl(var(--muted))', margin: '2px 0 0 0' }}>نشر المقال فوراً</p>
                  </div>
                </label>

                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${formData.publishType === "scheduled" ? 'hsl(var(--accent))' : 'hsl(var(--line))'}`,
                  background: formData.publishType === "scheduled" ? 'hsl(var(--accent) / 0.05)' : 'hsl(var(--bg-card))',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="publish-type"
                    value="scheduled"
                    checked={formData.publishType === "scheduled"}
                    onChange={() => setFormData((prev) => ({ ...prev, publishType: "scheduled" }))}
                    style={{ accentColor: 'hsl(var(--accent))' }}
                  />
                  <Calendar className="w-5 h-5" style={{ color: formData.publishType === "scheduled" ? 'hsl(var(--accent))' : 'hsl(var(--muted))' }} />
                  <div>
                    <span style={{ fontWeight: '600' }}>نشر مجدول</span>
                    <p style={{ fontSize: '12px', color: 'hsl(var(--muted))', margin: '2px 0 0 0' }}>تحديد وقت النشر</p>
                  </div>
                </label>

                {formData.publishType === "scheduled" && (
                  <div style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: 'hsl(var(--bg) / 0.5)',
                    border: '1px solid hsl(var(--line))'
                  }}>
                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Clock className="w-4 h-4" style={{ color: 'hsl(var(--accent))' }} />
                      التاريخ والوقت
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                      min={new Date().toISOString().slice(0, 16)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid hsl(var(--line))',
                        borderRadius: '6px',
                        background: 'hsl(var(--bg-card))',
                        color: 'hsl(var(--fg))',
                        fontSize: '14px'
                      }}
                    />
                    {formData.scheduledDate && (
                      <p style={{ fontSize: '12px', color: 'hsl(var(--accent))', margin: '8px 0 0 0' }}>
                        سيتم النشر في: {new Date(formData.scheduledDate).toLocaleString("ar-SA")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

          {/* الصورة المميزة */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                <ImageIcon className="w-4 h-4" />
                الصورة المميزة
                </div>
              </div>
              
              <FeaturedImageUpload
                value={formData.featuredImage}
                onChange={(url) => setFormData((prev) => ({ ...prev, featuredImage: url }))}
                darkMode={false}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setOpenMediaPicker(true)}
                  style={{
                    background: 'hsl(var(--bg-card))',
                    border: '1px solid hsl(var(--line))',
                  }}
                >
                  <ImageIcon className="w-4 h-4" />
                  اختيار من مكتبة الصور
                </button>
                <span className="text-muted" style={{ fontSize: '12px' }}>أو ارفع صورة جديدة من الأعلى</span>
              </div>
            </div>

          {/* الكلمات المفتاحية */}
             <div className="card">
               <div className="card-header">
                 <div className="card-title">
                <Tag className="w-4 h-4" />
                الكلمات المفتاحية
                  </div>
                  </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div style={{ display: 'flex', gap: '8px' }}>
                   <input
                    placeholder="أضف كلمة مفتاحية"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        const target = e.target as HTMLInputElement;
                        const keyword = target.value.trim();
                        if (keyword && !formData.keywords.includes(keyword)) {
                          setFormData((prev) => ({
                            ...prev,
                            keywords: [...prev.keywords, keyword],
                          }));
                          target.value = "";
                        }
                      }
                    }}
                     style={{
                       flex: 1,
                       padding: '10px',
                       border: '1px solid hsl(var(--line))',
                       borderRadius: '6px',
                       background: 'hsl(var(--bg-card))',
                       color: 'hsl(var(--fg))'
                     }}
                   />
                   <button 
                     className="btn btn-sm"
                     style={{ padding: '10px 12px' }}
                  >
                    <Plus className="w-4 h-4" />
                   </button>
                </div>

                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                   {formData.keywords.map((keyword, index) => (
                     <div
                        key={index}
                       className="chip"
                       style={{
                         display: 'flex',
                         alignItems: 'center',
                         gap: '6px',
                         background: 'hsl(var(--bg-elevated))',
                         border: '1px solid hsl(var(--line))'
                       }}
                      >
                        {keyword}
                        <X
                         className="w-3 h-3 cursor-pointer"
                         style={{ color: 'hsl(var(--muted))' }}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                             keywords: prev.keywords.filter((_, i) => i !== index),
                            }))
                          }
                        />
                     </div>
                    ))}
                </div>
              </div>
        </div>

                          {/* حقول SEO */}
             <div className="card" style={{
               border: recentlyGenerated.seo 
                 ? '2px solid hsl(var(--accent))' 
                 : '1px solid hsl(var(--line))',
               background: recentlyGenerated.seo
                 ? 'hsl(var(--accent) / 0.02)'
                 : 'hsl(var(--bg-card))',
               transition: 'all 0.3s ease'
             }}>
               <div className="card-header">
                 <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Sparkles className="w-4 h-4" />
                   تحسين محركات البحث (SEO)
                   {recentlyGenerated.seo && (
                     <span 
                       className="chip"
                       style={{
                         background: 'hsl(var(--accent) / 0.1)',
                         color: 'hsl(var(--accent))',
                         border: '1px solid hsl(var(--accent) / 0.2)',
                         fontSize: '10px',
                         padding: '2px 6px',
                         animation: 'pulse 2s infinite'
                       }}
                     >
                       ✨ محدث تلقائياً
                     </span>
                   )}
                 </div>
                 <div className="text-xs text-muted">يتم تحديثها تلقائياً عند التوليد</div>
      </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div>
                   <label className="label" htmlFor="seoTitle">عنوان SEO</label>
                   <input
                     id="seoTitle"
                     type="text"
                     value={formData.seoTitle}
                     onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))}
                     placeholder="سيتم توليده تلقائياً..."
                     style={{
                       width: '100%',
                       padding: '10px',
                       border: '1px solid hsl(var(--line))',
                       borderRadius: '6px',
                       background: 'hsl(var(--bg-card))',
                       color: 'hsl(var(--fg))',
                       fontSize: '13px'
                     }}
                   />
                 </div>

                 <div>
                   <label className="label" htmlFor="seoDescription">وصف SEO</label>
                   <textarea
                     id="seoDescription"
                     value={formData.seoDescription}
                     onChange={(e) => setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))}
                     placeholder="سيتم توليده تلقائياً من الموجز..."
                     rows={2}
                     style={{
                       width: '100%',
                       padding: '10px',
                       border: '1px solid hsl(var(--line))',
                       borderRadius: '6px',
                       background: 'hsl(var(--bg-card))',
                       color: 'hsl(var(--fg))',
                       fontSize: '13px',
                       resize: 'vertical'
                     }}
                   />
                 </div>
               </div>
             </div>
      </div>
        </div>
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'hsl(var(--bg-card))',
            color: 'hsl(var(--fg))',
            border: '1px solid hsl(var(--line))'
          },
        }}
      />
      <MediaPickerModal
        open={openMediaPicker}
        onClose={() => setOpenMediaPicker(false)}
        onSelect={(asset: any) => {
          setFormData((prev) => ({
            ...prev,
            featuredImage: asset.cloudinaryUrl,
            featuredImageCaption: asset.altText || (asset.metadata?.altText || prev.featuredImageCaption),
          }));
          setOpenMediaPicker(false);
        }}
        title="اختر صورة من مكتبة الوسائط"
        acceptedTypes={["image/"]}
      />
    </>
  );
}
