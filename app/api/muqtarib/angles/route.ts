import { CreateAngleForm } from "@/types/muqtarab";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// إنشاء زاوية جديدة
export async function POST(request: NextRequest) {
  try {
    const body: CreateAngleForm = await request.json();

    console.log("📥 البيانات المستلمة:", {
      title: body.title,
      description: body.description?.substring(0, 50) + "...",
      authorId: body.authorId,
      themeColor: body.themeColor,
      isPublished: body.isPublished,
    });

    // التحقق من البيانات المطلوبة
    if (!body.title?.trim() || !body.description?.trim()) {
      return NextResponse.json(
        { error: "العنوان والوصف مطلوبان" },
        { status: 400 }
      );
    }

    // توليد slug فريد إذا لم يُقدم
    let slug = body.slug;
    if (!slug) {
      slug = body.title
        .toLowerCase()
        .replace(/[\u0600-\u06FF]/g, (match) => match) // الحفاظ على الأحرف العربية
        .replace(/[^\u0600-\u06FF\w\s-]/g, "") // إزالة الرموز الخاصة
        .replace(/\s+/g, "-") // استبدال المسافات بـ -
        .trim();
    }

    // التحقق من عدم تكرار الـ slug
    const existingAngle = (await prisma.$queryRaw`
      SELECT slug FROM angles WHERE slug = ${slug}
    `) as { slug: string }[];

    if (existingAngle.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    // إنشاء الزاوية
    const result = (await prisma.$queryRaw`
      INSERT INTO angles (
        title, slug, description, icon, theme_color,
        author_id, cover_image, is_featured, is_published
      ) VALUES (
        ${body.title},
        ${slug},
        ${body.description},
        ${body.icon || null},
        ${body.themeColor},
        ${body.authorId || null},
        ${body.coverImage || null},
        ${body.isFeatured},
        ${body.isPublished}
      ) RETURNING *
    `) as any[];

    const angle = result[0];

    if (!angle) {
      throw new Error("فشل في إنشاء الزاوية - لم يتم إرجاع بيانات");
    }

    console.log("✅ تم إنشاء الزاوية بنجاح:", {
      id: angle.id,
      title: angle.title,
      slug: angle.slug,
    });

    return NextResponse.json({
      success: true,
      message: body.isPublished
        ? "تم نشر الزاوية بنجاح"
        : "تم حفظ الزاوية كمسودة",
      angle: {
        id: angle.id,
        title: angle.title,
        slug: angle.slug,
        description: angle.description,
        icon: angle.icon,
        themeColor: angle.theme_color,
        authorId: angle.author_id,
        coverImage: angle.cover_image,
        isFeatured: angle.is_featured,
        isPublished: angle.is_published,
        createdAt: angle.created_at,
        updatedAt: angle.updated_at,
      },
    });
  } catch (error) {
    console.error("خطأ في إنشاء الزاوية:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء الزاوية" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// جلب جميع الزوايا مع فلترة
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const published = searchParams.get("published") === "true";
    const featured = searchParams.get("featured") === "true";
    const authorId = searchParams.get("authorId");

    const offset = (page - 1) * limit;

    // بناء الشروط
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (published) {
      whereClause += ` AND is_published = $${paramIndex}`;
      params.push(true);
      paramIndex++;
    }

    if (featured) {
      whereClause += ` AND is_featured = $${paramIndex}`;
      params.push(true);
      paramIndex++;
    }

    if (authorId) {
      whereClause += ` AND author_id = $${paramIndex}`;
      params.push(authorId);
      paramIndex++;
    }

    // جلب الزوايا مع بيانات المؤلف
    const anglesQuery = `
      SELECT
        a.*,
        u.name as author_name,
        u.avatar as author_avatar,
        COUNT(aa.id) as articles_count
      FROM angles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN angle_articles aa ON a.id = aa.angle_id AND aa.is_published = true
      ${whereClause}
      GROUP BY a.id, u.name, u.avatar
      ORDER BY a.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const angles = (await prisma.$queryRawUnsafe(
      anglesQuery,
      ...params
    )) as any[];

    // جلب العدد الإجمالي
    const countQuery = `
      SELECT COUNT(*) as total
      FROM angles a
      ${whereClause}
    `;

    const countResult = (await prisma.$queryRawUnsafe(
      countQuery,
      ...params.slice(0, -2)
    )) as { total: bigint }[];

    const total = Number(countResult[0].total);

    // تنسيق البيانات
    const formattedAngles = angles.map((angle) => ({
      id: angle.id,
      title: angle.title,
      slug: angle.slug,
      description: angle.description,
      icon: angle.icon,
      themeColor: angle.theme_color,
      authorId: angle.author_id,
      author: {
        id: angle.author_id,
        name: angle.author_name,
        avatar: angle.author_avatar,
      },
      coverImage: angle.cover_image,
      isFeatured: angle.is_featured,
      isPublished: angle.is_published,
      articlesCount: Number(angle.articles_count) || 0,
      createdAt: angle.created_at,
      updatedAt: angle.updated_at,
    }));

    return NextResponse.json({
      success: true,
      angles: formattedAngles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("خطأ في جلب الزوايا:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب الزوايا" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
