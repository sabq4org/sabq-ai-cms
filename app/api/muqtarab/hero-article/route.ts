import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [Hero Article] جاري جلب المقال المميز...");

    // جلب أول مقالة منشورة من زاوية "تقنية AI"
    const heroArticleQuery = `
      SELECT
        aa.*,
        a.title as angle_title,
        a.slug as angle_slug,
        a.icon as angle_icon,
        a.theme_color as angle_theme_color,
        u.name as author_name,
        u.avatar as author_avatar
      FROM angle_articles aa
      LEFT JOIN angles a ON aa.angle_id = a.id
      LEFT JOIN users u ON aa.author_id = u.id
      WHERE a.slug = $1
        AND a.is_published = true
        AND aa.is_published = true
      ORDER BY aa.publish_date DESC, aa.created_at DESC
      LIMIT 1
    `;

    const result = (await prisma.$queryRaw`
      SELECT
        aa.*,
        a.title as angle_title,
        a.slug as angle_slug,
        a.icon as angle_icon,
        a.theme_color as angle_theme_color,
        u.name as author_name,
        u.avatar as author_avatar
      FROM angle_articles aa
      LEFT JOIN angles a ON aa.angle_id = a.id
      LEFT JOIN users u ON aa.author_id = u.id
      WHERE a.slug = 'تقنية-ai'
        AND a.is_published = true
        AND aa.is_published = true
      ORDER BY aa.publish_date DESC, aa.created_at DESC
      LIMIT 1
    `) as any[];

    if (result.length === 0) {
      console.log("❌ [Hero Article] لم يتم العثور على مقالات منشورة");
      return NextResponse.json({
        success: false,
        message: "لا توجد مقالات منشورة في زاوية تقنية AI",
      });
    }

    const article = result[0];

    // تحليل النتيجة وحساب AI Score (محاكاة)
    const aiScore = calculateAIScore(article.title, article.content);

    // تنسيق البيانات
    const heroArticle = {
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      slug: article.id, // استخدام ID كـ slug لأن العمود slug غير موجود في جدول angle_articles
      coverImage: article.cover_image,
      readingTime: article.reading_time || 5,
      publishDate: article.publish_date,
      views: article.views || 0,
      tags: Array.isArray(article.tags) ? article.tags : [],
      aiScore: aiScore,
      angle: {
        title: article.angle_title,
        slug: article.angle_slug,
        icon: article.angle_icon,
        themeColor: article.angle_theme_color,
      },
      author: {
        name: article.author_name || "كاتب مجهول",
        avatar: article.author_avatar,
      },
    };

    console.log("✅ [Hero Article] تم جلب المقال المميز:", heroArticle.title);

    return NextResponse.json({
      success: true,
      heroArticle,
    });
  } catch (error) {
    console.error("❌ [Hero Article] خطأ في جلب المقال المميز:", error);
    return NextResponse.json(
      { success: false, error: "خطأ في جلب المقال المميز" },
      { status: 500 }
    );
  }
}

// دالة محاكاة حساب AI Score
function calculateAIScore(title: string, content: string): number {
  // محاكاة بسيطة لحساب درجة الذكاء الاصطناعي
  let score = 50; // القاعدة

  // كلمات مفتاحية تدل على محتوى تقني متقدم
  const aiKeywords = [
    "ذكاء اصطناعي",
    "خوارزمية",
    "تعلم آلة",
    "شبكة عصبية",
    "GPT",
    "AI",
    "Machine Learning",
    "Deep Learning",
    "إبداع",
    "ابتكار",
    "تقنية",
    "برمجة",
  ];

  const fullText = (title + " " + (content || "")).toLowerCase();

  aiKeywords.forEach((keyword) => {
    if (fullText.includes(keyword.toLowerCase())) {
      score += 8;
    }
  });

  // تحليل طول المحتوى (المحتوى الأطول = تحليل أعمق)
  const contentLength = (content || "").length;
  if (contentLength > 1000) score += 15;
  else if (contentLength > 500) score += 10;
  else if (contentLength > 200) score += 5;

  // تحليل تعقيد العنوان
  if (title.includes("؟")) score += 5; // سؤال فلسفي
  if (title.includes(":")) score += 3; // عنوان مركب

  return Math.min(100, Math.max(20, score));
}
