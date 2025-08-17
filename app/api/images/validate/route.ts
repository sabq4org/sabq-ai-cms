import { NextRequest, NextResponse } from 'next/server';
import { validateImageUrl } from '@/lib/image-utils';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'رابط الصورة مطلوب' },
        { status: 400 }
      );
    }

    const isValid = await validateImageUrl(url);

    return NextResponse.json({
      valid: isValid,
      url: url
    });
  } catch (error) {
    console.error('خطأ في التحقق من الصورة:', error);
    return NextResponse.json(
      { error: 'فشل التحقق من الصورة' },
      { status: 500 }
    );
  }
}

// التحقق من عدة صور دفعة واحدة
export async function PUT(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: 'قائمة الروابط مطلوبة' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      urls.map(async (url) => ({
        url,
        valid: await validateImageUrl(url)
      }))
    );

    return NextResponse.json({
      results,
      validCount: results.filter(r => r.valid).length,
      invalidCount: results.filter(r => !r.valid).length
    });
  } catch (error) {
    console.error('خطأ في التحقق من الصور:', error);
    return NextResponse.json(
      { error: 'فشل التحقق من الصور' },
      { status: 500 }
    );
  }
} 