import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth-options";

export const runtime = "nodejs";

// GET /api/media - جلب قائمة الوسائط
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // معاملات البحث والفلترة
    const q = searchParams.get("q") || "";
    const tags = searchParams.getAll("tags[]");
    const ratio = searchParams.get("ratio");
    const minW = searchParams.get("minW");
    const minH = searchParams.get("minH");
    const type = searchParams.get("type");
    const uploader = searchParams.get("uploader");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const limit = parseInt(searchParams.get("limit") || "24");
    const cursor = searchParams.get("cursor");

    // بناء شروط البحث
    const where: any = {};

    // البحث النصي
    if (q) {
      where.OR = [
        { filename: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        { alt: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { hasSome: q.split(" ") } },
      ];
    }

    // فلتر الوسوم
    if (tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    // فلتر نسبة العرض/الارتفاع
    if (ratio === "3:4") {
      where.aspectRatio = "ratio_3_4";
    } else if (ratio === "4:3") {
      where.aspectRatio = "ratio_4_3";
    }

    // فلتر الأبعاد
    if (minW) {
      where.width = { gte: parseInt(minW) };
    }
    if (minH) {
      where.height = { gte: parseInt(minH) };
    }

    // فلتر نوع الملف
    if (type) {
      where.mimeType = { contains: type };
    }

    // فلتر الرافع
    if (uploader) {
      where.uploaderId = uploader;
    }

    // فلتر التاريخ
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    // بناء الترتيب
    const orderBy: any = {};
    if (sort === "usage") {
      orderBy.usageCount = order;
    } else if (sort === "size") {
      orderBy.sizeBytes = order;
    } else {
      orderBy[sort] = order;
    }

    // استخدام cursor-based pagination
    const findArgs: any = {
      where,
      orderBy,
      take: limit + 1,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    };

    if (cursor) {
      findArgs.cursor = { id: cursor };
      findArgs.skip = 1;
    }

    const items = await prisma.media.findMany(findArgs);
    
    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    // الحصول على العدد الإجمالي
    const total = await prisma.media.count({ where });

    return NextResponse.json({
      items: results,
      nextCursor,
      total,
      hasMore,
    });
  } catch (error) {
    console.error("خطأ في جلب الوسائط:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب الوسائط" },
      { status: 500 }
    );
  }
}

// POST /api/media - رفع وسائط جديدة
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const data = await request.json();
    
    // حساب نسبة العرض/الارتفاع
    let aspectRatio: any = "other";
    if (data.width && data.height) {
      const ratio = data.width / data.height;
      if (Math.abs(ratio - 0.75) < 0.05) {
        aspectRatio = "ratio_3_4";
      } else if (Math.abs(ratio - 1.33) < 0.05) {
        aspectRatio = "ratio_4_3";
      } else if (Math.abs(ratio - 1.78) < 0.05) {
        aspectRatio = "ratio_16_9";
      } else if (Math.abs(ratio - 1) < 0.05) {
        aspectRatio = "ratio_1_1";
      }
    }

    const media = await prisma.media.create({
      data: {
        filename: data.filename,
        title: data.title,
        alt: data.alt,
        description: data.description,
        width: data.width,
        height: data.height,
        aspectRatio,
        sizeBytes: data.sizeBytes,
        mimeType: data.mimeType,
        tags: data.tags || [],
        license: data.license || "all_rights",
        uploaderId: session.user.id,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        cloudinaryId: data.cloudinaryId,
        exif: data.exif,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("خطأ في رفع الوسائط:", error);
    return NextResponse.json(
      { error: "حدث خطأ في رفع الوسائط" },
      { status: 500 }
    );
  }
}
