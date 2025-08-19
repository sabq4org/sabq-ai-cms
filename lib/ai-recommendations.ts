/**
 * 🧠 نظام التوصيات الذكي - سبق الذكية
 * AI Personalized Content Generator
 *
 * 🎯 الهدف: توليد روابط مقالات مخصصة بناءً على سلوك المستخدم الفعلي
 * 🔍 المصادر: سلوك القراءة + التفاعلات + الكلمات المفتاحية + الاتجاهات الشائعة
 */

export interface RecommendedArticle {
  id: string;
  title: string;
  url: string;
  type: "تحليل" | "رأي" | "مقالة" | "ملخص" | "عاجل" | "تقرير";
  reason: string;
  confidence: number; // درجة الثقة في التوصية (0-100)
  thumbnail?: string;
  publishedAt: string;
  category: string;
  readingTime: number;
  viewsCount: number;
  engagement: number; // معدل التفاعل
}

export interface UserBehavior {
  userId?: string;
  recentArticles: string[]; // آخر 10 مقالات قرأها
  favoriteCategories: string[]; // التصنيفات المفضلة
  readingPatterns: {
    timeOfDay: string[];
    daysOfWeek: string[];
    averageReadingTime: number;
  };
  interactions: {
    liked: string[];
    shared: string[];
    saved: string[];
    commented: string[];
  };
  searchHistory: string[];
  deviceType: "mobile" | "desktop";
  location?: string;
}

/**
 * 🔍 تحليل سلوك المستخدم وإرجاع التوصيات المخصصة
 */
export async function generatePersonalizedRecommendations({
  userId,
  currentArticleId,
  currentTags = [],
  currentCategory = "",
  userBehavior,
  limit = 6,
}: {
  userId?: string;
  currentArticleId: string;
  currentTags?: string[];
  currentCategory?: string;
  userBehavior?: UserBehavior;
  limit?: number;
}): Promise<RecommendedArticle[]> {
  try {
    // 1. جلب سلوك المستخدم (إذا لم يتم تمريره)
    const behavior = userBehavior || (await getUserBehaviorData(userId));

    // 2. جلب المقالات المرشحة من مصادر متعددة
    const [
      behaviorBasedArticles,
      categoryBasedArticles,
      trendingArticles,
      semanticSimilarArticles,
      mixedContentArticles,
    ] = await Promise.all([
      getBehaviorBasedRecommendations(behavior, currentArticleId),
      getCategoryBasedRecommendations(currentCategory, currentArticleId),
      getTrendingRecommendations(currentTags),
      getSemanticSimilarArticles(currentArticleId, currentTags),
      getSmartMixedContent(behavior, currentArticleId), // كوكتيل ذكي جديد
    ]);

    // 3. دمج وتسجيل النتائج
    const allRecommendations = [
      ...behaviorBasedArticles,
      ...categoryBasedArticles,
      ...trendingArticles,
      ...semanticSimilarArticles,
      ...mixedContentArticles,
    ];

    // 4. إزالة التكرار وترتيب حسب الصلة
    const uniqueRecommendations = removeDuplicatesAndScore(
      allRecommendations,
      behavior,
      currentArticleId
    );

    // 5. ضمان التنوع في أنواع المحتوى
    const diversifiedRecommendations = ensureContentDiversity(
      uniqueRecommendations,
      limit
    );

    // 6. إرجاع أفضل التوصيات
    return diversifiedRecommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  } catch (error) {
    console.error("❌ خطأ في توليد التوصيات الذكية:", error);

    // فولباك: توصيات أساسية
    return await getFallbackRecommendations(
      currentCategory,
      currentArticleId,
      limit
    );
  }
}

/**
 * 📊 جلب بيانات سلوك المستخدم
 */
