import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    
    console.log(`📝 تحديث عضو الفريق: ${id}`);
    
    // التحقق من وجود العضو
    const existingMember = await prisma.$queryRaw`
      SELECT id FROM team_members WHERE id = ${id}
    `;
    
    if (existingMember.length === 0) {
      return NextResponse.json(
        { success: false, error: 'العضو غير موجود' },
        { status: 404 }
      );
    }
    
    // بناء قائمة الحقول للتحديث
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    
    if (data.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    
    if (data.email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }
    
    if (data.role !== undefined) {
      updateFields.push(`role = $${paramIndex++}`);
      values.push(data.role);
    }
    
    if (data.department !== undefined) {
      updateFields.push(`department = $${paramIndex++}`);
      values.push(data.department || null);
    }
    
    if (data.position !== undefined) {
      updateFields.push(`position = $${paramIndex++}`);
      values.push(data.position || null);
    }
    
    if (data.bio !== undefined) {
      updateFields.push(`bio = $${paramIndex++}`);
      values.push(data.bio || null);
    }
    
    if (data.avatar !== undefined) {
      updateFields.push(`avatar = $${paramIndex++}`);
      values.push(data.avatar || null);
    }
    
    if (data.phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      values.push(data.phone || null);
    }
    
    if (data.social_links !== undefined) {
      updateFields.push(`social_links = $${paramIndex++}`);
      values.push(JSON.stringify(data.social_links || {}));
    }
    
    if (data.is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`);
      values.push(data.is_active);
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'لا توجد بيانات للتحديث' },
        { status: 400 }
      );
    }
    
    // إضافة updated_at
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // إضافة id في النهاية
    values.push(id);
    
    // تنفيذ التحديث
    const query = `
      UPDATE team_members 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const updatedMember = await prisma.$queryRawUnsafe(query, ...values);
    
    console.log('✅ تم تحديث العضو بنجاح');
    
    return NextResponse.json({
      success: true,
      message: 'تم تحديث العضو بنجاح',
      member: updatedMember[0]
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في تحديث العضو:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في تحديث العضو',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    console.log(`🗑️ حذف عضو الفريق: ${id}`);
    
    // التحقق من وجود العضو
    const existingMember = await prisma.$queryRaw`
      SELECT id, name FROM team_members WHERE id = ${id}
    `;
    
    if (existingMember.length === 0) {
      return NextResponse.json(
        { success: false, error: 'العضو غير موجود' },
        { status: 404 }
      );
    }
    
    // حذف العضو
    await prisma.$executeRawUnsafe(`
      DELETE FROM team_members WHERE id = $1
    `, id);
    
    console.log(`✅ تم حذف العضو: ${existingMember[0].name}`);
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف العضو بنجاح'
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في حذف العضو:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في حذف العضو',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}