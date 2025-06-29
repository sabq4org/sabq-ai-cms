import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم رفع أي ملف' });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // تحديد مسار الحفظ
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const fileName = `${Date.now()}-${file.name}`;
    const path = join(uploadsDir, fileName);

    // حفظ الملف
    await writeFile(path, buffer);
    console.log(`✅ تم رفع الملف: ${path}`);

    // إرجاع المسار العام للملف
    const publicPath = `/uploads/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: publicPath,
      message: 'تم رفع الصورة بنجاح'
    });

  } catch (error) {
    console.error('❌ خطأ في رفع الملف:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'فشل رفع الملف',
      message: error instanceof Error ? error.message : 'خطأ غير معروف' 
    }, { status: 500 });
  }
}

// دعم OPTIONS للـ CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 