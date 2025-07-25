import { NextRequest, NextResponse } from 'next/server';

// API مبسط للأدوار - نسخة احتياطية
export async function GET(request: NextRequest) {
  console.log('🔄 API البسيط: محاولة إرجاع أدوار افتراضية...');
  
  try {
    // أدوار افتراضية في حالة فشل قاعدة البيانات
    const defaultRoles = [
      {
        id: 'role-admin-default',
        name: 'admin',
        display_name: 'مدير النظام',
        description: 'صلاحيات كاملة لإدارة النظام',
        users: 0,
        permissions: ['manage_all'],
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'role-editor-default', 
        name: 'editor',
        display_name: 'محرر',
        description: 'إدارة المحتوى والمقالات',
        users: 0,
        permissions: ['manage_content'],
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'role-writer-default',
        name: 'writer', 
        display_name: 'كاتب',
        description: 'كتابة ونشر المقالات',
        users: 0,
        permissions: ['create_articles'],
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    console.log('✅ API البسيط: تم إرجاع الأدوار الافتراضية');
    
    return NextResponse.json({
      success: true,
      data: defaultRoles,
      count: defaultRoles.length,
      message: 'أدوار افتراضية - يرجى إعداد قاعدة البيانات',
      fallback: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ API البسيط: فشل في إرجاع الأدوار الافتراضية:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في تحميل الأدوار الافتراضية',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
