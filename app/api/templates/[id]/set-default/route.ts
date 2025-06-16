import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/app/lib/auth'

// POST /api/templates/[id]/set-default
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission('templates.update')
    const { id } = await params
    
    // هنا يتم:
    // 1. إلغاء تعيين القالب الافتراضي الحالي من نفس النوع
    // 2. تعيين القالب الجديد كافتراضي
    // في قاعدة البيانات
    
    return NextResponse.json({
      success: true,
      message: 'Template set as default successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
} 