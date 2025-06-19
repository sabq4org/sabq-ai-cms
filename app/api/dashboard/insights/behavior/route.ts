import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Interaction {
  user_id: string;
  article_id: string;
  action: string;
  timestamp: string;
  points?: number;
  duration?: number;
}

interface UserPreference {
  user_id: string;
  categories: {
    [key: string]: {
      weight: number;
      last_updated: string;
    }
  }
}

interface LoyaltyPoint {
  user_id: string;
  total_points: number;
  level: string;
  last_activity: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Article {
  id: string;
  title: string;
  category: string;
  category_id: string;
}

async function loadJsonFile(filename: string) {
  try {
    const filePath = path.join(process.cwd(), 'data', filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return filename.includes('array') ? [] : {};
  }
}

export async function GET() {
  try {
    // جلب جميع البيانات المطلوبة
    const [interactions, preferences, loyaltyData, users, articles] = await Promise.all([
      loadJsonFile('user_article_interactions.json'),
      loadJsonFile('user_preferences.json'),
      loadJsonFile('user_loyalty_points.json'),
      loadJsonFile('users.json'),
      loadJsonFile('articles.json')
    ]);

    // تحويل البيانات إلى arrays إذا لزم الأمر
    const interactionsArray = Array.isArray(interactions) ? interactions : 
      (interactions.interactions || []);
    const preferencesArray = Array.isArray(preferences) ? preferences : 
      (preferences.preferences || []);
    const loyaltyArray = Array.isArray(loyaltyData) ? loyaltyData : 
      (loyaltyData.users || []);
    const usersArray = Array.isArray(users) ? users : 
      (users.users || []);
    const articlesArray = Array.isArray(articles) ? articles : 
      (articles.articles || []);

    // حساب التفاعلات خلال آخر 7 أيام
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentInteractions = interactionsArray.filter((interaction: Interaction) => {
      const interactionDate = new Date(interaction.timestamp);
      return interactionDate >= sevenDaysAgo;
    });

    // حساب إحصائيات التفاعل
    const interactionStats = {
      total_reads: 0,
      total_likes: 0,
      total_shares: 0,
      total_comments: 0,
      total_bookmarks: 0
    };

    const userInteractionCounts: { [key: string]: number } = {};
    const categoryInteractionCounts: { [key: string]: number } = {};
    const userPoints: { [key: string]: number } = {};

    recentInteractions.forEach((interaction: Interaction) => {
      // حساب نوع التفاعل
      switch (interaction.action?.toUpperCase()) {
        case 'READ':
        case 'VIEW':
          interactionStats.total_reads++;
          break;
        case 'LIKE':
          interactionStats.total_likes++;
          break;
        case 'SHARE':
          interactionStats.total_shares++;
          break;
        case 'COMMENT':
          interactionStats.total_comments++;
          break;
        case 'BOOKMARK':
          interactionStats.total_bookmarks++;
          break;
      }

      // حساب تفاعلات المستخدمين
      if (interaction.user_id && interaction.user_id !== 'anonymous') {
        userInteractionCounts[interaction.user_id] = (userInteractionCounts[interaction.user_id] || 0) + 1;
        
        // حساب النقاط
        if (interaction.points) {
          userPoints[interaction.user_id] = (userPoints[interaction.user_id] || 0) + interaction.points;
        }
      }

      // حساب تفاعلات التصنيفات
      const article = articlesArray.find((a: Article) => a.id === interaction.article_id);
      if (article && article.category_id) {
        categoryInteractionCounts[article.category_id] = (categoryInteractionCounts[article.category_id] || 0) + 1;
      }
    });

    // ترتيب المستخدمين حسب التفاعل
    const topUserIds = Object.entries(userInteractionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId]) => userId);

    // بناء بيانات المستخدمين النشطين
    const topUsers = topUserIds.map(userId => {
      const user = usersArray.find((u: User) => u.id === userId);
      const loyaltyInfo = loyaltyArray.find((l: LoyaltyPoint) => l.user_id === userId);
      const userPrefs = preferencesArray.find((p: UserPreference) => p.user_id === userId);
      
      // العثور على التصنيف المفضل
      let favoriteCategory = 'غير محدد';
      if (userPrefs && userPrefs.categories) {
        const sortedCategories = Object.entries(userPrefs.categories)
          .sort(([, a]: any, [, b]: any) => b.weight - a.weight);
        if (sortedCategories.length > 0) {
          favoriteCategory = sortedCategories[0][0];
        }
      }

      return {
        id: userId,
        name: user?.name || `مستخدم ${userId}`,
        email: user?.email || '',
        avatar: user?.avatar || '',
        interactions: userInteractionCounts[userId] || 0,
        points: loyaltyInfo?.total_points || userPoints[userId] || 0,
        level: loyaltyInfo?.level || 'مبتدئ',
        favorite_category: favoriteCategory,
        last_activity: loyaltyInfo?.last_activity || new Date().toISOString()
      };
    });

    // ترتيب التصنيفات حسب النشاط
    const topCategories = Object.entries(categoryInteractionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([categoryId, count]) => ({
        id: categoryId,
        name: categoryId,
        interaction_count: count
      }));

    // حساب الإحصائيات العامة
    const totalInteractions = recentInteractions.length;
    const totalPoints = Object.values(userPoints).reduce((sum, points) => sum + points, 0);
    const activeUsers = Object.keys(userInteractionCounts).length;
    const publishedArticles = articlesArray.filter((a: Article) => a.id).length;

    // حساب متوسط التفاعل
    const averageInteractions = activeUsers > 0 ? Math.round(totalInteractions / activeUsers) : 0;

    const response = {
      success: true,
      data: {
        // الإحصائيات العامة
        overview: {
          total_interactions: totalInteractions,
          total_points_awarded: totalPoints,
          active_users: activeUsers,
          average_interactions_per_user: averageInteractions,
          published_articles: publishedArticles
        },
        
        // تفصيل التفاعلات
        interaction_summary: interactionStats,
        
        // المستخدمون النشطون
        top_users: topUsers,
        
        // التصنيفات النشطة
        top_categories: topCategories,
        
        // البيانات الزمنية (آخر 7 أيام)
        time_period: {
          start: sevenDaysAgo.toISOString(),
          end: new Date().toISOString(),
          days: 7
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in behavior insights API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch behavior insights',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 