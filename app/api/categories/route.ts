import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// ===============================
// أنواع البيانات
// ===============================

interface Category {
  id: number;
  name_ar: string;
  name_en?: string;
  description?: string;
  slug: string;
  color_hex: string;
  icon?: string;
  parent_id?: number;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  children?: Category[];
  article_count?: number;
  meta_title?: string;
  meta_description?: string;
  can_delete?: boolean;
}

interface CreateCategoryRequest {
  name_ar: string;
  name_en?: string;
  description?: string;
  slug: string;
  color_hex: string;
  icon?: string;
  parent_id?: number;
  position?: number;
  is_active?: boolean;
  meta_title?: string;
  meta_description?: string;
}

// ===============================
// إدارة البيانات
// ===============================

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'categories.json');

// قراءة التصنيفات من الملف
async function loadCategories(): Promise<Category[]> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.categories || [];
  } catch (error) {
    // إذا لم يكن الملف موجودًا، إرجاع مصفوفة فارغة
    return [];
  }
}

// حفظ التصنيفات في الملف
async function saveCategories(categories: Category[]): Promise<void> {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const dataToSave = { categories };
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (error) {
    console.error('خطأ في حفظ التصنيفات:', error);
    throw new Error('فشل في حفظ التصنيفات');
  }
}

// ===============================
// وظائف مساعدة
// ===============================

// التحقق من صحة slug
async function validateSlug(slug: string, excludeId?: number): Promise<boolean> {
  const categories = await loadCategories();
  return !categories.some(cat => cat.slug === slug && cat.id !== excludeId);
}

// توليد ID جديد
async function generateNewId(): Promise<number> {
  const categories = await loadCategories();
  return Math.max(...categories.map(cat => cat.id), 0) + 1;
}

// ===============================
// معالجات API
// ===============================

// GET: استرجاع جميع التصنيفات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active_only = searchParams.get('active_only') === 'true';
    const status = searchParams.get('status'); // دعم معامل status أيضاً
    const search = searchParams.get('search');

    // تحميل التصنيفات من الملف
    let result = await loadCategories();

    // تطبيق الفلاتر
    if (active_only || status === 'active') {
      result = result.filter(cat => cat.is_active);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(cat => 
        cat.name_ar.toLowerCase().includes(searchLower) ||
        cat.name_en?.toLowerCase().includes(searchLower) ||
        cat.description?.toLowerCase().includes(searchLower) ||
        cat.slug.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        total: result.length
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'فشل في استرجاع التصنيفات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// POST: إنشاء تصنيف جديد
export async function POST(request: NextRequest) {
  try {
    const body: CreateCategoryRequest = await request.json();

    // التحقق من صحة البيانات المطلوبة
    if (!body.name_ar?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'اسم التصنيف بالعربية مطلوب'
      }, { status: 400 });
    }

    if (!body.slug?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'مسار URL (slug) مطلوب'
      }, { status: 400 });
    }

    // التحقق من عدم تكرار slug
    const isSlugValid = await validateSlug(body.slug);
    if (!isSlugValid) {
      return NextResponse.json({
        success: false,
        error: 'مسار URL موجود بالفعل'
      }, { status: 400 });
    }

    // إنشاء التصنيف الجديد
    const newCategory: Category = {
      id: await generateNewId(),
      name_ar: body.name_ar.trim(),
      name_en: body.name_en?.trim(),
      description: body.description?.trim(),
      slug: body.slug.trim(),
      color_hex: body.color_hex || '#E5F1FA',
      icon: body.icon || '📰',
      parent_id: body.parent_id,
      position: body.position || 0,
      is_active: body.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      article_count: 0,
      meta_title: body.meta_title?.trim(),
      meta_description: body.meta_description?.trim(),
      can_delete: true
    };

    // إضافة التصنيف الجديد وحفظه
    const categories = await loadCategories();
    categories.push(newCategory);
    await saveCategories(categories);

    return NextResponse.json({
      success: true,
      data: newCategory,
      message: 'تم إنشاء التصنيف بنجاح'
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء التصنيف',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
} 