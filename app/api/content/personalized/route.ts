import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface UserInteraction {
  user_id: string;
  article_id: string;
  interaction_type: string;
  category_id?: number;
  timestamp: string;
}

interface Article {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  category_id: number;
  author_id?: string;
  author_name?: string;
  featured_image?: string;
  views_count: number;
  status: string;
  published_at?: string;
  created_at: string;
  reading_time?: number;
  seo_keywords?: string;
  is_breaking?: boolean;
}

// دالة لتحميل المقالات
async function loadPersonalizedArticles() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'articles.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.articles || [];
  } catch (error) {
    console.error('Error loading articles:', error);
    return [];
  }
}

// دالة لتحميل التفاعلات
async function loadUserInteractions() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'user_article_interactions.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.interactions || [];
  } catch (error) {
    console.error('Error loading interactions:', error);
    return [];
  }
}

// دالة لتحميل تفضيلات المستخدم
async function loadUserPreferencesById(userId: string) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'user_preferences.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    const userPref = data.preferences?.find((p: any) => p.user_id === userId);
    return userPref || null;
  } catch (error) {
    console.error('Error loading user preferences:', error);
    return null;
  }
}

// دالة لحساب نقاط الثقة للمقال بناءً على تفضيلات المستخدم
function calculateArticleScore(article: any, userPreferences: any, interactions: any[]) {
  let score = 0;
  
  // نقاط بناءً على التصنيف المفضل
  if (userPreferences?.preferred_categories?.includes(article.category_id)) {
    score += 10;
  }
  
  // نقاط بناءً على الكلمات المفتاحية
  const articleKeywords = article.seo_keywords || [];
  const preferredKeywords = userPreferences?.preferred_keywords || [];
  const matchingKeywords = articleKeywords.filter((k: string) => 
    preferredKeywords.some((pk: string) => k.includes(pk) || pk.includes(k))
  );
  score += matchingKeywords.length * 5;
  
  // نقاط بناءً على التفاعلات السابقة
  const articleInteractions = interactions.filter(i => i.article_id === article.id);
  score += articleInteractions.length * 2;
  
  // نقاط بناءً على الحداثة
  const articleDate = new Date(article.published_at || article.created_at);
  const daysSincePublished = (Date.now() - articleDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePublished < 1) score += 8;
  else if (daysSincePublished < 3) score += 5;
  else if (daysSincePublished < 7) score += 2;
  
  // نقاط بناءً على الشعبية
  score += Math.min(article.views_count / 100, 10);
  
  return score;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id') || 'test-user';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // تحميل البيانات
    const [articles, interactions, userPreferences] = await Promise.all([
      loadPersonalizedArticles(),
      loadUserInteractions(),
      loadUserPreferencesById(userId)
    ]);
    
    // فلترة المقالات المنشورة فقط
    const publishedArticles = articles.filter((article: any) => 
      article.status === 'published' && !article.is_deleted
    );
    
    // حساب النقاط لكل مقال
    const scoredArticles = publishedArticles.map((article: any) => ({
      ...article,
      score: calculateArticleScore(article, userPreferences, interactions)
    }));
    
    // ترتيب المقالات حسب النقاط
    scoredArticles.sort((a: any, b: any) => b.score - a.score);
    
    // أخذ أفضل المقالات
    const personalizedArticles = scoredArticles.slice(0, limit);
    
    // تجهيز البيانات للعرض
    const formattedArticles = personalizedArticles.map((article: any) => {
      // حساب عدد التفاعلات الحقيقية
      const articleInteractions = interactions.filter((i: any) => i.article_id === article.id);
      const likes = articleInteractions.filter((i: any) => i.interaction_type === 'like').length;
      const shares = articleInteractions.filter((i: any) => i.interaction_type === 'share').length;
      const comments = articleInteractions.filter((i: any) => i.interaction_type === 'comment').length;
      
      return {
        id: article.id,
        title: article.title,
        summary: article.summary,
        content: article.content,
        category_id: article.category_id,
        author_name: article.author_name || 'فريق التحرير',
        featured_image: article.featured_image,
        published_at: article.published_at || article.created_at,
        reading_time: article.reading_time || Math.ceil((article.content?.length || 0) / 200),
        views_count: article.views_count || 0,
        likes_count: likes,
        shares_count: shares,
        comments_count: comments,
        interaction_count: articleInteractions.length,
        tags: article.seo_keywords || [],
        score: article.score,
        confidence: Math.min(article.score / 50 * 100, 100), // نسبة الثقة كنسبة مئوية
        is_personalized: article.score > 20 // علامة للمقالات المخصصة بشكل عالي
      };
    });
    
    return NextResponse.json({
      success: true,
      data: {
        articles: formattedArticles,
        user_id: userId,
        generated_at: new Date().toISOString(),
        preferences_applied: !!userPreferences,
        total_articles: publishedArticles.length,
        personalized_count: formattedArticles.filter((a: any) => a.is_personalized).length
      }
    });
    
  } catch (error) {
    console.error('Error in personalized content API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch personalized content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 