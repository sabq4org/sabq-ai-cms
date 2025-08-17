import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT: تحديث دور
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    // التحقق من وجود الدور
    const existingRole = await prisma.$queryRaw`
      SELECT * FROM roles WHERE id = ${id} LIMIT 1
    `;

    if (!existingRole || existingRole.length === 0) {
      return NextResponse.json(
        { success: false, error: 'الدور غير موجود' },
        { status: 404 }
      );
    }

    // منع تعديل الأدوار النظامية
    if (existingRole[0].is_system && !data.isActive) {
      return NextResponse.json(
        { success: false, error: 'لا يمكن تعطيل الأدوار النظامية' },
        { status: 403 }
      );
    }

    // تحديث البيانات الأساسية
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (data.displayName !== undefined) {
      updateFields.push(`display_name = $${paramIndex++}`);
      updateValues.push(data.displayName);
    }
    if (data.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(data.description);
    }
    if (data.permissions !== undefined) {
      updateFields.push(`permissions = $${paramIndex++}::jsonb`);
      updateValues.push(JSON.stringify(data.permissions));
    }

    // تحديث الدور
    if (updateFields.length > 0) {
      updateValues.push(id);
      const updateQuery = `
        UPDATE roles 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      
      await prisma.$executeRawUnsafe(updateQuery, ...updateValues);
    }

    // جلب الدور المحدث
    const updatedRole = await prisma.$queryRaw`
      SELECT 
        r.*,
        COUNT(DISTINCT u.id) as users_count
      FROM roles r
      LEFT JOIN users u ON u.role = r.name
      WHERE r.id = ${id}
      GROUP BY r.id
    `;

    return NextResponse.json({
      success: true,
      role: updatedRole[0],
      message: 'تم تحديث الدور بنجاح'
    });

  } catch (error: any) {
    console.error('خطأ في تحديث الدور:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في تحديث الدور',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

// DELETE: حذف دور
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // التحقق من وجود الدور
    const existingRole = await prisma.$queryRaw`
      SELECT * FROM roles WHERE id = ${id} LIMIT 1
    `;

    if (!existingRole || existingRole.length === 0) {
      return NextResponse.json(
        { success: false, error: 'الدور غير موجود' },
        { status: 404 }
      );
    }

    // منع حذف الأدوار النظامية
    if (existingRole[0].is_system) {
      return NextResponse.json(
        { success: false, error: 'لا يمكن حذف الأدوار النظامية' },
        { status: 403 }
      );
    }

    // التحقق من عدم وجود مستخدمين مرتبطين بهذا الدور
    const usersCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM users WHERE role = ${existingRole[0].name}
    `;

    if (parseInt(usersCount[0].count) > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'لا يمكن حذف دور مرتبط بمستخدمين',
          details: `يوجد ${usersCount[0].count} مستخدم مرتبط بهذا الدور`
        },
        { status: 400 }
      );
    }

    // حذف الدور (سيتم حذف الصلاحيات المرتبطة تلقائياً بسبب ON DELETE CASCADE)
    await prisma.$queryRaw`
      DELETE FROM roles WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: 'تم حذف الدور بنجاح'
    });

  } catch (error: any) {
    console.error('خطأ في حذف الدور:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في حذف الدور',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

// GET: جلب دور واحد مع تفاصيله
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const role = await prisma.$queryRaw`
      SELECT 
        r.*,
        COUNT(DISTINCT u.id) as users_count
      FROM roles r
      LEFT JOIN users u ON u.role = r.name
      WHERE r.id = ${id}
      GROUP BY r.id
    `;

    if (!role || role.length === 0) {
      return NextResponse.json(
        { success: false, error: 'الدور غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      role: role[0]
    });

  } catch (error: any) {
    console.error('خطأ في جلب الدور:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في جلب الدور',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}