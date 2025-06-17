import { NextRequest, NextResponse } from 'next/server';
import { articles } from '../route';

// GET method لاسترجاع مقال محدد
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const article = articles.find(a => a.id === id);
    
    if (!article) {
      return NextResponse.json({ 
        success: false, 
        error: 'المقال غير موجود' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: article,
      message: 'تم جلب المقال بنجاح' 
    });
  } catch (e) {
    console.error('خطأ في جلب المقال:', e);
    return NextResponse.json({ 
      success: false, 
      error: 'فشل في جلب المقال' 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const index = articles.findIndex(a => a.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'مقال غير موجود' }, { status: 404 });
    }

    // تحديث الحقول المسموح بها فقط
    const allowed = ['status', 'is_deleted'];
    const updated = { ...articles[index] } as any;
    allowed.forEach(k => {
      if (k in body) updated[k] = body[k];
    });
    updated.updated_at = new Date().toISOString();
    articles[index] = updated;

    return NextResponse.json({ success: true, data: updated, message: 'تم التحديث بنجاح' });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'فشل التحديث' }, { status: 500 });
  }
}

// PUT method لتحديث المقال كاملاً (للتحرير)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const index = articles.findIndex(a => a.id === id);
    
    if (index === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'المقال غير موجود' 
      }, { status: 404 });
    }

    // تحديث المقال مع الاحتفاظ بالحقول الأساسية
    const updated = {
      ...articles[index],
      ...body,
      id, // المحافظة على المعرف
      updated_at: new Date().toISOString(),
      author_id: articles[index].author_id // المحافظة على معرف الكاتب الأصلي
    };
    
    articles[index] = updated;

    return NextResponse.json({ 
      success: true, 
      data: updated, 
      message: 'تم تحديث المقال بنجاح' 
    });
  } catch (e) {
    console.error('خطأ في تحديث المقال:', e);
    return NextResponse.json({ 
      success: false, 
      error: 'فشل في تحديث المقال' 
    }, { status: 500 });
  }
}