async function getUserBehaviorData(userId?: string): Promise<UserBehavior> {
  if (!userId) {
    return getAnonymousUserBehavior();
  }

  try {
    // استخدام API الجديد
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/user-behavior?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: فشل جلب بيانات المستخدم`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      console.log("✅ تم جلب سلوك المستخدم:", data.data);
      return data.data;
    } else {
      throw new Error(data.error || "استجابة غير صالحة من الخادم");
    }
  } catch (error) {
    console.error("❌ خطأ في جلب سلوك المستخدم:", error);
    console.log("🔄 استخدام السلوك الافتراضي...");
    return getAnonymousUserBehavior();
  }
}

/**
 * 🕵️ سلوك المستخدم المجهول (افتراضي)
 */
function getAnonymousUserBehavior(): UserBehavior {
  return {
    recentArticles: [],
    favoriteCategories: ["أخبار", "تقنية", "اقتصاد"],
    readingPatterns: {
      timeOfDay: ["morning", "evening"],
      daysOfWeek: ["sunday", "monday", "tuesday"],
      averageReadingTime: 180, // 3 دقائق
    },
    interactions: {
      liked: [],
      shared: [],
      saved: [],
      commented: [],
    },
    searchHistory: [],
    deviceType: "mobile",
  };
}

/**
 * 🎯 توصيات بناءً على سلوك المستخدم
 */
async function getBehaviorBasedRecommendations(
  behavior: UserBehavior,
  currentArticleId: string
): Promise<RecommendedArticle[]> {
  const recommendations: RecommendedArticle[] = [];

  try {
    // بناءً على التصنيفات المفضلة
    if (behavior.favoriteCategories.length > 0) {
      const categoryArticles = await fetchArticlesByCategories(
        behavior.favoriteCategories,
        currentArticleId
      );

      categoryArticles.forEach((article) => {
        recommendations.push({
          ...article,
          reason: `لأنك تهتم بمواضيع ${article.category}`,
          confidence: 85,
          type: determineArticleType(article),
        });
      });
    }

    // بناءً على المقالات التي تفاعل معها
    if (behavior.interactions.liked.length > 0) {
      const similarToLiked = await findSimilarToInteracted(
        behavior.interactions.liked,
        currentArticleId
      );

      similarToLiked.forEach((article) => {
        recommendations.push({
          ...article,
          reason: "مشابه لمقالات أعجبتك سابقاً",
          confidence: 90,
          type: determineArticleType(article),
        });
      });
    }

    return recommendations.slice(0, 2); // أفضل 2 توصية
  } catch (error) {
    console.error("خطأ في التوصيات السلوكية:", error);
    return [];
  }
}

/**
 * 📂 توصيات بناءً على نفس التصنيف
 */
async function getCategoryBasedRecommendations(
  category: string,
  currentArticleId: string
): Promise<RecommendedArticle[]> {
  if (!category) return [];

  try {
    const similarArticles = await fetchArticlesByCategory(
      category,
      currentArticleId
    );

    return similarArticles.slice(0, 1).map((article) => ({
      ...article,
      reason: `من نفس قسم ${category}`,
      confidence: 70,
      type: determineArticleType(article),
    }));
  } catch (error) {
    console.error("خطأ في توصيات التصنيف:", error);
    return [];
  }
}

/**
 * 🔥 توصيات المقالات الشائعة
 */
async function getTrendingRecommendations(
  tags: string[]
): Promise<RecommendedArticle[]> {
  try {
    const trendingArticles = await fetchTrendingArticles(tags);

    return trendingArticles.slice(0, 1).map((article) => ({
      ...article,
      reason: `يتفاعل معها ${article.viewsCount.toLocaleString()} قارئ`,
      confidence: 75,
      type: determineArticleType(article),
    }));
  } catch (error) {
    console.error("خطأ في التوصيات الشائعة:", error);
    return [];
  }
}

/**
 * 🧠 توصيات بناءً على التشابه الدلالي
 */
async function getSemanticSimilarArticles(
  articleId: string,
  tags: string[]
): Promise<RecommendedArticle[]> {
  try {
    const similarArticles = await fetchSemanticallySimilarArticles(
      articleId,
      tags
    );

    return similarArticles.slice(0, 1).map((article) => ({
      ...article,
      reason: "محتوى مشابه قد يهمك",
      confidence: 80,
      type: determineArticleType(article),
    }));
  } catch (error) {
    console.error("خطأ في التوصيات الدلالية:", error);
    return [];
  }
}

/**
 * 🔄 إزالة التكرار وتسجيل درجات الثقة
 */
function removeDuplicatesAndScore(
  articles: RecommendedArticle[],
  behavior: UserBehavior,
  currentArticleId: string
): RecommendedArticle[] {
  // إزالة المقال الحالي والمكررات
  const seen = new Set([currentArticleId]);
  const unique: RecommendedArticle[] = [];

  articles.forEach((article) => {
    if (!seen.has(article.id)) {
      seen.add(article.id);

      // تعديل درجة الثقة بناءً على عوامل إضافية
      let adjustedConfidence = article.confidence;

      // زيادة الثقة للمقالات الحديثة
      const daysSincePublished = Math.floor(
        (Date.now() - new Date(article.publishedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSincePublished <= 1) adjustedConfidence += 10;
      else if (daysSincePublished <= 7) adjustedConfidence += 5;

      // زيادة الثقة للمقالات عالية التفاعل
      if (article.engagement > 0.1) adjustedConfidence += 5;
      if (article.engagement > 0.2) adjustedConfidence += 10;

      unique.push({
        ...article,
        confidence: Math.min(100, adjustedConfidence),
      });
    }
  });

  return unique;
}

/**
 * 🎭 تحديد نوع المقال
 */
function determineArticleType(article: any): RecommendedArticle["type"] {
  const title = article.title.toLowerCase();

  if (title.includes("تحليل") || title.includes("دراسة")) return "تحليل";
  if (title.includes("رأي") || title.includes("وجهة نظر")) return "رأي";
  if (title.includes("ملخص") || title.includes("خلاصة")) return "ملخص";
  if (title.includes("عاجل") || title.includes("خبر عاجل")) return "عاجل";
  if (title.includes("تقرير") || title.includes("تحقيق")) return "تقرير";

  return "مقالة";
}

/**
 * 🆘 توصيات احتياطية في حالة فشل الخوارزمية الرئيسية (محدثة للبيانات الحقيقية)
 */
async function getFallbackRecommendations(
  category: string,
  currentArticleId: string,
  limit: number
): Promise<RecommendedArticle[]> {
  try {
    console.log("🔄 استخدام التوصيات الاحتياطية مع البيانات الحقيقية...");

    // استراتيجية الاحتياط: مزج من مصادر متعددة
    const [categoryArticles, trendingArticles, recentArticles] =
      await Promise.all([
        fetchArticlesByCategory(category, currentArticleId),
        fetchTrendingArticles([]),
        fetchRecentQualityArticles(currentArticleId, limit),
      ]);

    // دمج النتائج بذكاء
    const fallbackRecommendations = [
      ...categoryArticles.slice(0, 2), // مقالين من نفس الفئة
      ...trendingArticles.slice(0, 2), // مقالين رائجين
      ...recentArticles.slice(0, Math.max(limit - 4, 2)), // الباقي من المقالات الحديثة الجيدة
    ].filter(Boolean); // إزالة القيم الفارغة

    // إضافة معلومات الفولباك
    const validRecommendations = fallbackRecommendations
      .filter((article) => article && article.id && article.title)
      .slice(0, limit)
      .map((article, index) => ({
        ...article,
        reason: article.reason || "محتوى مختار بعناية لك",
        confidence: Math.max(article.confidence - 5, 45), // تقليل الثقة قليلاً فقط
      }));

    console.log(`✅ تم توفير ${validRecommendations.length} توصية احتياطية`);
    return validRecommendations;
  } catch (error) {
    console.error("❌ فشل حتى في التوصيات الاحتياطية:", error);
    // في حالة الفشل التام، نعرض رسالة بدلاً من محتوى وهمي
    return [];
  }
}

/**
 * 🆕 جلب مقالات حديثة عالية الجودة
 */
async function fetchRecentQualityArticles(
  excludeId: string,
  limit: number
): Promise<RecommendedArticle[]> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/news?limit=${limit * 2}&status=published&sort=published_at&order=desc`,
      {
        next: { revalidate: 30 },
        cache: 'no-store'
      }
    );

    if (!response.ok) return [];

    const data = await response.json();

    if (data.success && data.articles) {
      const qualityArticles = data.articles.filter(
        (article: any) =>
          article &&
          article.id &&
          article.title &&
          article.title.trim() !== "" &&
          !article.title.toLowerCase().includes("test") &&
          !article.title.toLowerCase().includes("placeholder") &&
          article.featured_image &&
          !article.featured_image.includes("placeholder") &&
          article.category_name
      );

      return qualityArticles.slice(0, limit).map((article: any) => ({
        id: article.id.toString(),
        title: article.title,
        url: `/article/${article.id}`,
        type: determineArticleTypeFromContent(article),
        reason: "محتوى حديث ومميز",
        confidence: calculateConfidenceScore(article),
        thumbnail: article.featured_image,
        publishedAt: article.published_at || article.created_at,
        category: article.category_name || "عام",
        readingTime: article.reading_time || 5,
        viewsCount: article.views || 0,
        engagement: article.engagement_score || 0,
      }));
    }

    return [];
  } catch (error) {
    console.error("❌ خطأ في جلب المقالات الحديثة الجيدة:", error);
    return [];
  }
}

