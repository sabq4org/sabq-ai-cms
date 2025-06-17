import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface UserPreference {
  user_id: string;
  preferences: Record<string, number>;
  last_updated: string;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  is_breaking_news: boolean;
  ai_generated: boolean;
  views?: number;
  likes?: number;
  shares?: number;
}

interface UserInteraction {
  id: string;
  user_id: string;
  article_id: string;
  action: string;
  duration?: number;
  timestamp: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'all'; // all, breaking, recommended, read-later

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // جلب تفضيلات المستخدم
    const preferencesPath = path.join(process.cwd(), 'data', 'user_preferences.json');
    let userPreferences: Record<string, number> = {};
    
    try {
      const prefsData = await fs.readFile(preferencesPath, 'utf8');
      const preferences: UserPreference[] = JSON.parse(prefsData);
      const userPref = preferences.find(p => p.user_id === userId);
      if (userPref) {
        userPreferences = userPref.preferences;
      }
    } catch (error) {
      // لا توجد تفضيلات بعد
    }

    // جلب المقالات
    const articlesPath = path.join(process.cwd(), 'data', 'articles.json');
    const articlesData = await fs.readFile(articlesPath, 'utf8');
    const allArticles: Article[] = JSON.parse(articlesData);

    // فلترة المقالات المنشورة فقط
    let articles = allArticles.filter(article => article.status === 'published');

    // جلب التفاعلات السابقة
    const interactionsPath = path.join(process.cwd(), 'data', 'user_article_interactions.json');
    let userInteractions: UserInteraction[] = [];
    
    try {
      const interactionsData = await fs.readFile(interactionsPath, 'utf8');
      const allInteractions: UserInteraction[] = JSON.parse(interactionsData);
      userInteractions = allInteractions.filter(i => i.user_id === userId);
    } catch (error) {
      // لا توجد تفاعلات بعد
    }

    // تحديد نوع المحتوى المطلوب
    switch (type) {
      case 'breaking':
        // الأخبار العاجلة من التصنيفات المفضلة
        articles = articles.filter(article => {
          const isBreaking = article.is_breaking_news;
          const isPreferredCategory = userPreferences[article.category_id] > 0;
          return isBreaking && (Object.keys(userPreferences).length === 0 || isPreferredCategory);
        });
        break;

      case 'read-later':
        // المقالات التي تفاعل معها جزئياً (قرأ أقل من 30 ثانية)
        const partiallyReadArticleIds = userInteractions
          .filter(i => i.action === 'read' && i.duration && i.duration < 30)
          .map(i => i.article_id);
        articles = articles.filter(article => partiallyReadArticleIds.includes(article.id));
        break;

      case 'recommended':
        // توصيات بناءً على الاهتمامات
        articles = articles.filter(article => {
          const weight = userPreferences[article.category_id] || 0;
          return weight > 2; // التصنيفات ذات الوزن المرتفع
        });
        break;

      default:
        // جميع المقالات مرتبة حسب التفضيلات
    }

    // حساب نقاط الأولوية لكل مقال
    const articlesWithScore = articles.map(article => {
      let score = 0;
      
      // 1. وزن التصنيف
      const categoryWeight = userPreferences[article.category_id] || 0;
      score += categoryWeight * 10;
      
      // 2. حداثة المقال (كلما كان أحدث كلما زادت النقاط)
      const articleAge = Date.now() - new Date(article.created_at).getTime();
      const ageInHours = articleAge / (1000 * 60 * 60);
      if (ageInHours < 1) score += 20;
      else if (ageInHours < 6) score += 15;
      else if (ageInHours < 24) score += 10;
      else if (ageInHours < 48) score += 5;
      
      // 3. التفاعل السابق
      const previousInteraction = userInteractions.find(i => i.article_id === article.id);
      if (previousInteraction) {
        if (previousInteraction.action === 'like') score += 5;
        if (previousInteraction.action === 'share') score += 7;
        if (previousInteraction.action === 'comment') score += 10;
      }
      
      // 4. الأخبار العاجلة
      if (article.is_breaking_news) score += 25;
      
      // 5. شعبية المقال
      const popularity = (article.views || 0) + (article.likes || 0) * 2 + (article.shares || 0) * 3;
      score += Math.min(popularity / 100, 10); // حد أقصى 10 نقاط للشعبية
      
      return { ...article, score };
    });

    // ترتيب المقالات حسب النقاط
    articlesWithScore.sort((a, b) => b.score - a.score);

    // أخذ العدد المطلوب
    const personalizedArticles = articlesWithScore.slice(0, limit);

    // تحديد وقت الجرعة (صباح، ظهر، مساء)
    const hour = new Date().getHours();
    let dose = 'morning';
    if (hour >= 12 && hour < 17) dose = 'afternoon';
    else if (hour >= 17) dose = 'evening';

    // جلب التصنيفات للمعلومات الإضافية
    const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');
    let categories: any[] = [];
    try {
      const categoriesData = await fs.readFile(categoriesPath, 'utf8');
      categories = JSON.parse(categoriesData);
    } catch (error) {
      // لا توجد تصنيفات
    }

    // إضافة معلومات التصنيف لكل مقال
    const enrichedArticles = personalizedArticles.map(article => {
      const category = categories.find(c => c.id === article.category_id);
      return {
        ...article,
        category_name: category?.name || 'غير مصنف',
        category_icon: category?.icon || '📄'
      };
    });

    return NextResponse.json({
      success: true,
      user_id: userId,
      dose,
      preferences_count: Object.keys(userPreferences).length,
      articles: enrichedArticles,
      metadata: {
        total_available: articles.length,
        returned: enrichedArticles.length,
        personalization_active: Object.keys(userPreferences).length > 0
      }
    });

  } catch (error) {
    console.error('Error fetching personalized content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personalized content' },
      { status: 500 }
    );
  }
} 