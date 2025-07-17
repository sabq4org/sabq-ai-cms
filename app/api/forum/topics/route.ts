import { NextRequest, NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';











// GET: جلب قائمة المواضيع
export async function GET(request: NextRequest) {
  try {
    console.log('Starting GET /api/forum/topics');
    
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'latest';

    const offset = (page - 1) * limit;

    // بناء الاستعلام الأساسي
    let whereClause = "WHERE t.status = 'active'";
    const params: any[] = [];

    // فلترة حسب الفئة
    if (category && category !== 'all') {
      whereClause += " AND c.slug = $" + (params.length + 1);
      params.push(category);
      console.log('Filtering by category slug:', category);
    }

    // الترتيب
    let orderBy = "";
    switch (sort) {
      case 'popular':
        orderBy = "ORDER BY like_count DESC, t.created_at DESC";
        break;
      case 'views':
        orderBy = "ORDER BY t.views DESC, t.created_at DESC";
        break;
      default:
        orderBy = "ORDER BY t.is_pinned DESC, COALESCE(t.last_reply_at, t.created_at) DESC";
    }

    console.log('Executing query with params:', params);

    // جلب المواضيع من قاعدة البيانات - استعلام مبسط
    const topics = await prisma.$queryRawUnsafe(`
      SELECT 
        t.id,
        t.title,
        t.content,
        t.views,
        t.is_pinned,
        t.is_locked,
        t.is_featured,
        t.created_at,
        t.last_reply_at,
        t.category_id,
        t.author_id,
        c.name_ar as category_name,
        c.slug as category_slug,
        c.color as category_color
      FROM forum_topics t
      JOIN forum_categories c ON t.category_id = c.id
      ${whereClause}
      ${orderBy}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, ...params, limit, offset);

    console.log('Found topics:', (topics as any[]).length);

    // جلب معلومات المؤلفين بشكل منفصل
    const authorIds = [...new Set((topics as any[]).map(t => t.author_id))];
    console.log('Author IDs to fetch:', authorIds);
    
    const authors = authorIds.length > 0 ? await prisma.$queryRawUnsafe(`
      SELECT id, name, email FROM users WHERE id IN (${authorIds.map((_, i) => '$' + (i + 1)).join(',')})
    `, ...authorIds) : [];
    
    console.log('Found authors:', authors);

    const authorsMap = new Map((authors as any[]).map(a => [a.id, a]));

    // جلب عدد الردود بشكل منفصل
    const topicIds = (topics as any[]).map(t => t.id);
    const replyCounts = topicIds.length > 0 ? await prisma.$queryRawUnsafe(`
      SELECT topic_id, COUNT(*) as count 
      FROM forum_replies 
      WHERE topic_id IN (${topicIds.map((_, i) => '$' + (i + 1)).join(',')}) AND status = 'active'
      GROUP BY topic_id
    `, ...topicIds) : [];

    const replyCountsMap = new Map((replyCounts as any[]).map(r => [r.topic_id, Number(r.count)]));

    // جلب عدد الإعجابات بشكل منفصل
    const likeCounts = topicIds.length > 0 ? await prisma.$queryRawUnsafe(`
      SELECT target_id, COUNT(*) as count 
      FROM forum_votes 
      WHERE target_id IN (${topicIds.map((_, i) => '$' + (i + 1)).join(',')}) AND target_type = 'topic' AND vote_type = 'like'
      GROUP BY target_id
    `, ...topicIds) : [];

    const likeCountsMap = new Map((likeCounts as any[]).map(l => [l.target_id, Number(l.count)]));

    // جلب العدد الإجمالي
    const countResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total
      FROM forum_topics t
      ${whereClause.replace('c.', '')}
    `, ...params.filter((_, i) => i === 0 ? category : false));
    
    const total = Number((countResult as any)[0]?.total || 0);
    console.log('Total topics:', total);

    // تنسيق البيانات
    const formattedTopics = (topics as any[]).map(topic => {
      const author = authorsMap.get(topic.author_id) || { id: topic.author_id, name: 'مستخدم مجهول', email: '' };
      
      return {
        id: topic.id,
        title: topic.title,
        content: topic.content,
        views: Number(topic.views),
        is_pinned: Boolean(topic.is_pinned),
        is_locked: Boolean(topic.is_locked),
        is_featured: Boolean(topic.is_featured),
        created_at: topic.created_at,
        last_reply_at: topic.last_reply_at,
        category: {
          id: topic.category_id,
          name: topic.category_name,
          slug: topic.category_slug,
          color: topic.category_color
        },
        author: {
          id: author.id,
          name: author.name,
          avatar: `/images/authors/default-avatar.jpg`
        },
        replies: replyCountsMap.get(topic.id) || 0,
        likes: likeCountsMap.get(topic.id) || 0,
        lastReply: topic.last_reply_at 
          ? getRelativeTime(new Date(topic.last_reply_at))
          : getRelativeTime(new Date(topic.created_at))
      };
    });

    return NextResponse.json({
      topics: formattedTopics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ في جلب المواضيع',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// POST: إنشاء موضوع جديد
export async function POST(request: NextRequest) {
  try {
    console.log('Starting POST /api/forum/topics');
    
    // التحقق من تسجيل الدخول
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    
    if (!authToken) {
      console.log('No auth token found');
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول لإنشاء موضوع' },
        { status: 401 }
      );
    }
    
    // التحقق من صحة التوكن
    let user: any;
    try {
      const jwt = require('jsonwebtoken');
      user = jwt.verify(authToken, process.env.JWT_SECRET || 'default-secret');
      
      if (!user.emailVerified) {
        return NextResponse.json(
          { error: 'يجب تفعيل البريد الإلكتروني أولاً' },
          { status: 403 }
        );
      }
    } catch (error) {
      console.log('Invalid auth token');
      return NextResponse.json(
        { error: 'جلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { title, content, category_id } = body;

    // التحقق من البيانات
    if (!title || !content || !category_id) {
      console.log('Missing required fields:', { title: !!title, content: !!content, category_id: !!category_id });
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من طول البيانات
    if (title.trim().length < 5) {
      return NextResponse.json(
        { error: 'عنوان الموضوع يجب أن يكون أكثر من 5 أحرف' },
        { status: 400 }
      );
    }

    if (content.trim().length < 10) {
      return NextResponse.json(
        { error: 'محتوى الموضوع يجب أن يكون أكثر من 10 أحرف' },
        { status: 400 }
      );
    }

    // التحقق من وجود الفئة
    console.log('Checking category existence:', category_id);
    const categoryCheck = await prisma.$queryRawUnsafe(`
      SELECT id FROM forum_categories WHERE id = $1 AND is_active = true
    `, category_id);
    
    if (!categoryCheck || (categoryCheck as any[]).length === 0) {
      console.log('Category not found or inactive:', category_id);
      return NextResponse.json(
        { error: 'الفئة المحددة غير موجودة أو غير مفعلة' },
        { status: 400 }
      );
    }

    // إنشاء الموضوع في قاعدة البيانات
    const topicId = crypto.randomUUID();
    
    // استخدام معلومات المستخدم من التوكن
    const userId = user.id;
    const userName = user.name;
    
    console.log('Creating topic with ID:', topicId);
    
    try {
      // التحقق من وجود جدول users وإنشاء مستخدم مؤقت إذا لزم الأمر
      const userCheck = await prisma.$queryRawUnsafe(`
              SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as exists
      `);
      
      const userTableExists = (userCheck as any[])[0]?.exists;
      
      if (userTableExists) {
        // التحقق من وجود المستخدم المؤقت
        const existingUser = await prisma.$queryRawUnsafe(`
          SELECT id FROM users WHERE id = $1
        `, userId);
        
        if (!existingUser || (existingUser as any[]).length === 0) {
          // إنشاء مستخدم مؤقت
          await prisma.$executeRawUnsafe(`
            INSERT INTO users (id, name, email, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `, userId, userName, `${userId}@sabq.org`);
        } else {
          // تحديث اسم المستخدم إذا تغير
          await prisma.$executeRawUnsafe(`
            UPDATE users SET name = $2, updated_at = NOW() WHERE id = $1
          `, userId, userName);
        }
      }
    } catch (userError) {
      console.log('User table might not exist, continuing without user check:', userError);
    }
    
    // إنشاء الموضوع
    await prisma.$executeRawUnsafe(`
      INSERT INTO forum_topics (id, title, content, category_id, author_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    `, topicId, title.trim(), content.trim(), category_id, userId);

    console.log('Topic created successfully');

    // إضافة نقاط السمعة (اختياري)
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO forum_reputation (id, user_id, points, action_type, target_type, target_id, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, crypto.randomUUID(), userId, 10, 'topic_created', 'topic', topicId, 'إنشاء موضوع جديد');
      console.log('Reputation points added');
    } catch (repError) {
      console.log('Could not add reputation points:', repError);
      // لا نريد فشل العملية بسبب نقاط السمعة
    }

    return NextResponse.json({
      id: topicId,
      message: 'تم إنشاء الموضوع بنجاح'
    });
  } catch (error: any) {
    console.error('Error creating topic:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // معالجة أخطاء قاعدة البيانات المحددة
    if (error.message?.includes('foreign key constraint')) {
      return NextResponse.json(
        { error: 'الفئة المحددة غير موجودة' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'حدث خطأ في إنشاء الموضوع',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// دالة مساعدة لحساب الوقت النسبي
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
  if (diffHours < 24) return `قبل ${diffHours} ساعة`;
  if (diffDays < 30) return `قبل ${diffDays} يوم`;
  
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    calendar: 'gregory',
    numberingSystem: 'latn'
  });
} 

  const formatDate = (date: Date) => {
    if (!date) return '';
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      calendar: 'gregory',
      numberingSystem: 'latn'
    });
  }; 