/**
 * 🍹 كوكتيل المحتوى الذكي - مزيج متنوع من أنواع المحتوى
 */
async function getSmartMixedContent(
  behavior: UserBehavior,
  currentArticleId: string
): Promise<RecommendedArticle[]> {
  const mixedContent: RecommendedArticle[] = [];

  try {
    console.log("🎯 جلب كوكتيل المحتوى المتنوع...");

    // 1. أخبار عامة (أساس المحتوى)
    const generalNews = await fetchArticlesByType(
      ["مقالة", "عاجل"],
      currentArticleId,
      4
    );
    generalNews.forEach((article) => {
      mixedContent.push({
        ...article,
        reason: article.type === "عاجل" ? "خبر عاجل يهمك" : "خبر جديد",
        confidence: 75,
        type: article.type || "مقالة",
      });
    });

    // 2. محتوى عميق (تحليلات وتقارير)
    const deepContent = await fetchArticlesByType(
      ["تحليل", "تقرير"],
      currentArticleId,
      3
    );
    deepContent.forEach((article) => {
      mixedContent.push({
        ...article,
        reason: "تحليل معمق يثري معرفتك",
        confidence: 85,
        type: article.type || "تحليل",
      });
    });

    // 3. محتوى رأي (وجهات نظر)
    const opinionContent = await fetchArticlesByType(
      ["رأي"],
      currentArticleId,
      2
    );
    opinionContent.forEach((article) => {
      mixedContent.push({
        ...article,
        reason: "وجهة نظر قد تغير تفكيرك",
        confidence: 80,
        type: article.type || "رأي",
      });
    });

    // 4. محتوى ملخص (قراءة سريعة)
    const summaryContent = await fetchArticlesByType(
      ["ملخص"],
      currentArticleId,
      2
    );
    summaryContent.forEach((article) => {
      mixedContent.push({
        ...article,
        reason: "ملخص سريع ومفيد",
        confidence: 70,
        type: article.type || "ملخص",
      });
    });
    console.log(`🎯 تم جلب ${mixedContent.length} مقال في الكوكتيل المتنوع`);

    // 5. إذا لم نحصل على ما يكفي، اجلب المزيد من الأخبار العامة
    if (mixedContent.length < 6) {
      console.log("🔄 جلب المزيد من المحتوى لضمان التنوع...");
      const additionalNews = await fetchArticlesByType(
        ["مقالة"],
        currentArticleId,
        8 - mixedContent.length
      );
      additionalNews.forEach((article, index) => {
        if (!mixedContent.find((existing) => existing.id === article.id)) {
          mixedContent.push({
            ...article,
            reason: "مقال إضافي قد يهمك",
            confidence: 65 + index * 2,
            type: article.type || "مقالة",
          });
        }
      });
    }
  } catch (error) {
    console.error("⚠️ خطأ في توليد الكوكتيل الذكي:", error);

    // Fallback: جلب أي مقالات متاحة
    try {
      console.log("🆘 fallback: جلب أي مقالات متاحة...");
      const fallbackArticles = await fetchArticlesByType(
        ["مقالة", "تحليل", "رأي"],
        currentArticleId,
        6
      );
      fallbackArticles.forEach((article) => {
        mixedContent.push({
          ...article,
          reason: "مقال مقترح",
          confidence: 60,
          type: article.type || "مقالة",
        });
      });
    } catch (fallbackError) {
      console.error("❌ فشل في fallback أيضاً:", fallbackError);
    }
  }

  console.log(`✅ إجمالي المحتوى المتنوع: ${mixedContent.length} مقال`);
  return mixedContent;
}

