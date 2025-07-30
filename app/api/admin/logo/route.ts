import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // إرجاع رابط اللوجو الحالي
    return NextResponse.json({
      success: true,
      logoUrl: '/logo.png',
      message: 'تم جلب رابط اللوجو الحالي'
    });
  } catch (error) {
    console.error('خطأ في جلب رابط اللوجو:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في جلب رابط اللوجو' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { logoUrl } = await request.json();

    if (!logoUrl || typeof logoUrl !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'رابط اللوجو مطلوب' 
        },
        { status: 400 }
      );
    }

    // يمكن هنا حفظ رابط اللوجو في قاعدة البيانات
    // أو في ملف إعدادات
    // حالياً سنقوم بحفظه في ملف JSON مؤقت
    
    const settingsPath = path.join(process.cwd(), 'public', 'site-settings.json');
    let settings = {};
    
    try {
      const settingsData = await fs.readFile(settingsPath, 'utf8');
      settings = JSON.parse(settingsData);
    } catch (error) {
      // إذا لم يوجد الملف، سننشئه
      console.log('إنشاء ملف إعدادات جديد');
    }

    // تحديث رابط اللوجو
    settings = {
      ...settings,
      logoUrl,
      lastUpdated: new Date().toISOString()
    };

    // حفظ الإعدادات المحدثة
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));

    return NextResponse.json({
      success: true,
      logoUrl,
      message: 'تم حفظ رابط اللوجو الجديد بنجاح'
    });

  } catch (error) {
    console.error('خطأ في حفظ رابط اللوجو:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في حفظ رابط اللوجو' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // حذف إعدادات اللوجو والعودة للافتراضي
    const settingsPath = path.join(process.cwd(), 'public', 'site-settings.json');
    
    let settings = {};
    try {
      const settingsData = await fs.readFile(settingsPath, 'utf8');
      settings = JSON.parse(settingsData);
    } catch (error) {
      // إذا لم يوجد الملف، لا حاجة لحذف شيء
    }

    // إزالة رابط اللوجو المخصص
    delete settings.logoUrl;
    settings.lastUpdated = new Date().toISOString();

    // حفظ الإعدادات المحدثة
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));

    return NextResponse.json({
      success: true,
      logoUrl: '/logo.png',
      message: 'تم استعادة اللوجو الافتراضي'
    });

  } catch (error) {
    console.error('خطأ في حذف إعدادات اللوجو:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في استعادة اللوجو الافتراضي' 
      },
      { status: 500 }
    );
  }
}