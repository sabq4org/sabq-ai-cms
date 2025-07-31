import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET: جلب زاوية واحدة
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const corner = await prisma.$queryRaw`
      SELECT 
        mc.*,
        c.name as category_name,
        u.name as creator_name,
        (SELECT COUNT(*) FROM muqtarab_articles ma WHERE ma.corner_id = mc.id) as articles_count,
        (SELECT COUNT(*) FROM muqtarab_followers mf WHERE mf.corner_id = mc.id) as followers_count,
        (SELECT COUNT(*) FROM muqtarab_articles ma WHERE ma.corner_id = mc.id AND ma.status = 'published') as published_articles_count
      FROM muqtarab_corners mc
      LEFT JOIN categories c ON mc.category_id = c.id
      LEFT JOIN users u ON mc.created_by = u.id
      WHERE mc.id = ${id};
    `;
    
    if (!(corner as any[]).length) {
      return NextResponse.json(
        { success: false, error: 'الزاوية غير موجودة' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: (corner as any[])[0]
    });
    
  } catch (error) {
    console.error('خطأ في جلب الزاوية:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب الزاوية' },
      { status: 500 }
    );
  }
}

// PUT: تحديث زاوية
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: إضافة نظام التحقق من الصلاحيات لاحقاً
    
    const { id } = params;
    const body = await request.json();
    const {
      name,
      slug,
      author_name,
      author_bio,
      description,
      cover_image,
      category_id,
      ai_enabled,
      is_active,
      is_featured
    } = body;
    
    // التحقق من وجود الزاوية
    const existingCorner = await prisma.$queryRaw`
      SELECT id FROM muqtarab_corners WHERE id = ${id};
    `;
    
    if (!(existingCorner as any[]).length) {
      return NextResponse.json(
        { success: false, error: 'الزاوية غير موجودة' },
        { status: 404 }
      );
    }
    
    // التحقق من عدم تكرار الرابط (إذا تم تغييره)
    if (slug) {
      const duplicateSlug = await prisma.$queryRaw`
        SELECT id FROM muqtarab_corners WHERE slug = ${slug} AND id != ${id};
      `;
      
      if ((duplicateSlug as any[]).length > 0) {
        return NextResponse.json(
          { success: false, error: 'هذا الرابط مستخدم بالفعل' },
          { status: 400 }
        );
      }
    }
    
    // تحديث الزاوية
    const updatedCorner = await prisma.$queryRaw`
      UPDATE muqtarab_corners SET 
        name = COALESCE(${name}, name),
        slug = COALESCE(${slug}, slug),
        author_name = COALESCE(${author_name}, author_name),
        author_bio = ${author_bio},
        description = ${description},
        cover_image = ${cover_image},
        category_id = ${category_id},
        ai_enabled = COALESCE(${ai_enabled}, ai_enabled),
        is_active = COALESCE(${is_active}, is_active),
        is_featured = COALESCE(${is_featured}, is_featured),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *;
    `;
    
    return NextResponse.json({
      success: true,
      message: 'تم تحديث الزاوية بنجاح',
      data: updatedCorner
    });
    
  } catch (error) {
    console.error('خطأ في تحديث الزاوية:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في تحديث الزاوية' },
      { status: 500 }
    );
  }
}

// DELETE: حذف زاوية
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: إضافة نظام التحقق من الصلاحيات لاحقاً
    
    const { id } = params;
    
    // التحقق من وجود مقالات مرتبطة
    const relatedArticles = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM muqtarab_articles WHERE corner_id = ${id};
    `;
    
    const articlesCount = Number((relatedArticles as any[])[0].count);
    
    if (articlesCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `لا يمكن حذف الزاوية لأنها تحتوي على ${articlesCount} مقال(ة). يرجى حذف أو نقل المقالات أولاً.` 
        },
        { status: 400 }
      );
    }
    
    // حذف الزاوية
    await prisma.$queryRaw`
      DELETE FROM muqtarab_corners WHERE id = ${id};
    `;
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف الزاوية بنجاح'
    });
    
  } catch (error) {
    console.error('خطأ في حذف الزاوية:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في حذف الزاوية' },
      { status: 500 }
    );
  }
}