/**
 * 🖼️ الحصول على صورة افتراضية حسب نوع المحتوى
 */
function getDefaultImageByType(type: RecommendedArticle["type"]): string {
  // مجموعة متنوعة من الصور التجريبية عالية الجودة
  const defaultImages = {
    تحليل: [
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&h=600&fit=crop",
    ],
    رأي: [
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=800&h=600&fit=crop",
    ],
    عاجل: [
      "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop",
    ],
    مقالة: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop",
    ],
    تقرير: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop",
    ],
    ملخص: [
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop",
    ],
  };

  const images = defaultImages[type] || defaultImages["مقالة"];
  // اختيار صورة عشوائية من المجموعة
  return images[Math.floor(Math.random() * images.length)];
}

/**
 * 🎯 ضمان التنوع في أنواع المحتوى
 */
function ensureContentDiversity(
  recommendations: RecommendedArticle[],
  targetCount: number
): RecommendedArticle[] {
  const typeGroups: { [key: string]: RecommendedArticle[] } = {};
  const diversified: RecommendedArticle[] = [];

  // تجميع حسب النوع
  recommendations.forEach((article) => {
    const type = article.type || "مقالة";
    if (!typeGroups[type]) {
      typeGroups[type] = [];
    }
    typeGroups[type].push(article);
  });

  // أخذ عينة متنوعة من كل نوع
  const typePriority = ["عاجل", "تحليل", "رأي", "تقرير", "ملخص", "مقالة"];
  let addedCount = 0;

  // جولة أولى: أخذ مقال واحد من كل نوع
  for (const type of typePriority) {
    if (
      typeGroups[type] &&
      typeGroups[type].length > 0 &&
      addedCount < targetCount
    ) {
      diversified.push(typeGroups[type].shift()!);
      addedCount++;
    }
  }

  // جولة ثانية: ملء الباقي حسب الثقة
  const remaining = recommendations
    .filter((r) => !diversified.includes(r))
    .sort((a, b) => b.confidence - a.confidence);

  diversified.push(...remaining.slice(0, targetCount - addedCount));

  return diversified;
}

