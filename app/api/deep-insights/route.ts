import { NextRequest, NextResponse } from 'next/server';

// بيانات تجريبية للتحليلات العميقة
const mockDeepInsights = [
  {
    id: "deep-001",
    title: "الذكاء الاصطناعي والمستقبل الاقتصادي للمملكة: رؤية شاملة للتحول التقني",
    summary: "تحليل معمق لدور الذكاء الاصطناعي في تحقيق رؤية 2030، وكيف تستفيد المملكة لتستفيد من هذه التقنية لبناء اقتصاد رقمي متطور",
    author: "الذكاء الاصطناعي",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // قبل 12 ساعة
    readTime: 12,
    views: 15420,
    aiConfidence: 94,
    tags: ["الاقتصاد الرقمي", "رؤية 2030"],
    type: "AI",
    url: "/insights/deep/deep-001"
  },
  {
    id: "deep-002",
    title: "جيوسياسية الطاقة في 2024: كيف تعيد السعودية تشكيل خريطة النفط العالمية",
    summary: "دراسة تحليلية لاستراتيجية المملكة في أسواق الطاقة العالمية، والتحولات الجيوسياسية الناشئة عن السياسات السعودية الجديدة",
    author: "الطاقة",
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // قبل يوم ونصف
    readTime: 10,
    views: 12840,
    aiConfidence: 0,
    tags: ["النفط", "الطاقة"],
    type: "تحرير بشري",
    url: "/insights/deep/deep-002"
  },
  {
    id: "deep-003",
    title: "مستقبل التعليم في عصر الرقمنة: التجربة السعودية كنموذج عالمي",
    summary: "تحليل شامل للتحول الرقمي في قطاع التعليم السعودي وتأثيره على جودة التعليم ومخرجاته، مع مقارنات دولية ودروس مستفادة",
    author: "التعليم الرقمي",
    createdAt: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(), // قبل يومين ونصف
    readTime: 8,
    views: 9650,
    aiConfidence: 0,
    tags: ["التعليم الرقمي", "التحول الرقمي"],
    type: "تحرير بشري",
    url: "/insights/deep/deep-003"
  },
  {
    id: "deep-004",
    title: "السياحة المستدامة في السعودية: رؤية جديدة للسفر المسؤول",
    summary: "تحليل شامل لمشاريع السياحة المستدامة في المملكة وكيفية تحقيق التوازن بين النمو السياحي والحفاظ على البيئة والتراث",
    author: "فريق الذكاء الصحفي",
    createdAt: "2025-06-17T16:45:00Z",
    readTime: 9,
    views: 4230,
    aiConfidence: 92,
    tags: ["السياحة المستدامة", "البيئة", "نيوم"],
    type: "AI",
    url: "/insights/deep/deep-004"
  },
  {
    id: "deep-005",
    title: "الأمن السيبراني في عصر التحول الرقمي: التحديات والحلول",
    summary: "دراسة تحليلية للتهديدات السيبرانية المتزايدة وأفضل الممارسات لحماية البنية التحتية الرقمية في المملكة",
    author: "م. خالد الأمني",
    createdAt: "2025-06-16T11:20:00Z",
    readTime: 15,
    views: 3560,
    aiConfidence: 0,
    tags: ["الأمن السيبراني", "الحماية الرقمية", "التقنية"],
    type: "تحرير بشري",
    url: "/insights/deep/deep-005"
  }
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '3');
    const sort = searchParams.get('sort') || 'desc';

    let insights = [...mockDeepInsights];

    // الترتيب
    if (sort === 'desc') {
      insights.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'views') {
      insights.sort((a, b) => b.views - a.views);
    }

    // تحديد العدد
    insights = insights.slice(0, limit);

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error fetching deep insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deep insights' },
      { status: 500 }
    );
  }
} 