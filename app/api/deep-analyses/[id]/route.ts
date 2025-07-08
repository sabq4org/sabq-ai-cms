import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DeepAnalysis } from '@/types/deep-analysis';

export const runtime = 'nodejs';

// GET - جلب تحليل محدد
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // البحث في جدول deep_analyses أولاً
    const dbAnalysis = await prisma.deep_analyses.findUnique({
      where: { id }
    });
    
    if (dbAnalysis) {
      // استخراج البيانات من metadata إذا كانت موجودة
      const metadata = dbAnalysis.metadata as any || {};
      
      // تحويل البيانات من قاعدة البيانات إلى صيغة DeepAnalysis
      const analysis: DeepAnalysis = {
        id: dbAnalysis.id,
        title: metadata.title || dbAnalysis.ai_summary || 'تحليل عميق',
        slug: metadata.slug || `analysis-${dbAnalysis.id}`,
        summary: metadata.summary || dbAnalysis.ai_summary || '',
        content: metadata.content || {
          sections: [],
          tableOfContents: [],
          recommendations: dbAnalysis.suggested_headlines || [],
          keyInsights: dbAnalysis.key_topics as any || [],
          dataPoints: []
        },
        rawContent: metadata.rawContent || dbAnalysis.ai_summary || '',
        featuredImage: metadata.featuredImage,
        categories: metadata.categories || [],
        tags: (dbAnalysis.tags as string[]) || [],
        authorName: metadata.authorName || 'محرر سبق',
        sourceType: metadata.sourceType || 'original',
        creationType: metadata.creationType || 'gpt' as const,
        analysisType: metadata.analysisType || 'ai',
        readingTime: metadata.readingTime || 5,
        qualityScore: metadata.qualityScore || dbAnalysis.engagement_score || 0,
        contentScore: metadata.contentScore || {
          overall: dbAnalysis.engagement_score || 0,
          contentLength: dbAnalysis.ai_summary?.length || 0,
          hasSections: false,
          hasData: false,
          hasRecommendations: Array.isArray(dbAnalysis.suggested_headlines) && dbAnalysis.suggested_headlines.length > 0,
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
      
      return NextResponse.json(analysis);
    }
    
    // إذا لم يوجد في قاعدة البيانات، نحاول البحث عن مقال له تحليل
    const articleAnalysis = await prisma.articles.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      }
    });
    
    if (articleAnalysis) {
      // استخراج البيانات من metadata إذا كانت موجودة
      const articleMetadata = articleAnalysis.metadata as any || {};
      
      // إنشاء تحليل من بيانات المقال
      const analysis: DeepAnalysis = {
        id: `analysis-${articleAnalysis.id}`,
        title: `تحليل عميق: ${articleAnalysis.title}`,
        slug: `analysis-${articleAnalysis.slug}`,
        summary: articleAnalysis.content?.substring(0, 300) + '...',
        content: {
          sections: [{
            id: 'main',
            title: 'التحليل الرئيسي',
            content: articleAnalysis.content || '',
            order: 1,
            type: 'text'
          }],
          tableOfContents: [],
          recommendations: [],
          keyInsights: [],
          dataPoints: []
        },
        rawContent: articleAnalysis.content || '',
        featuredImage: articleMetadata.image_url,
        categories: articleMetadata.category_name ? [articleMetadata.category_name] : [],
        tags: [],
        authorName: articleMetadata.author_name || 'محرر سبق',
        sourceType: 'original',
        creationType: 'manual' as const,
        analysisType: 'ai',
        readingTime: Math.ceil((articleAnalysis.content?.length || 0) / 250),
        qualityScore: 75,
        contentScore: {
          overall: 75,
          contentLength: articleAnalysis.content?.length || 0,
          hasSections: true,
          hasData: false,
          hasRecommendations: false,
          readability: 0.7,
          uniqueness: 0.8
        },
        status: 'published',
        isActive: true,
        isFeatured: false,
        displayPosition: 'middle',
        views: articleAnalysis.views,
        likes: 0,
        shares: 0,
        saves: 0,
        commentsCount: 0,
        avgReadTime: 0,
        createdAt: articleAnalysis.created_at.toISOString(),
        updatedAt: articleAnalysis.updated_at.toISOString(),
        publishedAt: articleAnalysis.published_at?.toISOString() || articleAnalysis.created_at.toISOString(),
        metadata: {}
      };
      
      return NextResponse.json(analysis);
    }
    
    // إذا لم نجد أي شيء
    return NextResponse.json(
      { error: 'Analysis not found' },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

// PUT - تحديث تحليل
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    // نحاول تحديث في قاعدة البيانات
    const updated = await prisma.deep_analyses.upsert({
      where: { id },
      create: {
        id,
        article_id: id,
        ai_summary: body.summary || body.title,
        key_topics: body.tags || [],
        tags: body.tags || [],
        sentiment: 'neutral',
        engagement_score: body.qualityScore || 0,
        metadata: body,
        updated_at: new Date()
      },
      update: {
        ai_summary: body.summary || body.title,
        key_topics: body.tags || [],
        tags: body.tags || [],
        engagement_score: body.qualityScore || 0,
        metadata: body,
        updated_at: new Date()
      }
    });
    
    return NextResponse.json({ success: true, analysis: updated });
    
  } catch (error) {
    console.error('Error updating analysis:', error);
    return NextResponse.json(
      { error: 'Failed to update analysis' },
      { status: 500 }
    );
  }
}

// PATCH - تحديث جزئي للتحليل
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const updated = await prisma.deep_analyses.update({
      where: { id },
      data: {
        metadata: body,
        updated_at: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      analysis: updated
    });
    
  } catch (error) {
    console.error('Error patching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to patch analysis' },
      { status: 500 }
    );
  }
}

// DELETE - حذف تحليل
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    await prisma.deep_analyses.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    );
  }
} 