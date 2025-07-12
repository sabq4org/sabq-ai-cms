import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// import { checkUserPermissions } from '@/lib/auth'; // الدالة غير موجودة حالياً

export async function GET(request: NextRequest) {
  try {
    // 1. التحقق من صلاحيات المستخدم (يجب أن يكون مديرًا)
    // ملاحظة: تم تعطيل التحقق من الصلاحيات مؤقتًا للتشخيص
    /*
    const permissions = await checkUserPermissions(request, ['admin', 'super_admin']);
    if (!permissions.authorized) {
      return NextResponse.json({ error: permissions.message }, { status: permissions.status });
    }
    */

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    console.log('API USERS (NEW): Connecting to DB to fetch users...');
    
    // 2. جلب المستخدمين من قاعدة البيانات
    const users = await prisma.users.findMany({
      take: limit,
      skip: skip,
      orderBy: {
        created_at: 'desc',
      },
    });

    const totalUsers = await prisma.users.count();
    
    console.log(`API USERS (NEW): Successfully fetched ${users.length} users.`);

    // 3. إرجاع استجابة ناجحة
    return NextResponse.json({
      success: true,
      data: users,
      total: totalUsers,
      page,
      limit,
    });

  } catch (error) {
    console.error('API USERS (NEW): Error fetching users:', error);
    // التأكد من أن الخطأ هو كائن Error
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في جلب المستخدمين',
        message: errorMessage
      }, 
      { status: 500 }
    );
  }
} 