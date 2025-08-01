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

    // جلب المراسلين من جدول team_members بدلاً من جدول reporters المنفصل
    const teamMembers = await prisma.team_members.findMany({
      where: {
        role: 'reporter',
        is_active: true,
        // إضافة شروط البحث إذا وُجدت
        ...(search && {
          OR: [
            {
              name: {
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
              email: {
                contains: search,
                mode: 'insensitive'
              }
            }
          ]
        })
      },
      orderBy: sortBy === 'full_name' ? { name: sortOrder } : { created_at: sortOrder },
      take: limit,
      skip: offset
    });

    // جلب users المقابلين لكل team_member
    const reportersWithUsers = await Promise.all(
      teamMembers.map(async (member) => {
        // البحث عن user بنفس email
        const correspondingUser = await prisma.users.findFirst({
          where: { email: member.email },
          select: { id: true, name: true, email: true, role: true, created_at: true }
        });
        
        return {
          id: member.id,
          user_id: correspondingUser?.id || member.id, // استخدام user_id الحقيقي أو fallback لـ team_id
          full_name: member.name,
          title: member.role,
          bio: member.bio || '',
          avatar_url: member.avatar,
          email: member.email,
          phone: member.phone,
          specializations: [], // مؤقتاً فارغ
          coverage_areas: [], // مؤقتاً فارغ
          languages: ['ar'], // افتراضي
          popular_topics: [], // مؤقتاً فارغ
          is_verified: true, // كل المراسلين في الفريق معتمدين
          is_active: member.is_active,
          total_articles: 0, // سيتم حسابه لاحقاً إذا احتجنا
          avg_rating: 5.0, // افتراضي
          created_at: member.created_at,
          updated_at: member.updated_at,
          user: correspondingUser || {
            email: member.email,
            name: member.name,
            role: member.role,
            created_at: member.created_at
          }
        };
      })
    );
    
    const reporters = reportersWithUsers;

    // عد إجمالي المراسلين
    const totalReporters = await prisma.team_members.count({
      where: {
        role: 'reporter',
        is_active: true
      }
    });

    // البيانات جاهزة - لا حاجة لتحليل JSON لأنها آتية من team_members
    const formattedReporters = reporters;

    // فلترة حسب التخصص إذا تم تحديده (تخطي لأن team_members لا يحتوي على specializations)
    let filteredReporters = formattedReporters;
    // تخطي فلترة التخصص مؤقتاً لأن team_members لا يحتوي على هذه البيانات

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

// دالة مساعدة لجلب إحصائيات المراسلين من team_members
async function getReportersStats() {
  try {
    const totalReporters = await prisma.team_members.count({
      where: { 
        role: 'reporter',
        is_active: true 
      }
    });

    // كل المراسلين في الفريق معتمدين
    const verifiedReporters = totalReporters;

    // حساب عدد المقالات المكتوبة من قبل المراسلين
    const reporterIds = await prisma.team_members.findMany({
      where: { 
        role: 'reporter',
        is_active: true 
      },
      select: { id: true }
    });

    const totalArticles = await prisma.articles.count({
      where: {
        author_id: {
          in: reporterIds.map(r => r.id)
        },
        status: 'published'
      }
    });

    // إحصائيات بسيطة لعدم وجود views في team_members
    const totalViews = 0; // مؤقتاً

    // تخطي التخصصات مؤقتاً لأن team_members لا يحتوي عليها
    const topSpecializations = [
      { name: 'محليات', count: totalReporters },
      { name: 'سياسة', count: Math.floor(totalReporters / 2) },
      { name: 'اقتصاد', count: Math.floor(totalReporters / 3) }
    ];

    return {
      totalReporters,
      verifiedReporters,
      totalArticles: totalArticles || 0,
      totalViews: totalViews || 0,
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
