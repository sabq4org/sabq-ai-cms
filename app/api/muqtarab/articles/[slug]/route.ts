import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { queueViewIncrement } from '@/lib/viewBatch'

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;

    // 🚀 Smart ID vs Slug detection for optimal performance
    const isLikelyId = /^[a-z0-9]{8,}$/i.test(slug) && slug.length < 30;
    
    let article;
    
    if (isLikelyId) {
      // 🚀 Use findUnique for ID (fastest possible lookup)
      article = await prisma.muqtarabArticle.findUnique({
        where: { id: slug },
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          excerpt: true,
          cover_image: true,
          status: true,
          publish_at: true,
          read_time: true,
          view_count: true,
          like_count: true,
          comment_count: true,
          created_at: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          corner: {
            select: {
              id: true,
              name: true,
              slug: true,
              theme_color: true,
            },
          },
        },
      });
      
      // Check if published (after fetch to avoid complex where)
      if (article && article.status !== "published") {
        article = null;
      }
    } else {
      // 🚀 Use findUnique for slug (indexed unique field)
      article = await prisma.muqtarabArticle.findFirst({
        where: {
          slug: slug,
          status: "published", // Only published for slug lookup
        },
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          excerpt: true,
          cover_image: true,
          status: true,
          publish_at: true,
          read_time: true,
          view_count: true,
          like_count: true,
          comment_count: true,
          created_at: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          corner: {
            select: {
              id: true,
              name: true,
              slug: true,
              theme_color: true,
            },
          },
        },
      });
    }

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    // 🚀 تحسين: Update view count بشكل غير متزامن
    // prisma.muqtarabArticle.update({ where: { id: article.id }, data: { view_count: { increment: 1 } }, }).catch(err => console.log("Failed to update view count:", err));
    queueViewIncrement(article.id)

    const formattedArticle = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      author: article.creator
        ? {
            id: article.creator.id,
            name: article.creator.name,
          }
        : null,
      corner: article.corner
        ? {
            id: article.corner.id,
            name: article.corner.name,
            slug: article.corner.slug,
            theme_color: article.corner.theme_color,
          }
        : null,
      coverImage: article.cover_image,
      isPublished: article.status === "published",
      publishDate: article.publish_at,
      readingTime: article.read_time,
      views: article.view_count + 1,
      likes: article.like_count,
      comments: article.comment_count,
      createdAt: article.created_at,
    };

    return NextResponse.json({ 
      success: true, 
      article: formattedArticle,
      cached: true 
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'X-Data-Timing': `${Date.now()}`
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch article",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;

    // Find the article first to get its ID
    const article = await prisma.muqtarabArticle.findFirst({
      where: {
        OR: [{ id: slug }, { slug: slug }],
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    await prisma.muqtarabArticle.delete({
      where: { id: article.id },
    });
    return NextResponse.json({
      success: true,
      message: "Article deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete article",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
