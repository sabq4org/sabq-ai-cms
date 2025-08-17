import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import dbConnectionManager from '@/lib/db-connection-manager';
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
    const dbAnalysis = await dbConnectionManager.executeWithConnection(
      async () => {
        return await prisma.deep_analyses.findUnique({
          where: { id }
        });
      }
    );
    
    if (dbAnalysis) {
      console.log('📊 بيانات التحليل من DB:', {
        id: dbAnalysis.id,
        ai_summary: dbAnalysis.ai_summary?.substring(0, 100),
        metadata: dbAnalysis.metadata
      });
      
      // استخراج البيانات من metadata إذا كانت موجودة
      const metadata = dbAnalysis.metadata as any || {};
      
      // تحويل البيانات للعرض
      const transformedAnalysis = {
        id: dbAnalysis.id,
        title: metadata.title || 'تحليل عميق',
        slug: metadata.slug || dbAnalysis.id,
        summary: dbAnalysis.ai_summary || metadata.summary || '',
        content: {
          sections: metadata.sections || [],
          tableOfContents: [],
          recommendations: [],
          keyInsights: [],
          dataPoints: []
        },
        rawContent: metadata.content || dbAnalysis.ai_summary || '',
        featuredImage: metadata.featuredImage || null,
        categories: metadata.categories || [],
        tags: dbAnalysis.tags || [],
        authorId: metadata.authorId || null,
        authorName: metadata.authorName || 'فريق التحرير',
        sourceType: metadata.sourceType || 'original',
        creationType: metadata.creationType || 'gpt',
        analysisType: metadata.creationType || 'ai',
        sourceArticleId: metadata.sourceArticleId || null,
        externalLink: metadata.externalLink || null,
        readingTime: metadata.readingTime || 5,
        qualityScore: metadata.qualityScore || 85,
        contentScore: {
          overall: metadata.qualityScore || 85,
          readability: 80,
          relevance: 90,
          depth: 85,
          engagement: 75
        },
        status: 'published',
        isActive: metadata.isActive !== false,
        isFeatured: metadata.isFeatured || false,
        displayPosition: metadata.displayPosition || 'middle',
        views: metadata.views || 0,
        likes: metadata.likes || 0,
        shares: metadata.shares || 0,
        saves: metadata.saves || 0,
        commentsCount: metadata.commentsCount || 0,
        avgReadTime: metadata.readingTime || 5,
        createdAt: dbAnalysis.analyzed_at,
        updatedAt: dbAnalysis.updated_at,
        analyzed_at: dbAnalysis.analyzed_at,
        publishedAt: dbAnalysis.analyzed_at,
        lastGptUpdate: dbAnalysis.updated_at,
        // Include original data for compatibility
        ai_summary: dbAnalysis.ai_summary,
        key_topics: dbAnalysis.key_topics,
        sentiment: dbAnalysis.sentiment,
        engagement_score: dbAnalysis.engagement_score,
        metadata: metadata
      };
      
      return NextResponse.json(transformedAnalysis);
    }
    
    // إذا لم يوجد في قاعدة البيانات، نحاول البحث عن مقال له تحليل
    const articleAnalysis = await dbConnectionManager.executeWithConnection(
      async () => {
        return await prisma.articles.findFirst({
          where: {
            OR: [
              { id },
              { slug: id }
            ]
          }
        });
      }
    );
    
    if (articleAnalysis) {
      // استخراج البيانات من metadata إذا كانت موجودة
      const articleMetadata = articleAnalysis.metadata as any || {};
      
      // إنشاء تحليل من بيانات المقال
      const analysisResponse = {
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
            type: 'text' as const
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
        authorId: null,
        authorName: articleMetadata.author_name || 'محرر سبق',
        sourceType: 'original' as const,
        creationType: 'manual' as const,
        analysisType: 'ai' as const,
        sourceArticleId: null,
        externalLink: null,
        readingTime: Math.ceil((articleAnalysis.content?.length || 0) / 250),
        qualityScore: 75,
        contentScore: {
          overall: 75,
          readability: 80,
          relevance: 85,
          depth: 70,
          engagement: 75
        },
        status: 'published' as const,
        isActive: true,
        isFeatured: false,
        displayPosition: 'middle' as const,
        views: articleAnalysis.views,
        likes: 0,
        shares: 0,
        saves: 0,
        commentsCount: 0,
        avgReadTime: Math.ceil((articleAnalysis.content?.length || 0) / 250),
        createdAt: articleAnalysis.created_at.toISOString(),
        updatedAt: articleAnalysis.updated_at.toISOString(),
        analyzed_at: articleAnalysis.created_at.toISOString(),
        publishedAt: articleAnalysis.published_at?.toISOString() || articleAnalysis.created_at.toISOString(),
        lastGptUpdate: articleAnalysis.updated_at.toISOString(),
        metadata: {}
      };
      
      return NextResponse.json(analysisResponse);
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
    const updated = await dbConnectionManager.executeWithConnection(
      async () => {
        return await prisma.deep_analyses.upsert({
          where: { id },
          create: {
            id,
            article_id: body.article_id || id,
            ai_summary: body.ai_summary || body.summary || body.title,
            key_topics: body.key_topics || body.tags || [],
            tags: body.tags || [],
            sentiment: body.sentiment || 'neutral',
            engagement_score: body.engagement_score || body.qualityScore || 0,
            metadata: body.metadata || body,
            analyzed_at: new Date(),
            updated_at: new Date()
          },
          update: {
            ai_summary: body.ai_summary || body.summary || body.title,
            key_topics: body.key_topics || body.tags || [],
            tags: body.tags || [],
            sentiment: body.sentiment,
            engagement_score: body.engagement_score || body.qualityScore || 0,
            metadata: body.metadata || body,
            updated_at: new Date()
          }
        });
      }
    );
    
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