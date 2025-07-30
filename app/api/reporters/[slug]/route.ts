import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('🔍 البحث عن المراسل بالـ slug:', slug);

    // البحث عن المراسل حسب الـ slug
    const reporter = await prisma.reporters.findUnique({
      where: {
        slug: slug,
        is_active: true
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            role: true,
            created_at: true
          }
        }
      }
    });

    console.log('📋 نتيجة البحث:', reporter ? 'تم العثور على المراسل' : 'لم يتم العثور على المراسل');

    if (!reporter) {
      return NextResponse.json(
        { error: 'المراسل غير موجود' },
        { status: 404 }
      );
    }

    console.log('🔄 بدء معالجة البيانات...');

    // تحويل البيانات المخزنة كـ JSON مع معالجة الأخطاء المحتملة
    const formattedReporter = {
      ...reporter,
      specializations: reporter.specializations ? 
        (typeof reporter.specializations === 'string' ? JSON.parse(reporter.specializations) : reporter.specializations) : [],
      coverage_areas: reporter.coverage_areas ? 
        (typeof reporter.coverage_areas === 'string' ? JSON.parse(reporter.coverage_areas) : reporter.coverage_areas) : [],
      languages: reporter.languages ? 
        (typeof reporter.languages === 'string' ? JSON.parse(reporter.languages) : reporter.languages) : ['ar'],
      writing_style: reporter.writing_style ? 
        (typeof reporter.writing_style === 'string' ? JSON.parse(reporter.writing_style) : reporter.writing_style) : null,
      popular_topics: reporter.popular_topics ? 
        (typeof reporter.popular_topics === 'string' ? JSON.parse(reporter.popular_topics) : reporter.popular_topics) : [],
      publication_pattern: reporter.publication_pattern ? 
        (typeof reporter.publication_pattern === 'string' ? JSON.parse(reporter.publication_pattern) : reporter.publication_pattern) : null,
      reader_demographics: reporter.reader_demographics ? 
        (typeof reporter.reader_demographics === 'string' ? JSON.parse(reporter.reader_demographics) : reporter.reader_demographics) : null
    };

    console.log('✅ تم تحويل البيانات بنجاح');

    return NextResponse.json({
      success: true,
      reporter: formattedReporter
    });

  } catch (error) {
    console.error('❌ خطأ في جلب بيانات المراسل:', error);
    console.error('تفاصيل الخطأ:', error.message);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const data = await request.json();

    // البحث عن المراسل أولاً
    const existingReporter = await prisma.reporters.findUnique({
      where: { slug }
    });

    if (!existingReporter) {
      return NextResponse.json(
        { error: 'المراسل غير موجود' },
        { status: 404 }
      );
    }

    // تحديث بيانات المراسل
    const updatedReporter = await prisma.reporters.update({
      where: { slug },
      data: {
        full_name: data.full_name,
        title: data.title,
        bio: data.bio,
        avatar_url: data.avatar_url,
        specializations: data.specializations ? JSON.stringify(data.specializations) : null,
        coverage_areas: data.coverage_areas ? JSON.stringify(data.coverage_areas) : null,
        languages: data.languages ? JSON.stringify(data.languages) : JSON.stringify(['ar']),
        twitter_url: data.twitter_url,
        linkedin_url: data.linkedin_url,
        website_url: data.website_url,
        email_public: data.email_public,
        show_stats: data.show_stats ?? true,
        show_contact: data.show_contact ?? false,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      reporter: updatedReporter
    });

  } catch (error) {
    console.error('خطأ في تحديث بيانات المراسل:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}