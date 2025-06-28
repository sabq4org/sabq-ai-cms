import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// GET /api/categories/export
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
    })

    const json = JSON.stringify(categories, null, 2)

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="categories-export.json"',
      },
    })
  } catch (error) {
    console.error('خطأ في تصدير التصنيفات:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في تصدير التصنيفات' },
      { status: 500 },
    )
  }
} 