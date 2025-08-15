import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const verified = searchParams.get('verified') || 'all';
    const subscription = searchParams.get('subscription') || 'all';
    
    const skip = (page - 1) * limit;
    
    // بناء شروط البحث
    const where: any = {};
    
    // البحث بالاسم أو البريد
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // فلتر الحالة
    if (status !== 'all') {
      where.status = status;
    }
    
    // فلتر التوثيق
    if (verified === 'verified') {
      where.is_verified = true;
    } else if (verified === 'unverified') {
      where.is_verified = false;
    }
    
    // جلب القراء
    const [readers, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          status: true,
          is_verified: true,
          created_at: true,
          last_login_at: true,
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.users.count({ where })
    ]);
    
    // تحويل البيانات للتنسيق المطلوب
    const formattedReaders = readers.map((reader: any) => {
      // اشتراك افتراضي وقراءة تقديرية كقيم مبدئية
      const subscription = { type: 'free' } as any;
      const articlesRead = 0;
      
      return {
        id: reader.id,
        name: reader.name || reader.email.split('@')[0],
        email: reader.email,
        avatar: reader.avatar,
        status: reader.status || 'active',
        email_verified: Boolean(reader.is_verified),
        created_at: reader.created_at,
        last_login: reader.last_login_at ?? null,
        stats: {
          articles_read: articlesRead,
          comments: 0,
          likes: 0,
          bookmarks: 0
        },
        subscription
      };
    });
    
    return NextResponse.json({
      success: true,
      readers: formattedReaders,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
    
  } catch (error: any) {
    console.error('خطأ في جلب القراء:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في جلب بيانات القراء',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}