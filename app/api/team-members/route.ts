import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// مسار ملف البيانات
const DATA_FILE = path.join(process.cwd(), 'data', 'team-members.json');

// دالة لإنشاء ID فريد
function generateId(): string {
  return `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// دالة لقراءة البيانات
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // إذا لم يكن الملف موجوداً، نرجع مصفوفة فارغة
    return [];
  }
}

// دالة لكتابة البيانات
async function writeData(data: any[]) {
  // التأكد من وجود مجلد data
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 جلب أعضاء الفريق من ملف JSON...');
    
    const teamMembers = await readData();
    
    // ترتيب حسب display_order ثم created_at
    teamMembers.sort((a: any, b: any) => {
      if (a.display_order !== b.display_order) {
        return (a.display_order || 0) - (b.display_order || 0);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
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
    
    // قراءة البيانات الحالية
    const teamMembers = await readData();
    
    // التحقق من عدم وجود عضو بنفس البريد
    const existingMember = teamMembers.find((m: any) => m.email === data.email);
    if (existingMember) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'يوجد عضو بنفس البريد الإلكتروني' 
        },
        { status: 400 }
      );
    }
    
    // الحصول على أعلى display_order
    const maxOrder = teamMembers.reduce((max: number, m: any) => 
      Math.max(max, m.display_order || 0), 0
    );
    
    // إنشاء العضو الجديد
    const newMember = {
      id: generateId(),
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department || null,
      position: data.position || null,
      bio: data.bio || null,
      avatar: data.avatar || null,
      phone: data.phone || null,
      social_links: data.social_links || {},
      is_active: data.is_active !== false,
      display_order: maxOrder + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // إضافة العضو للقائمة
    teamMembers.push(newMember);
    
    // حفظ البيانات
    await writeData(teamMembers);
    
    console.log('✅ تم إضافة العضو بنجاح');
    
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
  }
}