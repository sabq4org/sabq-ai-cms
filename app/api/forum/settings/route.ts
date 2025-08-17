import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/lib/supabase';

const supabase = getSupabaseClient();

// جلب الإعدادات
export async function GET(request: NextRequest) {
  try {
    const { data: settings, error } = await supabase
      .from('forum_settings')
      .select('*')
      .single();

    if (error && error.code === 'PGRST116') {
      // لا توجد إعدادات، إرجاع الإعدادات الافتراضية
      return NextResponse.json({
        success: true,
        settings: {
          forum_name: 'منتدى سبق',
          forum_description: 'مجتمع النقاش والحوار',
          allow_guest_read: true,
          require_moderation: false,
          allow_edit_posts: true,
          enable_reputation: true,
          enable_badges: true,
          max_topics_per_day: 10
        }
      });
    }

    if (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error in GET /api/forum/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// حفظ الإعدادات
export async function POST(request: NextRequest) {
  try {
    // التحقق من المستخدم
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = JSON.parse(userCookie.value);
    
    // التحقق من صلاحيات المستخدم (يجب أن يكون مشرف)
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { settings } = await request.json();

    // التحقق من وجود جدول الإعدادات أولاً
    const { data: existingSettings } = await supabase
      .from('forum_settings')
      .select('id')
      .single();

    let result;
    if (existingSettings) {
      // تحديث الإعدادات الموجودة
      result = await supabase
        .from('forum_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)
        .select()
        .single();
    } else {
      // إنشاء إعدادات جديدة
      result = await supabase
        .from('forum_settings')
        .insert({
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error saving settings:', result.error);
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      settings: result.data
    });
  } catch (error) {
    console.error('Error in POST /api/forum/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 