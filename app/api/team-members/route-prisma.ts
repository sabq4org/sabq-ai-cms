import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// إنشاء instance واحد من Prisma
const prisma = new PrismaClient();

// دالة لإنشاء ID فريد
function generateId(): string {
  return `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 جلب أعضاء الفريق...');
    
    // استخدام Prisma بشكل مباشر مع executeRaw
    const teamMembers = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        name,
        role,
        department,
        position,
        bio,
        avatar,
        email,
        phone,
        social_links::text as social_links,
        is_active,
        display_order,
        created_at,
        updated_at
      FROM team_members
      ORDER BY display_order ASC, created_at DESC
    `;
    
    // معالجة البيانات
    const processedMembers = teamMembers.map(member => ({
      ...member,
      social_links: member.social_links ? JSON.parse(member.social_links) : {}
    }));
    
    console.log(`✅ تم جلب ${processedMembers.length} عضو`);
    
    return NextResponse.json({
      success: true,
      members: processedMembers,
      total: processedMembers.length
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في جلب أعضاء الفريق:', error);
    
    // إذا كان الخطأ بسبب عدم وجود الجدول، نرجع مصفوفة فارغة
    if (error.code === 'P2010' && error.message?.includes('team_members')) {
      console.log('⚠️ جدول team_members غير موجود، إرجاع قائمة فارغة');
      return NextResponse.json({
        success: true,
        members: [],
        total: 0
      });
    }
    
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
    try {
      const existingMember = await prisma.$queryRaw<any[]>`
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
    } catch (checkError: any) {
      // إذا فشل التحقق بسبب عدم وجود الجدول، نتابع
      console.log('⚠️ تحذير في التحقق من البريد:', checkError.message);
    }
    
    // الحصول على أعلى display_order
    let newOrder = 1;
    try {
      const maxOrder = await prisma.$queryRaw<any[]>`
        SELECT COALESCE(MAX(display_order), 0) as max_order FROM team_members
      `;
      newOrder = (maxOrder[0]?.max_order || 0) + 1;
    } catch (orderError) {
      console.log('⚠️ تحذير في الحصول على الترتيب:', orderError);
    }
    
    // إنشاء معرف فريد
    const memberId = generateId();
    
    // إضافة العضو الجديد
    try {
      await prisma.$executeRaw`
        INSERT INTO team_members (
          id, name, email, role, department, position, bio, 
          avatar, phone, social_links, is_active, display_order,
          created_at, updated_at
        ) VALUES (
          ${memberId},
          ${data.name}, 
          ${data.email}, 
          ${data.role}, 
          ${data.department || null}, 
          ${data.position || null}, 
          ${data.bio || null}, 
          ${data.avatar || null}, 
          ${data.phone || null}, 
          ${JSON.stringify(data.social_links || {})}::jsonb, 
          ${data.is_active !== false}, 
          ${newOrder},
          NOW(),
          NOW()
        )
      `;
      
      // جلب العضو المضاف
      const newMember = await prisma.$queryRaw<any[]>`
        SELECT * FROM team_members WHERE id = ${memberId}
      `;
      
      console.log('✅ تم إضافة العضو بنجاح');
      
      return NextResponse.json({
        success: true,
        message: 'تم إضافة العضو بنجاح',
        member: newMember[0]
      });
      
    } catch (insertError: any) {
      console.error('❌ خطأ في إدخال البيانات:', insertError);
      
      // إذا كان الخطأ بسبب عدم وجود الجدول، نحاول إنشاؤه
      if (insertError.code === 'P2010' && insertError.message?.includes('team_members')) {
        console.log('📦 محاولة إنشاء جدول team_members...');
        
        try {
          await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS team_members (
              id VARCHAR(255) PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              email VARCHAR(255) UNIQUE NOT NULL,
              role VARCHAR(100) NOT NULL,
              department VARCHAR(255),
              position VARCHAR(255),
              bio TEXT,
              avatar VARCHAR(500),
              phone VARCHAR(50),
              social_links JSONB DEFAULT '{}',
              is_active BOOLEAN DEFAULT true,
              display_order INTEGER DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;
          
          console.log('✅ تم إنشاء الجدول بنجاح، إعادة المحاولة...');
          
          // إعادة محاولة الإدخال
          await prisma.$executeRaw`
            INSERT INTO team_members (
              id, name, email, role, department, position, bio, 
              avatar, phone, social_links, is_active, display_order,
              created_at, updated_at
            ) VALUES (
              ${memberId},
              ${data.name}, 
              ${data.email}, 
              ${data.role}, 
              ${data.department || null}, 
              ${data.position || null}, 
              ${data.bio || null}, 
              ${data.avatar || null}, 
              ${data.phone || null}, 
              ${JSON.stringify(data.social_links || {})}::jsonb, 
              ${data.is_active !== false}, 
              ${newOrder},
              NOW(),
              NOW()
            )
          `;
          
          const newMember = await prisma.$queryRaw<any[]>`
            SELECT * FROM team_members WHERE id = ${memberId}
          `;
          
          return NextResponse.json({
            success: true,
            message: 'تم إنشاء الجدول وإضافة العضو بنجاح',
            member: newMember[0]
          });
          
        } catch (createTableError: any) {
          console.error('❌ فشل إنشاء الجدول:', createTableError);
          throw createTableError;
        }
      }
      
      throw insertError;
    }
    
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
          details: 'تحقق من صحة البيانات المدخلة',
          debug: error.message
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