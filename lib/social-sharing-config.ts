/**
 * إعدادات المشاركة الاجتماعية لصحيفة سبق الإلكترونية
 * تحتوي على الإعدادات الافتراضية للـ Open Graph وTwitter Cards
 */

export const SOCIAL_SHARING_CONFIG = {
  // الإعدادات الأساسية للموقع
  siteName: "صحيفة سبق الإلكترونية",
  siteDescription:
    "صحيفة سبق الإلكترونية - أخبار السعودية والعالم، تغطية شاملة للأحداث المحلية والعالمية",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://sabq.io",

  // حسابات التواصل الاجتماعي
  social: {
    twitter: "@sabq_news", // يمكن تحديث هذا للحساب الحقيقي
    facebook: "sabq.news", // يمكن تحديث هذا للحساب الحقيقي
    instagram: "@sabq_news", // يمكن تحديث هذا للحساب الحقيقي
  },

  // أبعاد الصور المثلى للمشاركة الاجتماعية
  images: {
    og: {
      width: 1200,
      height: 630,
    },
    twitter: {
      width: 1200,
      height: 630,
    },
  },

  // الصورة الافتراضية
  defaultImage: "/images/sabq-logo-social.svg",

  // إعدادات محددة لكل نوع محتوى
  contentTypes: {
    article: {
      og: {
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
      },
    },
    news: {
      og: {
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
      },
    },
    opinion: {
      og: {
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
      },
    },
  },

  // قوالب النصوص
  templates: {
    title: (articleTitle: string) => `${articleTitle} - صحيفة سبق الإلكترونية`,
    description: (articleTitle: string) =>
      `اقرأ: ${articleTitle} - في صحيفة سبق الإلكترونية`,
  },

  // إعدادات خاصة لكل منصة
  platforms: {
    whatsapp: {
      maxTitleLength: 100,
      maxDescriptionLength: 160,
    },
    twitter: {
      maxTitleLength: 70,
      maxDescriptionLength: 160,
    },
    telegram: {
      maxTitleLength: 100,
      maxDescriptionLength: 200,
    },
    facebook: {
      maxTitleLength: 100,
      maxDescriptionLength: 160,
    },
  },
};

/**
 * دالة لتنسيق metadata للمشاركة الاجتماعية
 */
export function formatSocialMetadata(article: {
  title: string;
  description?: string;
  excerpt?: string;
  summary?: string;
  featured_image?: string;
  author?: { name: string };
  category?: { name: string };
  published_at?: string | Date;
  keywords?: string[];
  id: string;
}) {
  const config = SOCIAL_SHARING_CONFIG;

  const title = config.templates.title(article.title);
  const description =
    article.excerpt ||
    article.summary ||
    article.description ||
    config.templates.description(article.title);

  const imageUrl =
    article.featured_image || `${config.siteUrl}${config.defaultImage}`;
  const articleUrl = `${config.siteUrl}/article/${article.id}`;

  return {
    title: title.substring(0, config.platforms.facebook.maxTitleLength),
    description: description.substring(
      0,
      config.platforms.facebook.maxDescriptionLength
    ),
    imageUrl,
    articleUrl,
    author: article.author?.name || "فريق التحرير",
    section: article.category?.name || "أخبار",
    publishedTime: article.published_at
      ? new Date(article.published_at).toISOString()
      : undefined,
    keywords: Array.isArray(article.keywords) ? article.keywords : [],
  };
}

/**
 * دالة لإنشاء روابط المشاركة السريعة
 */
export function generateSharingLinks(article: { title: string; id: string }) {
  const config = SOCIAL_SHARING_CONFIG;
  const articleUrl = `${config.siteUrl}/article/${article.id}`;
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(article.title);

  return {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=${config.social.twitter.replace(
      "@",
      ""
    )}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };
}
