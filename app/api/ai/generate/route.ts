import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { type, content, title } = await request.json();

    // محاكاة توليد المحتوى
    let suggestion = '';

    switch (type) {
      case 'title':
        // توليد عنوان بناءً على المحتوى
        if (content) {
          const words = content.split(' ').slice(0, 10).join(' ');
          suggestion = `عنوان مقترح: ${words}...`;
        } else {
          suggestion = 'عنوان مقترح للمقال الجديد';
        }
        break;

      case 'subtitle':
        // توليد عنوان فرعي بناءً على العنوان والمحتوى
        if (title && content) {
          suggestion = `عنوان فرعي يوضح: ${title.split(' ').slice(0, 5).join(' ')}`;
        } else {
          suggestion = 'عنوان فرعي توضيحي للمقال';
        }
        break;

      case 'excerpt':
        // توليد ملخص بناءً على المحتوى
        if (content) {
          const words = content.split(' ').slice(0, 50).join(' ');
          suggestion = `${words}...`;
        } else {
          suggestion = 'ملخص مقترح للمقال';
        }
        break;

      case 'keywords':
        // توليد كلمات مفتاحية
        suggestion = 'أخبار، تقنية، ذكاء اصطناعي، تطوير، برمجة';
        break;

      default:
        return NextResponse.json(
          { error: 'نوع التوليد غير مدعوم' },
          { status: 400 }
        );
    }

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('Error generating AI content:', error);
    return NextResponse.json(
      { error: 'فشل في توليد المحتوى' },
      { status: 500 }
    );
  }
}