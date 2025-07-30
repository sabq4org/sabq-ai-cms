import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

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

    if (!reporter) {
      return NextResponse.json(
        { error: 'المراسل غير موجود' },
        { status: 404 }
      );
    }

    // تحويل البيانات المخزنة كـ JSON
    const formattedReporter = {
      ...reporter,
      specializations: reporter.specializations ? JSON.parse(reporter.specializations as string) : [],
      coverage_areas: reporter.coverage_areas ? JSON.parse(reporter.coverage_areas as string) : [],
      languages: reporter.languages ? JSON.parse(reporter.languages as string) : ['ar'],
      writing_style: reporter.writing_style ? JSON.parse(reporter.writing_style as string) : null,
      popular_topics: reporter.popular_topics ? JSON.parse(reporter.popular_topics as string) : [],
      publication_pattern: reporter.publication_pattern ? JSON.parse(reporter.publication_pattern as string) : null,
      reader_demographics: reporter.reader_demographics ? JSON.parse(reporter.reader_demographics as string) : null
    };

    return NextResponse.json({
      success: true,
      reporter: formattedReporter
    });

  } catch (error) {
    console.error('خطأ في جلب بيانات المراسل:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
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