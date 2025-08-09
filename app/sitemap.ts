import { MetadataRoute } from "next";

// دالة جلب المقالات من API
async function getArticles() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "https://sabq.me";
    const response = await fetch(
      `${baseUrl}/api/articles?limit=1000&published=true`,
      {
        next: { revalidate: 3600 }, // إعادة التحقق كل ساعة
      }
    );

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return [];
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      console.error("Response is not JSON, received:", contentType);
      return [];
    }

    const data = await response.json();
    return data.articles || data.data || [];
  } catch (error) {
    console.error("Error fetching articles for sitemap:", error);
    return [];
  }
}

// دالة جلب التصنيفات
async function getCategories() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "https://sabq.me";
    const response = await fetch(`${baseUrl}/api/categories`, {
      next: { revalidate: 3600 }, // إعادة التحقق كل ساعة
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return [];
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      console.error("Response is not JSON, received:", contentType);
      return [];
    }

    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://sabq.io").replace(/\/$/, "");

  // الصفحات الثابتة
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/opinion-articles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-use`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // جلب المقالات والأخبار
  const articles = await getArticles();
  const articlePages: MetadataRoute.Sitemap = articles.map((article: any) => ({
    url: `${baseUrl}${article.article_type === "news" ? "/news" : "/article"}/${
      article.slug || article.id
    }`,
    lastModified: new Date(
      article.published_at || article.updated_at || article.created_at
    ),
    changeFrequency: "weekly" as const,
    priority:
      article.article_type === "breaking"
        ? 0.9
        : article.article_type === "news"
        ? 0.8
        : article.article_type === "opinion"
        ? 0.7
        : 0.6,
  }));

  // جلب التصنيفات
  const categories = await getCategories();
  const categoryPages: MetadataRoute.Sitemap = categories.map(
    (category: any) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })
  );

  return [...staticPages, ...articlePages, ...categoryPages];
}
