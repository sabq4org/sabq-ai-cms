import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || 'test-image-caption-2025';

    console.log('🔍 Testing article with slug:', slug);

    const article = await prisma.articles.findFirst({
      where: { slug },
      include: {
        media_assets: {
          select: {
            id: true,
            metadata: true,
            filename: true,
            cloudinaryUrl: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // استخراج تعريف الصورة
    const imageCaption = (article.media_assets?.[0]?.metadata as any)?.altText || null;

    const result = {
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        featured_image: article.featured_image,
        featured_image_caption: imageCaption,
        media_assets_count: article.media_assets?.length || 0,
      },
      media_assets: article.media_assets?.map(asset => ({
        id: asset.id,
        filename: asset.filename,
        cloudinaryUrl: asset.cloudinaryUrl,
        metadata: asset.metadata,
        altText: (asset.metadata as any)?.altText || null,
      })) || [],
      debug: {
        hasMediaAssets: !!article.media_assets?.length,
        firstAssetMetadata: article.media_assets?.[0]?.metadata || null,
        extractedCaption: imageCaption,
      }
    };

    console.log('📊 Article Test Result:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error testing article:', error);
    return NextResponse.json(
      { error: "Failed to test article" },
      { status: 500 }
    );
  }
}