/**
 * 📰 جلب مقالات حسب النوع (محدث للبيانات الحقيقية)
 */
async function fetchArticlesByType(
  types: string[],
  excludeId: string,
  limit: number
): Promise<RecommendedArticle[]> {
  try {
    // تحويل الأنواع العربية إلى الإنجليزية المستخدمة في قاعدة البيانات
    const typeMapping: { [key: string]: string } = {
      تحليل: "analysis",
      رأي: "opinion",
      مقالة: "opinion",
      ملخص: "news",
      عاجل: "news",
      تقرير: "analysis",
    };

    // تحويل الأنواع وإزالة التكرار
    const dbTypes = [
      ...new Set(types.map((type) => typeMapping[type] || "news")),
    ];

    // إنشاء الـ query string للأنواع
    const typesQuery = dbTypes.length > 0 ? `&types=${dbTypes.join(",")}` : "";

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    // جلب المقالات المنشورة مع تصفية محسنة
    const response = await fetch(
      `${baseUrl}/api/articles?exclude=${excludeId}&limit=${
        limit * 3
      }&status=published&sortBy=published_at&order=desc${typesQuery}`
    );

    if (!response.ok) {
      console.warn("⚠️ فشل جلب المقالات من API");
      return [];
    }

    const data = await response.json();

    if (!data.success || !data.articles || !Array.isArray(data.articles)) {
      console.warn("⚠️ استجابة غير صالحة من API المقالات");
      return [];
    }

    // فلترة المقالات للتأكد من صحة البيانات الأساسية
    const validArticles = data.articles.filter((article: any) => {
      // التأكد من وجود البيانات الأساسية المطلوبة
      return (
        article &&
        article.id &&
        article.title &&
        article.title.trim() !== "" &&
        !article.title.includes("placeholder") &&
        !article.title.includes("test") &&
        // الصورة المميزة اختيارية - يمكن أن تكون null أو فارغة
        (article.featured_image === null ||
          article.featured_image === "" ||
          (article.featured_image &&
            !article.featured_image.includes("placeholder"))) &&
        // التصنيف مطلوب
        (article.category_name ||
          article.categories?.name ||
          article.category?.name)
      );
    });

    if (validArticles.length === 0) {
      console.debug("🔍 لم يتم العثور على مقالات تطابق معايير الفلترة المحددة");
      return [];
    }

    // تحويل إلى صيغة RecommendedArticle
    const recommendations = validArticles
      .slice(0, limit)
      .map((article: any) => {
        const articleType = determineArticleTypeFromContent(article);
        return {
          id: article.id.toString(),
          title: article.title,
          url: `/article/${article.id}`,
          type: articleType,
          reason: getSmartReasonByType(articleType, article.category_name),
          confidence: calculateConfidenceScore(article),
          thumbnail: article.featured_image || article.thumbnail,
          publishedAt: article.published_at || article.created_at,
          category: article.category_name || article.categories?.name || "عام",
          readingTime:
            article.reading_time ||
            Math.ceil((article.content?.length || 1000) / 200),
          viewsCount: article.views || 0,
          engagement: article.engagement_score || (article.views || 0) / 1000,
        };
      });

    console.log(
      `✅ تم جلب ${recommendations.length} مقالة صالحة من النوع المطلوب`
    );
    return recommendations;
  } catch (error) {
    console.error("❌ خطأ في جلب المقالات حسب النوع:", error);
    return [];
  }
}

