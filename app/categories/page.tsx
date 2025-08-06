"use client";

import Footer from "@/components/Footer";
import SafeImage from "@/components/ui/SafeImage";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Building2,
  Code,
  Globe,
  Grid3X3,
  Heart,
  Layers,
  Leaf,
  List,
  Loader2,
  Palette,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Category {
  id: string | number;
  name: string;
  name_ar?: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  cover_image?: string;
  articles_count?: number;
  is_active: boolean;
  metadata?: {
    name_ar?: string;
    name_en?: string;
    cover_image?: string;
    icon?: string;
    color_hex?: string;
    [key: string]: any;
  };
}

// بيانات التصنيفات مع الألوان والأيقونات
const categoryData = {
  تقنية: {
    icon: Code,
    color: "purple",
    bgColor: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    lightBg: "bg-purple-50",
    darkBg: "dark:bg-purple-900/20",
    image:
      "https://images.unsplash.com/photo-1518776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80",
  },
  رياضة: {
    icon: Trophy,
    color: "blue",
    bgColor: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    lightBg: "bg-blue-50",
    darkBg: "dark:bg-blue-900/20",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
  },
  اقتصاد: {
    icon: TrendingUp,
    color: "green",
    bgColor: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    lightBg: "bg-green-50",
    darkBg: "dark:bg-green-900/20",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
  },
  سياسة: {
    icon: Building2,
    color: "red",
    bgColor: "bg-red-500",
    hoverColor: "hover:bg-red-600",
    lightBg: "bg-red-50",
    darkBg: "dark:bg-red-900/20",
    image:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80",
  },
  ثقافة: {
    icon: Palette,
    color: "yellow",
    bgColor: "bg-yellow-500",
    hoverColor: "hover:bg-yellow-600",
    lightBg: "bg-yellow-50",
    darkBg: "dark:bg-yellow-900/20",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  },
  صحة: {
    icon: Heart,
    color: "pink",
    bgColor: "bg-pink-500",
    hoverColor: "hover:bg-pink-600",
    lightBg: "bg-pink-50",
    darkBg: "dark:bg-pink-900/20",
    image:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
  },
  محلي: {
    icon: Users,
    color: "indigo",
    bgColor: "bg-indigo-500",
    hoverColor: "hover:bg-indigo-600",
    lightBg: "bg-indigo-50",
    darkBg: "dark:bg-indigo-900/20",
    image:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80",
  },
  دولي: {
    icon: Globe,
    color: "cyan",
    bgColor: "bg-cyan-500",
    hoverColor: "hover:bg-cyan-600",
    lightBg: "bg-cyan-50",
    darkBg: "dark:bg-cyan-900/20",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  },
  منوعات: {
    icon: Activity,
    color: "orange",
    bgColor: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    lightBg: "bg-orange-50",
    darkBg: "dark:bg-orange-900/20",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
  },
  بيئة: {
    icon: Leaf,
    color: "teal",
    bgColor: "bg-teal-500",
    hoverColor: "hover:bg-teal-600",
    lightBg: "bg-teal-50",
    darkBg: "dark:bg-teal-900/20",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
  },
  تعليم: {
    icon: BookOpen,
    color: "emerald",
    bgColor: "bg-emerald-500",
    hoverColor: "hover:bg-emerald-600",
    lightBg: "bg-emerald-50",
    darkBg: "dark:bg-emerald-900/20",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  },
  فنون: {
    icon: Palette,
    color: "rose",
    bgColor: "bg-rose-500",
    hoverColor: "hover:bg-rose-600",
    lightBg: "bg-rose-50",
    darkBg: "dark:bg-rose-900/20",
    image:
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8a?auto=format&fit=crop&w=800&q=80",
  },
  سفر: {
    icon: Globe,
    color: "sky",
    bgColor: "bg-sky-500",
    hoverColor: "hover:bg-sky-600",
    lightBg: "bg-sky-50",
    darkBg: "dark:bg-sky-900/20",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
  },
  علوم: {
    icon: Code,
    color: "violet",
    bgColor: "bg-violet-500",
    hoverColor: "hover:bg-violet-600",
    lightBg: "bg-violet-50",
    darkBg: "dark:bg-violet-900/20",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
  },
  تكنولوجيا: {
    icon: Code,
    color: "purple",
    bgColor: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    lightBg: "bg-purple-50",
    darkBg: "dark:bg-purple-900/20",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=800&q=80",
  },
  أخبار: {
    icon: Activity,
    color: "blue",
    bgColor: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    lightBg: "bg-blue-50",
    darkBg: "dark:bg-blue-900/20",
    image:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
  },
  ميديا: {
    icon: Sparkles,
    color: "yellow",
    bgColor: "bg-yellow-500",
    hoverColor: "hover:bg-yellow-600",
    lightBg: "bg-yellow-50",
    darkBg: "dark:bg-yellow-900/20",
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80",
  },
  محليات: {
    icon: Users,
    color: "indigo",
    bgColor: "bg-indigo-500",
    hoverColor: "hover:bg-indigo-600",
    lightBg: "bg-indigo-50",
    darkBg: "dark:bg-indigo-900/20",
    image:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80",
  },
  العالم: {
    icon: Globe,
    color: "cyan",
    bgColor: "bg-cyan-500",
    hoverColor: "hover:bg-cyan-600",
    lightBg: "bg-cyan-50",
    darkBg: "dark:bg-cyan-900/20",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  },
  حياتنا: {
    icon: Heart,
    color: "pink",
    bgColor: "bg-pink-500",
    hoverColor: "hover:bg-pink-600",
    lightBg: "bg-pink-50",
    darkBg: "dark:bg-pink-900/20",
    image:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
  },
  محطات: {
    icon: Activity,
    color: "orange",
    bgColor: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    lightBg: "bg-orange-50",
    darkBg: "dark:bg-orange-900/20",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
  },
  سياحة: {
    icon: Globe,
    color: "sky",
    bgColor: "bg-sky-500",
    hoverColor: "hover:bg-sky-600",
    lightBg: "bg-sky-50",
    darkBg: "dark:bg-sky-900/20",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
  },
  أعمال: {
    icon: TrendingUp,
    color: "green",
    bgColor: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    lightBg: "bg-green-50",
    darkBg: "dark:bg-green-900/20",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
  },
  سيارات: {
    icon: Activity,
    color: "blue",
    bgColor: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    lightBg: "bg-blue-50",
    darkBg: "dark:bg-blue-900/20",
    image:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80",
  },
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "articles">("articles");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log("🔄 بدء جلب التصنيفات من الصفحة...");
      setLoading(true);
      setError(null);

      const response = await fetch("/api/categories", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      });

      console.log("📄 استجابة API:", {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("📊 بيانات مستلمة:", data);

      // التحقق من تنسيق البيانات - إما array مباشر أو كائن يحتوي على categories
      let categoriesArray;
      if (Array.isArray(data)) {
        // البيانات مُرجعة مباشرة كـ array
        categoriesArray = data;
      } else if (data.success && Array.isArray(data.categories)) {
        // البيانات مُلفة في كائن
        categoriesArray = data.categories;
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("تنسيق البيانات غير صحيح");
      }

      // إضافة name_ar للبيانات مع تشخيص مفصل
      console.log("📋 البيانات الخام من API:", categoriesArray);

      const processedCategories = categoriesArray.map((cat: any) => ({
        ...cat,
        name_ar: cat.name, // استخدام name كـ name_ar
      }));

      console.log("🔧 البيانات بعد المعالجة:", processedCategories);

      setCategories(processedCategories);
      console.log("✅ تم تحميل", processedCategories.length, "تصنيف");
      console.log("🎯 تم حفظ categories في state:", processedCategories);
    } catch (error: any) {
      console.error("❌ خطأ في جلب التصنيفات:", error);
      setError(error.message || "فشل في تحميل التصنيفات");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = React.useMemo(() => {
    // التحقق من وجود البيانات أولاً مع تشخيص مفصل
    console.log("🔍 فحص categories:", {
      categories,
      isArray: Array.isArray(categories),
      length: categories?.length,
      type: typeof categories,
      firstItem: categories?.[0],
    });

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.log("❌ لا توجد تصنيفات للفلترة:", {
        categories,
        isArray: Array.isArray(categories),
        length: categories?.length,
      });
      return [];
    }

    console.log("✅ بدء فلترة التصنيفات:", {
      totalCategories: categories.length,
      searchTerm,
    });

    const filtered = categories
      .filter((category) => {
        // التحقق من وجود الكائن أولاً
        if (!category || typeof category !== "object") {
          console.warn("تصنيف غير صالح:", category);
          return false;
        }

        // الحصول على الاسم العربي من المكان المناسب
        let categoryNameAr = "";
        try {
          categoryNameAr =
            category.name_ar ||
            category.metadata?.name_ar ||
            category.name ||
            "";
        } catch (e) {
          return false;
        }

        if (!categoryNameAr) return false;

        // التحقق من أن categoryNameAr هو string قبل استخدام toLowerCase
        if (typeof categoryNameAr !== "string") {
          return false;
        }

        // التحقق من searchTerm أيضاً
        const searchValue = searchTerm || "";
        if (typeof searchValue !== "string") {
          return true; // إرجاع جميع التصنيفات إذا لم يكن هناك نص بحث صالح
        }

        try {
          return categoryNameAr
            .toLowerCase()
            .includes(searchValue.toLowerCase());
        } catch (e) {
          return false;
        }
      })
      .sort((a, b) => {
        try {
          if (sortBy === "name") {
            // الحصول على الأسماء من المكان المناسب
            const nameA = a?.name_ar || a?.metadata?.name_ar || a?.name || "";
            const nameB = b?.name_ar || b?.metadata?.name_ar || b?.name || "";
            return String(nameA).localeCompare(String(nameB));
          } else {
            return (b?.articles_count || 0) - (a?.articles_count || 0);
          }
        } catch (e) {
          return 0;
        }
      });

    return filtered;
  }, [categories, searchTerm, sortBy]);

  const getCategoryData = (name: string) => {
    // التأكد من وجود الاسم
    if (!name) {
      return {
        icon: Tag,
        color: "gray",
        bgColor: "bg-gray-500",
        hoverColor: "hover:bg-gray-600",
        lightBg: "bg-gray-50",
        darkBg: "dark:bg-gray-900/20",
        image:
          "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80",
      };
    }

    // البحث المباشر في البيانات المعرفة
    const directMatch = categoryData[name as keyof typeof categoryData];
    if (directMatch) return directMatch;

    // البحث الجزئي في الكلمات المفتاحية
    const keywords = {
      تقني: categoryData["تقنية"],
      تكنولوجي: categoryData["تكنولوجيا"],
      رياضي: categoryData["رياضة"],
      اقتصادي: categoryData["اقتصاد"],
      سياسي: categoryData["سياسة"],
      ثقافي: categoryData["ثقافة"],
      صحي: categoryData["صحة"],
      محلي: categoryData["محلي"] || categoryData["محليات"],
      دولي: categoryData["دولي"],
      عالم: categoryData["العالم"],
      منوع: categoryData["منوعات"],
      بيئي: categoryData["بيئة"],
      تعليمي: categoryData["تعليم"],
      فني: categoryData["فنون"],
      سفر: categoryData["سفر"],
      علمي: categoryData["علوم"],
      خبر: categoryData["أخبار"],
      ميديا: categoryData["ميديا"],
      إعلام: categoryData["ميديا"],
    };

    for (const [keyword, data] of Object.entries(keywords)) {
      if (name.includes(keyword)) return data;
    }

    // إرجاع بيانات افتراضية جذابة
    const defaultImages = [
      "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    ];

    const randomImage =
      defaultImages[Math.floor(Math.random() * defaultImages.length)];

    return {
      icon: Tag,
      color: "gray",
      bgColor: "bg-gray-500",
      hoverColor: "hover:bg-gray-600",
      lightBg: "bg-gray-50",
      darkBg: "dark:bg-gray-900/20",
      image: randomImage,
    };
  };

  const getCategoryImage = (category: Category) => {
    // البحث عن الصورة في metadata أولاً (من تحديث التصنيف)
    const coverImage =
      (category.metadata &&
      typeof category.metadata === "object" &&
      "cover_image" in category.metadata
        ? (category.metadata as any).cover_image
        : null) || category.cover_image;

    // استخدام خدمة تحسين الصور المتقدمة
    const getOptimizedImageUrl = (imageUrl: string) => {
      if (!imageUrl) return null;

      // تجاهل الصور من Amazon S3 خاصة المعقدة أو المكسورة
      if (
        imageUrl.includes("amazonaws.com") &&
        (imageUrl.includes("X-Amz-") ||
          imageUrl.includes("Expires=") ||
          imageUrl.length > 200)
      ) {
        console.warn("🚫 تم تجاهل رابط S3 معقد للتصنيف:", category.name);
        return null;
      }

      // تجاهل صورة تصنيف ميديا تحديداً (مؤقتاً حتى يتم إصلاحها)
      if (category.name === "ميديا" || category.slug === "media") {
        console.warn("🚫 تم تجاهل صورة ميديا مؤقتاً");
        return null;
      }

      // تحسين روابط Cloudinary
      if (imageUrl.includes("cloudinary.com")) {
        // إضافة تحسينات للأداء
        const optimizations = "q_auto,f_auto,dpr_auto,w_800,h_600,c_fill";
        if (imageUrl.includes("/upload/")) {
          return imageUrl.replace("/upload/", `/upload/${optimizations}/`);
        }
      }

      return imageUrl;
    };

    const optimizedImage = getOptimizedImageUrl(coverImage);
    if (optimizedImage) {
      return optimizedImage;
    }

    // الحصول على الاسم العربي من المكان المناسب
    const categoryNameAr =
      category.name_ar || category.metadata?.name_ar || category.name || "";
    const categoryData = getCategoryData(categoryNameAr);

    // استخدام صورة افتراضية آمنة بدلاً من unsplash
    if (!categoryData.image || categoryData.image.includes("unsplash.com")) {
      // استخدام UI Avatars كصورة افتراضية
      const bgColor = categoryData.bgColor
        .replace("bg-", "")
        .replace("-500", "");
      const colorMap: { [key: string]: string } = {
        blue: "0D8ABC",
        green: "00A86B",
        red: "DC2626",
        purple: "9333EA",
        yellow: "F59E0B",
        pink: "EC4899",
        indigo: "6366F1",
        cyan: "06B6D4",
        orange: "F97316",
        teal: "14B8A6",
        emerald: "10B981",
        rose: "F43F5E",
      };
      const hexColor = colorMap[bgColor] || "1E40AF";
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        categoryNameAr
      )}&background=${hexColor}&color=fff&size=800&font-size=0.33&rounded=false`;
    }

    return categoryData.image;
  };

  const totalArticles = categories.reduce(
    (acc, cat) => acc + (cat.articles_count || 0),
    0
  );

  // تشخيص حالة الـ state في كل render
  console.log("🖥️ RENDER - حالة State:", {
    loading,
    error,
    categoriesLength: categories?.length,
    filteredCategoriesLength: filteredCategories?.length,
    categories: categories?.slice(0, 2), // أول تصنيفين فقط
    filteredCategories: filteredCategories?.slice(0, 2),
  });

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl bg-indigo-200/30 dark:bg-indigo-900/20" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl bg-purple-200/30 dark:bg-purple-900/20" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-2xl">
                <Layers className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                الأقسام
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                استكشف محتوانا المنظم في تصنيفات متنوعة
              </p>

              {/* إحصائيات الأقسام - مثل صفحة الأخبار */}
              {!loading && categories.length > 0 && (
                <div className="mt-6 inline-flex flex-wrap justify-center items-center gap-4 md:gap-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-4 md:px-6 py-3 shadow-lg">
                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {categories.length}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      قسم
                    </div>
                  </div>

                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>

                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {totalArticles > 999
                          ? `${(totalArticles / 1000).toFixed(1)}k`
                          : totalArticles}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      مقال
                    </div>
                  </div>

                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>

                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {categories.filter((cat) => cat.is_active).length}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      نشط
                    </div>
                  </div>

                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>

                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round(totalArticles / categories.length)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      متوسط
                    </div>
                  </div>
                </div>
              )}

              {/* Loading indicator for stats */}
              {loading && (
                <div className="mt-6 inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">جاري تحميل الإحصائيات...</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Search & Controls Bar */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
              {/* Search Box */}
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث في الأقسام..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* Sort Options */}
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "name" | "articles")
                  }
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="articles">الأكثر مقالات</option>
                  <option value="name">الترتيب الأبجدي</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                    title="عرض شبكي"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "list"
                        ? "bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                    title="عرض قائمة"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Results Count */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {loading
                  ? "جاري التحميل..."
                  : filteredCategories.length > 0
                  ? searchTerm
                    ? `${filteredCategories.length} قسم مطابق للبحث`
                    : `${filteredCategories.length} قسم متاح`
                  : searchTerm
                  ? "لا توجد أقسام مطابقة"
                  : "لا توجد أقسام"}
              </span>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                جاري تحميل الأقسام...
              </p>
            </div>
          ) : filteredCategories.length === 0 ? (
            // Empty State
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
              <Layers className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                لا توجد أقسام
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "لا توجد أقسام تطابق البحث"
                  : "لا توجد أقسام متاحة حالياً"}
              </p>
            </div>
          ) : (
            <>
              {/* Categories Grid/List */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCategories.map((category) => {
                    const categoryName =
                      category.name_ar ||
                      category.metadata?.name_ar ||
                      category.name ||
                      "";
                    const categorySlug =
                      category.slug ||
                      (categoryName
                        ? String(categoryName)
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                        : "");
                    const data = getCategoryData(categoryName);
                    const Icon = data.icon;
                    const imageSrc = getCategoryImage(category);

                    return (
                      <Link
                        key={category.id}
                        href={`/categories/${categorySlug}`}
                        className="group"
                      >
                        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-64">
                          {/* Background Image */}
                          <div className="absolute inset-0">
                            <SafeImage
                              src={imageSrc || ""}
                              alt={categoryName}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              fallbackType="category"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                          </div>

                          {/* Content */}
                          <div className="relative p-6 h-full flex flex-col justify-end">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md">
                                {category.icon || category.metadata?.icon ? (
                                  <span className="text-xl">
                                    {category.icon || category.metadata?.icon}
                                  </span>
                                ) : (
                                  <Icon
                                    className={`w-5 h-5 ${data.bgColor.replace(
                                      "bg-",
                                      "text-"
                                    )}`}
                                  />
                                )}
                              </div>
                              <h3 className="text-xl font-bold text-white">
                                {categoryName}
                              </h3>
                            </div>

                            {(() => {
                              let desc = category.description;
                              if (desc && desc.startsWith("{")) {
                                try {
                                  const parsed = JSON.parse(desc);
                                  desc =
                                    parsed.ar || parsed.description || desc;
                                } catch (e) {}
                              }
                              return desc ? (
                                <p className="text-white/80 text-sm line-clamp-2 mb-3">
                                  {desc}
                                </p>
                              ) : null;
                            })()}

                            <div className="flex items-center gap-2 text-white/90">
                              <BookOpen className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {category.articles_count || 0} مقال
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                // List View
                <div className="space-y-4">
                  {filteredCategories.map((category) => {
                    const categoryName =
                      category.name_ar ||
                      category.metadata?.name_ar ||
                      category.name ||
                      "";
                    const categorySlug =
                      category.slug ||
                      categoryName.toLowerCase().replace(/\s+/g, "-");
                    const data = getCategoryData(categoryName);
                    const Icon = data.icon;

                    return (
                      <Link
                        key={category.id}
                        href={`/categories/${categorySlug}`}
                        className="block"
                      >
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                          <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div
                              className={`w-16 h-16 ${data.bgColor} rounded-xl flex items-center justify-center shadow-md`}
                            >
                              {category.icon || category.metadata?.icon ? (
                                <span className="text-2xl text-white">
                                  {category.icon || category.metadata?.icon}
                                </span>
                              ) : (
                                <Icon className="w-8 h-8 text-white" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                {categoryName}
                              </h3>
                              {(() => {
                                let desc = category.description;
                                if (desc && desc.startsWith("{")) {
                                  try {
                                    const parsed = JSON.parse(desc);
                                    desc =
                                      parsed.ar || parsed.description || desc;
                                  } catch (e) {}
                                }
                                return desc ? (
                                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                    {desc}
                                  </p>
                                ) : null;
                              })()}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {category.articles_count || 0}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  مقال
                                </div>
                              </div>
                              <ArrowLeft className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
