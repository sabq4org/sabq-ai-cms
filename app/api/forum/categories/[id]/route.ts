import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/lib/supabase';

const supabase = getSupabaseClient();

// تحديث فئة
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // التحقق من المستخدم
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = JSON.parse(userCookie.value);
    
    // التحقق من صلاحيات المستخدم (يجب أن يكون مشرف)
    const isAdmin = user.role === 'admin' || user.role === 'moderator';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // السماح بتحديث حقول معينة فقط
    const allowedFields = ['name', 'name_ar', 'name_en', 'description', 'color', 'is_active', 'display_order'];
    const updateData: any = {};
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });
    
    // إذا تم إرسال name فقط، استخدمه للعربي والإنجليزي
    if (body.name && !body.name_ar && !body.name_en) {
      updateData.name_ar = body.name;
      updateData.name_en = body.name;
    }
    
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('forum_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating category:', error);
      return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      category: data
    });
  } catch (error) {
    console.error('Error in PATCH /api/forum/categories/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// حذف فئة
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // التحقق من المستخدم
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = JSON.parse(userCookie.value);
    
    // التحقق من صلاحيات المستخدم (يجب أن يكون مشرف)
    const isAdmin = user.role === 'admin' || user.role === 'moderator';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // التحقق من وجود مواضيع في هذه الفئة
    const { count } = await supabase
      .from('forum_topics')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);
      
    if (count && count > 0) {
      return NextResponse.json({ 
        error: 'لا يمكن حذف هذه الفئة لأنها تحتوي على مواضيع. يرجى نقل أو حذف المواضيع أولاً.' 
      }, { status: 400 });
    }
    
    // حذف الفئة
    const { error } = await supabase
      .from('forum_categories')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting category:', error);
      return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/forum/categories/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 