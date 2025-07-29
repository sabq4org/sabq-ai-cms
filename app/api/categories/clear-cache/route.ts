import { NextResponse } from 'next/server';
import { categoryCache } from '@/lib/category-cache';

export async function GET() {
  try {
    // مسح الكاش
    categoryCache.clear();
    
    return NextResponse.json({
      success: true,
      message: 'تم مسح كاش التصنيفات بنجاح'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في مسح الكاش',
      details: error.message
    }, { status: 500 });
  }
} 