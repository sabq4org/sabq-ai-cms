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
    const corners = await prisma.muqtarabCorner.findMany({
      where: {
        is_active: true,
      },
      include: {
        _count: {
          select: { articles: true },
        },
        creator: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedCorners = corners.map((corner) => ({
      id: corner.id,
      title: corner.name,
      slug: corner.slug,
      description: corner.description || "",
      icon: "BookOpen", // Fallback icon
      themeColor: corner.theme_color || "#3B82F6",
      author: { name: corner.creator?.name || "فريق التحرير" },
      coverImage: corner.cover_image,
      isFeatured: corner.is_featured,
      isPublished: corner.is_active,
      createdAt: corner.created_at,
      updatedAt: corner.updated_at,
      articlesCount: corner._count.articles,
      totalViews: 0, // This should be calculated separately if needed
    }));

    return NextResponse.json({
      success: true,
      angles: formattedCorners,
    });
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