/**
 * 💡 توليد أسباب ذكية للتوصية
 */
function getSmartReason(type?: string): string {
  const reasons = {
    تحليل: [
      "تحليل يربط الأحداث بسياقها الأوسع",
      "رؤية معمقة تكشف ما وراء الخبر",
      "تحليل ذكي يساعدك على الفهم الأعمق",
    ],
    رأي: [
      "وجهة نظر جديدة تثري النقاش",
      "رأي جريء يستحق القراءة",
      "منظور مختلف قد يغير قناعاتك",
    ],
    عاجل: ["آخر التطورات في الحدث", "خبر عاجل يهمك", "تطور مهم يجب متابعته"],
    تقرير: [
      "تقرير شامل بالأرقام والحقائق",
      "معلومات موثقة ومفصلة",
      "تغطية شاملة للموضوع",
    ],
    ملخص: [
      "خلاصة مركزة توفر وقتك",
      "أهم النقاط في دقائق",
      "ملخص ذكي للأحداث المهمة",
    ],
    مقالة: [
      "قراءة ممتعة ومفيدة",
      "محتوى مميز يستحق وقتك",
      "مقال يجمع بين المتعة والفائدة",
    ],
  };

  const typeReasons = reasons[type as keyof typeof reasons] || reasons["مقالة"];
  return typeReasons[Math.floor(Math.random() * typeReasons.length)];
}

// =============================================================================
// 📡 دوال API المحاكاة (يجب استبدالها بـ APIs حقيقية)
// =============================================================================

/**
 * 📂 جلب مقالات حسب التصنيفات (محدث للبيانات الحقيقية)
 */
async function fetchArticlesByCategories(
  categories: string[],
  excludeId: string
): Promise<RecommendedArticle[]> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    // استخدام أول تصنيف فقط حالياً لأن API لا يدعم تصنيفات متعددة
    const categoryParam = categories[0] ? `&category=${encodeURIComponent(categories[0])}` : '';
    const response = await fetch(
      `${baseUrl}/api/news?limit=15&status=published&sort=published_at&order=desc${categoryParam}`,
      {
        next: { revalidate: 30 },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      console.warn("⚠️ فشل جلب المقالات حسب التصنيفات");
      return [];
    }

    const data = await response.json();

    if (!data.success || !data.articles || !Array.isArray(data.articles)) {
      console.warn("⚠️ استجابة غير صالحة من API المقالات (التصنيفات)");
      return [];
    }

    // فلترة وتحويل المقالات
    const validArticles = data.articles.filter(
      (article: any) =>
        article &&
        article.id &&
        article.title &&
        article.title.trim() !== "" &&
        !article.title.includes("placeholder") &&
        article.featured_image &&
        article.category_name
    );

    return validArticles.map((article: any) => ({
      id: article.id.toString(),
      title: article.title,
      url: `/article/${article.id}`,
      type: determineArticleTypeFromContent(article),
      reason: `لأنك تهتم بمواضيع ${article.category_name}`,
      confidence: Math.min(95, 70 + (article.views || 0) / 100),
      thumbnail: article.featured_image,
      publishedAt: article.published_at || article.created_at,
      category: article.category_name,
      readingTime: article.reading_time || 5,
      viewsCount: article.views || 0,
      engagement: article.engagement_score || (article.views || 0) / 1000,
    }));
  } catch (error) {
    console.error("❌ خطأ في جلب المقالات حسب التصنيفات:", error);
    return [];
  }
}

/**
 * 🔗 جلب مقالات مشابهة للمقالات التي تفاعل معها المستخدم
 */
