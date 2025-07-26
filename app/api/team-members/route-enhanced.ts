import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET: جلب قائمة أعضاء الفريق مع معالجة أخطاء محسنة
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('👥 [Team Members API] بدء جلب أعضاء الفريق...');
    
    // استيراد آمن لـ Prisma
    let prisma, ensureConnection;
    try {
      const prismaModule = await import('@/lib/prisma');
      prisma = prismaModule.prisma;
      ensureConnection = prismaModule.ensureConnection;
      console.log('✅ [Team Members API] تم تحميل Prisma بنجاح');
    } catch (error) {
      console.error('❌ [Team Members API] فشل تحميل Prisma:', error);
      return NextResponse.json({
        success: false,
        error: 'خطأ في النظام - فشل تحميل قاعدة البيانات',
        code: 'PRISMA_IMPORT_FAILED'
      }, { status: 500 });
    }

    // التأكد من الاتصال بقاعدة البيانات
    let isConnected = false;
    try {
      isConnected = await ensureConnection();
      console.log('🔗 [Team Members API] حالة الاتصال بقاعدة البيانات:', isConnected);
    } catch (error) {
      console.error('❌ [Team Members API] خطأ في فحص الاتصال:', error);
    }
    
    if (!isConnected) {
      console.error('❌ [Team Members API] فشل الاتصال بقاعدة البيانات');
      
      // إرجاع أعضاء افتراضيين في حالة فشل الاتصال
      const fallbackMembers = [
        { 
          id: '1', 
          name: 'فريق التحرير', 
          email: 'editor@sabq.io', 
          role: 'editor',
          roleId: 'editor',
          avatar: null,
          isActive: true,
          isVerified: true,
          createdAt: new Date().toISOString()
        },
        { 
          id: '2', 
          name: 'المدير العام', 
          email: 'admin@sabq.io', 
          role: 'admin',
          roleId: 'admin',
          avatar: null,
          isActive: true,
          isVerified: true,
          createdAt: new Date().toISOString()
        },
        { 
          id: '3', 
          name: 'كاتب رئيسي', 
          email: 'writer@sabq.io', 
          role: 'writer',
          roleId: 'writer',
          avatar: null,
          isActive: true,
          isVerified: true,
          createdAt: new Date().toISOString()
        }
      ];
      
      return NextResponse.json({
        success: true,
        data: fallbackMembers,
        members: fallbackMembers,
        message: 'تم استخدام أعضاء افتراضيين',
        fallback: true
      });
    }
    
    // جلب الأعضاء من قاعدة البيانات
    let members = [];
    try {
      console.log('🔍 [Team Members API] جلب الأعضاء من قاعدة البيانات...');
      
      members = await prisma.users.findMany({
        where: {
          role: {
            not: 'user' // استثناء المستخدمين العاديين
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          is_verified: true,
          created_at: true,
          updated_at: true,
          last_login: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      
      console.log(`📊 [Team Members API] تم جلب ${members.length} عضو من قاعدة البيانات`);
      
    } catch (dbError) {
      console.error('❌ [Team Members API] خطأ في قاعدة البيانات:', dbError);
      
      // إرجاع أعضاء افتراضيين في حالة خطأ قاعدة البيانات
      const fallbackMembers = [
        { 
          id: 'fallback-1', 
          name: 'فريق التحرير', 
          email: 'editor@sabq.io', 
          role: 'editor',
          roleId: 'editor',
          avatar: null,
          isActive: true,
          isVerified: true,
          createdAt: new Date().toISOString()
        },
        { 
          id: 'fallback-2', 
          name: 'المراسل الرئيسي', 
          email: 'reporter@sabq.io', 
          role: 'reporter',
          roleId: 'reporter',
          avatar: null,
          isActive: true,
          isVerified: true,
          createdAt: new Date().toISOString()
        }
      ];
      
      return NextResponse.json({
        success: true,
        data: fallbackMembers,
        members: fallbackMembers,
        message: 'تم استخدام أعضاء افتراضيين بسبب خطأ في قاعدة البيانات',
        fallback: true,
        error_details: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
      });
    }
    
    // تحويل البيانات للتوافق مع الواجهة
    const formattedMembers = members.map((member: any) => ({
      id: member.id,
      name: member.name || member.email.split('@')[0],
      email: member.email,
      roleId: member.role,
      role: member.role,
      avatar: member.avatar,
      isActive: true, // يمكن إضافة حقل في قاعدة البيانات لاحقاً
      isVerified: member.is_verified || false,
      createdAt: member.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: member.updated_at?.toISOString(),
      lastLogin: member.last_login?.toISOString()
    }));
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ [Team Members API] تم جلب ${formattedMembers.length} عضو بنجاح في ${responseTime}ms`);
    
    const response = NextResponse.json({
      success: true,
      data: formattedMembers,
      members: formattedMembers,
      count: formattedMembers.length
    });
    
    response.headers.set('X-Response-Time', `${responseTime}ms`);
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    response.headers.set('Access-Control-Allow-Origin', '*');
    
    return response;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ [Team Members API] خطأ غير متوقع:', error);
    
    // إرجاع أعضاء طوارئ في حالة أي خطأ
    const emergencyMembers = [
      { 
        id: 'emergency-1', 
        name: 'نظام التحرير', 
        email: 'system@sabq.io', 
        role: 'system',
        roleId: 'system',
        avatar: null,
        isActive: true,
        isVerified: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: emergencyMembers,
      members: emergencyMembers,
      message: 'تم استخدام أعضاء طوارئ بسبب خطأ في النظام',
      emergency_fallback: true,
      responseTime: `${responseTime}ms`,
      error_details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 200 }); // نرجع 200 لأننا نعطي بيانات افتراضية
  }
}

// POST: إضافة عضو جديد
export async function POST(request: NextRequest) {
  try {
    console.log('➕ [Team Members API] بدء إضافة عضو جديد...');
    
    const body = await request.json();
    const { name, email, role, password } = body;
    
    if (!name || !email || !role) {
      return NextResponse.json({
        success: false,
        error: 'الاسم والبريد الإلكتروني والدور مطلوبة'
      }, { status: 400 });
    }

    // استيراد آمن لـ Prisma
    const { prisma, ensureConnection } = await import('@/lib/prisma');
    
    // التأكد من الاتصال بقاعدة البيانات
    const isConnected = await ensureConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'فشل الاتصال بقاعدة البيانات'
      }, { status: 503 });
    }
    
    // تشفير كلمة المرور إذا تم توفيرها
    let hashedPassword = null;
    if (password) {
      const bcrypt = await import('bcryptjs');
      hashedPassword = await bcrypt.hash(password, 12);
    }
    
    // إنشاء العضو الجديد
    const newMember = await prisma.users.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        is_verified: true,
        created_at: true
      }
    });
    
    console.log('✅ [Team Members API] تم إضافة العضو بنجاح');
    
    return NextResponse.json({
      success: true,
      data: newMember,
      message: 'تم إضافة العضو بنجاح'
    });
    
  } catch (error) {
    console.error('❌ [Team Members API] خطأ في إضافة العضو:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في إضافة العضو',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}

// OPTIONS: معالجة طلبات CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
