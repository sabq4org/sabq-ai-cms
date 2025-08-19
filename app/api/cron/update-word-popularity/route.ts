import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

const prisma = getPrismaClient();

// API Cron لحساب شعبية الكلمات المفتاحية تلقائياً
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    // التحقق من الصلاحية (Vercel Cron أو secret key)
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    console.log("🕐 بدء المهمة المجدولة لحساب شعبية الكلمات...");

    const startTime = Date.now();

    // إعدادات المهمة
    const PERIODS = [7, 30, 90]; // فترات زمنية مختلفة
    const BATCH_SIZE = 100; // معالجة دفعية للأداء

    let totalProcessed = 0;
    const results = [];

    for (const period of PERIODS) {
      console.log(`📊 معالجة فترة ${period} يوم...`);

      // تحديد الفترة الزمنية
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // جلب العلامات بشكل دفعي
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        let tagsBatch;
        try {
          tagsBatch = await prisma.tags.findMany({
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
              }
            },
            skip: offset,
            take: BATCH_SIZE
          });
        } catch (error: any) {
          console.error(`❌ خطأ في جلب العلامات للفترة ${period}:`, error.message);
          tagsBatch = [];
        }

        if (tagsBatch.length === 0) {
          hasMore = false;
          continue;
        }

        // معالجة كل دفعة
        for (const tag of tagsBatch) {
          try {
            // حساب الإحصائيات
            const articleCount = tag.article_tags.filter(at => 
              at.articles.published_at && new Date(at.articles.published_at) >= startDate
            ).length;

            const totalViews = tag.article_tags.reduce((sum, at) => {
              if (at.articles.published_at && new Date(at.articles.published_at) >= startDate) {
                return sum + (at.articles.views || 0);
              }
              return sum;
            }, 0);

            // حساب معامل الحداثة
            const recencyFactor = tag.article_tags.reduce((factor, at) => {
              if (at.articles.published_at && new Date(at.articles.published_at) >= startDate) {
                const daysSince = Math.max(1, 
                  (Date.now() - new Date(at.articles.published_at).getTime()) / (1000 * 60 * 60 * 24)
                );
                return factor + Math.pow(0.95, daysSince);
              }
              return factor;
            }, 0);

            // حساب معامل النمو
            const previousPeriodStart = new Date(startDate);
            previousPeriodStart.setDate(previousPeriodStart.getDate() - period);
            
            const previousArticleCount = tag.article_tags.filter(at => 
              at.articles.published_at && 
              new Date(at.articles.published_at) >= previousPeriodStart &&
              new Date(at.articles.published_at) < startDate
            ).length;

            const growthRate = previousArticleCount > 0 
              ? ((articleCount - previousArticleCount) / previousArticleCount) * 100
              : articleCount > 0 ? 100 : 0;

            // حساب نقاط الشعبية
            let popularityScore = 0;
            popularityScore += articleCount * 0.4; // التكرار
            popularityScore += (totalViews / 100) * 0.3; // المشاهدات
            popularityScore += recencyFactor * 0.2; // الحداثة
            popularityScore += Math.max(0, growthRate / 100) * 0.1; // النمو

            if (tag.priority) {
              popularityScore *= (1 + (tag.priority - 5) * 0.1);
            }

            // تحديث العلامة فقط إذا تغيرت القيم
            if (period === 30) { // استخدام فترة 30 يوم كأساس
              try {
                await prisma.tags.update({
                  where: { id: tag.id },
                  data: {
                    total_usage_count: articleCount,
                    views_count: totalViews,
                    growth_rate: Math.round(growthRate * 100) / 100,
                    popularity_score: Math.round(popularityScore * 100) / 100,
                    last_used_at: tag.article_tags.length > 0 
                      ? new Date(Math.max(...tag.article_tags
                          .filter(at => at.articles.published_at)
                          .map(at => new Date(at.articles.published_at!).getTime())))
                      : null,
                    updated_at: new Date()
                  }
                });
              } catch (updateError: any) {
                console.error(`❌ خطأ في تحديث العلامة ${tag.name}:`, updateError.message);
              }
            }

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
                  popularity_score: popularityScore,
                  clicks_count: 0,
                  interactions: 0
                }
              });
            } catch (analyticsError: any) {
              console.warn(`⚠️ خطأ في حفظ تحليلات ${tag.name}:`, analyticsError.message);
            }

            totalProcessed++;

          } catch (tagError) {
            console.error(`❌ خطأ في معالجة العلامة ${tag.name}:`, tagError);
          }
        }

        offset += BATCH_SIZE;
        
        // استراحة قصيرة لتجنب إرهاق قاعدة البيانات
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      results.push({
        period,
        processedTags: totalProcessed,
        timestamp: new Date().toISOString()
      });
    }

    // تنظيف البيانات القديمة (أكثر من 365 يوم)
    const cleanupDate = new Date();
    cleanupDate.setDate(cleanupDate.getDate() - 365);

    const deletedAnalytics = await prisma.tag_analytics.deleteMany({
      where: {
        date: {
          lt: cleanupDate
        }
      }
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ تمت المهمة المجدولة بنجاح في ${duration}ms`);

    // إحصائيات النتائج
    const summary = {
      totalProcessed,
      duration: `${duration}ms`,
      deletedOldRecords: deletedAnalytics.count,
      periods: results,
      completedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: `تم تحديث شعبية ${totalProcessed} كلمة مفتاحية`,
      data: summary
    });

  } catch (error: any) {
    console.error("❌ خطأ في المهمة المجدولة:", error);
    
    return NextResponse.json(
      { 
        error: "خطأ في تنفيذ المهمة المجدولة", 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// للاختبار اليدوي (POST)
export async function POST(request: NextRequest) {
  try {
    // تنفيذ نفس المنطق للاختبار اليدوي
    return await GET(request);
  } catch (error: any) {
    return NextResponse.json(
      { error: "خطأ في الاختبار اليدوي", details: error.message },
      { status: 500 }
    );
  }
}
