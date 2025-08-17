import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// التحقق من صلاحيات الإدارة
async function checkAdminAuth(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "") || 
                request.cookies.get("auth-token")?.value;
  
  if (!token) return null;
  
  try {
    // يمكن إضافة تحقق JWT هنا لاحقاً
    return { id: "admin", email: "admin@sabq.ai" };
  } catch {
    return null;
  }
}

// خوارزمية حساب شعبية الكلمات المفتاحية
export async function POST(request: NextRequest) {
  try {
    const user = await checkAdminAuth(request);
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { period = 30, includeViews = true, includeInteractions = true } = 
      await request.json();

    console.log("🔄 بدء حساب شعبية الكلمات المفتاحية...");

    // تحديد الفترة الزمنية
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // 1. حساب الإحصائيات الأساسية للعلامات
    const tagsWithStats = await prisma.tags.findMany({
      where: { is_active: true },
      include: {
        article_tags: {
          include: {
            articles: {
              where: {
                published_at: {
                  gte: startDate
                },
                status: "published"
              },
              select: {
                id: true,
                views: true,
                published_at: true,
                created_at: true
              }
            }
          }
        },
        tag_analytics: {
          where: {
            date: {
              gte: startDate
            }
          }
        }
      }
    });

    console.log(`📊 معالجة ${tagsWithStats.length} علامة...`);

    const updatedTags: any[] = [];

    for (const tag of tagsWithStats) {
      // حساب عدد المقالات في الفترة المحددة
      const articleCount = tag.article_tags.filter((at: any) => 
        at.articles.published_at && new Date(at.articles.published_at) >= startDate
      ).length;

      // حساب إجمالي المشاهدات
      const totalViews = tag.article_tags.reduce((sum: number, at: any) => {
        if (at.articles.published_at && new Date(at.articles.published_at) >= startDate) {
          return sum + (at.articles.views || 0);
        }
        return sum;
      }, 0);

      // حساب معامل الحداثة (الاستخدامات الأحدث تحصل على وزن أكبر)
      const recencyFactor = tag.article_tags.reduce((factor: number, at: any) => {
        if (at.articles.published_at && new Date(at.articles.published_at) >= startDate) {
          const daysSince = Math.max(1, 
            (Date.now() - new Date(at.articles.published_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          // منحنى تدهور: كلما كان أحدث، كلما كان الوزن أكبر
          return factor + Math.pow(0.95, daysSince);
        }
        return factor;
      }, 0);

      // حساب معامل النمو (مقارنة بالفترة السابقة)
      const previousPeriodStart = new Date(startDate);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - period);
      
      const previousArticleCount = tag.article_tags.filter((at: any) => 
        at.articles.published_at && 
        new Date(at.articles.published_at) >= previousPeriodStart &&
        new Date(at.articles.published_at) < startDate
      ).length;

      const growthRate = previousArticleCount > 0 
        ? ((articleCount - previousArticleCount) / previousArticleCount) * 100
        : articleCount > 0 ? 100 : 0;

      // حساب نقاط الشعبية النهائية
      let popularityScore = 0;
      
      // عامل التكرار (40% من النقاط)
      popularityScore += articleCount * 0.4;
      
      // عامل المشاهدات (30% من النقاط) - إذا كان مفعلاً
      if (includeViews) {
        popularityScore += (totalViews / 100) * 0.3;
      }
      
      // عامل الحداثة (20% من النقاط)
      popularityScore += recencyFactor * 0.2;
      
      // عامل النمو (10% من النقاط) - مع تعزيز للكلمات الصاعدة
      const growthBonus = Math.max(0, growthRate / 100) * 0.1;
      popularityScore += growthBonus;

      // تطبيق عوامل إضافية
      if (tag.priority) {
        popularityScore *= (1 + (tag.priority - 5) * 0.1); // الأولوية تؤثر بـ ±10% لكل درجة
      }

      // تحديث العلامة
      const updatedTag = await prisma.tags.update({
        where: { id: tag.id },
        data: {
          total_usage_count: articleCount,
          views_count: totalViews,
          growth_rate: growthRate,
          popularity_score: Math.round(popularityScore * 100) / 100,
          last_used_at: tag.article_tags.length > 0 
            ? new Date(Math.max(...tag.article_tags
                .filter((at: any) => at.articles.published_at)
                .map((at: any) => new Date(at.articles.published_at!).getTime())))
            : null,
          updated_at: new Date()
        }
      });

      // حفظ البيانات التحليلية اليومية
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      try {
        await prisma.tag_analytics.upsert({
          where: {
            tag_id_date: {
              tag_id: tag.id,
              date: today
            }
          },
          update: {
            usage_count: articleCount,
            article_count: articleCount,
            views_count: totalViews,
            growth_factor: growthRate,
            popularity_score: popularityScore
          },
          create: {
            tag_id: tag.id,
            date: today,
            usage_count: articleCount,
            article_count: articleCount,
            views_count: totalViews,
            growth_factor: growthRate,
            popularity_score: popularityScore
          }
        });
      } catch (analyticsError) {
        console.warn(`⚠️ خطأ في حفظ تحليلات العلامة ${tag.name}:`, analyticsError);
      }

      updatedTags.push({
        id: tag.id,
        name: tag.name,
        articleCount,
        totalViews,
        growthRate,
        popularityScore,
        recencyFactor
      });
    }

    // ترتيب العلامات حسب الشعبية
    updatedTags.sort((a, b) => b.popularityScore - a.popularityScore);

    console.log("✅ تم حساب شعبية الكلمات المفتاحية بنجاح");

    return NextResponse.json({
      success: true,
      message: `تم تحديث شعبية ${updatedTags.length} كلمة مفتاحية`,
      data: {
        period,
        processedTags: updatedTags.length,
        topTags: updatedTags.slice(0, 10),
        summary: {
          totalArticles: updatedTags.reduce((sum, tag) => sum + tag.articleCount, 0),
          totalViews: updatedTags.reduce((sum, tag) => sum + tag.totalViews, 0),
          avgGrowthRate: updatedTags.length > 0 
            ? updatedTags.reduce((sum, tag) => sum + tag.growthRate, 0) / updatedTags.length 
            : 0
        }
      }
    });

  } catch (error: any) {
    console.error("❌ خطأ في حساب شعبية الكلمات:", error);
    return NextResponse.json(
      { 
        error: "خطأ في حساب الشعبية", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
