import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - جلب جميع الكيانات الذكية
export async function GET(request: NextRequest) {
  try {
    await prisma.$connect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const active = searchParams.get('active');

    // بناء شروط البحث
    const where: any = {};
    
    if (type && type !== 'all') {
      where.entity_type = { name: type };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { name_ar: { contains: search, mode: 'insensitive' } },
        { name_en: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (active !== null && active !== undefined) {
      where.is_active = active === 'true';
    }

    // جلب الكيانات مع المعلومات المرتبطة
    const entities = await prisma.smartEntities.findMany({
      where,
      include: {
        entity_type: true,
        _count: {
          select: {
            smart_links: true,
            entity_links_source: true,
            entity_links_target: true
          }
        }
      },
      orderBy: [
        { importance_score: 'desc' },
        { mention_count: 'desc' },
        { created_at: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    // حساب إجمالي عدد الكيانات
    const total = await prisma.smartEntities.count({ where });

    return NextResponse.json({
      success: true,
      entities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب الكيانات:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب الكيانات',
      details: error.message
    }, { status: 500 });
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}

// POST - إضافة كيان ذكي جديد
export async function POST(request: NextRequest) {
  try {
    await prisma.$connect();
    
    const body = await request.json();
    const {
      name,
      name_ar,
      name_en,
      entity_type_id,
      description,
      short_bio,
      importance_score = 5,
      location,
      country = 'SA',
      official_website,
      wikipedia_url,
      social_media,
      aliases = [],
      birth_date,
      start_date,
      end_date,
      seo_keywords,
      is_active = true,
      is_verified = false
    } = body;

    // التحقق من البيانات المطلوبة
    if (!name_ar || !entity_type_id || !description) {
      return NextResponse.json({
        success: false,
        error: 'البيانات المطلوبة مفقودة (name_ar, entity_type_id, description)'
      }, { status: 400 });
    }

    // التحقق من وجود نوع الكيان
    const entityType = await prisma.smartEntityTypes.findUnique({
      where: { id: entity_type_id }
    });

    if (!entityType) {
      return NextResponse.json({
        success: false,
        error: 'نوع الكيان غير موجود'
      }, { status: 400 });
    }

    // إنشاء slug من الاسم العربي
    const slug = name_ar
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\u0600-\u06FF-]/g, '');

    // إنشاء الكيان الجديد
    const newEntity = await prisma.smartEntities.create({
      data: {
        name: name || name_ar,
        name_ar,
        name_en,
        entity_type_id,
        description,
        short_bio,
        importance_score: Math.max(1, Math.min(10, importance_score)),
        location,
        country,
        official_website,
        wikipedia_url,
        social_media,
        aliases,
        birth_date: birth_date ? new Date(birth_date) : null,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        slug,
        seo_keywords,
        is_active,
        is_verified
      },
      include: {
        entity_type: true
      }
    });

    console.log(`✅ تم إنشاء كيان جديد: ${newEntity.name_ar} (${newEntity.id})`);

    return NextResponse.json({
      success: true,
      entity: newEntity,
      message: 'تم إنشاء الكيان بنجاح'
    });

  } catch (error: any) {
    console.error('❌ خطأ في إنشاء الكيان:', error);
    
    // التعامل مع خطأ التكرار
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'يوجد كيان بنفس الاسم أو الـ slug'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء الكيان',
      details: error.message
    }, { status: 500 });
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}