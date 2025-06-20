import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// نوع بيانات عضو الفريق
interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  role: string;
  department: string;
  joinDate: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
  permissions: string[];
}

// مسار ملف بيانات الفريق
const TEAM_FILE = path.join(process.cwd(), 'data', 'team_members.json');

// دالة لقراءة بيانات الفريق
async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const fileContents = await fs.readFile(TEAM_FILE, 'utf8');
    const data = JSON.parse(fileContents);
    return data.teamMembers || [];
  } catch (error) {
    // إذا لم يكن الملف موجود، أنشئ ملف جديد
    await saveTeamMembers([]);
    return [];
  }
}

// دالة لحفظ بيانات الفريق
async function saveTeamMembers(teamMembers: TeamMember[]): Promise<void> {
  const data = { teamMembers, updated_at: new Date().toISOString() };
  await fs.writeFile(TEAM_FILE, JSON.stringify(data, null, 2));
}

// دالة للحصول على بيانات المستخدم
async function getUserData(userId: string) {
  try {
    const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
    const fileContents = await fs.readFile(usersFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    const users = Array.isArray(data) ? data : (data.users || []);
    
    return users.find((user: any) => user.id === userId);
  } catch (error) {
    return null;
  }
}

// GET - جلب جميع أعضاء الفريق
export async function GET(request: NextRequest) {
  try {
    const teamMembers = await getTeamMembers();
    
    return NextResponse.json({
      success: true,
      data: teamMembers,
      count: teamMembers.length
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب بيانات الفريق'
    }, { status: 500 });
  }
}

// POST - إضافة عضو جديد للفريق
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, roleId, department, permissions } = body;
    
    // التحقق من البيانات المطلوبة
    if (!userId || !roleId || !department) {
      return NextResponse.json({
        success: false,
        error: 'يرجى ملء جميع الحقول المطلوبة'
      }, { status: 400 });
    }
    
    // جلب بيانات المستخدم
    const userData = await getUserData(userId);
    if (!userData) {
      return NextResponse.json({
        success: false,
        error: 'المستخدم غير موجود'
      }, { status: 404 });
    }
    
    // التحقق من عدم وجود العضو مسبقاً
    const teamMembers = await getTeamMembers();
    const existingMember = teamMembers.find(member => member.userId === userId);
    
    if (existingMember) {
      return NextResponse.json({
        success: false,
        error: 'هذا المستخدم عضو في الفريق بالفعل'
      }, { status: 400 });
    }
    
    // الحصول على اسم الدور (في بيئة حقيقية، يجب جلبه من جدول الأدوار)
    const roleNames: { [key: string]: string } = {
      '1': 'مدير النظام',
      '2': 'محرر',
      '3': 'كاتب',
      '4': 'مشرف',
      '5': 'عضو'
    };
    
    // إنشاء عضو الفريق الجديد
    const newMember: TeamMember = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      roleId: roleId,
      role: roleNames[roleId] || 'عضو',
      department: department,
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active',
      avatar: userData.avatar || '/default-avatar.png',
      permissions: permissions || []
    };
    
    // إضافة العضو الجديد وحفظ البيانات
    teamMembers.push(newMember);
    await saveTeamMembers(teamMembers);
    
    // تسجيل العملية في سجل النشاط
    try {
      const logsPath = path.join(process.cwd(), 'data', 'admin_logs.json');
      const logsContent = await fs.readFile(logsPath, 'utf8');
      const logsData = JSON.parse(logsContent);
      
      const newLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        admin_id: 'system', // يجب أن يكون معرف المستخدم الحالي
        admin_name: 'النظام',
        action: 'add_team_member',
        target_type: 'team_member',
        target_id: newMember.id,
        details: {
          memberName: newMember.name,
          role: newMember.role,
          department: newMember.department
        },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString()
      };
      
      logsData.logs.unshift(newLog);
      await fs.writeFile(logsPath, JSON.stringify(logsData, null, 2));
    } catch (error) {
      console.error('Error logging action:', error);
    }
    
    return NextResponse.json({
      success: true,
      message: 'تمت إضافة العضو بنجاح',
      data: newMember
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في إضافة العضو'
    }, { status: 500 });
  }
}

// DELETE - حذف عضو من الفريق
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('id');
    
    if (!memberId) {
      return NextResponse.json({
        success: false,
        error: 'معرف العضو مطلوب'
      }, { status: 400 });
    }
    
    const teamMembers = await getTeamMembers();
    const updatedMembers = teamMembers.filter(member => member.id !== memberId);
    
    if (teamMembers.length === updatedMembers.length) {
      return NextResponse.json({
        success: false,
        error: 'العضو غير موجود'
      }, { status: 404 });
    }
    
    await saveTeamMembers(updatedMembers);
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف العضو بنجاح'
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في حذف العضو'
    }, { status: 500 });
  }
}

// PUT - تحديث بيانات عضو في الفريق
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('id');

    if (!memberId) {
      return NextResponse.json({ success: false, error: 'معرّف العضو مطلوب' }, { status: 400 });
    }

    const body = await request.json();
    const { roleId, department, permissions, status } = body;

    const teamMembers = await getTeamMembers();
    const memberIndex = teamMembers.findIndex((m) => m.id === memberId || m.userId === memberId);

    if (memberIndex === -1) {
      return NextResponse.json({ success: false, error: 'العضو غير موجود' }, { status: 404 });
    }

    // تحديث الحقول المسموح بها
    if (roleId) teamMembers[memberIndex].roleId = roleId;
    if (department) teamMembers[memberIndex].department = department;
    if (Array.isArray(permissions)) teamMembers[memberIndex].permissions = permissions;
    if (status) teamMembers[memberIndex].status = status;

    // تحديث وقت آخر نشاط كمثال
    teamMembers[memberIndex].lastActive = new Date().toISOString();

    await saveTeamMembers(teamMembers);

    return NextResponse.json({ success: true, message: 'تم تحديث بيانات العضو بنجاح', data: teamMembers[memberIndex] });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في تحديث بيانات العضو' }, { status: 500 });
  }
} 