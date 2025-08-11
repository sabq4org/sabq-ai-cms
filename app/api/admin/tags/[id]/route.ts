import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import prisma from "@/lib/prisma";

// GET /api/admin/tags/[id] - جلب كلمة مفتاحية واحدة
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const tag = await prisma.tags.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            article_tags: true
          }
        },
        article_tags: {
          include: {
            articles: {
              select: {
                id: true,
                title: true,
                slug: true,
                published_at: true,
                status: true
              }
            }
          },
          take: 10,
          orderBy: {
            articles: {
              published_at: "desc"
            }
          }
        }
      }
    });

    if (!tag) {
      return NextResponse.json(
        { error: "الكلمة المفتاحية غير موجودة" },
        { status: 404 }
      );
    }

    // إحصائيات إضافية
    const stats = await prisma.article_tags.groupBy({
      by: ["tag_id"],
      where: { tag_id: id },
      _count: {
        article_id: true
      }
    });

    const tagWithDetails = {
      ...tag,
      articles_count: tag._count.article_tags,
      recent_articles: tag.article_tags.map(at => at.articles),
      stats: stats[0] || { _count: { article_id: 0 } }
    };

    return NextResponse.json({
      success: true,
      data: tagWithDetails
    });

  } catch (error) {
    console.error("❌ خطأ في جلب الكلمة المفتاحية:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "فشل في جلب الكلمة المفتاحية",
        details: error instanceof Error ? error.message : "خطأ غير معروف"
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/tags/[id] - تحديث كلمة مفتاحية
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();
    const { 
      name, 
      description, 
      color, 
      category, 
      priority, 
      synonyms,
      seo_meta_description,
      is_active 
    } = data;

    // التحقق من وجود الكلمة المفتاحية
    const existingTag = await prisma.tags.findUnique({
      where: { id }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: "الكلمة المفتاحية غير موجودة" },
        { status: 404 }
      );
    }

    // إعداد البيانات للتحديث
    const updateData: any = {};

    if (name && name.trim() !== existingTag.name) {
      // توليد slug جديد إذا تغير الاسم
      const newSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // التحقق من عدم تكرار الاسم الجديد
      const duplicateCheck = await prisma.tags.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                { name: name.trim() },
                { slug: newSlug }
              ]
            }
          ]
        }
      });

      if (duplicateCheck) {
        return NextResponse.json(
          { error: "الاسم الجديد موجود بالفعل" },
          { status: 409 }
        );
      }

      updateData.name = name.trim();
      updateData.slug = newSlug;
    }

    if (description !== undefined) updateData.description = description?.trim() || null;
    if (color !== undefined) updateData.color = color;
    if (category !== undefined) updateData.category = category?.trim() || null;
    if (priority !== undefined) updateData.priority = priority;
    if (synonyms !== undefined) updateData.synonyms = synonyms;
    if (seo_meta_description !== undefined) updateData.seo_meta_description = seo_meta_description?.trim() || null;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    updateData.updated_at = new Date();

    // تحديث الكلمة المفتاحية
    const updatedTag = await prisma.tags.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            article_tags: true
          }
        }
      }
    });

    console.log(`✅ تم تحديث الكلمة المفتاحية: ${updatedTag.name}`);

    return NextResponse.json({
      success: true,
      message: "تم تحديث الكلمة المفتاحية بنجاح",
      data: {
        ...updatedTag,
        articles_count: updatedTag._count.article_tags
      }
    });

  } catch (error) {
    console.error("❌ خطأ في تحديث الكلمة المفتاحية:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "فشل في تحديث الكلمة المفتاحية",
        details: error instanceof Error ? error.message : "خطأ غير معروف"
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tags/[id] - حذف كلمة مفتاحية
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // التحقق من وجود الكلمة المفتاحية
    const existingTag = await prisma.tags.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            article_tags: true
          }
        }
      }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: "الكلمة المفتاحية غير موجودة" },
        { status: 404 }
      );
    }

    // التحقق من وجود مقالات مرتبطة
    if (existingTag._count.article_tags > 0) {
      return NextResponse.json(
        { 
          error: "لا يمكن حذف الكلمة المفتاحية",
          details: `الكلمة المفتاحية مرتبطة بـ ${existingTag._count.article_tags} مقال. يرجى إزالة الارتباطات أولاً.`
        },
        { status: 409 }
      );
    }

    // حذف الكلمة المفتاحية
    await prisma.tags.delete({
      where: { id }
    });

    console.log(`✅ تم حذف الكلمة المفتاحية: ${existingTag.name}`);

    return NextResponse.json({
      success: true,
      message: "تم حذف الكلمة المفتاحية بنجاح"
    });

  } catch (error) {
    console.error("❌ خطأ في حذف الكلمة المفتاحية:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "فشل في حذف الكلمة المفتاحية",
        details: error instanceof Error ? error.message : "خطأ غير معروف"
      },
      { status: 500 }
    );
  }
}
