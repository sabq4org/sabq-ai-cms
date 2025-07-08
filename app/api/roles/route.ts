import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// GET - جلب جميع الأدوار
export async function GET(request: NextRequest) {
  try {
    const roles = await prisma.roles.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
    
    // حساب عدد المستخدمين لكل دور
    const rolesWithCount = await Promise.all(
      roles.map(async (role) => {
        const userCount = await prisma.users.count({
          where: {
            role: role.name
          }
        });
        
        return {
          ...role,
          users: userCount,
          permissions: typeof role.permissions === 'string' 
            ? JSON.parse(role.permissions as string) 
            : role.permissions
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      data: rolesWithCount,
      count: rolesWithCount.length
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب الأدوار'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - إنشاء دور جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, display_name, description, permissions = [], color = '#4B82F2' } = body;
    
    if (!name || !display_name || !description) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال جميع البيانات المطلوبة' },
        { status: 400 }
      );
    }
    
    // التحقق من عدم تكرار اسم الدور
    const existingRole = await prisma.roles.findUnique({
      where: { name }
    });
    
    if (existingRole) {
      return NextResponse.json(
        { success: false, error: 'يوجد دور بنفس الاسم' },
        { status: 400 }
      );
    }
    
    const newRole = await prisma.roles.create({
      data: {
        id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        display_name,
        description,
        permissions: JSON.stringify(permissions),
        is_system: false,
        updated_at: new Date()
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...newRole,
        permissions: permissions,
        users: 0
      },
      message: 'تم إنشاء الدور بنجاح' 
    });
    
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إنشاء الدور' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
