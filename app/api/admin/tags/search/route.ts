import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import prisma from "@/lib/prisma";

// POST /api/admin/tags/search - بحث متقدم في الكلمات المفتاحية
export async function POST(request: NextRequest) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      query = "",
      categories = [],
      colors = [],
      is_active,
      min_usage = 0,
      max_usage,
      priority_range = [0, 10],
      created_after,
      created_before,
      sort_by = "usage",
      sort_order = "desc",
      page = 1,
      limit = 20,
      include_unused = true,
      include_synonyms = false
    } = data;

    // بناء شروط البحث
    const whereConditions: any = {};

    // البحث النصي
    if (query && query.trim()) {
      const searchTerms = query.trim().split(/\s+/);
      whereConditions.OR = [
        {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          slug: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ];

      if (include_synonyms) {
        whereConditions.OR.push({
          synonyms: {
            hasSome: searchTerms
          }
        });
      }

      // البحث في الوصف
      whereConditions.OR.push({
        description: {
          contains: query,
          mode: 'insensitive'
        }
      });
    }

    // فلترة حسب الفئات
    if (categories && categories.length > 0) {
      whereConditions.category = {
        in: categories
      };
    }

    // فلترة حسب الألوان
    if (colors && colors.length > 0) {
      whereConditions.color = {
        in: colors
      };
    }

    // فلترة حسب الحالة (نشط/غير نشط)
    if (is_active !== undefined) {
      whereConditions.is_active = is_active;
    }

    // فلترة حسب نطاق الأولوية
    if (priority_range && priority_range.length === 2) {
      whereConditions.priority = {
        gte: priority_range[0],
        lte: priority_range[1]
      };
    }

    // فلترة حسب تاريخ الإنشاء
    if (created_after || created_before) {
      whereConditions.created_at = {};
      if (created_after) {
        whereConditions.created_at.gte = new Date(created_after);
      }
      if (created_before) {
        whereConditions.created_at.lte = new Date(created_before);
      }
    }

    // إعداد الترتيب
    let orderBy: any = {};
    switch (sort_by) {
      case 'name':
        orderBy.name = sort_order;
        break;
      case 'usage':
        orderBy.article_tags = { _count: sort_order };
        break;
      case 'created':
        orderBy.created_at = sort_order;
        break;
      case 'updated':
        orderBy.updated_at = sort_order;
        break;
      case 'priority':
        orderBy.priority = sort_order;
        break;
      default:
        orderBy.created_at = 'desc';
    }

    // تطبيق فلتر الاستخدام
    let havingCondition: any = undefined;
    if (min_usage > 0 || max_usage !== undefined) {
      // سنحتاج إلى استعلام منفصل للفلترة حسب عدد الاستخدام
    }

    // جلب النتائج مع الاحصائيات
    const [tags, totalCount] = await Promise.all([
      prisma.tags.findMany({
        where: whereConditions,
        include: {
          _count: {
            select: {
              article_tags: true
            }
          }
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.tags.count({
        where: whereConditions
      })
    ]);

    // فلترة حسب عدد الاستخدام إذا كان مطلوباً
    let filteredTags = tags;
    if (min_usage > 0 || max_usage !== undefined) {
      filteredTags = tags.filter(tag => {
        const usageCount = tag._count.article_tags;
        if (min_usage > 0 && usageCount < min_usage) return false;
        if (max_usage !== undefined && usageCount > max_usage) return false;
        return true;
      });
    }

    // إضافة إحصائيات الاتجاه (trend) للكلمات المفتاحية
    const tagsWithTrend = await Promise.all(
      filteredTags.map(async (tag) => {
        // حساب الاتجاه بناءً على الاستخدام في آخر 30 يوم مقابل الـ 30 يوم السابقة
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const [recentUsage, previousUsage] = await Promise.all([
          prisma.article_tags.count({
            where: {
              tag_id: tag.id,
              articles: {
                published_at: {
                  gte: thirtyDaysAgo
                }
              }
            }
          }),
          prisma.article_tags.count({
            where: {
              tag_id: tag.id,
              articles: {
                published_at: {
                  gte: sixtyDaysAgo,
                  lt: thirtyDaysAgo
                }
              }
            }
          })
        ]);

        let usage_trend: 'up' | 'down' | 'stable' = 'stable';
        if (recentUsage > previousUsage) {
          usage_trend = 'up';
        } else if (recentUsage < previousUsage) {
          usage_trend = 'down';
        }

        return {
          ...tag,
          articles_count: tag._count.article_tags,
          usage_trend,
          recent_usage: recentUsage,
          previous_usage: previousUsage
        };
      })
    );

    // إحصائيات إضافية
    const searchStats = {
      total_found: totalCount,
      current_page_count: tagsWithTrend.length,
      page,
      limit,
      total_pages: Math.ceil(totalCount / limit),
      has_next_page: page * limit < totalCount,
      has_previous_page: page > 1
    };

    // تحليل النتائج
    const resultsAnalysis = {
      most_used: tagsWithTrend.reduce((max, tag) => 
        tag.articles_count > (max?.articles_count || 0) ? tag : max, null),
      least_used: tagsWithTrend.reduce((min, tag) => 
        tag.articles_count < (min?.articles_count || Infinity) ? tag : min, null),
      trending_up: tagsWithTrend.filter(tag => tag.usage_trend === 'up').length,
      trending_down: tagsWithTrend.filter(tag => tag.usage_trend === 'down').length,
      average_usage: tagsWithTrend.length > 0 
        ? Math.round(tagsWithTrend.reduce((sum, tag) => sum + tag.articles_count, 0) / tagsWithTrend.length)
        : 0,
      categories_found: [...new Set(tagsWithTrend.map(tag => tag.category).filter(Boolean))],
      colors_found: [...new Set(tagsWithTrend.map(tag => tag.color).filter(Boolean))]
    };

    return NextResponse.json({
      success: true,
      data: {
        tags: tagsWithTrend,
        pagination: searchStats,
        analysis: resultsAnalysis,
        search_criteria: {
          query,
          categories,
          colors,
          is_active,
          min_usage,
          max_usage,
          priority_range,
          created_after,
          created_before,
          sort_by,
          sort_order
        }
      }
    });

  } catch (error) {
    console.error("❌ خطأ في البحث المتقدم:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "فشل في البحث المتقدم",
        details: error instanceof Error ? error.message : "خطأ غير معروف"
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/tags/search - البحث البسيط (للاستخدام السريع)
export async function GET(request: NextRequest) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || "";
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: {
          tags: [],
          suggestions: []
        }
      });
    }

    // البحث السريع
    const tags = await prisma.tags.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            slug: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        _count: {
          select: {
            article_tags: true
          }
        }
      },
      orderBy: [
        { article_tags: { _count: 'desc' } },
        { name: 'asc' }
      ],
      take: limit
    });

    // اقتراحات بناءً على البحث الجزئي
    const suggestions = await prisma.tags.findMany({
      where: {
        name: {
          startsWith: query,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: {
        name: 'asc'
      },
      take: 5
    });

    return NextResponse.json({
      success: true,
      data: {
        tags: tags.map(tag => ({
          ...tag,
          articles_count: tag._count.article_tags
        })),
        suggestions,
        query,
        total_found: tags.length
      }
    });

  } catch (error) {
    console.error("❌ خطأ في البحث السريع:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "فشل في البحث السريع",
        details: error instanceof Error ? error.message : "خطأ غير معروف"
      },
      { status: 500 }
    );
  }
}
