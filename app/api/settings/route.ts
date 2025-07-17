import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// جلب جميع الإعدادات
export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.site_settings.findMany();
    
    // تحويل البيانات إلى كائن مفتاحي
    const settingsObject: Record<string, any> = {};
    
    for (const setting of settings) {
      settingsObject[setting.section] = setting.data;
    }
    
    return NextResponse.json({
      success: true,
      data: settingsObject
    });
  } catch (error) {
    console.error('خطأ في جلب الإعدادات:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب الإعدادات' },
      { status: 500 }
    );
  }
}

// حفظ الإعدادات
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // حفظ كل قسم من الإعدادات
    const sections = Object.keys(body);
    const results = [];
    
    for (const section of sections) {
      try {
        const existingSetting = await prisma.site_settings.findFirst({
          where: { section }
        });
        
        if (existingSetting) {
          // تحديث الإعدادات الموجودة
          const updated = await prisma.site_settings.update({
            where: { id: existingSetting.id },
            data: {
              data: body[section],
              updated_at: new Date()
            }
          });
          results.push({ section, status: 'updated' });
        } else {
          // إنشاء إعدادات جديدة
          const created = await prisma.site_settings.create({
            data: {
              id: `${section}-${Date.now()}`,
              section,
              data: body[section],
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          results.push({ section, status: 'created' });
        }
      } catch (sectionError) {
        console.error(`خطأ في حفظ قسم ${section}:`, sectionError);
        results.push({ section, status: 'error', error: sectionError });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'تم حفظ الإعدادات بنجاح',
      results
    });
  } catch (error) {
    console.error('خطأ في حفظ الإعدادات:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في حفظ الإعدادات' },
      { status: 500 }
    );
  }
} 