import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  console.log('📋 بدء جلب التصنيفات...')
  
  try {
    const categories = await prisma.categories.findMany({
      orderBy: {
        display_order: 'asc'
      }
    })
    
    console.log(`✅ تم جلب ${categories.length} تصنيف بنجاح`)
    
    return NextResponse.json({
      success: true,
      categories,
      count: categories.length
    })
  } catch (error: any) {
    console.error('❌ خطأ في جلب التصنيفات:', error)
    
    return NextResponse.json({
      success: false,
      categories: [],
      error: 'خطأ في جلب البيانات',
      details: error.message || 'خطأ غير معروف'
    }, { status: 503 })
  }
}
