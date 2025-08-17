import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // التأكد من الاتصال بقاعدة البيانات
    await prisma.$connect();
    
    console.log('📊 جلب أعضاء الفريق...');
    
    // جلب أعضاء الفريق من الجدول المخصص
    const teamMembers = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        role,
        department,
        bio,
        avatar,
        email,
        phone,
        social_links,
        is_active,
        display_order,
        created_at,
        updated_at
      FROM team_members
      ORDER BY display_order ASC, created_at DESC
    `;
    
    console.log(`✅ تم جلب ${teamMembers.length} عضو`);
    
    return NextResponse.json({
      success: true,
      members: teamMembers,
      total: teamMembers.length
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في جلب أعضاء الفريق:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في جلب بيانات الفريق',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // التأكد من الاتصال بقاعدة البيانات
    await prisma.$connect();
    
    const data = await request.json();
    console.log('➕ إضافة عضو جديد:', data.name);
    
    // التحقق من البيانات المطلوبة
    if (!data.name || !data.email || !data.role) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'الاسم والبريد الإلكتروني والدور مطلوبة' 
        },
        { status: 400 }
      );
    }
    
    // التحقق من عدم وجود عضو بنفس البريد
    const existingMember = await prisma.$queryRaw`
      SELECT id FROM team_members WHERE email = ${data.email}
    `;
    
    if (existingMember.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'يوجد عضو بنفس البريد الإلكتروني' 
        },
        { status: 400 }
      );
    }
    
    // الحصول على أعلى display_order
    const maxOrder = await prisma.$queryRaw`
      SELECT COALESCE(MAX(display_order), 0) as max_order FROM team_members
    `;
    
    const newOrder = (maxOrder[0]?.max_order || 0) + 1;
    
    // إضافة العضو الجديد
    const newMember = await prisma.$queryRaw`
      INSERT INTO team_members (
        name, email, role, department, position, bio, 
        avatar, phone, social_links, is_active, display_order
      ) VALUES (
        ${data.name}, 
        ${data.email}, 
        ${data.role}, 
        ${data.department || null}, 
        ${data.position || null}, 
        ${data.bio || null}, 
        ${data.avatar || null}, 
        ${data.phone || null}, 
        ${JSON.stringify(data.social_links || {})}, 
        ${data.is_active !== false}, 
        ${newOrder}
      ) RETURNING *
    `;
    
    console.log('✅ تم إضافة العضو بنجاح');
    
    return NextResponse.json({
      success: true,
      message: 'تم إضافة العضو بنجاح',
      member: newMember
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في إضافة العضو:', error);
    console.error('Stack trace:', error.stack);
    console.error('Error code:', error.code);
    
    // معالجة أخطاء محددة
    if (error.code === 'P2010') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'خطأ في تنفيذ الاستعلام',
          details: 'تحقق من صحة البيانات المدخلة'
        },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('unique constraint')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'البريد الإلكتروني مستخدم بالفعل',
          details: 'يرجى استخدام بريد إلكتروني آخر'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في إضافة العضو',
        details: error?.message || 'خطأ غير معروف',
        debug: {
          code: error.code,
          message: error.message
        }
      },
      { status: 500 }
    );
  }
}