async function findSimilarToInteracted(
  likedIds: string[],
  excludeId: string
): Promise<RecommendedArticle[]> {
  if (likedIds.length === 0) return [];

  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    // جلب مقالات من نفس فئات المقالات التي أعجب بها
    const idsQuery = likedIds.slice(0, 5).join(","); // أول 5 مقالات
    const response = await fetch(
      `${baseUrl}/api/articles/similar?ids=${idsQuery}&exclude=${excludeId}&limit=6`
    );

    if (!response.ok) return [];

    const data = await response.json();

    if (data.success && data.articles) {
      return data.articles.map((article: any) => ({
        id: article.id.toString(),
        title: article.title,
        url: `/article/${article.id}`,
        type: determineArticleTypeFromContent(article),
        reason: "مشابه لمقالات أعجبت بها",
        confidence: calculateConfidenceScore(article) + 10, // مكافأة للتشابه
        thumbnail: article.featured_image,
        publishedAt: article.published_at || article.created_at,
        category: article.category_name || "عام",
        readingTime: article.reading_time || 5,
        viewsCount: article.views || 0,
        engagement: article.engagement_score || 0,
      }));
    }

    return [];
  } catch (error) {
    console.error("❌ خطأ في جلب المقالات المشابهة:", error);
    return [];
  }
}

/**
 * 📂 جلب مقالات حسب تصنيف واحد
 */
async function fetchArticlesByCategory(
  category: string,
  excludeId: string
): Promise<RecommendedArticle[]> {
  return await fetchArticlesByCategories([category], excludeId);
}

/**
 * 🔥 جلب المقالات الرائجة
 */
