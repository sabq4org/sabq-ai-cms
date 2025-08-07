import prisma from "@/lib/prisma";
import {
  SOCIAL_SHARING_CONFIG,
  formatSocialMetadata,
} from "@/lib/social-sharing-config";
import { Metadata } from "next";

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  try {
    const { id } = await params;

    // محاولة جلب المقال من قاعدة البيانات
    const article = await prisma.articles.findUnique({
      where: { id },
      include: {
        categories: true,
        author: true,
      },
    });

    if (!article) {
      return {
        title: "المقال غير موجود - صحيفة سبق الإلكترونية",
        description: SOCIAL_SHARING_CONFIG.siteDescription,
      };
    }

    // تنسيق بيانات المقال للمشاركة الاجتماعية
    const socialData = formatSocialMetadata({
      title: article.title,
      description: article.seo_description,
      excerpt: article.excerpt,
      summary: article.excerpt,
      featured_image: article.featured_image,
      author: article.author,
      category: article.categories,
      published_at: article.published_at || article.created_at,
      keywords: article.seo_keywords?.split(",") || [],
      id: article.id,
    });

    return {
      title: socialData.title,
      description: socialData.description,

      // Open Graph Tags للمشاركة الاجتماعية المحسنة
      openGraph: {
        title: socialData.title,
        description: socialData.description,
        url: socialData.articleUrl,
        siteName: SOCIAL_SHARING_CONFIG.siteName,
        images: [
          {
            url: socialData.imageUrl,
            width: SOCIAL_SHARING_CONFIG.images.og.width,
            height: SOCIAL_SHARING_CONFIG.images.og.height,
            alt: article.title,
          },
        ],
        locale: "ar_SA",
        type: "article",
        publishedTime: socialData.publishedTime,
        modifiedTime: article.updated_at?.toISOString(),
        authors: [socialData.author],
        section: socialData.section,
        tags: socialData.keywords,
      },

      // Twitter Card Tags محسنة
      twitter: {
        card: "summary_large_image",
        title: socialData.title,
        description: socialData.description,
        images: [socialData.imageUrl],
        creator: SOCIAL_SHARING_CONFIG.social.twitter,
        site: SOCIAL_SHARING_CONFIG.social.twitter,
      },

      // Meta tags إضافية للتحسين
      authors: [{ name: socialData.author }],
      category: socialData.section,
      keywords: socialData.keywords.join(", "),

      // Robots meta محسن
      robots: {
        index: article.status === "published",
        follow: true,
        googleBot: {
          index: article.status === "published",
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },

      // Schema.org structured data
      other: {
        "article:author": socialData.author,
        "article:published_time": socialData.publishedTime || "",
        "article:modified_time": article.updated_at?.toISOString() || "",
        "article:section": socialData.section,
        "article:tag": socialData.keywords.join(", "),
        "og:locale": "ar_SA",
        "og:locale:alternate": "en_US",
      },
    };
  } catch (error) {
    console.error("خطأ في جلب metadata للمقال:", error);

    // في حالة فشل جلب البيانات، إرجاع metadata افتراضية محسنة
    return {
      title: SOCIAL_SHARING_CONFIG.siteName,
      description: SOCIAL_SHARING_CONFIG.siteDescription,
      openGraph: {
        title: SOCIAL_SHARING_CONFIG.siteName,
        description: SOCIAL_SHARING_CONFIG.siteDescription,
        url: SOCIAL_SHARING_CONFIG.siteUrl,
        siteName: SOCIAL_SHARING_CONFIG.siteName,
        images: [
          {
            url: `${SOCIAL_SHARING_CONFIG.siteUrl}${SOCIAL_SHARING_CONFIG.defaultImage}`,
            width: SOCIAL_SHARING_CONFIG.images.og.width,
            height: SOCIAL_SHARING_CONFIG.images.og.height,
            alt: SOCIAL_SHARING_CONFIG.siteName,
          },
        ],
        locale: "ar_SA",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: SOCIAL_SHARING_CONFIG.siteName,
        description: SOCIAL_SHARING_CONFIG.siteDescription,
        images: [
          `${SOCIAL_SHARING_CONFIG.siteUrl}${SOCIAL_SHARING_CONFIG.defaultImage}`,
        ],
        creator: SOCIAL_SHARING_CONFIG.social.twitter,
        site: SOCIAL_SHARING_CONFIG.social.twitter,
      },
    };
  }
}
