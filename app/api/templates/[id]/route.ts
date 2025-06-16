import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/app/lib/auth'

// GET /api/templates/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission('templates.view')
    const { id } = await params
    
    // هنا يتم جلب القالب من قاعدة البيانات
    // مؤقتاً نرجع بيانات تجريبية
    const template = {
      id: parseInt(id),
      name: 'الهيدر الافتراضي',
      description: 'قالب الهيدر الأساسي للموقع',
      type: 'header',
      content: {
        logo: {
          url: '/images/sabq-logo.svg',
          alt: 'صحيفة سبق الإلكترونية'
        }
      },
      is_active: true,
      is_default: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    }
    
    return NextResponse.json(template)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 403 }
    )
  }
}

// PATCH /api/templates/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission('templates.update')
    const { id } = await params
    const data = await request.json()
    
    // هنا يتم تحديث القالب في قاعدة البيانات
    const updatedTemplate = {
      id: parseInt(id),
      ...data,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      data: updatedTemplate
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

// DELETE /api/templates/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission('templates.delete')
    const { id } = await params
    
    // التحقق من أن القالب ليس افتراضياً
    // هنا يتم حذف القالب من قاعدة البيانات
    
    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
} 