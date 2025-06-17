import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ROLES_FILE = path.join(process.cwd(), 'data', 'roles.json');

// الأدوار الافتراضية
const DEFAULT_ROLES = [
  {
    id: 'role-admin',
    name: 'مشرف عام',
    description: 'صلاحيات كاملة على النظام',
    permissions: ['all'],
    color: 'red',
    users: 0
  },
  {
    id: 'role-editor-chief',
    name: 'رئيس تحرير',
    description: 'إدارة شاملة للمحتوى والفريق',
    permissions: ['create_articles', 'edit_articles', 'delete_articles', 'publish_articles', 'manage_users', 'view_analytics'],
    color: 'blue',
    users: 0
  },
  {
    id: 'role-editor',
    name: 'محرر',
    description: 'كتابة وتحرير المقالات',
    permissions: ['create_articles', 'edit_articles', 'publish_articles'],
    color: 'green',
    users: 0
  },
  {
    id: 'role-reporter',
    name: 'مراسل',
    description: 'كتابة الأخبار والتقارير',
    permissions: ['create_articles', 'edit_articles'],
    color: 'cyan',
    users: 0
  },
  {
    id: 'role-proofreader',
    name: 'مدقق لغوي',
    description: 'مراجعة وتدقيق المحتوى',
    permissions: ['edit_articles', 'review_articles'],
    color: 'purple',
    users: 0
  },
  {
    id: 'role-media-manager',
    name: 'مدير وسائط',
    description: 'إدارة الصور والفيديوهات',
    permissions: ['manage_media', 'edit_articles'],
    color: 'orange',
    users: 0
  },
  {
    id: 'role-ai-supervisor',
    name: 'مسؤول AI',
    description: 'إدارة أدوات الذكاء الاصطناعي',
    permissions: ['manage_ai', 'view_analytics', 'edit_articles'],
    color: 'purple',
    users: 0
  },
  {
    id: 'role-engagement-supervisor',
    name: 'مشرف تفاعل',
    description: 'إدارة التفاعل مع الجمهور',
    permissions: ['manage_comments', 'view_analytics', 'share_articles'],
    color: 'green',
    users: 0
  },
  {
    id: 'role-viewer',
    name: 'Viewer',
    description: 'صلاحيات المشاهدة فقط',
    permissions: ['view_articles', 'view_analytics'],
    color: 'gray',
    users: 0
  }
];

// تأكد من وجود المجلد
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// تهيئة الأدوار الافتراضية
async function initializeRoles() {
  await ensureDataDir();
  
  try {
    await fs.access(ROLES_FILE);
  } catch {
    // إذا لم يكن الملف موجود، أنشئ الأدوار الافتراضية
    await fs.writeFile(ROLES_FILE, JSON.stringify(DEFAULT_ROLES, null, 2));
  }
}

export async function GET() {
  try {
    await initializeRoles();
    
    const data = await fs.readFile(ROLES_FILE, 'utf-8');
    const roles = JSON.parse(data);
    
    // تحديث عدد المستخدمين لكل دور
    const teamFile = path.join(process.cwd(), 'data', 'team-members.json');
    try {
      const teamData = await fs.readFile(teamFile, 'utf-8');
      const teamMembers = JSON.parse(teamData);
      
      roles.forEach((role: any) => {
        role.users = teamMembers.filter((member: any) => member.roleId === role.id).length;
      });
    } catch {
      // إذا لم يكن هناك أعضاء فريق
    }
    
    return NextResponse.json({ 
      success: true, 
      data: roles,
      total: roles.length 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب الأدوار' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeRoles();
    
    const body = await request.json();
    const { name, description, permissions = [], color = 'blue' } = body;
    
    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال اسم ووصف الدور' },
        { status: 400 }
      );
    }
    
    const data = await fs.readFile(ROLES_FILE, 'utf-8');
    const roles = JSON.parse(data);
    
    // التحقق من عدم تكرار اسم الدور
    const existingRole = roles.find((r: any) => r.name === name);
    if (existingRole) {
      return NextResponse.json(
        { success: false, error: 'يوجد دور بنفس الاسم' },
        { status: 400 }
      );
    }
    
    const newRole = {
      id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      permissions,
      color,
      users: 0
    };
    
    roles.push(newRole);
    
    await fs.writeFile(ROLES_FILE, JSON.stringify(roles, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      data: newRole,
      message: 'تم إنشاء الدور بنجاح' 
    });
    
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إنشاء الدور' },
      { status: 500 }
    );
  }
}
