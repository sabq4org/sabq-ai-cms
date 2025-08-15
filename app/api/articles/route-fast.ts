import prisma from "@/lib/prisma";
import { ensureUniqueSlug, resolveContentType } from "@/lib/slug";
import { NextRequest, NextResponse } from "next/server";

// دالة إنشاء ID بسيط
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// دالة POST محسنة للنشر السريع
export async function POST_FAST(request: NextRequest) {
  console.log("🚀 POST /api/articles - بداية معالجة الطلب السريع");
  
  try {
    // تحليل البيانات
    const data = await request.json();
    console.log("📝 البيانات المستلمة:", { title: data.title, status: data.status });

    // التحقق من البيانات الأساسية بسرعة
    if (!data.title?.trim() || !data.content) {
      return NextResponse.json(
        { ok: false, message: "العنوان والمحتوى مطلوبان", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // معالجة المحتوى بسرعة
    let content = data.content;
    if (typeof content === 'object' && content !== null) {
      content = content.html || JSON.stringify(content);
    }
    content = String(content);

    // توليد slug سريع
    const slug = await ensureUniqueSlug(prisma as any);
    
    // إعداد البيانات بشكل مبسط
    const articleData = {
      id: generateId(),
      title: data.title,
      slug: slug,
      content: content,
      excerpt: data.excerpt || null,
      category_id: data.category_id || data.categoryId,
      author_id: data.author_id || data.authorId,
      status: data.status === "published" ? "published" : "draft",
      featured: Boolean(data.featured || data.is_featured),
      breaking: Boolean(data.breaking || data.is_breaking),
      featured_image: data.featured_image || null,
      article_type: data.article_type || "news",
      content_type: resolveContentType(data.article_type) as any,
      published_at: data.status === "published" ? new Date() : null,
      created_at: new Date(),
      updated_at: new Date(),
      metadata: data.metadata || {},
    };

    console.log("⚡ إنشاء المقال بسرعة...");
    
    // إنشاء المقال مباشرة بدون include معقد
    const article = await prisma.articles.create({
      data: articleData,
    });

    console.log("✅ تم إنشاء المقال بنجاح:", article.id);

    // إرسال تحليل القصة في الخلفية (لا ننتظر)
    if (typeof window === 'undefined') {
      setImmediate(() => {
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/stories/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: article.title,
            content: article.content,
            source: "article-created",
            meta: { articleId: article.id }
          }),
        }).catch(() => {}); // تجاهل الأخطاء
      });
    }

    return NextResponse.json(
      {
        ok: true,
        message: article.status === "published" ? "تم نشر المقال بنجاح" : "تم حفظ المسودة بنجاح",
        data: {
          id: article.id,
          slug: article.slug,
          title: article.title,
          status: article.status
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("❌ خطأ في إنشاء المقال:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "حدث خطأ أثناء إنشاء المقال",
        code: "SERVER_ERROR",
        details: error.message
      },
      { status: 500 }
    );
  }
}
