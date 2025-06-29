import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

export const runtime = 'nodejs'

// POST /api/categories/import
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'غير مصرح لك' }), { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'لم يتم رفع أي ملف' }), { status: 400 })
    }

    const fileContent = await file.text()
    const categoriesToImport = JSON.parse(fileContent)

    if (!Array.isArray(categoriesToImport)) {
      return new NextResponse(JSON.stringify({ error: 'صيغة الملف غير صالحة' }), { status: 400 })
    }

    let createdCount = 0
    let updatedCount = 0

    for (const category of categoriesToImport) {
      const { id, name, slug, ...rest } = category
      
      const data = {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        ...rest,
      }

      const existingCategory = await prisma.category.findUnique({
        where: { id: id },
      })

      if (existingCategory) {
        await prisma.category.update({
          where: { id: id },
          data: data,
        })
        updatedCount++
      } else {
        await prisma.category.create({
          data: { ...data, id: id },
        })
        createdCount++
      }
    }

    return new NextResponse(JSON.stringify({ 
      message: 'تم استيراد التصنيفات بنجاح',
      created: createdCount,
      updated: updatedCount,
    }), { status: 200 })

  } catch (error) {
    console.error('فشل في استيراد التصنيفات:', error)
    return new NextResponse(JSON.stringify({ error: 'فشل في استيراد التصنيفات' }), { status: 500 })
  }
} 