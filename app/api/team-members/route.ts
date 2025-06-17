import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const TEAM_FILE = path.join(process.cwd(), 'data', 'team-members.json');

// تأكد من وجود المجلد
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

export async function GET() {
  try {
    await ensureDataDir();
    
    try {
      const data = await fs.readFile(TEAM_FILE, 'utf-8');
      const teamMembers = JSON.parse(data);
      
      return NextResponse.json({ 
        success: true, 
        data: teamMembers,
        total: teamMembers.length 
      });
    } catch (error) {
      // إذا لم يكن الملف موجود، أرجع مصفوفة فارغة
      return NextResponse.json({ 
        success: true, 
        data: [],
        total: 0 
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب بيانات الفريق' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDataDir();
    
    const body = await request.json();
    const { userId, roleId, department, permissions = [] } = body;
    
    if (!userId || !roleId || !department) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال جميع البيانات المطلوبة' },
        { status: 400 }
      );
    }
    
    // قراءة بيانات المستخدمين للحصول على معلومات المستخدم
    const usersFile = path.join(process.cwd(), 'data', 'users.json');
    let user = null;
    
    try {
      const usersData = await fs.readFile(usersFile, 'utf-8');
      const users = JSON.parse(usersData);
      user = users.find((u: any) => u.id === userId);
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'المستخدم غير موجود' },
          { status: 404 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'لا توجد بيانات مستخدمين' },
        { status: 404 }
      );
    }
    
    // قراءة بيانات الأدوار
    const rolesFile = path.join(process.cwd(), 'data', 'roles.json');
    let role = null;
    
    try {
      const rolesData = await fs.readFile(rolesFile, 'utf-8');
      const roles = JSON.parse(rolesData);
      role = roles.find((r: any) => r.id === roleId);
      
      if (!role) {
        return NextResponse.json(
          { success: false, error: 'الدور غير موجود' },
          { status: 404 }
        );
      }
    } catch {
      // إذا لم توجد أدوار، استخدم اسم افتراضي
      role = { name: 'عضو فريق' };
    }
    
    // قراءة أعضاء الفريق الحاليين
    let teamMembers = [];
    try {
      const data = await fs.readFile(TEAM_FILE, 'utf-8');
      teamMembers = JSON.parse(data);
    } catch {
      teamMembers = [];
    }
    
    // التحقق من عدم وجود العضو مسبقاً
    const existingMember = teamMembers.find((m: any) => m.userId === userId);
    if (existingMember) {
      return NextResponse.json(
        { success: false, error: 'هذا المستخدم موجود بالفعل في الفريق' },
        { status: 400 }
      );
    }
    
    // إنشاء عضو فريق جديد
    const newMember = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      roleId: roleId,
      role: role.name,
      department: department,
      permissions: permissions.length > 0 ? permissions : (role.permissions || []),
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active',
      avatar: user.avatar || '/api/placeholder/40/40'
    };
    
    teamMembers.push(newMember);
    
    // حفظ البيانات
    await fs.writeFile(TEAM_FILE, JSON.stringify(teamMembers, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      data: newMember,
      message: 'تمت إضافة العضو بنجاح' 
    });
    
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إضافة عضو الفريق' },
      { status: 500 }
    );
  }
} 