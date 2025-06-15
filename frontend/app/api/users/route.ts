import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, hashPassword, logActivity } from '@/app/lib/auth';

// GET /api/users - الحصول على قائمة المستخدمين
export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission('users.view');
    
    // استعلام المستخدمين من قاعدة البيانات
    // هنا نرجع بيانات تجريبية
    const users = [
      {
        id: '1',
        email: 'admin@sabq.org',
        name: 'مدير النظام',
        role: { id: 1, name: 'مشرف عام' },
        status: 'active',
        sections: [],
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString()
      },
      {
        id: '2',
        email: 'editor@sabq.org',
        name: 'أحمد الشمري',
        role: { id: 2, name: 'رئيس تحرير' },
        status: 'active',
        sections: [],
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString()
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 403 }
    );
  }
}

// POST /api/users - إنشاء مستخدم جديد
export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission('users.create');
    const body = await request.json();
    
    // التحقق من البيانات المطلوبة
    const { email, name, password, role_id, sections = [] } = body;
    
    if (!email || !name || !password || !role_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // التحقق من قوة كلمة المرور
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    // تشفير كلمة المرور
    const passwordHash = await hashPassword(password);
    
    // إنشاء المستخدم في قاعدة البيانات
    // هنا نرجع بيانات تجريبية
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      role_id,
      status: 'active',
      sections,
      created_at: new Date().toISOString()
    };
    
    // تسجيل النشاط
    await logActivity(
      user.id,
      'CREATE_USER',
      'user',
      newUser.id,
      newUser.name
    );
    
    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'تم إنشاء المستخدم بنجاح'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 403 }
    );
  }
} 