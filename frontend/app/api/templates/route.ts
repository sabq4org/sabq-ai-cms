import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/app/lib/auth'

// GET /api/templates
export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission('templates.view')
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    // هنا يتم جلب القوالب من قاعدة البيانات
    // مؤقتاً نرجع بيانات تجريبية
    const templates = [
      {
        id: 1,
        name: 'الهيدر الافتراضي',
        description: 'قالب الهيدر الأساسي للموقع',
        type: 'header',
        content: {
          logo: {
            url: '/images/sabq-logo.svg',
            alt: 'صحيفة سبق الإلكترونية'
          },
          navigation: {
            items: [
              { label: 'الرئيسية', url: '/', order: 1 },
              { label: 'محليات', url: '/local', order: 2 },
              { label: 'دولي', url: '/international', order: 3 },
              { label: 'اقتصاد', url: '/economy', order: 4 },
              { label: 'رياضة', url: '/sports', order: 5 }
            ]
          }
        },
        is_active: true,
        is_default: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      },
      {
        id: 2,
        name: 'الفوتر الافتراضي',
        description: 'قالب الفوتر الأساسي للموقع',
        type: 'footer',
        content: {
          sections: [
            {
              title: 'عن سبق',
              links: [
                { label: 'من نحن', url: '/about' },
                { label: 'رؤيتنا ورسالتنا', url: '/vision' }
              ]
            }
          ],
          newsletter: {
            enabled: true,
            title: 'اشترك في النشرة البريدية'
          },
          copyright: '© 2024 صحيفة سبق الإلكترونية. جميع الحقوق محفوظة.'
        },
        is_active: true,
        is_default: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      }
    ]
    
    // فلترة حسب النوع إذا تم تحديده
    const filteredTemplates = type 
      ? templates.filter(t => t.type === type)
      : templates
    
    return NextResponse.json(filteredTemplates)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 403 }
    )
  }
}

// POST /api/templates
export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission('templates.create')
    const data = await request.json()
    
    // التحقق من البيانات المطلوبة
    if (!data.name || !data.type || !data.content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // هنا يتم إنشاء القالب في قاعدة البيانات
    const newTemplate = {
      id: Date.now(),
      ...data,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      data: newTemplate
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
} 