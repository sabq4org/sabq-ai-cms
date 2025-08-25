import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bulletinId, action } = body;

    if (!bulletinId) {
      return NextResponse.json({ 
        success: false, 
        error: 'معرف النشرة مطلوب' 
      }, { status: 400 });
    }

    // البحث عن النشرة الصوتية في قاعدة البيانات أو إنشاؤها
    let bulletin;
    
    if (action === 'publish') {
      // نشر النشرة في الصفحة الرئيسية
      // يمكن إضافة منطق قاعدة البيانات هنا لحفظ النشرة
      
      return NextResponse.json({
        success: true,
        message: 'تم نشر النشرة في الصفحة الرئيسية بنجاح',
        bulletinId
      });
    } else if (action === 'unpublish') {
      // إلغاء نشر النشرة من الصفحة الرئيسية
      
      return NextResponse.json({
        success: true,
        message: 'تم إلغاء نشر النشرة من الصفحة الرئيسية',
        bulletinId
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'إجراء غير صالح' 
    }, { status: 400 });

  } catch (error) {
    console.error('خطأ في API النشر:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطأ في الخادم' 
    }, { status: 500 });
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}

export async function GET(req: NextRequest) {
  try {
    // جلب النشرة المنشورة حالياً في الصفحة الرئيسية
    // يمكن إضافة منطق قاعدة البيانات هنا
    
    return NextResponse.json({
      success: true,
      featured_bulletin: null, // سيتم تحديثه عند إضافة قاعدة البيانات
      message: 'لا توجد نشرة منشورة حالياً'
    });

  } catch (error) {
    console.error('خطأ في جلب النشرة المنشورة:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطأ في الخادم' 
    }, { status: 500 });
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}
