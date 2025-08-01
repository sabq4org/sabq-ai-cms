import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// دالة لإنشاء ID فريد
function generateId(): string {
  return `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 جلب أعضاء الفريق من قاعدة البيانات...');
    
    const teamMembers = await prisma.team_members.findMany({
      orderBy: [
        { display_order: 'asc' },
        { created_at: 'desc' }
      ]
    });
    
    console.log(`✅ تم جلب ${teamMembers.length} عضو من قاعدة البيانات`);
    
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
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 بدء معالجة طلب POST...');
    console.log('📨 Headers:', Object.fromEntries(request.headers.entries()));
    
    const data = await request.json();
    console.log('➕ إضافة عضو جديد - البيانات المستلمة:', {
      hasName: !!data.name,
      hasEmail: !!data.email, 
      hasRole: !!data.role,
      allKeys: Object.keys(data),
      fullData: data
    });
    
    // التحقق من البيانات المطلوبة
    if (!data.name || !data.email || !data.role) {
      console.log('❌ بيانات ناقصة:', { name: !!data.name, email: !!data.email, role: !!data.role });
      return NextResponse.json(
        { 
          success: false, 
          error: 'الاسم والبريد الإلكتروني والدور مطلوبة',
          received: { name: !!data.name, email: !!data.email, role: !!data.role }
        },
        { status: 400 }
      );
    }
    
    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'صيغة البريد الإلكتروني غير صحيحة' 
        },
        { status: 400 }
      );
    }
    
    // التحقق من عدم وجود عضو بنفس البريد
    const existingMember = await prisma.team_members.findFirst({
      where: {
        email: {
          equals: data.email,
          mode: 'insensitive'
        }
      }
    });
    
    if (existingMember) {
      console.log('⚠️ عضو موجود بالفعل:', existingMember.name);
      return NextResponse.json(
        { 
          success: false, 
          error: 'يوجد عضو بنفس البريد الإلكتروني',
          existingMember: { name: existingMember.name, email: existingMember.email }
        },
        { status: 400 }
      );
    }
    
    // الحصول على أعلى display_order
    const maxOrderResult = await prisma.team_members.aggregate({
      _max: {
        display_order: true
      }
    });
    const maxOrder = maxOrderResult._max.display_order || 0;
    
    // إنشاء العضو الجديد في قاعدة البيانات
    const newMember = await prisma.team_members.create({
      data: {
        id: generateId(),
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department || null,
        bio: data.bio || null,
        avatar: data.avatar || null,
        phone: data.phone || null,
        social_links: data.social_links || {},
        is_active: data.is_active !== false,
        display_order: maxOrder + 1,
        updated_at: new Date()
      }
    });
    
    console.log('✅ تم إضافة العضو بنجاح في قاعدة البيانات:', newMember.name);
    
    return NextResponse.json({
      success: true,
      message: 'تم إضافة العضو بنجاح',
      member: newMember
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في إضافة العضو:', error);
    console.error('Stack trace:', error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في إضافة العضو',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}