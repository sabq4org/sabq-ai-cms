import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireContentEditPermission, createPermissionErrorResponse } from '@/lib/auth/content-permissions';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  // التحقق من صلاحيات الوصول للمراسلين
  const authResult = requireContentEditPermission(request);
  if ('error' in authResult) {
    const errorResponse = createPermissionErrorResponse(authResult);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
  
  console.log(`👤 المستخدم ${authResult.email} (${authResult.role}) يطلب قائمة المراسلين`);
  
  // التحقق من صلاحية عرض المراسلين
  if (!authResult.canViewReporters) {
    return NextResponse.json(
      createPermissionErrorResponse({
        error: 'ليس لديك صلاحية عرض قائمة المراسلين',
        code: 'INSUFFICIENT_PERMISSIONS'
      }),
      { status: 403 }
    );
  }
  try {
    console.log('📊 جلب قائمة المراسلين من قاعدة البيانات...');
    
    // استخراج المعاملات من URL
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const active_only = searchParams.get('active_only');
    
    // بناء شروط البحث - المراسلين النشطين فقط
    const whereClause: any = {
      is_active: true
    };
    
    if (active_only === 'true') {
      // فلترة إضافية إذا طُلبت
      whereClause.is_active = true;
    }
    
    // بناء معاملات الاستعلام
    const queryOptions: any = {
      where: whereClause,
      orderBy: [
        { full_name: 'asc' },
        { created_at: 'desc' }
      ],
      select: {
        id: true,
        user_id: true,
        full_name: true,
        slug: true,
        title: true,
        avatar_url: true,
        is_verified: true,
        verification_badge: true,
        is_active: true,
        total_articles: true,
        created_at: true
      }
    };
    
    if (limit) {
      queryOptions.take = parseInt(limit);
      console.log(`📏 الحد الأقصى: ${limit}`);
    }
    
    // جلب المراسلين من جدول reporters
    const reporters = await prisma.reporters.findMany(queryOptions);
    
    console.log(`✅ تم جلب ${reporters.length} مراسل من قاعدة البيانات`);
    
    // تحويل البيانات لتتوافق مع واجهة البرمجة المطلوبة
    const formattedReporters = reporters.map((reporter) => ({
      id: reporter.id,
      full_name: reporter.full_name,
      slug: reporter.slug,
      title: reporter.title,
      avatar_url: reporter.avatar_url, // ستكون null بعد تطهير البيانات الوهمية
      is_verified: reporter.is_verified,
      verification_badge: reporter.verification_badge,
      is_active: reporter.is_active,
      total_articles: reporter.total_articles || 0,
      profileUrl: `/reporter/${reporter.slug}`
    }));
    
    // إضافة إحصائيات سريعة
    const totalReporters = reporters.length;
    const verifiedReporters = reporters.filter(r => r.is_verified).length;
    const reportersWithArticles = reporters.filter(r => (r.total_articles || 0) > 0).length;
    
    console.log(`📊 إحصائيات المراسلين: إجمالي ${totalReporters}، معتمد ${verifiedReporters}، لديهم مقالات ${reportersWithArticles}`);
    
    return NextResponse.json({
      success: true,
      reporters: formattedReporters,
      data: formattedReporters, // للتوافق
      total: totalReporters,
      stats: {
        total: totalReporters,
        verified: verifiedReporters,
        with_articles: reportersWithArticles
      }
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في جلب قائمة المراسلين:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في جلب قائمة المراسلين',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 إنشاء مراسل جديد...');
    
    const body = await request.json();
    const { 
      user_id, 
      full_name, 
      title, 
      bio, 
      specializations = [], 
      coverage_areas = [] 
    } = body;
    
    // التحقق من البيانات المطلوبة
    if (!user_id || !full_name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'معرف المستخدم والاسم الكامل مطلوبان' 
        },
        { status: 400 }
      );
    }
    
    // التحقق من عدم وجود مراسل بنفس user_id
    const existingReporter = await prisma.reporters.findFirst({
      where: { user_id: user_id }
    });
    
    if (existingReporter) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'يوجد مراسل مرتبط بهذا المستخدم بالفعل' 
        },
        { status: 409 }
      );
    }
    
    // إنشاء slug فريد
    const baseSlug = full_name
      .toLowerCase()
      .replace(/[أإآء]/g, 'ا')
      .replace(/[ة]/g, 'ه')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]/g, '');
    
    const slug = `${baseSlug}-${Date.now()}`;
    
    // إنشاء المراسل الجديد
    const newReporter = await prisma.reporters.create({
      data: {
        id: `reporter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: user_id,
        full_name: full_name,
        slug: slug,
        title: title || 'مراسل صحفي',
        bio: bio || null,
        avatar_url: null, // لا صور وهمية حسب السياسة الجديدة
        specializations: specializations,
        coverage_areas: coverage_areas,
        is_verified: false,
        verification_badge: null,
        is_active: true,
        total_articles: 0,
        total_views: 0,
        total_likes: 0,
        total_shares: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      select: {
        id: true,
        full_name: true,
        slug: true,
        title: true,
        is_active: true
      }
    });
    
    console.log(`✅ تم إنشاء مراسل جديد: ${newReporter.full_name} (${newReporter.slug})`);
    
    return NextResponse.json({
      success: true,
      reporter: newReporter,
      message: 'تم إنشاء المراسل بنجاح'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ خطأ في إنشاء المراسل:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في إنشاء المراسل',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}