import prisma, { ensureDbConnected, retryWithConnection } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await ensureDbConnected();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active_only") === "true";
    const limit = searchParams.get("limit");

    let authors: any[] = [];

    // المحاولة الأولى: من article_authors
    try {
      const articleAuthors = await retryWithConnection(async () => await prisma.article_authors.findMany({
        where: activeOnly ? { is_active: true } : {},
        select: {
          id: true,
          full_name: true,
          email: true,
          slug: true,
          title: true,
          avatar_url: true,
          is_active: true,
          specializations: true,
          total_articles: true,
          total_views: true,
          total_likes: true,
          total_shares: true,
          ai_score: true,
          last_article_at: true,
          created_at: true,
        },
        orderBy: [
          { is_active: "desc" },
          { total_articles: "desc" },
          { full_name: "asc" },
        ],
        take: limit ? parseInt(limit) : undefined,
      }));

      if (Array.isArray(articleAuthors) && articleAuthors.length > 0) {
        authors = articleAuthors;
      } else {
        throw new Error("No article_authors found");
      }
    } catch {
      // المحاولة الثانية: team_members (fallback)
      const whereClause: any = { role: "writer" };
      const queryOptions: any = {
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          bio: true,
          avatar: true,
          department: true,
          phone: true,
          social_links: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: { name: "asc" },
      };
      if (limit) queryOptions.take = parseInt(limit);

      const teamWriters = await retryWithConnection(async () => await prisma.team_members.findMany(queryOptions));
      authors = teamWriters.map((writer: any) => ({
        id: writer.id,
        full_name: writer.name,
        slug: (writer.name?.toLowerCase()?.replace(/\s+/g, "-")?.replace(/[^a-z0-9\u0600-\u06FF-]/g, "") || writer.id),
        title: writer.department || null,
        bio: writer.bio,
        email: writer.email,
        avatar_url: writer.avatar,
        social_links: writer.social_links || {},
        is_active: true,
        specializations: [],
        total_articles: 0,
        total_views: 0,
        total_likes: 0,
        total_shares: 0,
        ai_score: 0.0,
        last_article_at: null,
        created_at: writer.created_at,
      }));
    }

    return NextResponse.json({ success: true, authors, total: authors.length });
  } catch (error: any) {
    console.error("❌ فشل جلب المراسلين:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch article authors", details: error.message },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    console.log("📝 إنشاء كاتب جديد...");

    const body = await request.json();
    const {
      full_name,
      title,
      bio,
      email,
      avatar_url,
      social_links,
      specializations,
    } = body;

    // التحقق من البيانات المطلوبة
    if (!full_name) {
      return NextResponse.json(
        {
          success: false,
          error: "الاسم الكامل مطلوب",
        },
        { status: 400 }
      );
    }

    // إنشاء slug فريد
    const baseSlug = full_name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s]/g, "")
      .replace(/\s+/g, "-");

    const timestamp = Date.now();
    const slug = `${baseSlug}-${timestamp}`;

    // إنشاء الكاتب
    const newAuthor = await prisma.article_authors.create({
      data: {
        id: `author_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        full_name,
        slug,
        title: title || null,
        bio: bio || null,
        email: email || null,
        avatar_url: avatar_url || null,
        social_links: social_links || {},
        specializations: specializations || [],
        is_active: true,
        role: "writer",
        total_articles: 0,
        total_views: 0,
        total_likes: 0,
        total_shares: 0,
        ai_score: 0.0,
      },
    });

    console.log(`✅ تم إنشاء كاتب جديد: ${newAuthor.full_name}`);

    return NextResponse.json({
      success: true,
      author: newAuthor,
      message: "تم إنشاء الكاتب بنجاح",
    });
  } catch (error: any) {
    console.error("❌ خطأ في إنشاء الكاتب:", error);
    return NextResponse.json(
      {
        success: false,
        error: "فشل في إنشاء الكاتب",
        details: error?.message || "خطأ غير معروف",
      },
      { status: 500 }
    );
  } finally {
    // عدم قطع الاتصال لمشاركة عميل Prisma الموحد
  }
}
