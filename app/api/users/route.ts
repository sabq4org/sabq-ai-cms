import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: جلب جميع المستخدمين (محمي للمسؤولين فقط)
export async function GET(request: NextRequest) {
  try {
    // التحقق من صلاحيات المسؤول
    const authHeader = request.headers.get('authorization');
    const authToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : request.cookies.get('auth-token')?.value || request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    
    // التحقق من JWT
    try {
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
      
      if (!JWT_SECRET) {
        console.error('خطأ أمني: JWT_SECRET غير محدد');
        return NextResponse.json({ error: 'خطأ في التكوين' }, { status: 500 });
      }
      
      const decoded = jwt.verify(authToken, JWT_SECRET, {
        algorithms: ['HS256'],
        ignoreExpiration: false
      }) as any;
      
      // التحقق من صلاحيات المسؤول
      if (!decoded.is_admin && decoded.role !== 'admin') {
        return NextResponse.json({ error: 'صلاحيات مسؤول مطلوبة' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'توكن غير صالح' }, { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // بناء شروط البحث
    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    // إخفاء الحسابات غير النشطة افتراضياً
    if (!status) {
      where.status = { not: 'inactive' };
    } else if (status && status !== 'all') {
      where.status = status;
    }

    // جلب المستخدمين مع الإحصائيات
    const users = await prisma.users.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        is_admin: true,
        is_verified: true,
        created_at: true,
        updated_at: true,
        // عد المقالات (إذا كان هناك علاقة)
        _count: {
          select: {
            audio_episodes: true,
            audio_programs: true,
            interactions: true
          }
        }
      }
    });

    // جلب العدد الإجمالي
    const total = await prisma.users.count({ where });

    // تحويل البيانات للشكل المطلوب
    const transformedUsers = users.map(user => {
      // تحديد الحالة بناءً على بيانات المستخدم
      let status = 'active';
      if (!user.is_verified) {
        status = 'pending';
      }
      
      // تحديد نوع الاشتراك (افتراضي)
      let subscription = 'free';
      if (user.is_admin) {
        subscription = 'enterprise';
      } else if (user.role === 'editor') {
        subscription = 'premium';
      }

      // إخفاء البيانات الحساسة جزئياً
      const maskedEmail = user.email 
        ? user.email.substring(0, 3) + '***@' + user.email.split('@')[1]
        : 'غير محدد';
      
      return {
        id: user.id,
        name: user.name || 'بدون اسم',
        email: maskedEmail, // البريد المخفي
        avatar: user.avatar,
        role: user.role,
        isAdmin: user.is_admin,
        verified: user.is_verified,
        status,
        subscription,
        joinDate: user.created_at,
        lastActive: user.updated_at,
        stats: {
          episodes: user._count.audio_episodes,
          programs: user._count.audio_programs,
          interactions: user._count.interactions
        }
      };
    });

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      total,
      limit,
      offset
    });

  } catch (error: any) {
    console.error('خطأ في جلب المستخدمين:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في جلب المستخدمين',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

// PUT: تحديث بيانات مستخدم
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error: any) {
    console.error('خطأ في تحديث المستخدم:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في تحديث المستخدم',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
} 