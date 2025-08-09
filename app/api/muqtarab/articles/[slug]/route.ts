import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;

    // Try to find by ID first, then by slug
    const article = await prisma.muqtarabArticle.findFirst({
      where: {
        OR: [
          { id: slug }, // If the slug parameter is actually an ID
          { slug: slug }, // If it's a traditional slug
        ],
      },
      include: {
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

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    // Update view count
    await prisma.muqtarabArticle.update({
      where: { id: article.id },
      data: { view_count: { increment: 1 } },
    });

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

    return NextResponse.json({ success: true, article: formattedArticle });
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
