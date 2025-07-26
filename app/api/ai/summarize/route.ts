import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// محاكاة توليد الملخص - يمكن استبدالها بـ OpenAI API أو خدمة AI أخرى
function generateAISummary(title: string, content: string): string {
  // استخراج أول 500 حرف كملخص مؤقت
  const cleanContent = content
    .replace(/<[^>]*>/g, '') // إزالة HTML tags
    .replace(/\s+/g, ' ') // تنظيف المسافات
    .trim();
  
  const maxLength = 300;
  let summary = cleanContent.substring(0, maxLength);
  
  // إضافة نقاط في نهاية الملخص إذا تم القطع
  if (cleanContent.length > maxLength) {
    const lastSpaceIndex = summary.lastIndexOf(' ');
    if (lastSpaceIndex > 200) {
      summary = summary.substring(0, lastSpaceIndex) + '...';
    } else {
      summary += '...';
    }
  }
  
  // إضافة مقدمة ذكية
  const intro = `في هذا المقال: `;
  return intro + summary;
}

export async function POST(request: NextRequest) {
  try {
    const { articleId, title, content } = await request.json();

    if (!articleId || !title || !content) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة ناقصة' },
        { status: 400 }
      );
    }

    // توليد الملخص
    const summary = generateAISummary(title, content);

    // حفظ الملخص في قاعدة البيانات
    try {
      // جلب metadata الحالية
      const article = await prisma.articles.findUnique({
        where: { id: articleId },
        select: { metadata: true }
      });
      
      const currentMetadata = (article?.metadata as any) || {};
      
      await prisma.articles.update({
        where: { id: articleId },
        data: { 
          metadata: {
            ...currentMetadata,
            ai_summary: summary,
            summary_generated_at: new Date().toISOString()
          },
          updated_at: new Date()
        }
      });
    } catch (dbError) {
      console.error('خطأ في حفظ الملخص:', dbError);
    }

    return NextResponse.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('خطأ في توليد الملخص:', error);
    return NextResponse.json(
      { error: 'فشل في توليد الملخص' },
      { status: 500 }
    );
  }
}

// GET: جلب الملخص الموجود
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json(
        { error: 'معرف المقال مطلوب' },
        { status: 400 }
      );
    }

    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: {
        excerpt: true,
        metadata: true
      }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'المقال غير موجود' },
        { status: 404 }
      );
    }

    // استخراج الملخص من metadata
    const metadata = (article.metadata as any) || {};
    const aiSummary = metadata.ai_summary || metadata.summary;

    return NextResponse.json({
      success: true,
      summary: aiSummary || article.excerpt || null
    });

  } catch (error) {
    console.error('خطأ في جلب الملخص:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الملخص' },
      { status: 500 }
    );
  }
} 