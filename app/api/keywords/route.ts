import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';











const prisma = new PrismaClient();

// دالة مساعدة لتوليد slug
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^\u0600-\u06FF\w\s-]/g, '').replace(/[\s-]+/g, '-');
}

// دالة مساعدة لتوليد ID
function generateId(): string {
  return `keyword_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface Keyword {
  id: string;
  name: string;
  usageCount: number;
}

// جلب الكلمات المفتاحية من قاعدة البيانات
async function loadKeywords(search?: string): Promise<Keyword[]> {
  try {
    console.log('🔍 جلب الكلمات المفتاحية من قاعدة البيانات...');
    
    const keywords = await prisma.keywords.findMany({
      where: search ? {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      } : undefined,
      orderBy: [
        { count: 'desc' },
        { name: 'asc' }
      ]
    });

    console.log(`✅ تم جلب ${keywords.length} كلمة مفتاحية`);

    // تحويل البيانات لتنسيق API القديم
    return keywords.map(keyword => ({
      id: keyword.id,
      name: keyword.name,
      usageCount: keyword.count
    }));

  } catch (error) {
    console.error('❌ خطأ في جلب الكلمات المفتاحية:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

// إنشاء كلمة مفتاحية جديدة
async function createKeyword(name: string, usageCount: number = 0): Promise<Keyword> {
  try {
    console.log('📝 إنشاء كلمة مفتاحية جديدة:', name);
    
    const slug = generateSlug(name);
    
    const newKeyword = await prisma.keywords.create({
      data: {
        id: generateId(),
        name: name,
        slug: slug,
        count: usageCount
      }
    });
    
    console.log('✅ تم إنشاء الكلمة المفتاحية:', newKeyword.id);
    
    return {
      id: newKeyword.id,
      name: newKeyword.name,
      usageCount: newKeyword.count
    };
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الكلمة المفتاحية:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تحديث كلمة مفتاحية
async function updateKeyword(id: string, updates: Partial<Keyword>): Promise<Keyword> {
  try {
    console.log('🔄 تحديث كلمة مفتاحية:', id);
    
    const updatedKeyword = await prisma.keywords.update({
      where: { id },
      data: {
        name: updates.name,
        slug: updates.name ? generateSlug(updates.name) : undefined,
        count: updates.usageCount
      }
    });
    
    console.log('✅ تم تحديث الكلمة المفتاحية:', updatedKeyword.id);
    
    return {
      id: updatedKeyword.id,
      name: updatedKeyword.name,
      usageCount: updatedKeyword.count
    };
    
  } catch (error) {
    console.error('❌ خطأ في تحديث الكلمة المفتاحية:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// حذف كلمة مفتاحية
async function deleteKeyword(id: string): Promise<void> {
  try {
    console.log('🗑️ حذف كلمة مفتاحية:', id);
    
    await prisma.keywords.delete({
      where: { id }
    });
    
    console.log('✅ تم حذف الكلمة المفتاحية:', id);
    
  } catch (error) {
    console.error('❌ خطأ في حذف الكلمة المفتاحية:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// GET: جلب الكلمات المفتاحية مع البحث الاختياري
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 GET /api/keywords - بداية معالجة الطلب');
    
    // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request URL'
      }, { status: 400 });
    }
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    
    console.log('🔍 معاملات البحث:', { search });
    
    const keywords = await loadKeywords(search);
    
    console.log(`✅ تم جلب ${keywords.length} كلمة مفتاحية`);
    return NextResponse.json({ 
      success: true, 
      data: keywords,
      count: keywords.length
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في جلب الكلمات المفتاحية:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'فشل في جلب الكلمات المفتاحية',
      details: error.message
    }, { status: 500 });
  }
}

// POST: إضافة كلمة مفتاحية جديدة
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/keywords - بداية معالجة الطلب');
    
    const body = await request.json();
    console.log('📦 البيانات المستلمة:', body);
    
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'اسم الكلمة المفتاحية مطلوب' 
      }, { status: 400 });
    }
    
    // التحقق من عدم وجود الكلمة مسبقاً
    const existingKeywords = await loadKeywords();
    const exists = existingKeywords.find(k => k.name.toLowerCase() === body.name.toLowerCase());
    
    if (exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'الكلمة المفتاحية موجودة مسبقاً' 
      }, { status: 400 });
    }
    
    const newKeyword = await createKeyword(body.name.trim(), body.usageCount ?? 0);
    
    console.log('✅ تم إنشاء الكلمة المفتاحية بنجاح:', newKeyword.id);
    return NextResponse.json({ 
      success: true, 
      data: newKeyword,
      message: 'تم إضافة الكلمة المفتاحية بنجاح'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ خطأ في إضافة الكلمة المفتاحية:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: false, 
        error: 'الكلمة المفتاحية موجودة مسبقاً' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'فشل في إضافة الكلمة المفتاحية',
      details: error.message
    }, { status: 500 });
  }
}

// PUT: تحديث كلمة مفتاحية
export async function PUT(request: NextRequest) {
  try {
    console.log('🚀 PUT /api/keywords - بداية معالجة الطلب');
    
    // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request URL'
      }, { status: 400 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    console.log('📦 معاملات التحديث:', { id, body });
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'معرف الكلمة المفتاحية مطلوب' 
      }, { status: 400 });
    }
    
    // بناء البيانات للتحديث
    const updates: Partial<Keyword> = {};
    if (body.name && body.name.trim()) {
      updates.name = body.name.trim();
    }
    if (typeof body.usageCount === 'number') {
      updates.usageCount = body.usageCount;
    }
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'لا يوجد بيانات للتحديث' 
      }, { status: 400 });
    }
    
    const updatedKeyword = await updateKeyword(id, updates);
    
    console.log('✅ تم تحديث الكلمة المفتاحية بنجاح:', updatedKeyword.id);
    return NextResponse.json({ 
      success: true, 
      data: updatedKeyword,
      message: 'تم تحديث الكلمة المفتاحية بنجاح'
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في تحديث الكلمة المفتاحية:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ 
        success: false, 
        error: 'الكلمة المفتاحية غير موجودة' 
      }, { status: 404 });
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: false, 
        error: 'اسم الكلمة المفتاحية موجود مسبقاً' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'فشل في تحديث الكلمة المفتاحية',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE: حذف كلمة مفتاحية
export async function DELETE(request: NextRequest) {
  try {
    console.log('🚀 DELETE /api/keywords - بداية معالجة الطلب');
    
    // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request URL'
      }, { status: 400 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    console.log('🗑️ معرف الكلمة المفتاحية للحذف:', id);
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'معرف الكلمة المفتاحية مطلوب' 
      }, { status: 400 });
    }
    
    await deleteKeyword(id);
    
    console.log('✅ تم حذف الكلمة المفتاحية بنجاح:', id);
    return NextResponse.json({ 
      success: true,
      message: 'تم حذف الكلمة المفتاحية بنجاح'
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في حذف الكلمة المفتاحية:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ 
        success: false, 
        error: 'الكلمة المفتاحية غير موجودة' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'فشل في حذف الكلمة المفتاحية',
      details: error.message
    }, { status: 500 });
  }
} 