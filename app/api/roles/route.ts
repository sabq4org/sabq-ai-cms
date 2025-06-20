import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ROLES_FILE = path.join(process.cwd(), 'data', 'roles.json');

// بيانات الأدوار الافتراضية
const defaultRoles = [
  {
    id: '1',
    name: 'مدير النظام',
    description: 'صلاحيات كاملة على النظام',
    permissions: [
      'create_articles', 'edit_articles', 'delete_articles', 'publish_articles',
      'manage_users', 'system_settings', 'backup_system', 'review_articles',
      'manage_media', 'manage_ai', 'manage_comments', 'view_analytics', 'share_articles'
    ],
    color: '#DC2626' // أحمر
  },
  {
    id: '2',
    name: 'محرر',
    description: 'إدارة المحتوى والمقالات',
    permissions: [
      'create_articles', 'edit_articles', 'delete_articles', 'publish_articles',
      'review_articles', 'manage_media', 'manage_comments', 'view_analytics', 'share_articles'
    ],
    color: '#059669' // أخضر
  },
  {
    id: '3',
    name: 'كاتب',
    description: 'كتابة وتعديل المقالات',
    permissions: [
      'create_articles', 'edit_articles', 'manage_media', 'view_analytics', 'share_articles'
    ],
    color: '#2563EB' // أزرق
  },
  {
    id: '4',
    name: 'مشرف',
    description: 'مراجعة ونشر المحتوى',
    permissions: [
      'review_articles', 'publish_articles', 'manage_comments', 'view_analytics'
    ],
    color: '#7C3AED' // بنفسجي
  },
  {
    id: '5',
    name: 'عضو',
    description: 'صلاحيات أساسية',
    permissions: [
      'view_analytics', 'share_articles'
    ],
    color: '#6B7280' // رمادي
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
    await fs.writeFile(ROLES_FILE, JSON.stringify(defaultRoles, null, 2));
  }
}

// GET - جلب جميع الأدوار
export async function GET(request: NextRequest) {
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
      count: roles.length
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب الأدوار'
    }, { status: 500 });
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
