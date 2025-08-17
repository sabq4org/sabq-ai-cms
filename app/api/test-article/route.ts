import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 إنشاء مقال تجريبي...');
    
    // إنشاء مقال تجريبي
    const article = await prisma.articles.create({
      data: {
        title: "مقال تجريبي لاختبار ميزة تعريف الصورة",
        content: "هذا مقال تجريبي لاختبار ميزة تعريف الصورة. يحتوي على محتوى كافي لاختبار جميع الميزات.",
        excerpt: "مقال تجريبي لاختبار الميزات الجديدة",
        featured_image: "https://via.placeholder.com/800x600.jpg?text=صورة+تجريبية",
        slug: "test-image-caption",
        status: "published",
        published_at: new Date(),
        metadata: {}
      },
      include: {
        featured_image_asset: true
      }
    });

    // إنشاء media asset للصورة
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        filename: "test-image.jpg",
        originalName: "test-image.jpg", 
        mimeType: "image/jpeg",
        size: 102400,
        width: 800,
        height: 600,
        cloudinaryId: "test-id",
        cloudinaryUrl: "https://via.placeholder.com/800x600.jpg?text=صورة+تجريبية",
        metadata: {
          altText: "هذا تعريف تجريبي للصورة - يظهر في صفحة تفاصيل الخبر"
        },
        uploadType: "image",
        uploadedById: "test-user"
      }
    });

    // ربط الصورة بالمقال
    await prisma.articles.update({
      where: { id: article.id },
      data: {
        featured_image_asset_id: mediaAsset.id
      }
    });

    console.log('✅ تم إنشاء المقال بنجاح');
    console.log(`🔗 رابط المقال: http://localhost:3002/news/${article.slug}`);

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        url: `http://localhost:3002/news/${article.slug}`
      },
      mediaAsset: {
        id: mediaAsset.id,
        metadata: mediaAsset.metadata
      }
    });

  } catch (error) {
    console.error('❌ خطأ في إنشاء المقال:', error);
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء المقال التجريبي" },
      { status: 500 }
    );
  }
}
