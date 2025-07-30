import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface ErrorReport {
  message: string;
  stack: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const errorReport: ErrorReport = await request.json();

    // التحقق من صحة البيانات
    if (!errorReport.message || !errorReport.timestamp) {
      return NextResponse.json(
        { success: false, error: 'بيانات التقرير غير مكتملة' },
        { status: 400 }
      );
    }

    // إنشاء مجلد التقارير إذا لم يكن موجوداً
    const reportsDir = path.join(process.cwd(), 'logs', 'error-reports');
    try {
      await fs.mkdir(reportsDir, { recursive: true });
    } catch (error) {
      // المجلد موجود بالفعل
    }

    // إنشاء اسم ملف فريد
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `error-${timestamp}.json`;
    const filepath = path.join(reportsDir, filename);

    // إضافة معلومات إضافية للتقرير
    const fullReport = {
      ...errorReport,
      receivedAt: new Date().toISOString(),
      id: `error-${Date.now()}`,
      severity: 'error',
      environment: process.env.NODE_ENV || 'unknown'
    };

    // حفظ التقرير
    await fs.writeFile(filepath, JSON.stringify(fullReport, null, 2));

    // طباعة في الكونسول للمتابعة الفورية
    console.error('🚨 تقرير خطأ جديد:', {
      id: fullReport.id,
      message: errorReport.message,
      url: errorReport.url,
      timestamp: errorReport.timestamp
    });

    return NextResponse.json({
      success: true,
      reportId: fullReport.id,
      message: 'تم استلام تقرير الخطأ بنجاح'
    });

  } catch (error) {
    console.error('❌ خطأ في حفظ تقرير الخطأ:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في حفظ تقرير الخطأ' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // إرجاع آخر التقارير (للمديرين فقط)
    const reportsDir = path.join(process.cwd(), 'logs', 'error-reports');
    
    try {
      const files = await fs.readdir(reportsDir);
      const recentFiles = files
        .filter(file => file.endsWith('.json'))
        .sort()
        .slice(-10); // آخر 10 تقارير

      const reports = [];
      for (const file of recentFiles) {
        try {
          const content = await fs.readFile(path.join(reportsDir, file), 'utf8');
          const report = JSON.parse(content);
          reports.push({
            id: report.id,
            message: report.message,
            url: report.url,
            timestamp: report.timestamp,
            filename: file
          });
        } catch (e) {
          console.error(`فشل في قراءة التقرير ${file}:`, e);
        }
      }

      return NextResponse.json({
        success: true,
        reports: reports.reverse() // الأحدث أولاً
      });

    } catch (error) {
      return NextResponse.json({
        success: true,
        reports: [],
        message: 'لا توجد تقارير أخطاء حالياً'
      });
    }

  } catch (error) {
    console.error('❌ خطأ في جلب تقارير الأخطاء:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في جلب تقارير الأخطاء' 
      },
      { status: 500 }
    );
  }
}