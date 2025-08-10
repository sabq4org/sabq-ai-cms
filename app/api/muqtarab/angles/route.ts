import prisma from "@/lib/prisma";
import { generateSlug } from "@/lib/slug-utils";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function generateUniqueCornerSlug(base: string): Promise<string> {
  // محاولة توليد slug إنجليزي من النص
  let slug = generateSlug(base);

  // إذا فشل في إنتاج slug إنجليزي صالح، استخدم nanoid مع prefix
  if (!slug || slug.length < 3) {
    slug = `corner-${nanoid(8)}`;
    console.log(
      `📝 تم توليد slug عشوائي للزاوية: ${slug} (النص الأصلي: ${base})`
    );
  } else {
    console.log(
      `✅ تم توليد slug إنجليزي للزاوية: ${slug} (النص الأصلي: ${base})`
    );
  }

  // التحقق من الفرادة
  let counter = 1;
  const originalSlug = slug;

  while (true) {
    const exists = await prisma.muqtarabCorner.findUnique({ where: { slug } });
    if (!exists) {
      console.log(`🎯 تأكيد فرادة الـ slug: ${slug}`);
      return slug;
    }

    // إضافة رقم للتمييز
    slug = `${originalSlug}-${counter}`;
    counter++;

    // منع التكرار اللانهائي
    if (counter > 100) {
      slug = `corner-${nanoid(8)}`;
      break;
    }
  }

  return slug;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const slug = await generateUniqueCornerSlug(body.slug || body.title);

    const newCorner = await prisma.muqtarabCorner.create({
      data: {
        name: body.title,
        slug: slug,
        description: body.description,
        author_name: "فريق التحرير", // Placeholder
        cover_image: body.coverImage || null,
        theme_color: body.themeColor || "#3B82F6",
        is_featured: body.isFeatured || false,
        is_active: body.isPublished || false,
        creator: body.authorId ? { connect: { id: body.authorId } } : undefined,
      },
    });

    return NextResponse.json({ success: true, corner: newCorner });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create corner",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 🚀 استعلام محسن ومبسط
    const corners = await prisma.muqtarabCorner.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        cover_image: true,
        theme_color: true,
        is_featured: true,
        created_at: true,
        updated_at: true,
        author_name: true,
        // عدد مبسط للمقالات
        _count: {
          select: {
            articles: { where: { status: "published" } },
          },
        },
      },
      orderBy: [
        { is_featured: "desc" }, // المميزة أولاً
        { created_at: "desc" },
      ],
      take: 50, // حد أقصى معقول
    });

    // 📊 تحويل مبسط وسريع
    const formattedCorners = corners.map((corner) => ({
      id: corner.id,
      title: corner.name,
      slug: corner.slug,
      description: corner.description || "",
      icon: "BookOpen",
      themeColor: corner.theme_color || "#3B82F6",
      author: { name: corner.author_name || "فريق التحرير" },
      coverImage: corner.cover_image,
      isFeatured: corner.is_featured,
      isPublished: true, // مفلتر مسبقاً
      createdAt: corner.created_at,
      updatedAt: corner.updated_at,
      articlesCount: corner._count.articles,
      totalViews: 0, // تبسيط للسرعة
    }));

    const response = NextResponse.json({
      success: true,
      angles: formattedCorners,
      count: formattedCorners.length,
      cached: true,
      timestamp: new Date().toISOString(),
    });

    // 🚀 Cache محسن
    response.headers.set(
      "Cache-Control",
      "public, max-age=180, stale-while-revalidate=600"
    );

    return response;
  } catch (error: any) {
    console.error("خطأ في جلب الزوايا:", error);
    return NextResponse.json(
      {
        success: false,
        error: "فشل في جلب الزوايا",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
