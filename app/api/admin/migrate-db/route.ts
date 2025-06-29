import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

export const runtime = 'nodejs';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // التحقق من الصلاحية (يجب أن يكون admin)
    const authHeader = request.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET || 'your-admin-secret';
    
    if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json({
        success: false,
        error: 'غير مصرح لك بتنفيذ هذا الإجراء'
      }, { status: 401 });
    }

    console.log('🔄 بدء مهاجرة قاعدة البيانات...');

    // تشغيل prisma db push
    const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss');
    
    if (stderr && !stderr.includes('warnings')) {
      throw new Error(stderr);
    }

    console.log('✅ تمت مهاجرة قاعدة البيانات بنجاح');
    console.log('📄 تفاصيل:', stdout);

    return NextResponse.json({
      success: true,
      message: 'تمت مهاجرة قاعدة البيانات بنجاح',
      output: stdout,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ خطأ في مهاجرة قاعدة البيانات:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في مهاجرة قاعدة البيانات',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// للأمان - منع GET requests
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'هذا الـ endpoint يتطلب POST request'
  }, { status: 405 });
} 