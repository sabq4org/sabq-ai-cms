import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// مسار ملف البيانات
const DATA_FILE = path.join(process.cwd(), 'data', 'team-members.json');

// دالة لقراءة البيانات
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// دالة لكتابة البيانات
async function writeData(data: any[]) {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    
    console.log(`📝 تحديث عضو الفريق: ${id}`);
    
    // قراءة البيانات الحالية
    const teamMembers = await readData();
    
    // البحث عن العضو
    const memberIndex = teamMembers.findIndex((m: any) => m.id === id);
    
    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'العضو غير موجود' },
        { status: 404 }
      );
    }
    
    // تحديث البيانات
    const updatedMember = {
      ...teamMembers[memberIndex],
      ...data,
      id: teamMembers[memberIndex].id, // الحفاظ على ID
      created_at: teamMembers[memberIndex].created_at, // الحفاظ على تاريخ الإنشاء
      updated_at: new Date().toISOString()
    };
    
    // استبدال العضو في المصفوفة
    teamMembers[memberIndex] = updatedMember;
    
    // حفظ البيانات
    await writeData(teamMembers);
    
    console.log('✅ تم تحديث العضو بنجاح');
    
    return NextResponse.json({
      success: true,
      message: 'تم تحديث العضو بنجاح',
      member: updatedMember
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
    
    // قراءة البيانات الحالية
    const teamMembers = await readData();
    
    // البحث عن العضو
    const memberIndex = teamMembers.findIndex((m: any) => m.id === id);
    
    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'العضو غير موجود' },
        { status: 404 }
      );
    }
    
    // حذف العضو من المصفوفة
    teamMembers.splice(memberIndex, 1);
    
    // حفظ البيانات
    await writeData(teamMembers);
    
    console.log('✅ تم حذف العضو بنجاح');
    
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