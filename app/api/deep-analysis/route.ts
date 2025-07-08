import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DeepAnalysis } from '@/types/deep-analysis';

export const runtime = 'nodejs';

// Helper function to convert DB data to DeepAnalysis format
function convertToDeepAnalysis(dbAnalysis: any): DeepAnalysis {
  const metadata = dbAnalysis.metadata as any || {};
  
  return {
    id: dbAnalysis.id,
    title: metadata.title || dbAnalysis.ai_summary || 'تحليل عميق',
    slug: metadata.slug || `analysis-${dbAnalysis.id}`,
    summary: metadata.summary || dbAnalysis.ai_summary || '',
    content: metadata.content || {
      sections: [],
      tableOfContents: [],
      recommendations: [],
      keyInsights: dbAnalysis.key_topics || [],
      dataPoints: []
    },
    rawContent: metadata.rawContent || dbAnalysis.ai_summary || '',
    featuredImage: metadata.featuredImage,
    categories: metadata.categories || [],
    tags: (dbAnalysis.tags as string[]) || [],
    authorName: metadata.authorName || 'محرر سبق',
    sourceType: metadata.sourceType || 'original',
    creationType: metadata.creationType || 'gpt',
    analysisType: metadata.analysisType || 'ai',
    readingTime: metadata.readingTime || 5,
    qualityScore: dbAnalysis.engagement_score || 0,
    contentScore: metadata.contentScore || {
      overall: dbAnalysis.engagement_score || 0,
      contentLength: dbAnalysis.ai_summary?.length || 0,
      hasSections: false,
      hasData: false,
      hasRecommendations: false,
      readability: parseFloat(dbAnalysis.readability_score?.toString() || '0'),
      uniqueness: 0.8
    },
    status: metadata.status || 'published',
    isActive: metadata.isActive !== false,
    isFeatured: metadata.isFeatured || false,
    displayPosition: metadata.displayPosition || 'middle',
    views: metadata.views || 0,
    likes: metadata.likes || 0,
    shares: metadata.shares || 0,
    saves: metadata.saves || 0,
    commentsCount: metadata.commentsCount || 0,
    avgReadTime: metadata.avgReadTime || 0,
    createdAt: metadata.createdAt || dbAnalysis.analyzed_at.toISOString(),
    updatedAt: metadata.updatedAt || dbAnalysis.updated_at.toISOString(),
    publishedAt: metadata.publishedAt || dbAnalysis.analyzed_at.toISOString(),
    metadata: metadata.metadata || {}
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'published';
    const featured = searchParams.get('featured') === 'true';
    
    const skip = (page - 1) * limit;
    
    // بناء شروط البحث
    const where: any = {};
    
    if (status && status !== 'all') {
      where.metadata = {
        path: ['status'],
        equals: status
      };
    }
    
    if (featured) {
      where.metadata = {
        ...where.metadata,
        path: ['isFeatured'],
        equals: true
      };
    }
    
    // جلب التحليلات من قاعدة البيانات
    const [analyses, total] = await Promise.all([
      prisma.deep_analyses.findMany({
        where,
        skip,
        take: limit,
        orderBy: { analyzed_at: 'desc' }
      }),
      prisma.deep_analyses.count({ where })
    ]);
    
    // تحويل البيانات
    const deepAnalyses = analyses.map(convertToDeepAnalysis);
    
    return NextResponse.json({
      success: true,
      data: deepAnalyses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching deep analyses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analyses' },
      { status: 500 }
    );
  }
}

// POST - إنشاء تحليل جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const analysis = await prisma.deep_analyses.create({
      data: {
        id,
        article_id: body.articleId || `article-${id}`,
        ai_summary: body.summary || body.title,
        key_topics: body.tags || [],
        tags: body.tags || [],
        sentiment: 'neutral',
        readability_score: body.contentScore?.readability || 0.7,
        engagement_score: body.qualityScore || 0,
        suggested_headlines: body.content?.recommendations || [],
        related_articles: body.relatedArticles || [],
        metadata: body,
        analyzed_at: new Date(),
        updated_at: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      data: convertToDeepAnalysis(analysis)
    });
    
  } catch (error) {
    console.error('Error creating analysis:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create analysis' },
      { status: 500 }
    );
  }
} 