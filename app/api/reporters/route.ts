import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// جلب قائمة المراسلين
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search') || '';
    const specialization = searchParams.get('specialization') || 'all';
    const isVerified = searchParams.get('verified') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sort') || 'total_articles';
    const sortOrder = searchParams.get('order') || 'desc';

    // بناء شروط البحث
    const whereConditions: any = {
      is_active: true
    };

    // البحث في الاسم أو النبذة
    if (search) {
      whereConditions.OR = [
        {
          full_name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          bio: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // تصفية المراسلين المعتمدين
    if (isVerified) {
      whereConditions.is_verified = true;
    }

    // بناء ترتيب النتائج
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // جلب المراسلين
    const reporters = await prisma.reporters.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            email: true,
            name: true,
            role: true,
            created_at: true
          }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    });

    // عد إجمالي المراسلين
    const totalReporters = await prisma.reporters.count({
      where: whereConditions
    });

    // تنسيق البيانات
    const formattedReporters = reporters.map(reporter => ({
      ...reporter,
      specializations: reporter.specializations ? JSON.parse(reporter.specializations as string) : [],
      coverage_areas: reporter.coverage_areas ? JSON.parse(reporter.coverage_areas as string) : [],
      languages: reporter.languages ? JSON.parse(reporter.languages as string) : ['ar'],
      popular_topics: reporter.popular_topics ? JSON.parse(reporter.popular_topics as string) : []
    }));

    // فلترة حسب التخصص إذا تم تحديده
    let filteredReporters = formattedReporters;
    if (specialization !== 'all') {
      filteredReporters = formattedReporters.filter(reporter => 
        reporter.specializations.includes(specialization)
      );
    }

    // جلب إحصائيات عامة
    const stats = await getReportersStats();

    return NextResponse.json({
      success: true,
      reporters: filteredReporters,
      pagination: {
        total: specialization !== 'all' ? filteredReporters.length : totalReporters,
        limit,
        offset,
        hasMore: offset + limit < (specialization !== 'all' ? filteredReporters.length : totalReporters)
      },
      stats
    });

  } catch (error) {
    console.error('خطأ في جلب قائمة المراسلين:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// إنشاء مراسل جديد
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // التحقق من الحقول المطلوبة
    if (!data.user_id || !data.full_name || !data.slug) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة مفقودة' },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود slug مكرر
    const existingReporter = await prisma.reporters.findUnique({
      where: { slug: data.slug }
    });

    if (existingReporter) {
      return NextResponse.json(
        { error: 'هذا المعرف مستخدم بالفعل' },
        { status: 400 }
      );
    }

    // التحقق من وجود المستخدم
    const user = await prisma.users.findUnique({
      where: { id: data.user_id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود بروفايل مراسل للمستخدم
    const existingProfile = await prisma.reporters.findUnique({
      where: { user_id: data.user_id }
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: 'يوجد بروفايل مراسل لهذا المستخدم بالفعل' },
        { status: 400 }
      );
    }

    // إنشاء بروفايل المراسل
    const newReporter = await prisma.reporters.create({
      data: {
        user_id: data.user_id,
        full_name: data.full_name,
        slug: data.slug,
        title: data.title || null,
        bio: data.bio || null,
        avatar_url: data.avatar_url || null,
        is_verified: data.is_verified || false,
        verification_badge: data.verification_badge || 'verified',
        specializations: data.specializations ? JSON.stringify(data.specializations) : null,
        coverage_areas: data.coverage_areas ? JSON.stringify(data.coverage_areas) : null,
        languages: data.languages ? JSON.stringify(data.languages) : JSON.stringify(['ar']),
        twitter_url: data.twitter_url || null,
        linkedin_url: data.linkedin_url || null,
        website_url: data.website_url || null,
        email_public: data.email_public || null,
        show_stats: data.show_stats ?? true,
        show_contact: data.show_contact ?? false
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      reporter: newReporter,
      message: 'تم إنشاء بروفايل المراسل بنجاح'
    });

  } catch (error) {
    console.error('خطأ في إنشاء بروفايل المراسل:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// دالة مساعدة لجلب إحصائيات المراسلين
async function getReportersStats() {
  try {
    const totalReporters = await prisma.reporters.count({
      where: { is_active: true }
    });

    const verifiedReporters = await prisma.reporters.count({
      where: { 
        is_active: true,
        is_verified: true 
      }
    });

    const totalArticles = await prisma.reporters.aggregate({
      where: { is_active: true },
      _sum: {
        total_articles: true
      }
    });

    const totalViews = await prisma.reporters.aggregate({
      where: { is_active: true },
      _sum: {
        total_views: true
      }
    });

    // أكثر التخصصات شيوعاً
    const allReporters = await prisma.reporters.findMany({
      where: { 
        is_active: true,
        specializations: {
          not: null
        }
      },
      select: {
        specializations: true
      }
    });

    const specializationCounts: Record<string, number> = {};
    allReporters.forEach(reporter => {
      if (reporter.specializations) {
        const specs = JSON.parse(reporter.specializations as string);
        specs.forEach((spec: string) => {
          specializationCounts[spec] = (specializationCounts[spec] || 0) + 1;
        });
      }
    });

    const topSpecializations = Object.entries(specializationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      totalReporters,
      verifiedReporters,
      totalArticles: totalArticles._sum.total_articles || 0,
      totalViews: totalViews._sum.total_views || 0,
      topSpecializations
    };

  } catch (error) {
    console.error('خطأ في جلب إحصائيات المراسلين:', error);
    return {
      totalReporters: 0,
      verifiedReporters: 0,
      totalArticles: 0,
      totalViews: 0,
      topSpecializations: []
    };
  }
}