async function fetchTrendingArticles(
  tags: string[]
): Promise<RecommendedArticle[]> {
  try {
    // استخدام API الأخبار بدلاً من المقالات للحصول على أحدث المحتوى
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/news?limit=10&status=published&sort=published_at&order=desc&breaking=false&featured=false`,
      {
        next: { revalidate: 30 }, // تحديث كل 30 ثانية
        cache: 'no-store' // منع الكاش لضمان الحصول على أحدث الأخبار
      }
    );

    if (!response.ok) return [];

    const data = await response.json();

    if (data.success && data.articles) {
      const validArticles = data.articles.filter(
        (article: any) =>
          article &&
          article.id &&
          article.title &&
          article.featured_image &&
          (article.views || 0) > 500 // معيار للرواج
      );

      return validArticles.slice(0, 5).map((article: any) => ({
        id: article.id.toString(),
        title: article.title,
        url: `/article/${article.id}`,
        type: determineArticleTypeFromContent(article),
        reason: `رائج في ${article.category_name || "الموقع"} 🔥`,
        confidence: Math.min(95, calculateConfidenceScore(article) + 15),
        thumbnail: article.featured_image,
        publishedAt: article.published_at || article.created_at,
        category: article.category_name || "عام",
        readingTime: article.reading_time || 5,
        viewsCount: article.views || 0,
        engagement: article.engagement_score || 0,
      }));
    }

    return [];
  } catch (error) {
    console.error("❌ خطأ في جلب المقالات الرائجة:", error);
    return [];
  }
}

/**
 * 🔎 جلب مقالات مشابهة دلالياً
 */
async function fetchSemanticallySimilarArticles(
  articleId: string,
  tags: string[]
): Promise<RecommendedArticle[]> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    // استخدام العلامات للبحث عن محتوى مشابه
    const tagsQuery = tags
      .slice(0, 3)
      .map((tag) => `tag=${encodeURIComponent(tag)}`)
      .join("&");
    const response = await fetch(
      `${baseUrl}/api/articles?${tagsQuery}&exclude=${articleId}&limit=6&status=published`
    );

    if (!response.ok) return [];

    const data = await response.json();

    if (data.success && data.articles) {
      const validArticles = data.articles.filter(
        (article: any) =>
          article && article.id && article.title && article.featured_image
      );

      return validArticles.slice(0, 4).map((article: any) => ({
        id: article.id.toString(),
        title: article.title,
        url: `/article/${article.id}`,
        type: determineArticleTypeFromContent(article),
        reason: "موضوع مشابه قد يهمك",
        confidence: calculateConfidenceScore(article),
        thumbnail: article.featured_image,
        publishedAt: article.published_at || article.created_at,
        category: article.category_name || "عام",
        readingTime: article.reading_time || 5,
        viewsCount: article.views || 0,
        engagement: article.engagement_score || 0,
      }));
    }

    return [];
  } catch (error) {
    console.error("❌ خطأ في جلب المقالات المشابهة دلالياً:", error);
    return [];
  }
}

/**
 * ⭐ جلب المقالات الأكثر شعبية
 */
async function fetchPopularArticles(
  limit: number
): Promise<RecommendedArticle[]> {
  return await fetchTrendingArticles([]);
}

// =============================================================================
// 🔧 دوال مساعدة جديدة للنظام الذكي
// =============================================================================

/**
 * 🎯 تحديد نوع المقال من المحتوى
 */
function determineArticleTypeFromContent(
  article: any
): RecommendedArticle["type"] {
  // أولاً: استخدام نوع المقال من قاعدة البيانات إذا كان موجوداً
  if (article.article_type) {
    const dbTypeMapping: { [key: string]: RecommendedArticle["type"] } = {
      analysis: "تحليل",
      opinion: "رأي",
      news: article.breaking || article.is_breaking ? "عاجل" : "مقالة",
      interview: "تقرير",
    };

    const mappedType = dbTypeMapping[article.article_type];
    if (mappedType) {
      return mappedType;
    }
  }

  // ثانياً: تحليل العنوان والمحتوى كـ fallback
  const title = (article.title || "").toLowerCase();
  const content = (article.content || "").toLowerCase();
  const category = (article.category_name || "").toLowerCase();

  // إذا كان الخبر عاجل
  if (article.breaking || article.is_breaking || title.includes("عاجل")) {
    return "عاجل";
  }

  // تحليل العنوان للكلمات المفتاحية
  if (
    title.includes("تحليل") ||
    title.includes("دراسة") ||
    title.includes("تقرير مفصل") ||
    category.includes("تحليل")
  ) {
    return "تحليل";
  }

  if (
    title.includes("رأي") ||
    title.includes("وجهة نظر") ||
    title.includes("كاتب") ||
    category.includes("رأي")
  ) {
    return "رأي";
  }

  if (
    title.includes("ملخص") ||
    title.includes("موجز") ||
    title.includes("في دقائق")
  ) {
    return "ملخص";
  }

  if (title.includes("تقرير") || category.includes("تقارير")) {
    return "تقرير";
  }

  return "مقالة";
}

/**
 * 💫 حساب درجة الثقة في التوصية
 */
function calculateConfidenceScore(article: any): number {
  let score = 50; // نقطة البداية

  // زيادة النقاط بناءً على المشاهدات
  const views = article.views || 0;
  if (views > 1000) score += 20;
  if (views > 5000) score += 10;
  if (views > 10000) score += 10;

  // زيادة النقاط بناءً على حداثة المقال
  const publishedDate = new Date(article.published_at || article.created_at);
  const daysDiff =
    (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysDiff < 1) score += 15; // مقال جديد
  if (daysDiff < 7) score += 10; // أقل من أسبوع
  if (daysDiff < 30) score += 5; // أقل من شهر

  // زيادة النقاط بناءً على وجود صورة جيدة
  if (
    article.featured_image &&
    !article.featured_image.includes("placeholder")
  ) {
    score += 5;
  }

  // تقليل النقاط للمقالات المحذوفة أو المخفية
  if (article.status !== "published") {
    score -= 30;
  }

  return Math.min(Math.max(score, 10), 100); // الحد بين 10-100
}

/**
 * 🎨 توليد أسباب ذكية للتوصية حسب النوع
 */
function getSmartReasonByType(
  type: RecommendedArticle["type"],
  category?: string
): string {
  const reasons = {
    تحليل: [
      "تحليل معمق يثري معرفتك",
      `دراسة شاملة في ${category || "موضوع مهم"}`,
      "محتوى تحليلي متقدم",
      "رؤية عميقة للأحداث",
    ],
    رأي: [
      "وجهة نظر قد تغير تفكيرك",
      `رأي متخصص في ${category || "الموضوع"}`,
      "منظور جديد للأحداث",
      "كاتب معروف يشارك خبرته",
    ],
    عاجل: [
      "خبر مهم يستحق المتابعة",
      "آخر التطورات",
      "حدث جديد يؤثر عليك",
      "معلومات حديثة ومهمة",
    ],
    ملخص: [
      "ملخص سريع ومفيد",
      "أهم النقاط في دقائق",
      "موجز شامل للموضوع",
      "خلاصة ذكية للأحداث",
    ],
    تقرير: [
      "تقرير مفصل وموثق",
      `بيانات وإحصائيات عن ${category || "الموضوع"}`,
      "معلومات موثقة ومفيدة",
      "تقرير شامل بالأرقام",
    ],
    مقالة: [
      "مقال يناسب اهتماماتك",
      `محتوى متميز في ${category || "مجالك المفضل"}`,
      "قراءة ممتعة ومفيدة",
      "محتوى عالي الجودة",
    ],
  };

  const typeReasons = reasons[type] || reasons["مقالة"];
  return typeReasons[Math.floor(Math.random() * typeReasons.length)];
}
