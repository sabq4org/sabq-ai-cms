import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { corsResponse } from '@/lib/cors';












// أنواع الأحداث في النظام
const EVENT_TYPES = {
  ARTICLE_PUBLISHED: 'article_published',
  ARTICLE_UPDATED: 'article_updated',
  ARTICLE_FEATURED: 'article_featured',
  ARTICLE_BREAKING: 'article_breaking',
  COMMENT_ADDED: 'comment_added',
  CATEGORY_CREATED: 'category_created',
  AUTHOR_JOINED: 'author_joined',
  ANALYSIS_COMPLETED: 'analysis_completed',
  USER_MILESTONE: 'user_milestone',
  SYSTEM_UPDATE: 'system_update',
  DAILY_DOSE_PUBLISHED: 'daily_dose_published',
  FORUM_TOPIC_CREATED: 'forum_topic_created',
  FORUM_REPLY_ADDED: 'forum_reply_added',
  TEAM_MEMBER_JOINED: 'team_member_joined',
  TEMPLATE_CREATED: 'template_created',
  SMART_BLOCK_UPDATED: 'smart_block_updated',
  KEYWORD_TRENDING: 'keyword_trending',
  USER_VERIFIED: 'user_verified',
  LOYALTY_ACHIEVEMENT: 'loyalty_achievement'
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20'); // تقليل الحد الافتراضي
    const offset = parseInt(searchParams.get('offset') || '0');
    const filter = searchParams.get('filter') || 'all';
    const realtime = searchParams.get('realtime') === 'true';

    // جلب آخر الأحداث من جداول مختلفة
    const events = [];
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last3Days = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // تقليل من 7 أيام إلى 3
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    // تشغيل جميع الاستعلامات بشكل متوازي
    const [
      recentArticles,
      recentAnalyses,
      recentComments,
      recentCategories,
      recentAuthors,
      recentDailyDoses,
      recentForumTopics,
      recentForumReplies,
      recentTeamMembers,
      recentTemplates,
      recentSmartBlocks,
      recentKeywords,
      recentVerifiedUsers,
      recentLoyaltyPoints,
      storedEvents
    ] = await Promise.all([
      // 1. المقالات المنشورة حديثاً
      prisma.articles.findMany({
        where: {
          status: 'published',
          published_at: {
            gte: realtime ? last24Hours : last3Days
          }
        },
        orderBy: {
          published_at: 'desc'
        },
        take: realtime ? 10 : 20 // تقليل العدد
      }),

      // 2. التحليلات العميقة الجديدة
      realtime ? [] : prisma.deep_analyses.findMany({
        where: {
          analyzed_at: {
            gte: last3Days
          }
        },
        orderBy: {
          analyzed_at: 'desc'
        },
        take: 10 // تقليل العدد
      }),

      // 3. التعليقات الجديدة
      realtime ? [] : prisma.comments.findMany({
        where: {
          status: 'approved',
          created_at: {
            gte: last24Hours
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 20 // تقليل العدد
      }),

      // 4. التصنيفات الجديدة
      realtime ? [] : prisma.categories.findMany({
        where: {
          created_at: {
            gte: last3Days
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 5
      }),

      // 5. المؤلفون الجدد
      realtime ? [] : prisma.users.findMany({
        where: {
          role: 'AUTHOR',
          created_at: {
            gte: last3Days
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 5
      }),

      // 6. الجرعات اليومية الجديدة
      realtime ? [] : prisma.daily_doses.findMany({
        where: {
          status: 'published',
          publishedAt: {
            gte: last24Hours
          }
        },
        orderBy: {
          publishedAt: 'desc'
        },
        take: 5
      }),

      // 7. مواضيع المنتدى الجديدة
      realtime ? [] : prisma.forum_topics.findMany({
        where: {
          status: 'active',
          created_at: {
            gte: last24Hours
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 10
      }),

      // 8. ردود المنتدى الجديدة
      realtime ? [] : prisma.forum_replies.findMany({
        where: {
          status: 'active',
          created_at: {
            gte: lastHour
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 15
      }),

      // 9. أعضاء الفريق الجدد
      realtime ? [] : prisma.team_members.findMany({
        where: {
          is_active: true,
          created_at: {
            gte: last3Days
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 5
      }),

      // 10. القوالب الجديدة
      realtime ? [] : prisma.templates.findMany({
        where: {
          is_active: true,
          created_at: {
            gte: last3Days
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 5
      }),

      // 11. تحديثات الكتل الذكية
      realtime ? [] : prisma.smart_blocks.findMany({
        where: {
          updated_at: {
            gte: last24Hours
          }
        },
        orderBy: {
          updated_at: 'desc'
        },
        take: 5
      }),

      // 12. الكلمات المفتاحية الرائجة
      realtime ? [] : prisma.keywords.findMany({
        where: {
          count: {
            gte: 10
          },
          created_at: {
            gte: last24Hours
          }
        },
        orderBy: {
          count: 'desc'
        },
        take: 10
      }),

      // 13. المستخدمون المعتمدون حديثاً
      realtime ? [] : prisma.users.findMany({
        where: {
          is_verified: true,
          updated_at: {
            gte: last24Hours
          }
        },
        orderBy: {
          updated_at: 'desc'
        },
        take: 10
      }),

      // 14. إنجازات نقاط الولاء
      realtime ? [] : prisma.loyalty_points.findMany({
        where: {
          points: {
            gte: 100
          },
          created_at: {
            gte: last24Hours
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 10
      }),

      // 15. الأحداث المخزنة في جدول timeline_events
      prisma.timeline_events.findMany({
        where: {
          created_at: {
            gte: realtime ? lastHour : last3Days
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: realtime ? 20 : 50
      })
    ]);

    // جلب بيانات إضافية للمقالات
    const categoryIds = [...new Set(recentArticles.map((a: any) => a.category_id).filter(Boolean))];
    const categoriesMap = new Map();
    if (categoryIds.length > 0) {
      const categories = await prisma.categories.findMany({
        where: { id: { in: categoryIds } }
      });
      categories.forEach((cat: any) => {
        categoriesMap.set(cat.id, cat);
      });
    }

    // جلب بيانات المؤلفين
    const authorIds = [...new Set(recentArticles.map((a: any) => a.author_id).filter(Boolean))];
    const authorsMap = new Map();
    if (authorIds.length > 0) {
      const authors = await prisma.users.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, name: true, avatar: true }
      });
      authors.forEach((author: any) => {
        authorsMap.set(author.id, author);
      });
    }

    // تحويل المقالات لأحداث (بدون استعلامات إضافية)
    for (const article of recentArticles) {
      const publishedAt = article.published_at || article.created_at;
      const isNew = publishedAt.getTime() > lastHour.getTime();
      const category = categoriesMap.get(article.category_id);
      const author = authorsMap.get(article.author_id);
      
      events.push({
        id: `article-${article.id}`,
        type: article.breaking ? EVENT_TYPES.ARTICLE_BREAKING : 
              article.featured ? EVENT_TYPES.ARTICLE_FEATURED : 
              EVENT_TYPES.ARTICLE_PUBLISHED,
        timestamp: publishedAt.toISOString(),
        title: article.title,
        description: article.excerpt || '',
        category: category?.name || 'عام',
        categoryColor: '#6B7280',
        author: author?.name || 'الكاتب',
        authorAvatar: author?.avatar,
        url: `/article/${article.id}`,
        metadata: {
          views: article.views || 0,
          featured: article.featured,
          breaking: article.breaking,
          readingTime: article.reading_time,
          comments: 0, // تعيين قيمة افتراضية بدلاً من الاستعلام
          shares: 0
        },
        isNew,
        icon: article.breaking ? '🚨' : (article.featured ? '⭐' : '📰')
      });
    }

    // جلب بيانات المقالات للتحليلات
    const analysisArticleIds = [...new Set(recentAnalyses.map((a: any) => a.article_id).filter(Boolean))];
    const articlesForAnalysisMap = new Map();
    if (analysisArticleIds.length > 0) {
      const articlesForAnalysis = await prisma.articles.findMany({
        where: { id: { in: analysisArticleIds } }
      });
      articlesForAnalysis.forEach((article: any) => {
        articlesForAnalysisMap.set(article.id, article);
      });
    }

    // تحويل التحليلات لأحداث
    for (const analysis of recentAnalyses) {
      const article = articlesForAnalysisMap.get(analysis.article_id);
      const category = article ? categoriesMap.get(article.category_id) : null;
      
      events.push({
        id: `analysis-${analysis.id}`,
        type: EVENT_TYPES.ANALYSIS_COMPLETED,
        timestamp: analysis.analyzed_at.toISOString(),
        title: `تحليل عميق: ${article?.title || 'مقال'}`,
        description: analysis.ai_summary || '',
        category: category?.name || 'تحليل',
        categoryColor: '#8B5CF6',
        url: `/insights/deep/${analysis.article_id}`,
        metadata: {
          sentiment: analysis.sentiment,
          readabilityScore: analysis.readability_score,
          engagementScore: analysis.engagement_score
        },
        isNew: analysis.analyzed_at.getTime() > lastHour.getTime(),
        icon: '📊'
      });
    }

    // جلب بيانات المقالات والمستخدمين للتعليقات
    const commentArticleIds = [...new Set(recentComments.map((c: any) => c.article_id).filter(Boolean))];
    const articlesForCommentsMap = new Map();
    if (commentArticleIds.length > 0) {
      const articlesForComments = await prisma.articles.findMany({
        where: { id: { in: commentArticleIds } },
        select: { id: true, title: true, category_id: true }
      });
      articlesForComments.forEach((article: any) => {
        articlesForCommentsMap.set(article.id, article);
      });
    }

    const commentUserIds = [...new Set(recentComments.map((c: any) => c.user_id).filter(Boolean))];
    const usersMap = new Map();
    if (commentUserIds.length > 0) {
      const users = await prisma.users.findMany({
        where: { id: { in: commentUserIds } },
        select: { id: true, name: true, avatar: true }
      });
      users.forEach((user: any) => {
        usersMap.set(user.id, user);
      });
    }

    // تحويل التعليقات لأحداث
    for (const comment of recentComments) {
      const content = comment.content.length > 100 
        ? comment.content.substring(0, 97) + '...' 
        : comment.content;
      
      const article = articlesForCommentsMap.get(comment.article_id);
      const user = usersMap.get(comment.user_id);
      const category = article ? categoriesMap.get(article.category_id) : null;
        
      events.push({
        id: `comment-${comment.id}`,
        type: EVENT_TYPES.COMMENT_ADDED,
        timestamp: comment.created_at.toISOString(),
        title: `تعليق جديد على: ${article?.title || 'مقال'}`,
        description: content,
        category: category?.name || 'تعليقات',
        categoryColor: '#10B981',
        author: user?.name || 'مستخدم',
        authorAvatar: user?.avatar,
        url: `/article/${comment.article_id}#comment-${comment.id}`,
        metadata: {
          likes: comment.likes || 0
        },
        isNew: comment.created_at.getTime() > lastHour.getTime(),
        icon: '💬'
      });
    }

    // تحويل التصنيفات لأحداث (بدون عد المقالات)
    for (const category of recentCategories) {
      events.push({
        id: `category-${category.id}`,
        type: EVENT_TYPES.CATEGORY_CREATED,
        timestamp: category.created_at.toISOString(),
        title: `تصنيف جديد: ${category.name}`,
        description: category.description || '',
        category: 'نظام',
        categoryColor: '#6B7280',
        url: `/categories/${category.slug}`,
        metadata: {},
        isNew: category.created_at.getTime() > lastHour.getTime(),
        icon: '🗂️'
      });
    }

    // تحويل المؤلفين لأحداث (بدون عد المقالات)
    for (const author of recentAuthors) {
      events.push({
        id: `author-${author.id}`,
        type: EVENT_TYPES.AUTHOR_JOINED,
        timestamp: author.created_at.toISOString(),
        title: `انضم كاتب جديد: ${author.name}`,
        description: 'كاتب في صحيفة سبق',
        category: 'فريق العمل',
        categoryColor: '#F59E0B',
        authorAvatar: author.avatar,
        url: `/author/${author.id}`,
        metadata: {
          role: author.role
        },
        isNew: author.created_at.getTime() > lastHour.getTime(),
        icon: '✍️'
      });
    }

    // تحويل الجرعات اليومية لأحداث
    for (const dose of recentDailyDoses) {
      events.push({
        id: `dose-${dose.id}`,
        type: EVENT_TYPES.DAILY_DOSE_PUBLISHED,
        timestamp: dose.publishedAt?.toISOString() || dose.createdAt.toISOString(),
        title: dose.title,
        description: dose.subtitle,
        category: 'جرعات يومية',
        categoryColor: '#EC4899',
        url: `/daily-dose`,
        metadata: {
          period: dose.period,
          views: dose.views || 0
        },
        isNew: (dose.publishedAt || dose.createdAt).getTime() > lastHour.getTime(),
        icon: '💊'
      });
    }

    // تحويل مواضيع المنتدى لأحداث
    for (const topic of recentForumTopics) {
      events.push({
        id: `forum-topic-${topic.id}`,
        type: EVENT_TYPES.FORUM_TOPIC_CREATED,
        timestamp: topic.created_at?.toISOString() || new Date().toISOString(),
        title: `موضوع جديد: ${topic.title}`,
        description: topic.content.substring(0, 150) + '...',
        category: 'المنتدى',
        categoryColor: '#059669',
        url: `/forum/topic/${topic.id}`,
        metadata: {
          views: topic.views || 0,
          isPinned: topic.is_pinned,
          isFeatured: topic.is_featured
        },
        isNew: (topic.created_at || new Date()).getTime() > lastHour.getTime(),
        icon: '💬'
      });
    }

    // تحويل ردود المنتدى لأحداث
    for (const reply of recentForumReplies) {
      events.push({
        id: `forum-reply-${reply.id}`,
        type: EVENT_TYPES.FORUM_REPLY_ADDED,
        timestamp: reply.created_at?.toISOString() || new Date().toISOString(),
        title: 'رد جديد في المنتدى',
        description: reply.content.substring(0, 100) + '...',
        category: 'المنتدى',
        categoryColor: '#059669',
        url: `/forum/topic/${reply.topic_id}#reply-${reply.id}`,
        metadata: {
          isAccepted: reply.is_accepted
        },
        isNew: (reply.created_at || new Date()).getTime() > lastHour.getTime(),
        icon: '💭'
      });
    }

    // تحويل أعضاء الفريق الجدد لأحداث
    for (const member of recentTeamMembers) {
      events.push({
        id: `team-${member.id}`,
        type: EVENT_TYPES.TEAM_MEMBER_JOINED,
        timestamp: member.created_at.toISOString(),
        title: `انضم للفريق: ${member.name}`,
        description: `${member.role} في ${member.department || 'القسم العام'}`,
        category: 'فريق العمل',
        categoryColor: '#F59E0B',
        authorAvatar: member.avatar,
        url: `/team`,
        metadata: {
          department: member.department,
          role: member.role
        },
        isNew: member.created_at.getTime() > lastHour.getTime(),
        icon: '��'
      });
    }

    // تحويل القوالب الجديدة لأحداث
    for (const template of recentTemplates) {
      events.push({
        id: `template-${template.id}`,
        type: EVENT_TYPES.TEMPLATE_CREATED,
        timestamp: template.created_at.toISOString(),
        title: `قالب جديد: ${template.name}`,
        description: template.description || '',
        category: 'النظام',
        categoryColor: '#6B7280',
        url: `/dashboard/templates/${template.id}`,
        metadata: {
          category: template.category
        },
        isNew: template.created_at.getTime() > lastHour.getTime(),
        icon: '📋'
      });
    }

    // تحويل تحديثات الكتل الذكية لأحداث
    for (const block of recentSmartBlocks) {
      events.push({
        id: `smart-block-${block.id}`,
        type: EVENT_TYPES.SMART_BLOCK_UPDATED,
        timestamp: block.updated_at.toISOString(),
        title: `تحديث كتلة ذكية: ${block.name}`,
        description: 'تم تحديث محتوى الكتلة الذكية',
        category: 'النظام',
        categoryColor: '#6B7280',
        url: '/',
        metadata: {
          type: block.type
        },
        isNew: block.updated_at.getTime() > lastHour.getTime(),
        icon: '��'
      });
    }

    // تحويل الكلمات المفتاحية الرائجة لأحداث
    for (const keyword of recentKeywords) {
      events.push({
        id: `keyword-${keyword.id}`,
        type: EVENT_TYPES.KEYWORD_TRENDING,
        timestamp: keyword.created_at.toISOString(),
        title: `كلمة رائجة: ${keyword.name}`,
        description: `تم استخدامها ${keyword.count} مرة`,
        category: 'إحصائيات',
        categoryColor: '#7C3AED',
        url: `/search?q=${encodeURIComponent(keyword.name)}`,
        metadata: {
          count: keyword.count
        },
        isNew: keyword.created_at.getTime() > lastHour.getTime(),
        icon: '🔥'
      });
    }

    // تحويل المستخدمين المعتمدين لأحداث
    for (const user of recentVerifiedUsers) {
      if (user.role !== 'AUTHOR') { // تجنب التكرار مع المؤلفين
        events.push({
          id: `verified-${user.id}`,
          type: EVENT_TYPES.USER_VERIFIED,
          timestamp: user.updated_at.toISOString(),
          title: `مستخدم معتمد: ${user.name}`,
          description: 'تم التحقق من الحساب',
          category: 'المستخدمون',
          categoryColor: '#10B981',
          authorAvatar: user.avatar,
          url: `/profile/${user.id}`,
          metadata: {
            role: user.role
          },
          isNew: user.updated_at.getTime() > lastHour.getTime(),
          icon: '✅'
        });
      }
    }

    // تحويل إنجازات نقاط الولاء لأحداث
    const loyaltyUserIds = [...new Set(recentLoyaltyPoints.map((l: any) => l.user_id).filter(Boolean))];
    const loyaltyUsersMap = new Map();
    if (loyaltyUserIds.length > 0) {
      const loyaltyUsers = await prisma.users.findMany({
        where: { id: { in: loyaltyUserIds } },
        select: { id: true, name: true, avatar: true }
      });
      loyaltyUsers.forEach((user: any) => {
        loyaltyUsersMap.set(user.id, user);
      });
    }

    for (const loyaltyPoint of recentLoyaltyPoints) {
      const user = loyaltyUsersMap.get(loyaltyPoint.user_id);
      events.push({
        id: `loyalty-${loyaltyPoint.id}`,
        type: EVENT_TYPES.LOYALTY_ACHIEVEMENT,
        timestamp: loyaltyPoint.created_at.toISOString(),
        title: `إنجاز: ${user?.name || 'مستخدم'}`,
        description: `حصل على ${loyaltyPoint.points} نقطة - ${loyaltyPoint.action}`,
        category: 'الولاء',
        categoryColor: '#F59E0B',
        authorAvatar: user?.avatar,
        url: `/profile/${loyaltyPoint.user_id}`,
        metadata: {
          points: loyaltyPoint.points,
          action: loyaltyPoint.action
        },
        isNew: loyaltyPoint.created_at.getTime() > lastHour.getTime(),
        icon: '🏆'
      });
    }

    // إضافة الأحداث المخزنة من جدول timeline_events
    for (const storedEvent of storedEvents) {
      events.push({
        id: storedEvent.id,
        type: storedEvent.event_type,
        timestamp: storedEvent.created_at.toISOString(),
        title: storedEvent.title,
        description: storedEvent.description || '',
        category: storedEvent.category_name || 'عام',
        categoryColor: storedEvent.category_color || '#6B7280',
        author: storedEvent.author_name,
        authorAvatar: storedEvent.author_avatar,
        url: storedEvent.url,
        metadata: storedEvent.metadata || {},
        isNew: storedEvent.created_at.getTime() > lastHour.getTime(),
        icon: storedEvent.icon || '📍',
        isImportant: storedEvent.is_important
      });
    }

    // ترتيب الأحداث حسب الوقت
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // تطبيق الفلترة
    let filteredEvents = events;
    if (filter !== 'all') {
      filteredEvents = events.filter(event => {
        switch (filter) {
          case 'articles':
            return [EVENT_TYPES.ARTICLE_PUBLISHED, EVENT_TYPES.ARTICLE_UPDATED, EVENT_TYPES.ARTICLE_FEATURED, EVENT_TYPES.ARTICLE_BREAKING].includes(event.type);
          case 'analysis':
            return event.type === EVENT_TYPES.ANALYSIS_COMPLETED;
          case 'comments':
            return event.type === EVENT_TYPES.COMMENT_ADDED;
          case 'system':
            return [EVENT_TYPES.CATEGORY_CREATED, EVENT_TYPES.SYSTEM_UPDATE].includes(event.type);
          case 'community':
            return [EVENT_TYPES.USER_MILESTONE, EVENT_TYPES.AUTHOR_JOINED].includes(event.type);
          default:
            return true;
        }
      });
    }

    // تطبيق pagination
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);

    // إحصائيات مبسطة (بدون استعلامات إضافية إلا في أول مرة)
    let stats = {
      total: events.length,
      totalEvents: filteredEvents.length,
      todayEvents: events.filter(e => {
        const eventDate = new Date(e.timestamp);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
      }).length,
      activeUsers: 0,
      newEvents: events.filter(e => e.isNew).length,
      totalArticles: 0,
      todayArticles: 0,
      totalComments: 0,
      totalViews: 0,
      byType: {
        articles: events.filter(e => [EVENT_TYPES.ARTICLE_PUBLISHED, EVENT_TYPES.ARTICLE_FEATURED, EVENT_TYPES.ARTICLE_BREAKING].includes(e.type)).length,
        analyses: events.filter(e => e.type === EVENT_TYPES.ANALYSIS_COMPLETED).length,
        comments: events.filter(e => e.type === EVENT_TYPES.COMMENT_ADDED).length,
        system: events.filter(e => [EVENT_TYPES.CATEGORY_CREATED, EVENT_TYPES.SYSTEM_UPDATE].includes(e.type)).length,
        community: events.filter(e => [EVENT_TYPES.USER_MILESTONE, EVENT_TYPES.AUTHOR_JOINED].includes(e.type)).length
      }
    };

    // جلب الإحصائيات الكاملة فقط في الطلب الأول (offset = 0)
    if (offset === 0) {
      const [
        totalArticles,
        todayArticles,
        totalComments,
        activeUsersCount,
        totalViews
      ] = await Promise.all([
        prisma.articles.count({ where: { status: 'published' } }),
        prisma.articles.count({ 
          where: { 
            status: 'published',
            published_at: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
          } 
        }),
        prisma.comments.count({ where: { status: 'approved' } }),
        prisma.users.count({ 
          where: { 
            OR: [
              { is_verified: true },
              { role: { not: 'USER' } }
            ]
          } 
        }),
        prisma.articles.aggregate({
          _sum: { views: true },
          where: { status: 'published' }
        })
      ]);

      stats = {
        ...stats,
        activeUsers: activeUsersCount,
        totalArticles,
        todayArticles,
        totalComments,
        totalViews: totalViews._sum.views || 0
      };
    }

    // تنسيق البيانات للعرض
    const formattedEvents = paginatedEvents.map(event => {
      const date = new Date(event.timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      let timeAgo;
      if (diffInMinutes < 1) {
        timeAgo = 'الآن';
      } else if (diffInMinutes < 60) {
        timeAgo = `منذ ${diffInMinutes} دقيقة`;
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        timeAgo = hours === 1 ? 'منذ ساعة' : hours === 2 ? 'منذ ساعتين' : `منذ ${hours} ساعات`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        timeAgo = days === 1 ? 'منذ يوم' : days === 2 ? 'منذ يومين' : `منذ ${days} أيام`;
      }

      return {
        ...event,
        timestamp: date.toLocaleTimeString('ar-SA', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        date: date.toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          calendar: 'gregory',
          numberingSystem: 'latn'
        }),
        timeAgo,
        // تحديد نوع العرض للواجهة
        displayType: getDisplayType(event.type),
        // إضافة معلومات التفاعل
        engagement: {
          views: (event.metadata && typeof event.metadata === 'object' && 'views' in event.metadata) ? (event.metadata as any).views : 0,
          likes: (event.metadata && typeof event.metadata === 'object' && 'likes' in event.metadata) ? (event.metadata as any).likes : 0,
          comments: (event.metadata && typeof event.metadata === 'object' && 'comments' in event.metadata) ? (event.metadata as any).comments : 0,
          shares: (event.metadata && typeof event.metadata === 'object' && 'shares' in event.metadata) ? (event.metadata as any).shares : 0
        }
      };
    });

    return NextResponse.json({
      success: true,
      events: formattedEvents,
      stats,
      pagination: {
        total: filteredEvents.length,
        limit,
        offset,
        hasMore: offset + limit < filteredEvents.length
      }
    });

  } catch (error) {
    console.error('Error fetching timeline events:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch timeline events',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// دالة مساعدة لتحديد نوع العرض
function getDisplayType(eventType: string) {
  switch (eventType) {
    case EVENT_TYPES.ARTICLE_PUBLISHED:
    case EVENT_TYPES.ARTICLE_UPDATED:
    case EVENT_TYPES.ARTICLE_FEATURED:
    case EVENT_TYPES.ARTICLE_BREAKING:
      return 'article';
    case EVENT_TYPES.ANALYSIS_COMPLETED:
      return 'analysis';
    case EVENT_TYPES.COMMENT_ADDED:
      return 'comment';
    case EVENT_TYPES.CATEGORY_CREATED:
    case EVENT_TYPES.SYSTEM_UPDATE:
    case EVENT_TYPES.TEMPLATE_CREATED:
    case EVENT_TYPES.SMART_BLOCK_UPDATED:
      return 'system';
    case EVENT_TYPES.USER_MILESTONE:
    case EVENT_TYPES.AUTHOR_JOINED:
    case EVENT_TYPES.TEAM_MEMBER_JOINED:
    case EVENT_TYPES.USER_VERIFIED:
    case EVENT_TYPES.LOYALTY_ACHIEVEMENT:
      return 'community';
    case EVENT_TYPES.DAILY_DOSE_PUBLISHED:
      return 'daily_dose';
    case EVENT_TYPES.FORUM_TOPIC_CREATED:
    case EVENT_TYPES.FORUM_REPLY_ADDED:
      return 'forum';
    case EVENT_TYPES.KEYWORD_TRENDING:
      return 'trending';
    default:
      return 'default';
  }
}

// API لإضافة أحداث مخصصة (للأحداث اليدوية أو أحداث النظام)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      event_type, 
      entity_type,
      entity_id,
      title, 
      description, 
      icon,
      url,
      user_id,
      author_name,
      author_avatar,
      category_name,
      category_color,
      metadata,
      is_important
    } = body;

    // التحقق من الحقول المطلوبة
    if (!event_type || !entity_type || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: event_type, entity_type, title' },
        { status: 400 }
      );
    }

    // إنشاء الحدث في جدول timeline_events
    const newEvent = await prisma.timeline_events.create({
      data: {
        id: crypto.randomUUID(),
        event_type,
        entity_type,
        entity_id,
        title,
        description,
        icon,
        url,
        user_id,
        author_name,
        author_avatar,
        category_name,
        category_color,
        metadata: metadata || {},
        is_important: is_important || false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Event added successfully',
      event: newEvent
    });

  } catch (error) {
    console.error('Error adding event:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add event',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 