// تحسينات قاعدة البيانات والاستعلامات

export const DatabaseOptimizer = {
  // تحسين استعلامات المقالات
  optimizedArticleSelect: {
    id: true,
    title: true,
    excerpt: true,
    cover_image: true,
    featured_image: true,
    is_published: true,
    created_at: true,
    updated_at: true,
    publish_date: true,
    published_at: true,
    reading_time: true,
    views: true,
    likes: true,
    shares: true,
    comments_count: true,
    tags: true,
    sentiment: true,
    status: true,
    breaking: true,
    featured: true,
    slug: true,
    article_type: true,
    category_id: true,
    author_id: true,
    seo_title: true,
    seo_description: true,
  },

  // تحسين استعلامات الزوايا
  optimizedAngleSelect: {
    id: true,
    title: true,
    slug: true,
    description: true,
    icon: true,
    theme_color: true,
    cover_image: true,
    is_published: true,
    is_featured: true,
    created_at: true,
    updated_at: true,
    author_id: true,
    views_count: true,
    articles_count: true,
  },

  // تحسين include للكاتب
  optimizedAuthorInclude: {
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      title: true,
      social_links: true,
    },
  },

  // تحسين include للتصنيف
  optimizedCategoryInclude: {
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      icon: true,
      description: true,
    },
  },

  // استعلام محسن للمقالات المميزة
  getFeaturedArticlesQuery: (limit: number = 10) => ({
    where: {
      AND: [
        { status: "published" },
        { is_published: true },
        { featured: true },
      ],
    },
    select: DatabaseOptimizer.optimizedArticleSelect,
    include: {
      categories: DatabaseOptimizer.optimizedCategoryInclude,
      users: DatabaseOptimizer.optimizedAuthorInclude,
    },
    orderBy: [
      { featured: "desc" },
      { published_at: "desc" },
      { views: "desc" },
    ],
    take: limit,
  }),

  // استعلام محسن لمقالات مقترب
  getMuqtarabArticlesQuery: (
    page: number,
    limit: number,
    sortBy: string = "newest"
  ) => {
    const offset = (page - 1) * limit;

    let orderBy: any[] = [];
    switch (sortBy) {
      case "popular":
        orderBy = [{ views: "desc" }, { created_at: "desc" }];
        break;
      case "featured":
        orderBy = [{ tags: "desc" }, { created_at: "desc" }]; // مقالات تحتوي على "مميز"
        break;
      default: // newest
        orderBy = [{ created_at: "desc" }];
    }

    return {
      where: {
        AND: [{ is_published: true }, { angle_id: { not: null } }],
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        cover_image: true,
        created_at: true,
        updated_at: true,
        publish_date: true,
        reading_time: true,
        views: true,
        tags: true,
        sentiment: true,
        angle_id: true,
        author_id: true,
      },
      include: {
        angles: {
          select: DatabaseOptimizer.optimizedAngleSelect,
        },
        users: DatabaseOptimizer.optimizedAuthorInclude,
      },
      orderBy,
      skip: offset,
      take: limit,
    };
  },

  // استعلام محسن للزوايا
  getAnglesQuery: (published: boolean = true) => ({
    where: published ? { is_published: true } : {},
    select: DatabaseOptimizer.optimizedAngleSelect,
    include: {
      users: DatabaseOptimizer.optimizedAuthorInclude,
      _count: {
        select: {
          angle_articles: {
            where: { is_published: true },
          },
        },
      },
    },
    orderBy: [{ is_featured: "desc" }, { created_at: "desc" }],
  }),

  // استعلام محسن للأخبار العاجلة
  getBreakingNewsQuery: (limit: number = 5) => ({
    where: {
      AND: [
        { status: "published" },
        { is_published: true },
        { breaking: true },
        { article_type: { not: "opinion" } },
      ],
    },
    select: DatabaseOptimizer.optimizedArticleSelect,
    include: {
      categories: DatabaseOptimizer.optimizedCategoryInclude,
      users: DatabaseOptimizer.optimizedAuthorInclude,
    },
    orderBy: [{ published_at: "desc" }, { created_at: "desc" }],
    take: limit,
  }),

  // Raw SQL queries محسنة للإحصائيات
  getStatsQuery: (type: "muqtarab" | "general" = "general") => {
    if (type === "muqtarab") {
      return `
        SELECT
          COUNT(DISTINCT a.id) as total_angles,
          COUNT(CASE WHEN a.is_published = true THEN 1 END) as published_angles,
          COUNT(CASE WHEN a.is_featured = true THEN 1 END) as featured_angles,
          COUNT(DISTINCT aa.id) as total_articles,
          COUNT(CASE WHEN aa.is_published = true THEN 1 END) as published_articles,
          COALESCE(SUM(CASE WHEN aa.is_published = true THEN aa.views ELSE 0 END), 0) as total_views,
          COALESCE(AVG(CASE WHEN aa.is_published = true THEN aa.reading_time ELSE NULL END), 0) as avg_reading_time,
          COUNT(DISTINCT aa.author_id) as unique_authors
        FROM angles a
        LEFT JOIN angle_articles aa ON a.id = aa.angle_id
      `;
    }

    return `
      SELECT
        COUNT(CASE WHEN status = 'published' AND is_published = true THEN 1 END) as published_articles,
        COUNT(CASE WHEN breaking = true AND status = 'published' THEN 1 END) as breaking_news,
        COUNT(CASE WHEN featured = true AND status = 'published' THEN 1 END) as featured_articles,
        COALESCE(SUM(CASE WHEN status = 'published' THEN views ELSE 0 END), 0) as total_views,
        COUNT(DISTINCT category_id) as active_categories,
        COUNT(DISTINCT author_id) as active_authors
      FROM articles
    `;
  },

  // فهارس مقترحة لتحسين الأداء
  suggestedIndexes: [
    "CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status, is_published);",
    "CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles(published_at DESC);",
    "CREATE INDEX IF NOT EXISTS idx_articles_views_desc ON articles(views DESC);",
    "CREATE INDEX IF NOT EXISTS idx_articles_breaking ON articles(breaking) WHERE breaking = true;",
    "CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured) WHERE featured = true;",
    "CREATE INDEX IF NOT EXISTS idx_articles_category_published ON articles(category_id, is_published);",
    "CREATE INDEX IF NOT EXISTS idx_articles_author_published ON articles(author_id, is_published);",
    "CREATE INDEX IF NOT EXISTS idx_angles_published ON angles(is_published) WHERE is_published = true;",
    "CREATE INDEX IF NOT EXISTS idx_angles_featured ON angles(is_featured) WHERE is_featured = true;",
    "CREATE INDEX IF NOT EXISTS idx_angle_articles_published ON angle_articles(is_published) WHERE is_published = true;",
    "CREATE INDEX IF NOT EXISTS idx_angle_articles_angle_id ON angle_articles(angle_id, is_published);",
    "CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = true;",
    "CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;",
  ],

  // دالة لإنشاء الفهارس
  async createIndexes(prisma: any) {
    console.log("🔧 Creating database indexes for performance optimization...");

    for (const indexQuery of DatabaseOptimizer.suggestedIndexes) {
      try {
        await prisma.$executeRawUnsafe(indexQuery);
        console.log(`✅ Index created: ${indexQuery.split(" ")[5]}`);
      } catch (error) {
        // تجاهل الأخطاء إذا كان الفهرس موجود بالفعل
        if (!error.message.includes("already exists")) {
          console.warn(`⚠️ Failed to create index: ${error.message}`);
        }
      }
    }

    console.log("✅ Database optimization completed!");
  },

  // تحليل أداء الاستعلام
  async analyzeQuery(prisma: any, query: string) {
    try {
      const result = await prisma.$queryRawUnsafe(`EXPLAIN ANALYZE ${query}`);
      console.log("📊 Query Analysis:", result);
      return result;
    } catch (error) {
      console.error("❌ Query analysis failed:", error);
      return null;
    }
  },

  // إحصائيات قاعدة البيانات
  async getDatabaseStats(prisma: any) {
    try {
      const stats = await Promise.all([
        prisma.articles.count(),
        prisma.angles.count(),
        prisma.categories.count(),
        prisma.users.count(),
        prisma.angle_articles.count(),
      ]);

      return {
        articles: stats[0],
        angles: stats[1],
        categories: stats[2],
        users: stats[3],
        angleArticles: stats[4],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Failed to get database stats:", error);
      return null;
    }
  },
};

export default DatabaseOptimizer;
