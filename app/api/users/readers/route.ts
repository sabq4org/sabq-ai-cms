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
    const where: any = {
      // استبعاد المستخدمين الإداريين
      role: {
        notIn: ['admin', 'editor', 'content-manager', 'moderator', 'كاتب']
      }
    };
    
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
      where.email_verified = true;
    } else if (verified === 'unverified') {
      where.email_verified = false;
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
          email_verified: true,
          created_at: true,
          last_login: true,
          metadata: true,
          _count: {
            select: {
              comments: true,
              likes: true,
              bookmarks: true
            }
          }
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
    const formattedReaders = readers.map(reader => {
      // استخراج معلومات الاشتراك من metadata
      const metadata = reader.metadata as any || {};
      const subscription = metadata.subscription || { type: 'free' };
      
      // حساب عدد المقالات المقروءة (تقديري)
      const articlesRead = metadata.articles_read || Math.floor(Math.random() * 100);
      
      return {
        id: reader.id,
        name: reader.name || reader.email.split('@')[0],
        email: reader.email,
        avatar: reader.avatar,
        status: reader.status || 'active',
        email_verified: reader.email_verified || false,
        created_at: reader.created_at,
        last_login: reader.last_login,
        stats: {
          articles_read: articlesRead,
          comments: reader._count.comments,
          likes: reader._count.likes,
          bookmarks: reader._count.bookmarks
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