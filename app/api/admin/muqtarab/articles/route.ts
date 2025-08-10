import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
// import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET: جلب جميع المقالات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // draft, published, archived, all
    const corner_id = searchParams.get('corner_id');
    const sentiment = searchParams.get('sentiment');
    
    const skip = (page - 1) * limit;
    
    // بناء شرط البحث
    let whereClause = 'TRUE';
    
    if (search) {
      whereClause += ` AND (ma.title ILIKE '%${search}%' OR ma.author_name ILIKE '%${search}%' OR ma.excerpt ILIKE '%${search}%')`;
    }
    
    if (status && status !== 'all') {
      whereClause += ` AND ma.status = '${status}'`;
    }
    
    if (corner_id) {
      whereClause += ` AND ma.corner_id = '${corner_id}'`;
    }
    
    if (sentiment && sentiment !== 'all') {
      whereClause += ` AND ma.ai_sentiment = '${sentiment}'`;
    }
    
    // جلب المقالات مع العد
    const [articles, totalCount] = await Promise.all([
      prisma.$queryRaw`
        SELECT 
          ma.*,
          mc.name as corner_name,
          mc.slug as corner_slug,
          u.name as creator_name,
          (SELECT COUNT(*) FROM muqtarab_interactions mi WHERE mi.article_id = ma.id AND mi.interaction_type = 'like') as likes_count,
          (SELECT COUNT(*) FROM muqtarab_interactions mi WHERE mi.article_id = ma.id AND mi.interaction_type = 'share') as shares_count,
          (SELECT COUNT(*) FROM muqtarab_comments mcom WHERE mcom.article_id = ma.id AND mcom.is_approved = true) as comments_count
        FROM muqtarab_articles ma
        LEFT JOIN muqtarab_corners mc ON ma.corner_id = mc.id
        LEFT JOIN users u ON ma.created_by = u.id
        WHERE ${whereClause}
        ORDER BY ma.created_at DESC
        LIMIT ${limit} OFFSET ${skip};
      `,
      prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM muqtarab_articles ma
        WHERE ${whereClause};
      `
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        articles,
        pagination: {
          page,
          limit,
          total: Number((totalCount as any)[0].count),
          pages: Math.ceil(Number((totalCount as any)[0].count) / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('خطأ في جلب المقالات:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب المقالات' },
      { status: 500 }
    );
  }
}

// POST: إنشاء مقال جديد
export async function POST(request: NextRequest) {
  try {
    // TODO: إضافة نظام التحقق من الصلاحيات لاحقاً
    
    const body = await request.json();
    const {
      corner_id,
      title,
      // slug, // تجاهل أي slug يُرسل من العميل - سنولده داخلياً
      content,
      excerpt,
      cover_image,
      author_name,
      author_bio,
      author_avatar,
      tags = [],
      is_featured = false,
      read_time,
      publish_at,
      status = 'draft',
      ai_sentiment,
      ai_compatibility_score = 0,
      ai_summary,
      ai_keywords = [],
      ai_mood
    } = body;
    
    // التحقق من البيانات المطلوبة
    if (!corner_id || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'البيانات الأساسية مطلوبة (الزاوية، العنوان، المحتوى)' },
        { status: 400 }
      );
    }
    
    // التحقق من وجود الزاوية
    const cornerExists = await prisma.$queryRaw`
      SELECT id FROM muqtarab_corners WHERE id = ${corner_id} AND is_active = true;
    `;
    
    if (!(cornerExists as any[]).length) {
      return NextResponse.json(
        { success: false, error: 'الزاوية غير موجودة أو غير نشطة' },
        { status: 400 }
      );
    }
    
    // توليد slug قصير وعشوائي، مع التأكد من الفرادة
    let shortSlug = nanoid(8);
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.$queryRaw`SELECT id FROM muqtarab_articles WHERE slug = ${shortSlug};`;
      if (!(exists as any[]).length) break;
      shortSlug = nanoid(9);
    }
    
    // حساب وقت القراءة تلقائياً إذا لم يتم تحديده
    const calculatedReadTime = read_time || Math.ceil(content.length / 1000); // تقدير: 1000 حرف = دقيقة واحدة
    
    // إنشاء المقال الجديد
    const newArticle = await prisma.$queryRaw`
      INSERT INTO muqtarab_articles (
        corner_id, title, slug, content, excerpt, cover_image,
        author_name, author_bio, author_avatar, tags, is_featured,
        read_time, publish_at, status, ai_sentiment, ai_compatibility_score,
        ai_summary, ai_keywords, ai_mood, created_by
      ) VALUES (
        ${corner_id}, ${title}, ${shortSlug}, ${content}, ${excerpt || null}, ${cover_image || null},
        ${author_name || null}, ${author_bio || null}, ${author_avatar || null}, 
        ${JSON.stringify(tags)}, ${is_featured},         ${calculatedReadTime}, 
        ${publish_at || null}, ${status}, ${ai_sentiment || null}, ${ai_compatibility_score},
        ${ai_summary || null}, ${JSON.stringify(ai_keywords)}, ${ai_mood || null}, ${null}
      ) RETURNING *;
    `;
    
    return NextResponse.json({
      success: true,
      message: 'تم إنشاء المقال بنجاح',
      data: newArticle
    });
    
  } catch (error) {
    console.error('خطأ في إنشاء المقال:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في إنشاء المقال' },
      { status: 500 }
    );
  }
}