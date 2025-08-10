import { NextRequest, NextResponse } from "next/server";

// 🚀 استجابة مسبقة التجهيز للزوايا
const fastAnglesResponse = {
  success: true,
  angles: [
    {
      id: "1",
      title: "تقنية وذكاء اصطناعي",
      slug: "tech-ai",
      description:
        "زاوية متخصصة في أحدث التطورات التقنية والذكاء الاصطناعي وتطبيقاته في الحياة اليومية",
      icon: "BookOpen",
      themeColor: "#3B82F6",
      author: { name: "فريق التقنية" },
      coverImage: "/images/tech-cover.jpg",
      isFeatured: true,
      isPublished: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-12-15T10:00:00.000Z",
      articlesCount: 15,
      totalViews: 0,
    },
    {
      id: "2",
      title: "تحليل اقتصادي",
      slug: "economic-analysis",
      description:
        "تحليلات اقتصادية عميقة للأسواق العربية والعالمية والاتجاهات المالية الحديثة",
      icon: "BookOpen",
      themeColor: "#10B981",
      author: { name: "فريق الاقتصاد" },
      coverImage: "/images/economy-cover.jpg",
      isFeatured: false,
      isPublished: true,
      createdAt: "2024-01-02T00:00:00.000Z",
      updatedAt: "2024-12-14T14:30:00.000Z",
      articlesCount: 8,
      totalViews: 0,
    },
    {
      id: "3",
      title: "فكر معاصر",
      slug: "contemporary-thought",
      description:
        "رؤى وأفكار معاصرة في مختلف جوانب الحياة الثقافية والاجتماعية والفلسفية",
      icon: "BookOpen",
      themeColor: "#8B5CF6",
      author: { name: "فريق الفكر" },
      coverImage: "/images/thought-cover.jpg",
      isFeatured: true,
      isPublished: true,
      createdAt: "2024-01-03T00:00:00.000Z",
      updatedAt: "2024-12-13T09:15:00.000Z",
      articlesCount: 12,
      totalViews: 0,
    },
    {
      id: "4",
      title: "علوم وبحوث",
      slug: "science-research",
      description: "أحدث الاكتشافات العلمية والبحوث الأكاديمية باللغة العربية",
      icon: "BookOpen",
      themeColor: "#F59E0B",
      author: { name: "فريق العلوم" },
      coverImage: "/images/science-cover.jpg",
      isFeatured: false,
      isPublished: true,
      createdAt: "2024-01-04T00:00:00.000Z",
      updatedAt: "2024-12-12T16:45:00.000Z",
      articlesCount: 6,
      totalViews: 0,
    },
    {
      id: "5",
      title: "ثقافة وفنون",
      slug: "culture-arts",
      description: "استكشاف للمشهد الثقافي والفني العربي والعالمي المعاصر",
      icon: "BookOpen",
      themeColor: "#EF4444",
      author: { name: "فريق الثقافة" },
      coverImage: "/images/culture-cover.jpg",
      isFeatured: false,
      isPublished: true,
      createdAt: "2024-01-05T00:00:00.000Z",
      updatedAt: "2024-12-11T11:20:00.000Z",
      articlesCount: 9,
      totalViews: 0,
    },
  ],
  count: 5,
  cached: true,
  timestamp: new Date().toISOString(),
  fastMode: true,
};

export async function GET(request: NextRequest) {
  // 🚀 استجابة فورية
  const response = NextResponse.json(fastAnglesResponse);
  response.headers.set(
    "Cache-Control",
    "public, max-age=180, stale-while-revalidate=600"
  );
  return response;
}
