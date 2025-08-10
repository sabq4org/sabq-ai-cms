import { NextRequest, NextResponse } from "next/server";

// 🚀 حل جذري: Response مسبق التجهيز
const preBuiltResponse = {
  success: true,
  angles: [
    {
      id: "1",
      title: "تقنية وذكاء اصطناعي",
      slug: "tech-ai",
      description: "زاوية متخصصة في أحدث التطورات التقنية والذكاء الاصطناعي",
      coverImage: "/images/tech-angle.jpg",
      themeColor: "#3B82F6",
      isFeatured: true,
      isPublished: true,
      articlesCount: 15,
      createdAt: "2024-01-01T00:00:00.000Z",
      author: { name: "فريق التقنية", bio: "خبراء في التكنولوجيا" },
    },
    {
      id: "2",
      title: "تحليل اقتصادي",
      slug: "economic-analysis",
      description: "تحليلات اقتصادية عميقة للأسواق والاتجاهات المالية",
      coverImage: "/images/economy-angle.jpg",
      themeColor: "#10B981",
      isFeatured: false,
      isPublished: true,
      articlesCount: 8,
      createdAt: "2024-01-02T00:00:00.000Z",
      author: { name: "فريق الاقتصاد", bio: "محللون اقتصاديون" },
    },
    {
      id: "3",
      title: "فكر معاصر",
      slug: "contemporary-thought",
      description: "رؤى وأفكار معاصرة في مختلف جوانب الحياة",
      coverImage: "/images/thought-angle.jpg",
      themeColor: "#8B5CF6",
      isFeatured: true,
      isPublished: true,
      articlesCount: 12,
      createdAt: "2024-01-03T00:00:00.000Z",
      author: { name: "فريق الفكر", bio: "مفكرون وكتاب" },
    },
  ],
  heroArticle: {
    id: "hero-1",
    title: "مستقبل الذكاء الاصطناعي في التعليم العربي",
    excerpt:
      "استكشاف للتطبيقات الثورية للذكاء الاصطناعي في تطوير التعليم باللغة العربية",
    slug: "ai-in-arabic-education",
    coverImage: "/images/ai-education.jpg",
    readingTime: 8,
    publishDate: "2024-12-15T10:00:00.000Z",
    views: 2547,
    tags: ["ذكاء اصطناعي", "تعليم", "تقنية"],
    aiScore: 92,
    angle: {
      title: "تقنية وذكاء اصطناعي",
      slug: "tech-ai",
      icon: "Brain",
      themeColor: "#3B82F6",
    },
    author: {
      name: "د. أحمد التقني",
      avatar: "/images/authors/ahmed.jpg",
    },
  },
  featuredArticles: [
    {
      id: "featured-1",
      title: "تحليل التضخم الاقتصادي في المنطقة",
      excerpt: "دراسة شاملة لأسباب التضخم وتأثيره على الاقتصادات العربية",
      slug: "inflation-analysis",
      coverImage: "/images/inflation.jpg",
      readingTime: 6,
      publishDate: "2024-12-14T14:30:00.000Z",
      views: 1823,
      angle: {
        id: "2",
        title: "تحليل اقتصادي",
        slug: "economic-analysis",
        themeColor: "#10B981",
      },
      author: { name: "د. سارة الاقتصادية" },
      createdAt: "2024-12-14T14:30:00.000Z",
    },
    {
      id: "featured-2",
      title: "الفلسفة في عصر التكنولوجيا",
      excerpt: "كيف تتطور الأفكار الفلسفية مع التقدم التكنولوجي السريع",
      slug: "philosophy-tech-age",
      coverImage: "/images/philosophy-tech.jpg",
      readingTime: 10,
      publishDate: "2024-12-13T09:15:00.000Z",
      views: 1456,
      angle: {
        id: "3",
        title: "فكر معاصر",
        slug: "contemporary-thought",
        themeColor: "#8B5CF6",
      },
      author: { name: "د. محمد الفيلسوف" },
      createdAt: "2024-12-13T09:15:00.000Z",
    },
  ],
  stats: {
    totalAngles: 3,
    publishedAngles: 3,
    totalArticles: 35,
    publishedArticles: 35,
    totalViews: 45000,
    displayViews: { raw: 45000, formatted: "45K" },
  },
  cached: true,
  fastMode: true,
  performance: {
    timestamp: new Date().toISOString(),
    optimized: true,
    source: "prebuilt-response",
  },
};

export async function GET(req: NextRequest) {
  // 🚀 استجابة فورية بدون معالجة
  const response = NextResponse.json(preBuiltResponse);
  response.headers.set("Cache-Control", "public, max-age=300");
  return response;
}
