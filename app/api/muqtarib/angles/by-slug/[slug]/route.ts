import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET: جلب زاوية بالـ slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    console.log("🔍 البحث عن الزاوية بالـ slug:", slug);

    if (!slug) {
      return NextResponse.json(
        { error: "slug مطلوب" },
        { status: 400 }
      );
    }

    // البحث عن الزاوية بالـ slug مع المؤلف وعدد المقالات
    const query = `
      SELECT 
        a.*,
        u.name as author_name,
        u.email as author_email,
        u.profile_image as author_image,
        (
          SELECT COUNT(*)::int 
          FROM angle_articles aa 
          WHERE aa.angle_id = a.id AND aa.is_published = true
        ) as articles_count
      FROM angles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.slug = $1 AND a.is_published = true
    `;

    console.log("📊 SQL Query:", query);
    console.log("📋 Parameters:", [slug]);

    const result = await prisma.$queryRawUnsafe(query, slug);
    console.log("🔍 نتيجة البحث:", result);

    if (!Array.isArray(result) || result.length === 0) {
      console.log("❌ لم يتم العثور على الزاوية");
      return NextResponse.json(
        { error: "الزاوية غير موجودة" },
        { status: 404 }
      );
    }

    const angleRow = result[0] as any;

    // تحويل البيانات إلى الشكل المطلوب
    const angle = {
      id: angleRow.id,
      title: angleRow.title,
      slug: angleRow.slug,
      description: angleRow.description,
      icon: angleRow.icon,
      themeColor: angleRow.theme_color,
      coverImage: angleRow.cover_image,
      isFeatured: angleRow.is_featured,
      isPublished: angleRow.is_published,
      createdAt: angleRow.created_at,
      updatedAt: angleRow.updated_at,
      authorId: angleRow.author_id,
      articlesCount: angleRow.articles_count,
      author: angleRow.author_name ? {
        id: angleRow.author_id,
        name: angleRow.author_name,
        email: angleRow.author_email,
        image: angleRow.author_image,
      } : null,
    };

    console.log("✅ تم تحويل بيانات الزاوية:", angle.title);

    return NextResponse.json({
      success: true,
      angle,
    });

  } catch (error) {
    console.error("❌ خطأ في جلب الزاوية بالـ slug:", error);
    
    return NextResponse.json(
      { 
        error: "حدث خطأ في جلب بيانات الزاوية",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}