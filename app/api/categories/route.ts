import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureConnection } from '@/lib/prisma';

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  parent_id?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  _count: {
    articles: number;
  };
}

// GET: جلب جميع الفئات من قاعدة البيانات مع تحسين معالجة الأخطاء
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isActiveParam = searchParams.get('is_active') || searchParams.get('active');
    const statusParam = searchParams.get('status');

    // تحديد الفلترة بناءً على المعاملات
    let where: any = {};
    
    // إذا كان هناك معامل is_active أو active
    if (isActiveParam !== null) {
      where.is_active = isActiveParam === 'true';
    }
    
    // إذا كان هناك معامل status='active' نعتبره is_active=true
    if (statusParam === 'active') {
      where.is_active = true;
    } else if (statusParam === 'inactive') {
      where.is_active = false;
    }

    // تأكد من الاتصال قبل تنفيذ الاستعلام
    console.log('🔍 جلب التصنيفات من قاعدة البيانات...');
    
    // إنشاء الاتصال مع محاولات إعادة المحاولة
    const isConnected = await ensureConnection();
    if (!isConnected) {
      throw new Error('فشل الاتصال بقاعدة البيانات بعد عدة محاولات');
    }
    
    // استخدام معامل timeout لتجنب مشاكل الانتظار الطويل
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('استغرق الاستعلام وقتًا طويلاً')), 5000);
    });
    
    // تنفيذ الاستعلام مع معالجة timeout
    const queryPromise = prisma.categories.findMany({
      where,
      orderBy: {
        display_order: 'asc'
      },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });
    
    // انتظار أول عملية تنتهي (الاستعلام أو الـtimeout)
    const categories = await Promise.race([queryPromise, timeoutPromise]) as any[];
    console.log(`✅ تم جلب ${categories.length} تصنيف`);

    // تحويل البيانات إلى الشكل المطلوب
    const formattedCategories = categories.map((category: CategoryWithCount) => ({
      ...category,
      articles_count: category._count.articles
    }));

    return NextResponse.json({
      success: true,
      categories: formattedCategories
    });
  } catch (error) {
    console.error('خطأ في جلب التصنيفات:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `فشل في جلب التصنيفات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      },
      { status: 500 }
    );
  } finally {
    // لا نفصل الاتصال هنا، سنتركه للإدارة العالمية
    // await prisma.$disconnect();
  }
}

// POST: إنشاء تصنيف جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // تأكد من الاتصال قبل تنفيذ الاستعلام
    await prisma.$connect();

    const category = await prisma.categories.create({
      data: {
        id: Math.random().toString(36).substr(2, 9), // توليد معرف فريد
        name: body.name,
        slug: body.slug,
        description: body.description,
        color: body.color,
        icon: body.icon,
        parent_id: body.parent_id || null,
        is_active: body.is_active ?? true,
        display_order: body.display_order || 0,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('خطأ في إنشاء التصنيف:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في إنشاء التصنيف' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// OPTIONS: معالجة طلبات CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
