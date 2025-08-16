"use client";

import Footer from "@/components/Footer";
import LikedArticlesTab from "@/components/profile/LikedArticlesTab";
import ReadingInsights from "@/components/profile/ReadingInsights";
import SavedArticles from "@/components/profile/SavedArticles";
import SavedArticlesTab from "@/components/profile/SavedArticlesTab";
import {
  getMembershipLevel,
  getPointsToNextLevel,
  getProgressToNextLevel,
} from "@/lib/loyalty";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Bookmark,
  Brain,
  Calendar,
  Camera,
  ChevronDown,
  ChevronRight,
  Clock,
  Crown,
  Edit2,
  Eye,
  Heart,
  Lock,
  LogOut,
  MessageCircle,
  Share2,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
// المكونات الجديدة
interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  avatar?: string;
  gender?: string;
  city?: string;
  loyaltyLevel?: string;
  loyaltyPoints?: number;
  role?: string;
  status?: string;
  isVerified?: boolean;
  preferences?: any[];
  interests?: string[];
  categoryIds?: string[]; // إضافة دعم لـ categoryIds
}
interface LoyaltyData {
  total_points: number;
  level: string;
  next_level_points: number;
  recent_activities: Activity[];
}
interface Activity {
  id: string;
  action: string;
  points: number;
  created_at: string;
  description: string;
}
interface UserPreference {
  category_id: string; // تغيير من number إلى string ليتوافق مع IDs الحقيقية
  category_name: string;
  category_icon: string;
  category_color: string;
}
// الواجهات الجديدة للبيانات المتقدمة
interface UserInsights {
  readingProfile: {
    type: string;
    description: string;
    level: string;
  };
  categoryDistribution: {
    distribution: Array<{
      name: string;
      count: number;
      percentage: number;
      color?: string;
      icon?: string;
    }>;
    topCategory: string;
    diversity: number;
    recommendations: string[];
  };
  timePatterns: {
    bestTime: string;
    bestDay: string;
    hourlyDistribution: Record<number, number>;
    dailyDistribution: Record<string, number>;
  };
  stats: {
    totalArticlesRead: number;
    totalLikes: number;
    totalShares: number;
    totalSaves: number;
    totalComments: number;
    averageReadingTime: number;
    streakDays: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  }>;
  timeline: Array<{
    date: string;
    articlesCount: number;
    totalReadingTime: number;
    articles: Array<{
      time: string;
      title: string;
      category: string;
      readingTime: number;
    }>;
  }>;
  savedArticles: Array<{
    id: string;
    title: string;
    category?: string;
    savedAt: string;
  }>;
  unfinishedArticles: Array<{
    id: string;
    title: string;
    category?: string;
    readingTime: number;
    excerpt?: string;
  }>;
}
export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [userStats, setUserStats] = useState({
    articlesRead: 0,
    interactions: 0,
    shares: 0,
  });
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [userInsights, setUserInsights] = useState<UserInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "insights" | "achievements" | "timeline" | "likes" | "saved"
  >("overview");
  const [realStats, setRealStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  // منع تكرار الطلبات
  const fetchDataRef = useRef(false);
  const dataFetchedRef = useRef(false);
  const fetchingInterestsRef = useRef(false);
  const manualRefreshRef = useRef(false); // 🆕 للتمييز بين التحديث اليدوي والتلقائي
  const interestsLoadedImmediatelyRef = useRef(false); // 🆕 لتتبع تحميل الاهتمامات من fetchUserInterestsImmediately
  useEffect(() => {
    if (!fetchDataRef.current) {
      fetchDataRef.current = true;
      checkAuth();
    }
  }, []);

  // إضافة listener لتحديث الاهتمامات عند العودة للصفحة (أقل تكراراً)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        !document.hidden &&
        user &&
        !fetchingInterestsRef.current &&
        preferences.length === 0 &&
        !interestsLoadedImmediatelyRef.current
      ) {
        // فقط إذا لم تكن الاهتمامات محملة مسبقاً
        console.log("👁️ الصفحة أصبحت مرئية وأحتاج لتحديث الاهتمامات");
        fetchUserInterestsImmediately();
      } else if (interestsLoadedImmediatelyRef.current) {
        console.log("👁️ الاهتمامات محملة بالفعل، تجاهل إعادة التحميل");
      }
    };

    // إزالة handleFocus لتقليل التحديثات المتكررة
    // const handleFocus = () => {
    //   if (user && !fetchingInterestsRef.current) {
    //     console.log("🔄 تم التركيز على الصفحة - تحديث الاهتمامات");
    //     fetchUserInterestsImmediately();
    //   }
    // };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    // window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // window.removeEventListener("focus", handleFocus);
    };
  }, [user]);

  useEffect(() => {
    // تتبع الوضع المظلم
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    // مراقبة تغييرات الوضع المظلم
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // تتبع الوضع المظلم
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    // مراقبة تغييرات الوضع المظلم
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (user && !dataFetchedRef.current) {
      dataFetchedRef.current = true;
      // جلب الاهتمامات فوراً دون انتظار (مرة واحدة فقط)
      console.log("🚀 تحميل أولي للاهتمامات");
      fetchUserInterestsImmediately();
      // تأخير جلب باقي البيانات لتجنب التداخل مع الاهتمامات
      setTimeout(() => {
        fetchAllDataOptimized();
      }, 100);
    }
  }, [user]);

  // دالة مخصصة لجلب الاهتمامات فوراً
  const fetchUserInterestsImmediately = async () => {
    if (!user || fetchingInterestsRef.current) return;

    try {
      fetchingInterestsRef.current = true;
      console.log("🚀 جلب الاهتمامات فوراً للمستخدم:", user.id);

      // جلب الاهتمامات والتصنيفات بشكل متوازي
      const [interestsRes, categoriesRes] = await Promise.allSettled([
        fetch(`/api/user/interests?userId=${user.id}`),
        fetch("/api/categories"),
      ]);

      let userCategoryIds: string[] = [];
      let allCategories: any[] = [];

      // معالجة نتيجة الاهتمامات
      if (interestsRes.status === "fulfilled" && interestsRes.value.ok) {
        const interestsData = await interestsRes.value.json();
        console.log("📡 استجابة API الاهتمامات:", interestsData);

        if (interestsData.success) {
          // تجربة التنسيق الجديد أولاً
          if (
            interestsData.interests &&
            Array.isArray(interestsData.interests)
          ) {
            userCategoryIds = interestsData.interests.map((interest: any) =>
              String(interest.interestId)
            );
          }
          // تجربة التنسيق القديم كـ fallback
          else if (interestsData.data?.categoryIds) {
            userCategoryIds = interestsData.data.categoryIds.map((id: any) =>
              String(id)
            );
          }
          console.log("✅ تم جلب الاهتمامات من API:", userCategoryIds);
        }
      }

      // معالجة نتيجة التصنيفات
      if (categoriesRes.status === "fulfilled" && categoriesRes.value.ok) {
        const categoriesData = await categoriesRes.value.json();
        allCategories = categoriesData.data || categoriesData.categories || [];
      }

      // إذا لم نجد اهتمامات من API، نحاول من localStorage
      if (userCategoryIds.length === 0) {
        userCategoryIds = user.categoryIds || user.interests || [];
        console.log("📱 استخدام الاهتمامات من localStorage:", userCategoryIds);
      }

      // تحويل IDs إلى بيانات التصنيفات
      if (userCategoryIds.length > 0 && allCategories.length > 0) {
        const userCategories = allCategories
          .filter((cat: any) => userCategoryIds.includes(cat.id))
          .map((cat: any) => ({
            category_id: cat.id,
            category_name: cat.name || cat.name_ar,
            category_icon: cat.icon || "📌",
            category_color: cat.color || cat.color_hex || "#6B7280",
          }));

        console.log("🎯 تم عرض الاهتمامات فوراً:", userCategories);
        // حماية إضافية: فقط أحدث الاهتمامات إذا كانت البيانات صحيحة
        if (userCategories.length > 0) {
          setPreferences(userCategories);
          interestsLoadedImmediatelyRef.current = true; // 🆕 تحديد أن الاهتمامات تم تحميلها بنجاح
          console.log(
            "✅ تم تعيين interestsLoadedImmediatelyRef إلى true مع",
            userCategories.length,
            "اهتمام"
          );
        }
        // إشعار بسيط فقط عند الضغط على زر التحديث يدوياً
        if (manualRefreshRef.current) {
          toast.success(`تم تحديث ${userCategories.length} اهتمام! ✨`);
          manualRefreshRef.current = false; // 🆕 إعادة تعيين المتغير بعد الإشعار
        }
      } else if (userCategoryIds.length === 0) {
        console.log("❓ لم يتم العثور على اهتمامات للمستخدم");
        // لا نمسح الاهتمامات إذا كانت موجودة مسبقاً
        // setPreferences([]);
      } else if (userCategoryIds.length > 0 && allCategories.length === 0) {
        console.log(
          "⏳ الاهتمامات موجودة لكن التصنيفات لم تحمل بعد، انتظار..."
        );
        // لا نمسح الاهتمامات، ننتظر تحميل التصنيفات
      }
    } catch (error) {
      console.error("❌ خطأ في جلب الاهتمامات فوراً:", error);
      // fallback: استخدام البيانات من localStorage
      const userCategoryIds = user.categoryIds || user.interests || [];
      if (userCategoryIds.length > 0) {
        const fallbackPreferences = userCategoryIds.map((id: string) => ({
          category_id: id,
          category_name: "اهتمام محفوظ",
          category_icon: "📌",
          category_color: "#6B7280",
        }));
        setPreferences(fallbackPreferences);
      }
    } finally {
      fetchingInterestsRef.current = false;
    }
  };
  // دالة محسّنة لجلب جميع البيانات بشكل متوازي
  const fetchAllDataOptimized = async () => {
    if (!user) return;

    // تجنب التشغيل إذا كانت الاهتمامات محملة بالفعل
    if (interestsLoadedImmediatelyRef.current) {
      console.log("🛑 تجاهل fetchAllDataOptimized - الاهتمامات محملة بالفعل");
      return;
    }

    try {
      // جلب الإحصائيات الحقيقية
      setLoadingStats(true);
      const statsResponse = await fetch(`/api/user/stats?userId=${user.id}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setRealStats(statsData);

        // تحديث userStats بالبيانات الحقيقية
        setUserStats({
          articlesRead: statsData.articlesRead,
          interactions: statsData.likes + statsData.shares + statsData.saves,
          shares: statsData.shares,
        });
      }
      setLoadingStats(false);

      // دالة مساعدة لإنشاء timeout signal
      const createTimeoutSignal = (ms: number) => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), ms);
        return controller.signal;
      };
      // تنفيذ جميع الطلبات بشكل متوازي مع timeout
      const promises = [
        // نقاط الولاء - مع timeout 3 ثواني
        fetch(`/api/loyalty/points?userId=${user.id}`, {
          signal: createTimeoutSignal(3000),
        })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null),
        // التصنيفات - مطلوبة دائماً
        fetch("/api/categories")
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null),
        // الاهتمامات - للمستخدمين المسجلين فقط
        !user.id.startsWith("guest-")
          ? fetch(`/api/user/interests?userId=${user.id}`, {
              signal: createTimeoutSignal(3000),
            })
              .then((res) => (res.ok ? res.json() : null))
              .catch(() => null)
          : Promise.resolve(null),
        // التفاعلات - مع timeout
        fetch(`/api/interactions/user/${user.id}`, {
          signal: createTimeoutSignal(3000),
        })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null),
        // التحليلات - مع timeout أطول
        fetch(`/api/user/${user.id}/insights`, {
          signal: createTimeoutSignal(5000),
        })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null),
      ];
      const [
        loyaltyResult,
        categoriesResult,
        interestsResult,
        interactionsResult,
        insightsResult,
      ] = await Promise.allSettled(promises);
      // معالجة نقاط الولاء
      if (loyaltyResult.status === "fulfilled" && loyaltyResult.value) {
        setLoyaltyData(loyaltyResult.value);
      }
      // معالجة التصنيفات والاهتمامات
      const allCategories =
        categoriesResult.status === "fulfilled" && categoriesResult.value
          ? categoriesResult.value.categories || categoriesResult.value || []
          : [];
      // معالجة التفضيلات بطريقة موحدة
      // تجنب إعادة معالجة الاهتمامات إذا كانت محملة بالفعل من fetchUserInterestsImmediately
      console.log("🔍 فحص حالة الاهتمامات في fetchAllDataOptimized:", {
        interestsLoadedImmediately: interestsLoadedImmediatelyRef.current,
        preferencesLength: preferences.length,
        preferences: preferences,
      });

      if (interestsLoadedImmediatelyRef.current && preferences.length > 0) {
        console.log(
          "✅ الاهتمامات محملة بالفعل من fetchUserInterestsImmediately، تجاهل fetchAllDataOptimized",
          preferences
        );
      } else {
        let userCategoryIds: string[] = [];
        console.log("🔍 تحليل مصادر الاهتمامات:", {
          userId: user.id,
          interestsAPI:
            interestsResult.status === "fulfilled"
              ? interestsResult.value
              : null,
          userPreferences: user.preferences,
          userInterests: user.interests,
        });
        // 1. أولاً جرب من API الاهتمامات الجديد
        if (
          interestsResult.status === "fulfilled" &&
          interestsResult.value?.success &&
          interestsResult.value?.data?.categoryIds?.length > 0
        ) {
          const categoryIds = interestsResult.value.data.categoryIds;
          userCategoryIds = categoryIds.map((id: any) => String(id)); // تحويل إلى string للتوافق
          console.log("✅ تم جلب الاهتمامات من API الجديد:", userCategoryIds);

          // إذا كانت هناك بيانات تصنيفات جاهزة من API، استخدمها مباشرة
          if (
            interestsResult.value.data.categories &&
            Array.isArray(interestsResult.value.data.categories)
          ) {
            const userCategories = interestsResult.value.data.categories.map(
              (cat: any) => ({
                category_id: String(cat.id),
                category_name: cat.name_ar || cat.name,
                category_icon: cat.icon || "📌",
                category_color: cat.color_hex || cat.color || "#6B7280",
              })
            );
            console.log(
              "✅ تم استخدام بيانات التصنيفات الجاهزة من API:",
              userCategories
            );
            setPreferences(userCategories);
            return; // انتهى، لا نحتاج لمعالجة إضافية
          }
        }
        // 2. إذا لم نجد، جرب من localStorage preferences
        else if (user.preferences && user.preferences.length > 0) {
          userCategoryIds = user.preferences;
          console.log(
            "✅ تم جلب الاهتمامات من user.preferences:",
            userCategoryIds
          );
        }
        // 3. إذا لم نجد، جرب من interests في user object
        else if (user.interests && user.interests.length > 0) {
          userCategoryIds = user.interests;
          console.log(
            "✅ تم جلب الاهتمامات من user.interests:",
            userCategoryIds
          );
        }
        // تحويل IDs إلى بيانات التصنيفات
        if (userCategoryIds.length > 0 && allCategories.length > 0) {
          const userCategories = allCategories
            .filter((cat: any) => {
              // محاولة المطابقة بالـ ID أو الـ slug
              return (
                userCategoryIds.includes(cat.id) ||
                userCategoryIds.includes(cat.slug) ||
                userCategoryIds.includes(String(cat.id))
              );
            })
            .map((cat: any) => ({
              category_id: cat.id,
              category_name: cat.name || cat.name_ar,
              category_icon: cat.icon || "📌",
              category_color: cat.color || "#6B7280",
            }));
          console.log("✅ تم تحويل الاهتمامات إلى تصنيفات:", userCategories);
          setPreferences(userCategories);
        } else {
          console.log("❌ لم يتم العثور على اهتمامات للمستخدم");
          // لا نمسح الاهتمامات إذا كانت موجودة بالفعل - ربما تم تحميلها من fetchUserInterestsImmediately
          if (preferences.length === 0) {
            setPreferences([]);
          }
        }
      } // إغلاق شرط if (preferences.length > 0)

      // معالجة التفاعلات
      if (
        interactionsResult.status === "fulfilled" &&
        interactionsResult.value?.stats
      ) {
        setUserStats(interactionsResult.value.stats);
      } else {
        // قيم افتراضية
        setUserStats({
          articlesRead: 5,
          interactions: 12,
          shares: 3,
        });
      }
      // معالجة التحليلات
      if (
        insightsResult.status === "fulfilled" &&
        insightsResult.value?.success
      ) {
        setUserInsights(insightsResult.value.data);
      }
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
    }
  };
  const checkAuth = async () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const localUser = JSON.parse(userData);
    // جلب البيانات المحدثة من API
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          // دمج البيانات المحدثة مع البيانات المحلية
          const updatedUser = {
            ...localUser,
            ...data.user,
            interests: data.user.interests || [],
          };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } else {
          setUser(localUser);
        }
      } else {
        setUser(localUser);
      }
    } catch (error) {
      console.error("Error fetching updated user data:", error);
      setUser(localUser);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("تم تسجيل الخروج بنجاح");
    router.push("/"); // العودة للصفحة الرئيسية بدلاً من صفحة تسجيل الدخول
  };
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      calendar: "gregory",
      numberingSystem: "latn",
    });
  };
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    // التحقق من نوع الملف
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("يرجى اختيار ملف صورة صالح (PNG أو JPG)");
      return;
    }
    // التحقق من حجم الملف (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 2 ميجابايت");
      return;
    }
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");
      formData.append("userId", user.id);
      console.log("📤 رفع الصورة للمستخدم:", user.id);

      // 1) محاولة الرفع إلى Cloudinary أولاً (آمن للإنتاج)
      let uploadResponse = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      // 2) في حال الفشل جرّب الرفع المحلي (للبيئة التطويرية فقط)
      if (!uploadResponse.ok) {
        console.warn("⚠️ فشل رفع Cloudinary، تجربة /api/upload كخطة بديلة");
        uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
      }

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        console.log("✅ تم رفع الصورة:", uploadData);
        const avatarUrl = (uploadData.data || uploadData).url;

        // تحديث في قاعدة البيانات
        console.log("💾 تحديث قاعدة البيانات...");
        const updateResponse = await fetch("/api/user/update-avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, avatarUrl }),
        });

        if (updateResponse.ok) {
          const updatedUser = { ...user, avatar: avatarUrl };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          toast.success("تم تحديث الصورة الشخصية بنجاح");
          setTimeout(() => { window.location.reload(); }, 600);
        } else {
          const updateError = (await updateResponse.json()).error || "حدث خطأ في تحديث قاعدة البيانات";
          console.error("❌ خطأ في تحديث قاعدة البيانات:", updateError);
          toast.error(updateError);
        }
      } else {
        const uploadError = await uploadResponse.json().catch(() => ({}));
        console.error("❌ خطأ في رفع الصورة:", uploadError);
        toast.error(uploadError.error || "فشل رفع الصورة. يرجى المحاولة لاحقاً");
      }
    } catch (error) {
      console.error("💥 خطأ عام في رفع الصورة:", error);
      toast.error("حدث خطأ غير متوقع أثناء رفع الصورة");
    } finally {
      setUploadingAvatar(false);
    }
  };
  const getActionIcon = (action: string) => {
    switch (action) {
      case "read":
      case "read_article":
        return <BookOpen className="w-4 h-4" />;
      case "share":
      case "share_article":
        return <Share2 className="w-4 h-4" />;
      case "like":
      case "like_article":
        return <Heart className="w-4 h-4" />;
      case "view":
        return <Eye className="w-4 h-4" />;
      case "comment":
        return <MessageCircle className="w-4 h-4" />;
      case "save":
        return <Bookmark className="w-4 h-4" />;
      case "select_preferences":
        return <Activity className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };
  if (loading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }
  if (!user) return null;
  const userPoints = loyaltyData?.total_points || user.loyaltyPoints || 0;
  const membership = getMembershipLevel(userPoints);
  const pointsToNext = getPointsToNextLevel(userPoints);
  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* رأس الصفحة محسّن للموبايل */}
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
          {/* نمط خلفية ناعم */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 relative">
            {/* أزرار الإجراءات للديسكتوب - موقع محسن */}
            <div className="hidden sm:flex absolute top-6 left-4 lg:left-8 gap-3">
              <button
                onClick={() => router.push("/profile/edit")}
                className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                تعديل الملف
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
            {/* التصميم المحسن للموبايل */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="relative group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-xl bg-gray-200 dark:bg-gray-700">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          console.error("خطأ في تحميل الصورة:", user.avatar);
                          const target = e.currentTarget;
                          const parent = target.parentElement;
                          if (parent) {
                            // إخفاء الصورة
                            target.style.display = "none";
                            // إنشاء وإظهار الدائرة البديلة
                            const fallback = document.createElement("div");
                            fallback.className =
                              "w-full h-full bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold";
                            fallback.textContent = user.name
                              ? user.name.charAt(0).toUpperCase()
                              : user.email
                              ? user.email.charAt(0).toUpperCase()
                              : "؟";
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                        {user.name
                          ? user.name.charAt(0).toUpperCase()
                          : user.email
                          ? user.email.charAt(0).toUpperCase()
                          : "؟"}
                      </div>
                    )}
                  </div>
                  {/* زر تغيير الصورة */}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                    {uploadingAvatar ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Camera className="w-8 h-8 text-white" />
                    )}
                  </label>
                  {/* شارة العضوية مصغرة ومحسنة */}
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-md ring-1 ring-white/50">
                    <span className="text-xs sm:text-sm">
                      {membership.icon}
                    </span>
                  </div>
                </div>

                {/* المعلومات الأساسية */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 text-white truncate">
                    {user.name}
                  </h1>
                  <p className="text-white/80 mb-2 sm:mb-3 text-sm sm:text-base truncate">
                    {user.email}
                  </p>
                  {/* معلومات سريعة مضغوطة للموبايل */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{membership.name}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{userPoints} نقطة</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>عضو منذ {formatDate(user.created_at)}</span>
                    </div>
                    {userInsights && (
                      <div className="hidden sm:flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        <span>
                          {userInsights.readingProfile.type === "analytical"
                            ? "قارئ تحليلي"
                            : userInsights.readingProfile.type === "balanced"
                            ? "قارئ متوازن"
                            : "قارئ عادي"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* أزرار الإجراءات للموبايل فقط */}
              <div className="flex flex-col gap-2 w-full sm:hidden">
                <button
                  onClick={() => router.push("/profile/edit")}
                  className="flex-1 px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-all font-medium flex items-center justify-center gap-2 shadow-lg text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  تعديل الملف
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium shadow-lg text-sm"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* التبويبات مع التمرير الأفقي للموبايل */}
        <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto">
            {/* حاوية التمرير الأفقي */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex px-2 sm:px-4 lg:px-8 min-w-max">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base ${
                    activeTab === "overview"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  نظرة عامة
                  {activeTab === "overview" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("insights")}
                  className={`flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base ${
                    activeTab === "insights"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  التحليلات
                  {activeTab === "insights" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("achievements")}
                  className={`flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base ${
                    activeTab === "achievements"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  الإنجازات
                  {activeTab === "achievements" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("timeline")}
                  className={`flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base ${
                    activeTab === "timeline"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  سجل القراءة
                  {activeTab === "timeline" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                  )}
                </button>
                <Link
                  href="/profile/liked"
                  className="flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Heart className="w-4 h-4" />
                  الإعجابات
                </Link>
                <Link
                  href="/profile/saved"
                  className="flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Bookmark className="w-4 h-4" />
                  المحفوظات
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* المحتوى الرئيسي */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8 mb-12">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* العمود الأيسر */}
              <div className="lg:col-span-1 space-y-6">
                {/* بطاقة النقاط محسنة للموبايل */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-700 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                      نقاط الولاء
                    </h3>
                    <div className="text-2xl sm:text-3xl font-bold text-amber-600">
                      {userPoints}
                    </div>
                  </div>

                  {membership.nextLevel && (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <span>المستوى التالي</span>
                        <span className="font-medium">
                          {getProgressToNextLevel(userPoints)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-amber-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${getProgressToNextLevel(userPoints)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        باقي {pointsToNext} نقطة للوصول إلى{" "}
                        {membership.nextLevel}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setShowLoyaltyModal(true)}
                    className="text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 w-full bg-white/50 dark:bg-gray-800/50 rounded-lg py-2"
                  >
                    عرض التفاصيل
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
                {/* بطاقات الإحصائيات السريعة - Mini Cards */}
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 px-1">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    إحصائيات سريعة
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {/* مقالات مقروءة */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-blue-700 dark:text-blue-300">
                          مقروء
                        </span>
                      </div>
                      <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
                        {realStats?.articlesRead ||
                          userInsights?.stats.totalArticlesRead ||
                          userStats.articlesRead}
                      </div>
                    </div>

                    {/* إعجابات */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-3 border border-red-200 dark:border-red-700">
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="w-4 h-4 text-red-600" />
                        <span className="text-xs text-red-700 dark:text-red-300">
                          إعجابات
                        </span>
                      </div>
                      <div className="text-xl font-bold text-red-800 dark:text-red-200">
                        {realStats?.likes ||
                          userInsights?.stats.totalLikes ||
                          0}
                      </div>
                    </div>

                    {/* مشاركات */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-2 mb-1">
                        <Share2 className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-700 dark:text-green-300">
                          مشاركات
                        </span>
                      </div>
                      <div className="text-xl font-bold text-green-800 dark:text-green-200">
                        {realStats?.shares ||
                          userInsights?.stats.totalShares ||
                          userStats.shares}
                      </div>
                    </div>

                    {/* محفوظات */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center gap-2 mb-1">
                        <Bookmark className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-purple-700 dark:text-purple-300">
                          محفوظ
                        </span>
                      </div>
                      <div className="text-xl font-bold text-purple-800 dark:text-purple-200">
                        {realStats?.saves ||
                          userInsights?.stats.totalSaves ||
                          0}
                      </div>
                    </div>
                  </div>

                  {/* سلسلة القراءة وتقييم التوازن */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span className="text-xs text-amber-700 dark:text-amber-300">
                          سلسلة
                        </span>
                      </div>
                      <div className="text-xl font-bold text-amber-800 dark:text-amber-200">
                        {realStats?.readingStreak || 0}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-gray-600" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          توازن
                        </span>
                      </div>
                      <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        {realStats?.balanceScore || 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* العمود الأيمن */}
              <div className="lg:col-span-2 space-y-6">
                {/* الاهتمامات */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      اهتماماتي
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (!fetchingInterestsRef.current) {
                            manualRefreshRef.current = true; // 🆕 تعيين أن هذا تحديث يدوي
                            fetchUserInterestsImmediately();
                          }
                        }}
                        disabled={fetchingInterestsRef.current}
                        className={`font-medium flex items-center gap-1 text-sm transition-colors ${
                          fetchingInterestsRef.current
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                        }`}
                        title="تحديث الاهتمامات"
                      >
                        {fetchingInterestsRef.current ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent" />
                        ) : (
                          <ArrowRight className="w-4 h-4 transform rotate-180" />
                        )}
                        {fetchingInterestsRef.current
                          ? "جاري التحديث..."
                          : "تحديث"}
                      </button>
                      <Link
                        href="/welcome/preferences"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        تعديل
                      </Link>
                    </div>
                  </div>
                  {preferences.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                      {preferences.slice(0, 8).map((pref) => (
                        <div
                          key={pref.category_id}
                          className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border hover:shadow-md transition-all text-sm sm:text-base"
                          style={{
                            backgroundColor: pref.category_color + "10",
                            borderColor: pref.category_color + "30",
                            borderLeftWidth: "3px",
                            borderLeftColor: pref.category_color,
                          }}
                        >
                          <span className="text-lg sm:text-2xl">
                            {pref.category_icon}
                          </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                            {pref.category_name}
                          </span>
                        </div>
                      ))}
                      {preferences.length > 8 && (
                        <div className="flex items-center justify-center p-2 sm:p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-400">
                          +{preferences.length - 8} أخرى
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      {user.id && user.id.startsWith("guest-") ? (
                        <>
                          <p className="text-gray-500 dark:text-gray-400 mb-2">
                            أنت تتصفح كضيف
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                            سجل الدخول لحفظ اهتماماتك وتخصيص تجربتك بشكل دائم
                          </p>
                          <div className="space-y-3">
                            <Link
                              href="/welcome/preferences"
                              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all mb-3"
                            >
                              <Heart className="w-5 h-5" />
                              اختر اهتماماتك كضيف
                            </Link>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                              <p className="text-xs text-gray-400 mb-3">
                                للحصول على تجربة كاملة:
                              </p>
                              <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                              >
                                تسجيل الدخول
                              </Link>
                              <span className="mx-2 text-gray-400">أو</span>
                              <Link
                                href="/register"
                                className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                إنشاء حساب جديد
                              </Link>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-500 dark:text-gray-400 mb-4">
                            لم تختر اهتمامات بعد
                          </p>
                          <Link
                            href="/welcome/preferences"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                          >
                            <Heart className="w-5 h-5" />
                            اختر اهتماماتك الآن
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* أوقات القراءة المفضلة */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-8">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    أوقات القراءة المفضلة
                  </h3>
                  {realStats?.readingTimes &&
                  realStats.readingTimes.length > 0 ? (
                    <div className="space-y-3">
                      {realStats.readingTimes.slice(0, 5).map((time: any) => {
                        const hourLabel =
                          time.hour < 12
                            ? "صباحاً"
                            : time.hour < 18
                            ? "ظهراً"
                            : "مساءً";
                        const hour12 = time.hour % 12 || 12;
                        return (
                          <div
                            key={time.hour}
                            className="flex items-center justify-between"
                          >
                            <span className="text-gray-600 dark:text-gray-400">
                              {hour12}:00 {hourLabel}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${
                                      (time.count /
                                        Math.max(
                                          ...realStats.readingTimes.map(
                                            (t: any) => t.count
                                          )
                                        )) *
                                      100
                                    }%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                                {time.count}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        لا توجد بيانات كافية بعد
                      </p>
                    </div>
                  )}
                </div>

                {/* الإنجازات */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-8">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-600" />
                    الإنجازات
                  </h3>
                  {realStats?.achievements &&
                  realStats.achievements.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {realStats.achievements.map((achievement: any) => (
                        <div
                          key={achievement.id}
                          className="text-center p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700"
                        >
                          <div className="text-4xl mb-2">
                            {achievement.icon}
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {achievement.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                        لم تحصل على إنجازات بعد
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs">
                        اقرأ المزيد من المقالات وتفاعل معها لفتح الإنجازات
                      </p>
                    </div>
                  )}
                </div>

                {/* توزيع الاهتمامات */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-8">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    توزيع القراءة حسب التصنيف
                  </h3>
                  {realStats?.categoryDistribution &&
                  realStats.categoryDistribution.length > 0 ? (
                    <div className="space-y-3">
                      {realStats.categoryDistribution.map((cat: any) => (
                        <div key={cat.name} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              {cat.name}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {cat.percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${cat.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        ابدأ بقراءة المقالات لرؤية توزيع اهتماماتك
                      </p>
                    </div>
                  )}
                </div>

                {/* المقالات المحفوظة وغير المكتملة */}
                {userInsights && (
                  <SavedArticles
                    savedArticles={userInsights.savedArticles}
                    unfinishedArticles={userInsights.unfinishedArticles}
                  />
                )}
              </div>
            </div>
          )}
          {activeTab === "insights" &&
            (userInsights ? (
              <ReadingInsights
                readingProfile={userInsights.readingProfile}
                categoryDistribution={userInsights.categoryDistribution}
                timePatterns={userInsights.timePatterns}
                stats={userInsights.stats}
              />
            ) : (
              <div className="space-y-6">
                {/* محتوى افتراضي لتحليلات القراءة */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">📖</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2 text-blue-600">
                        قارئ متوازن
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full text-sm font-medium">
                          مستوى متوسط
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          • 15 مقال مقروء
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <Clock className="w-4 h-4" />
                            متوسط القراءة
                          </div>
                          <div className="text-xl font-bold">8 دقيقة</div>
                        </div>
                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <Sparkles className="w-4 h-4" />
                            سلسلة القراءة
                          </div>
                          <div className="text-xl font-bold">5 أيام</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* توزيع الاهتمامات الافتراضي */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-8">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    توزيع اهتماماتك
                  </h3>
                  <div className="space-y-3">
                    {preferences.length > 0 ? (
                      preferences.slice(0, 5).map((pref, index) => {
                        const percentage =
                          Math.floor(100 / preferences.length) +
                          (index < 100 % preferences.length ? 1 : 0);
                        return (
                          <div key={pref.category_id} className="relative">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">
                                  {pref.category_icon}
                                </span>
                                <span className="font-medium">
                                  {pref.category_name}
                                </span>
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: pref.category_color,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <Target className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400">
                          لم تختر اهتمامات بعد
                        </p>
                        <Link
                          href="/welcome/preferences"
                          className="inline-flex items-center gap-2 px-4 py-2 mt-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
                        >
                          اختر اهتماماتك الآن
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 جرب قراءة مقالات من تصنيفات مختلفة لتوسيع آفاقك
                      المعرفية
                    </p>
                  </div>
                </div>
                {/* أوقات القراءة المفضلة الافتراضية */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-8">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    أوقات القراءة المفضلة
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="text-3xl mb-2">🌅</div>
                      <div className="font-medium">الصباح</div>
                      <div className="text-sm text-gray-500">أفضل وقت</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="text-3xl mb-2">📅</div>
                      <div className="font-medium">الأحد</div>
                      <div className="text-sm text-gray-500">
                        أكثر يوم نشاطاً
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          {activeTab === "achievements" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                إنجازاتك
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* إنجازات مفتوحة افتراضية */}
                <div
                  className="relative p-4 rounded-xl border-2 border-transparent hover:shadow-lg cursor-pointer transform hover:scale-105 transition-all"
                  style={{ backgroundColor: "#10B98115" }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎯</div>
                    <h4 className="font-semibold text-sm mb-1">قارئ مبتدئ</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      اقرأ أول مقال
                    </p>
                  </div>
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: "#10B981" }}
                  >
                    ✓
                  </div>
                </div>
                <div
                  className="relative p-4 rounded-xl border-2 border-transparent hover:shadow-lg cursor-pointer transform hover:scale-105 transition-all"
                  style={{ backgroundColor: "#3B82F615" }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">❤️</div>
                    <h4 className="font-semibold text-sm mb-1">محب للقراءة</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      أعجب بـ 5 مقالات
                    </p>
                  </div>
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: "#3B82F6" }}
                  >
                    ✓
                  </div>
                </div>
                <div
                  className="relative p-4 rounded-xl border-2 border-transparent hover:shadow-lg cursor-pointer transform hover:scale-105 transition-all"
                  style={{ backgroundColor: "#8B5CF615" }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">📚</div>
                    <h4 className="font-semibold text-sm mb-1">قارئ نشط</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      اقرأ 10 مقالات
                    </p>
                  </div>
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: "#8B5CF6" }}
                  >
                    ✓
                  </div>
                </div>
                {/* إنجازات مقفلة */}
                <div className="relative p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 opacity-50">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 dark:bg-gray-900/50 rounded-xl">
                    <Lock className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎓</div>
                    <h4 className="font-semibold text-sm mb-1">خبير القراءة</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      اقرأ 100 مقال
                    </p>
                  </div>
                </div>
                <div className="relative p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 opacity-50">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 dark:bg-gray-900/50 rounded-xl">
                    <Lock className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🦋</div>
                    <h4 className="font-semibold text-sm mb-1">اجتماعي</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      شارك 50 مقال
                    </p>
                  </div>
                </div>
                <div className="relative p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 opacity-50">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 dark:bg-gray-900/50 rounded-xl">
                    <Lock className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🦉</div>
                    <h4 className="font-semibold text-sm mb-1">بومة الليل</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      اقرأ 20 مقال بعد منتصف الليل
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  فتحت 3 من 6 إنجاز
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: "50%" }}
                  />
                </div>
              </div>
            </div>
          )}
          {activeTab === "timeline" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                سجل رحلتك القرائية
              </h3>
              <div className="space-y-4">
                {/* بيانات افتراضية للسجل */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      <div className="text-right">
                        <div className="font-medium">اليوم</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          3 مقالات • 25 دقيقة
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📆</span>
                      <div className="text-right">
                        <div className="font-medium">أمس</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          2 مقالات • 18 دقيقة
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🗓️</span>
                      <div className="text-right">
                        <div className="font-medium">قبل يومين</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          1 مقال • 12 دقيقة
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <p className="font-medium text-indigo-900 dark:text-indigo-200">
                      إجمالي القراءة: 6 مقالات
                    </p>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      وقت القراءة الكلي: 55 دقيقة
                    </p>
                  </div>
                </div>
              </div>
              {/* رسالة تشجيعية */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  استمر في القراءة لبناء سجل قرائي غني! 📚
                </p>
              </div>
            </div>
          )}

          {/* تبويب الإعجابات */}
          {activeTab === "likes" && user && (
            <LikedArticlesTab userId={user.id} darkMode={darkMode} />
          )}

          {/* تبويب المحفوظات */}
          {activeTab === "saved" && user && (
            <SavedArticlesTab userId={user.id} darkMode={darkMode} />
          )}

          {/* رسالة التحميل للبيانات المتقدمة */}
          {loadingInsights && activeTab !== "overview" && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        {/* Modal تفاصيل النقاط */}
        {showLoyaltyModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    تفاصيل نقاط الولاء
                  </h3>
                  <button
                    onClick={() => setShowLoyaltyModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                          مستوى العضوية الحالي
                        </p>
                        <p className="text-3xl font-bold flex items-center gap-2 mt-2">
                          <span>{membership.icon}</span>
                          <span style={{ color: membership.color }}>
                            {membership.name}
                          </span>
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          النقاط الحالية
                        </p>
                        <p className="text-2xl font-bold text-amber-600">
                          {userPoints}
                        </p>
                      </div>
                    </div>
                    {membership.nextLevel && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          التقدم نحو المستوى التالي ({membership.nextLevel}{" "}
                          نقطة)
                        </p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${getProgressToNextLevel(userPoints)}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          باقي {pointsToNext} نقطة للوصول إلى المستوى التالي
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
                      كيفية كسب النقاط:
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          قراءة المقالات
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          +10 نقاط
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          الإعجاب بالمقالات
                        </span>
                        <span className="text-sm font-medium text-red-600">
                          +5 نقاط
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-green-500" />
                          مشاركة المقالات
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          +15 نقاط
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-purple-500" />
                          حفظ المقالات
                        </span>
                        <span className="text-sm font-medium text-purple-600">
                          +5 نقاط
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
