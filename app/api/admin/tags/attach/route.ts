import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import prisma from "@/lib/prisma";

// POST /api/admin/tags/attach - ربط كلمات مفتاحية بمقال
export async function POST(request: NextRequest) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { article_id, tag_ids } = data;

    if (!article_id || !Array.isArray(tag_ids)) {
      return NextResponse.json(
        { error: "معرف المقال ومجموعة معرفات الكلمات المفتاحية مطلوبة" },
        { status: 400 }
      );
    }

    // التحقق من وجود المقال
    const article = await prisma.articles.findUnique({
      where: { id: article_id }
    });

    if (!article) {
      return NextResponse.json(
        { error: "المقال غير موجود" },
        { status: 404 }
      );
    }

    // التحقق من وجود الكلمات المفتاحية
    const existingTags = await prisma.tags.findMany({
      where: {
        id: { in: tag_ids }
      }
    });

    if (existingTags.length !== tag_ids.length) {
      const foundIds = existingTags.map(tag => tag.id);
      const missingIds = tag_ids.filter(id => !foundIds.includes(id));
      return NextResponse.json(
        { 
          error: "بعض الكلمات المفتاحية غير موجودة",
          missing_tags: missingIds
        },
        { status: 400 }
      );
    }

    // حذف الارتباطات السابقة
    await prisma.article_tags.deleteMany({
      where: { article_id }
    });

    // إضافة الارتباطات الجديدة
    const connections = tag_ids.map(tag_id => ({
      article_id,
      tag_id
    }));

    await prisma.article_tags.createMany({
      data: connections,
      skipDuplicates: true
    });

    // جلب تفاصيل الارتباطات الجديدة
    const newConnections = await prisma.article_tags.findMany({
      where: { article_id },
      include: {
        tags: true
      }
    });

    console.log(`✅ تم ربط ${tag_ids.length} كلمة مفتاحية مع المقال: ${article.title}`);

    return NextResponse.json({
      success: true,
      message: `تم ربط ${tag_ids.length} كلمة مفتاحية بالمقال بنجاح`,
      data: {
        article_id,
        connections: newConnections.map(conn => ({
          tag_id: conn.tag_id,
          tag_name: conn.tags.name,
          tag_slug: conn.tags.slug,
          tag_color: conn.tags.color
        }))
      }
    });

  } catch (error) {
    console.error("❌ خطأ في ربط الكلمات المفتاحية:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "فشل في ربط الكلمات المفتاحية",
        details: error instanceof Error ? error.message : "خطأ غير معروف"
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tags/attach - إزالة ربط كلمات مفتاحية من مقال
export async function DELETE(request: NextRequest) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const article_id = searchParams.get('article_id');
    const tag_ids = searchParams.get('tag_ids')?.split(',');

    if (!article_id) {
      return NextResponse.json(
        { error: "معرف المقال مطلوب" },
        { status: 400 }
      );
    }

    let deleteCondition: any = { article_id };

    // إذا تم تحديد كلمات مفتاحية معينة، احذف فقط هذه الارتباطات
    if (tag_ids && tag_ids.length > 0) {
      deleteCondition.tag_id = { in: tag_ids };
    }

    // حذف الارتباطات
    const deleted = await prisma.article_tags.deleteMany({
      where: deleteCondition
    });

    const message = tag_ids && tag_ids.length > 0 
      ? `تم إزالة ${deleted.count} ارتباط كلمة مفتاحية`
      : `تم إزالة جميع الكلمات المفتاحية من المقال`;

    console.log(`✅ ${message} للمقال: ${article_id}`);

    return NextResponse.json({
      success: true,
      message,
      data: {
        article_id,
        deleted_count: deleted.count
      }
    });

  } catch (error) {
    console.error("❌ خطأ في إزالة ربط الكلمات المفتاحية:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "فشل في إزالة ربط الكلمات المفتاحية",
        details: error instanceof Error ? error.message : "خطأ غير معروف"
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/tags/attach - جلب الكلمات المفتاحية المرتبطة بمقال
export async function GET(request: NextRequest) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const article_id = searchParams.get('article_id');

    if (!article_id) {
      return NextResponse.json(
        { error: "معرف المقال مطلوب" },
        { status: 400 }
      );
    }

    // جلب الكلمات المفتاحية المرتبطة بالمقال
    const connections = await prisma.article_tags.findMany({
      where: { article_id },
      include: {
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            category: true,
            description: true,
            priority: true,
            is_active: true
          }
        }
      },
      orderBy: {
        tags: {
          name: 'asc'
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        article_id,
        tags_count: connections.length,
        tags: connections.map(conn => conn.tags)
      }
    });

  } catch (error) {
    console.error("❌ خطأ في جلب الكلمات المفتاحية المرتبطة:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "فشل في جلب الكلمات المفتاحية المرتبطة",
        details: error instanceof Error ? error.message : "خطأ غير معروف"
      },
      { status: 500 }
    );
  }
}
