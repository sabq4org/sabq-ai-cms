import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import prisma from "@/lib/prisma";

// GET /api/admin/tags - جلب جميع الكلمات المفتاحية
export async function GET(request: NextRequest) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const order = searchParams.get("order") || "desc";
    const category = searchParams.get("category") || "";
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    // بناء شروط البحث
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    if (category) {
      where.category = { contains: category, mode: "insensitive" };
    }

    if (isActive !== null && isActive !== undefined) {
      where.is_active = isActive === "true";
    }

    // جلب الكلمات المفتاحية مع إحصائيات
    const [tags, totalCount] = await Promise.all([
      prisma.tags.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          _count: {
            select: {
              article_tags: true
            }
          }
        }
      }),
      prisma.tags.count({ where })
    ]);

    // تحويل البيانات وإضافة الإحصائيات
    const tagsWithStats = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      color: tag.color,
      category: tag.category,
      is_active: tag.is_active,
      priority: tag.priority,
      created_at: tag.created_at,
      updated_at: tag.updated_at,
      articles_count: tag._count.article_tags,
      usage_score: tag.usage_score || 0,
      trending_score: tag.trending_score || 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        tags: tagsWithStats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: page * limit < totalCount,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("❌ خطأ في جلب الكلمات المفتاحية:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "فشل في جلب الكلمات المفتاحية",
        details: error instanceof Error ? error.message : "خطأ غير معروف"
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/tags - إنشاء كلمة مفتاحية جديدة
export async function POST(request: NextRequest) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { 
      name, 
      description, 
      color, 
      category, 
      priority, 
      synonyms,
      seo_meta_description,
      is_active = true 
    } = data;

    // التحقق من الحقول المطلوبة
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "اسم الكلمة المفتاحية مطلوب" },
        { status: 400 }
      );
    }

    // توليد slug تلقائياً
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // إزالة الأحرف الخاصة
      .replace(/[\s_-]+/g, '-') // استبدال المسافات بشرطات
      .replace(/^-+|-+$/g, ''); // إزالة الشرطات من البداية والنهاية

    // التحقق من عدم تكرار الاسم أو slug
    const existingTag = await prisma.tags.findFirst({
      where: {
        OR: [
          { name: name.trim() },
          { slug: slug }
        ]
      }
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "الكلمة المفتاحية موجودة بالفعل" },
        { status: 409 }
      );
    }

    // إنشاء الكلمة المفتاحية
    const newTag = await prisma.tags.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        color: color || "#3B82F6",
        category: category?.trim() || null,
        priority: priority || 1,
        synonyms: synonyms || [],
        seo_meta_description: seo_meta_description?.trim() || null,
        is_active,
        usage_score: 0,
        trending_score: 0
      }
    });

    console.log(`✅ تم إنشاء كلمة مفتاحية جديدة: ${newTag.name}`);

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الكلمة المفتاحية بنجاح",
      data: newTag
    }, { status: 201 });

  } catch (error) {
    console.error("❌ خطأ في إنشاء الكلمة المفتاحية:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "فشل في إنشاء الكلمة المفتاحية",
        details: error instanceof Error ? error.message : "خطأ غير معروف"
      },
      { status: 500 }
    );
  }
}
