import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import prisma from "@/lib/prisma";

// GET /api/admin/tags/stats - إحصائيات شاملة للكلمات المفتاحية
export async function GET(request: NextRequest) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // إحصائيات عامة
    const [
      totalTags,
      activeTags,
      inactiveTags,
      totalArticleTagConnections,
      mostUsedTags,
      recentTags,
      categoriesStats,
      monthlyStats
    ] = await Promise.all([
      // إجمالي الكلمات المفتاحية
      prisma.tags.count(),
      
      // الكلمات المفتاحية النشطة
      prisma.tags.count({
        where: { is_active: true }
      }),
      
      // الكلمات المفتاحية غير النشطة
      prisma.tags.count({
        where: { is_active: false }
      }),
      
      // إجمالي الاتصالات بين المقالات والكلمات المفتاحية
      prisma.article_tags.count(),
      
      // أكثر الكلمات المفتاحية استخداماً
      prisma.tags.findMany({
        include: {
          _count: {
            select: {
              article_tags: true
            }
          }
        },
        orderBy: {
          article_tags: {
            _count: "desc"
          }
        },
        take: 10
      }),
      
      // آخر الكلمات المفتاحية المضافة
      prisma.tags.findMany({
        orderBy: {
          created_at: "desc"
        },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          created_at: true,
          _count: {
            select: {
              article_tags: true
            }
          }
        }
      }),
      
      // إحصائيات الفئات
      prisma.tags.groupBy({
        by: ["category"],
        _count: {
          category: true
        },
        orderBy: {
          _count: {
            category: "desc"
          }
        }
      }),
      
      // إحصائيات شهرية للكلمات المفتاحية الجديدة
      prisma.tags.groupBy({
        by: ["created_at"],
        _count: {
          id: true
        },
        where: {
          created_at: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
          }
        }
      })
    ]);

    // معالجة الإحصائيات الشهرية
    const monthlyStatsFormatted = monthlyStats.reduce((acc: any, stat) => {
      const month = new Date(stat.created_at).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + stat._count.id;
      return acc;
    }, {});

    // إحصائيات الألوان
    const colorStats = await prisma.tags.groupBy({
      by: ["color"],
      _count: {
        color: true
      },
      orderBy: {
        _count: {
          color: "desc"
        }
      }
    });

    // إحصائيات الأولوية
    const priorityStats = await prisma.tags.groupBy({
      by: ["priority"],
      _count: {
        priority: true
      },
      orderBy: {
        priority: "desc"
      }
    });

    // الكلمات المفتاحية غير المستخدمة
    const unusedTags = await prisma.tags.findMany({
      where: {
        article_tags: {
          none: {}
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        created_at: true
      },
      take: 10
    });

    // متوسط عدد الكلمات المفتاحية لكل مقال
    const articlesWithTagCount = await prisma.articles.findMany({
      include: {
        _count: {
          select: {
            article_tags: true
          }
        }
      }
    });
    
    const averageTagsPerArticle = articlesWithTagCount.length > 0 
      ? articlesWithTagCount.reduce((sum, article) => sum + article._count.article_tags, 0) / articlesWithTagCount.length
      : 0;

    const stats = {
      overview: {
        total_tags: totalTags,
        active_tags: activeTags,
        inactive_tags: inactiveTags,
        total_connections: totalArticleTagConnections,
        average_tags_per_article: Math.round(averageTagsPerArticle * 100) / 100,
        unused_tags_count: unusedTags.length
      },
      most_used_tags: mostUsedTags.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
        usage_count: tag._count.article_tags,
        category: tag.category,
        priority: tag.priority
      })),
      recent_tags: recentTags,
      categories_distribution: categoriesStats.map(cat => ({
        category: cat.category || "غير مصنف",
        count: cat._count.category
      })),
      colors_distribution: colorStats.map(color => ({
        color: color.color || "افتراضي",
        count: color._count.color
      })),
      priority_distribution: priorityStats.map(priority => ({
        priority: priority.priority,
        count: priority._count.priority
      })),
      monthly_creation: monthlyStatsFormatted,
      unused_tags: unusedTags,
      performance_metrics: {
        tags_to_articles_ratio: totalTags > 0 ? Math.round((totalArticleTagConnections / totalTags) * 100) / 100 : 0,
        active_percentage: totalTags > 0 ? Math.round((activeTags / totalTags) * 100) : 0,
        usage_efficiency: totalTags > 0 ? Math.round(((totalTags - unusedTags.length) / totalTags) * 100) : 0
      }
    };

    return NextResponse.json({
      success: true,
      data: stats,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ خطأ في جلب إحصائيات الكلمات المفتاحية:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "فشل في جلب الإحصائيات",
        details: error instanceof Error ? error.message : "خطأ غير معروف"
      },
      { status: 500 }
    );
  }
}
