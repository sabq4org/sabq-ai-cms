import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json(
        { 
          success: false,
          error: 'معرف المراسل مطلوب' 
        },
        { status: 400 }
      );
    }
    
    console.log(`🔍 البحث عن المراسل بالـ slug: ${slug}`);
    
    // دالة تحويل الأسماء العربية (نفس المنطق من ReporterLink)
    function convertArabicNameToSlug(name: string): string {
      return name
        .replace(/عبدالله/g, "abdullah")
        .replace(/البرقاوي/g, "barqawi")
        .replace(/علي/g, "ali")
        .replace(/الحازمي/g, "alhazmi")
        .replace(/أحمد/g, "ahmed")
        .replace(/محمد/g, "mohammed")
        .replace(/فاطمة/g, "fatima")
        .replace(/نورا/g, "nora")
        .replace(/عمر/g, "omar")
        .replace(/النجار/g, "najjar")
        .replace(/\s+/g, "-")
        .toLowerCase()
        .replace(/[^\w\-]/g, "")
        .replace(/\-+/g, "-")
        .replace(/^-|-$/g, "");
    }
    
    // البحث عن المراسل في جدول reporters بناءً على slug
    let reporter = await prisma.reporters.findFirst({
      where: { 
        slug: slug,
        is_active: true 
      },
      select: {
        id: true,
        user_id: true,
        full_name: true,
        slug: true,
        title: true,
        bio: true,
        avatar_url: true,
        is_verified: true,
        verification_badge: true,
        specializations: true,
        coverage_areas: true,
        languages: true,
        twitter_url: true,
        linkedin_url: true,
        website_url: true,
        email_public: true,
        total_articles: true,
        total_views: true,
        total_likes: true,
        total_shares: true,
        avg_reading_time: true,
        engagement_rate: true,
        writing_style: true,
        popular_topics: true,
        publication_pattern: true,
        reader_demographics: true,
        is_active: true,
        show_stats: true,
        show_contact: true,
        created_at: true,
        updated_at: true
      }
    });
    
    // إذا لم يُعثر على المراسل، حاول البحث بالاسم العربي المُحول
    if (!reporter) {
      console.log(`⚠️ لم يُعثر على المراسل بالـ slug: ${slug}`);
      console.log(`🔄 محاولة البحث بالاسم العربي المُحول...`);
      
      // فك ترميز slug إذا كان مرمز
      const decodedSlug = decodeURIComponent(slug);
      console.log(`🔍 البحث بالاسم المفكوك: ${decodedSlug}`);
      
      // محاولة البحث بالاسم الكامل
      reporter = await prisma.reporters.findFirst({
        where: { 
          full_name: {
            contains: decodedSlug,
            mode: 'insensitive'
          },
          is_active: true 
        },
        select: {
          id: true,
          user_id: true,
          full_name: true,
          slug: true,
          title: true,
          bio: true,
          avatar_url: true,
          is_verified: true,
          verification_badge: true,
          specializations: true,
          coverage_areas: true,
          languages: true,
          twitter_url: true,
          linkedin_url: true,
          website_url: true,
          email_public: true,
          total_articles: true,
          total_views: true,
          total_likes: true,
          total_shares: true,
          avg_reading_time: true,
          engagement_rate: true,
          writing_style: true,
          popular_topics: true,
          publication_pattern: true,
          reader_demographics: true,
          is_active: true,
          show_stats: true,
          show_contact: true,
          created_at: true,
          updated_at: true
        }
      });
      
      if (!reporter) {
        // محاولة أخيرة: البحث بـ slug يبدأ بالاسم المحول
        const convertedSlug = convertArabicNameToSlug(decodedSlug);
        if (convertedSlug) {
          console.log(`🔍 البحث بالـ slug المحول: ${convertedSlug}`);
          reporter = await prisma.reporters.findFirst({
            where: { 
              slug: {
                startsWith: convertedSlug,
                mode: 'insensitive'
              },
              is_active: true 
            },
            select: {
              id: true,
              user_id: true,
              full_name: true,
              slug: true,
              title: true,
              bio: true,
              avatar_url: true,
              is_verified: true,
              verification_badge: true,
              specializations: true,
              coverage_areas: true,
              languages: true,
              twitter_url: true,
              linkedin_url: true,
              website_url: true,
              email_public: true,
              total_articles: true,
              total_views: true,
              total_likes: true,
              total_shares: true,
              avg_reading_time: true,
              engagement_rate: true,
              writing_style: true,
              popular_topics: true,
              publication_pattern: true,
              reader_demographics: true,
              is_active: true,
              show_stats: true,
              show_contact: true,
              created_at: true,
              updated_at: true
            }
          });
        }
      }
    }
    
    if (!reporter) {
      console.log(`❌ لا يوجد مراسل بالـ slug أو الاسم: ${slug}`);
      return NextResponse.json({
        success: false,
        error: 'المراسل غير موجود'
      }, { status: 404 });
    }
    
    console.log(`✅ تم العثور على المراسل: ${reporter.full_name}`);
    
    return NextResponse.json({
      success: true,
      reporter: {
        id: reporter.id,
        user_id: reporter.user_id,
        full_name: reporter.full_name,
        slug: reporter.slug,
        title: reporter.title,
        bio: reporter.bio,
        avatar_url: reporter.avatar_url,
        is_verified: reporter.is_verified,
        verification_badge: reporter.verification_badge || 'verified',
        specializations: reporter.specializations || [],
        coverage_areas: reporter.coverage_areas || [],
        languages: reporter.languages || ['ar'],
        twitter_url: reporter.twitter_url,
        linkedin_url: reporter.linkedin_url,
        website_url: reporter.website_url,
        email_public: reporter.email_public,
        total_articles: reporter.total_articles || 0,
        total_views: reporter.total_views || 0,
        total_likes: reporter.total_likes || 0,
        total_shares: reporter.total_shares || 0,
        avg_reading_time: reporter.avg_reading_time || 3.0,
        engagement_rate: reporter.engagement_rate || 0.0,
        writing_style: reporter.writing_style || {},
        popular_topics: reporter.popular_topics || [],
        publication_pattern: reporter.publication_pattern || {},
        reader_demographics: reporter.reader_demographics || {},
        is_active: reporter.is_active,
        show_stats: reporter.show_stats,
        show_contact: reporter.show_contact,
        created_at: reporter.created_at,
        updated_at: reporter.updated_at
      }
    });
    
  } catch (error: any) {
    console.error('خطأ في جلب بيانات المراسل:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب بيانات المراسل'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
