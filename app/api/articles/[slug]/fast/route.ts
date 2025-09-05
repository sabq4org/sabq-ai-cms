import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const decodedSlug = decodeURIComponent(slug);
    
    // Search by slug first
    let article = await prisma.articles.findFirst({
      where: {
        slug: decodedSlug,
        status: "published",
      },
    });
    
    // If not found by slug, try by ID
    if (!article) {
      article = await prisma.articles.findFirst({
        where: {
          id: decodedSlug,
          status: "published",
        },
      });
    }
    
    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }
    
    // Get related articles
    const relatedArticles = await prisma.articles.findMany({
      where: {
        status: "published",
        id: { not: article.id },
        category_id: article.category_id,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featured_image: true,
        published_at: true,
      },
      orderBy: {
        published_at: "desc",
      },
      take: 3,
    });
    
    // Get comments count
    const commentsCount = await prisma.comments.count({
      where: {
        article_id: article.id,
        status: "approved",
      },
    });
    
    // Increment views
    await prisma.articles.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });
    
    const response = {
      article: article,
      related: relatedArticles,
      commentsCount,
    };
    
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    });
    
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
