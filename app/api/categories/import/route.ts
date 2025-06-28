import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// POST /api/categories/import
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'الملف مفقود' }, { status: 400 })
    }

    const text = await file.text()

    let categories
    try {
      categories = JSON.parse(text)
    } catch (e) {
      return NextResponse.json({ success: false, error: 'ملف JSON غير صالح' }, { status: 400 })
    }

    if (!Array.isArray(categories)) {
      return NextResponse.json({ success: false, error: 'تنسيق الملف غير صحيح. يجب أن يكون مصفوفة تصنيفات.' }, { status: 400 })
    }

    // نقوم بإنشاء أو تحديث كل تصنيف عبر upsert
    const operations = categories.map((c: any) => {
      return prisma.category.upsert({
        where: { id: c.id ?? '' },
        update: {
          name: c.name || c.name_ar,
          nameEn: c.nameEn || c.name_en,
          slug: c.slug,
          description: c.description,
          color: c.color || c.color_hex,
          icon: c.icon,
          parentId: c.parentId || c.parent_id || null,
          displayOrder: c.displayOrder ?? c.order_index ?? 0,
          isActive: c.isActive ?? c.is_active ?? true,
          metadata: c.metadata,
        },
        create: {
          id: c.id, // إذا كان موجودًا سيوضع، وإلا ستولّد Prisma
          name: c.name || c.name_ar,
          nameEn: c.nameEn || c.name_en,
          slug: c.slug,
          description: c.description,
          color: c.color || c.color_hex,
          icon: c.icon,
          parentId: c.parentId || c.parent_id || null,
          displayOrder: c.displayOrder ?? c.order_index ?? 0,
          isActive: c.isActive ?? c.is_active ?? true,
          metadata: c.metadata,
        },
      })
    })

    const result = await prisma.$transaction(operations)

    return NextResponse.json({ success: true, count: result.length, message: `تم استيراد/تحديث ${result.length} تصنيفاً` })
  } catch (error) {
    console.error('خطأ في استيراد التصنيفات:', error)
    return NextResponse.json({ success: false, error: 'فشل في استيراد التصنيفات' }, { status: 500 })
  }
} 