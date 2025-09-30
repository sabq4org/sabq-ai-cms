import { NextResponse } from 'next/server';

// نوع بيانات فئة البودكاست
interface PodcastCategory {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  episodeCount?: number;
}

// بيانات تجريبية للفئات
const mockCategories: PodcastCategory[] = [
  {
    id: 'cat-1',
    name: 'Economy',
    nameAr: 'الاقتصاد',
    slug: 'economy',
    description: 'تحليلات اقتصادية ومالية',
    color: '#10B981',
    icon: 'TrendingUp',
    displayOrder: 1,
    isActive: true,
    episodeCount: 5
  },
  {
    id: 'cat-2',
    name: 'Technology',
    nameAr: 'التكنولوجيا',
    slug: 'technology',
    description: 'آخر التطورات التقنية',
    color: '#3B82F6',
    icon: 'Smartphone',
    displayOrder: 2,
    isActive: true,
    episodeCount: 8
  },
  {
    id: 'cat-3',
    name: 'Education',
    nameAr: 'التعليم',
    slug: 'education',
    description: 'مواضيع تعليمية ومعرفية',
    color: '#8B5CF6',
    icon: 'GraduationCap',
    displayOrder: 3,
    isActive: true,
    episodeCount: 3
  },
  {
    id: 'cat-4',
    name: 'Analysis',
    nameAr: 'تحليلات',
    slug: 'analysis',
    description: 'تحليلات عميقة للأحداث',
    color: '#F59E0B',
    icon: 'Brain',
    displayOrder: 4,
    isActive: true,
    episodeCount: 7
  },
  {
    id: 'cat-5',
    name: 'Health',
    nameAr: 'الصحة',
    slug: 'health',
    description: 'مواضيع صحية ونمط حياة',
    color: '#EF4444',
    icon: 'Heart',
    displayOrder: 5,
    isActive: true,
    episodeCount: 2
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCount = searchParams.get('includeCount') === 'true';
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // default true

    let filteredCategories = [...mockCategories];

    // تصفية الفئات النشطة فقط
    if (activeOnly) {
      filteredCategories = filteredCategories.filter(category => category.isActive);
    }

    // ترتيب حسب ترتيب العرض
    filteredCategories.sort((a, b) => a.displayOrder - b.displayOrder);

    /* 
    // في المستقبل عند استخدام Prisma:
    
    const whereConditions: any = {};
    
    if (activeOnly) {
      whereConditions.isActive = true;
    }

    const categories = await prisma.podcastCategory.findMany({
      where: whereConditions,
      orderBy: { displayOrder: 'asc' },
      include: includeCount ? {
        _count: {
          select: {
            episodes: {
              where: { status: 'PUBLISHED' }
            }
          }
        }
      } : undefined
    });

    const formattedCategories = categories.map(category => ({
      ...category,
      episodeCount: includeCount ? category._count?.episodes : undefined
    }));
    */

    return NextResponse.json({
      categories: filteredCategories,
      total: filteredCategories.length
    });

  } catch (error) {
    console.error('خطأ في جلب فئات البودكاست:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب فئات البودكاست' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, nameAr, slug, description, color, icon } = body;

    // التحقق من البيانات المطلوبة
    if (!name || !nameAr || !slug) {
      return NextResponse.json(
        { error: 'الاسم والاسم العربي والرمز مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من عدم تكرار الرمز
    const existingCategory = mockCategories.find(cat => cat.slug === slug);
    if (existingCategory) {
      return NextResponse.json(
        { error: 'الرمز موجود مسبقاً' },
        { status: 409 }
      );
    }

    // إنشاء فئة جديدة
    const newCategory: PodcastCategory = {
      id: `cat-${Date.now()}`,
      name,
      nameAr,
      slug,
      description: description || null,
      color: color || '#3B82F6',
      icon: icon || null,
      displayOrder: mockCategories.length + 1,
      isActive: true,
      episodeCount: 0
    };

    mockCategories.push(newCategory);

    /* 
    // في المستقبل عند استخدام Prisma:
    
    const newCategory = await prisma.podcastCategory.create({
      data: {
        name,
        nameAr,
        slug,
        description,
        color: color || '#3B82F6',
        icon,
        displayOrder: await prisma.podcastCategory.count() + 1
      }
    });
    */

    return NextResponse.json({
      success: true,
      category: newCategory,
      message: 'تم إنشاء الفئة بنجاح'
    });

  } catch (error) {
    console.error('خطأ في إنشاء فئة البودكاست:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الفئة' },
      { status: 500 }
    );
  }
}
