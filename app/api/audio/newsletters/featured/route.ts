import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // تم تعطيل هذا API مؤقتاً لعدم وجود جدول audio_newsletters
    console.log('⚠️ API audio/newsletters/featured معطل مؤقتاً - جدول audio_newsletters غير موجود');
    
    return NextResponse.json({
      success: false,
      error: 'API معطل مؤقتاً',
      message: 'جدول audio_newsletters غير موجود في قاعدة البيانات'
    }, { status: 404 });
    
  } catch (error: any) {
    console.error('Error in audio/newsletters/featured:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في النظام',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 });
  }
}
