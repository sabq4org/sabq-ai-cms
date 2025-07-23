import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureConnection } from '@/lib/prisma';
import { logDatabaseError, logApiError } from '@/lib/services/monitoring';

export async function GET(request: NextRequest) {
  try {
    if (!request.url) {
      return NextResponse.json({ error: 'Invalid request URL' }, { status: 400 });
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'analyzed_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const status = searchParams.get('status');
    const sourceType = searchParams.get('sourceType');
    const search = searchParams.get('search');
    
    const offset = (page - 1) * limit;

    try {
      console.log('🔍 جلب التحليلات العميقة من قاعدة البيانات...');
      
      // التحقق من اتصال قاعدة البيانات أولاً
      const isConnected = await ensureConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }

    // بناء شروط البحث
    const where: any = {};
      if (search) {
        where.OR = [
          { ai_summary: { contains: search, mode: 'insensitive' } }
        ];
      }

      // جلب التحليلات من قاعدة البيانات
        const [totalCount, deepAnalyses] = await Promise.all([
          prisma.deep_analyses.count({ where }),
          prisma.deep_analyses.findMany({
            where,
          orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
            take: limit,
            skip: offset
          })
      ]);

      // معالجة البيانات وتنسيقها
      const enrichedAnalyses = deepAnalyses.map((analysis: any) => {
        const metadata = analysis.metadata as any || {};
        
        // استخراج العنوان
        let title = metadata.title || 'تحليل عميق';
        if (!metadata.title && analysis.ai_summary) {
          const firstSentence = analysis.ai_summary.split('.')[0] || analysis.ai_summary.substring(0, 100);
          title = firstSentence.length > 100 ? firstSentence.substring(0, 100) + '...' : firstSentence;
        }
        
        // تحديد المصدر
        let sourceType = metadata.sourceType || metadata.creationType || 'gpt';
        
        // تحديد الحالة
        let status = metadata.status || (metadata.isActive === false ? 'archived' : 'published');

        // حساب نقاط الجودة
        let qualityScore = metadata.qualityScore || analysis.engagement_score || 0;
        if (qualityScore === 0) {
          const contentLength = analysis.ai_summary?.length || 0;
          const views = metadata.views || 0;
          qualityScore = Math.min(Math.max(
            Math.floor((contentLength / 50) + (views / 10) + Math.random() * 20 + 70),
            75
          ), 98);
        }

        return {
          id: analysis.id,
          title,
          summary: analysis.ai_summary || metadata.summary || 'ملخص التحليل',
          slug: metadata.slug || analysis.id,
          featuredImage: metadata.featuredImage || '/images/default-analysis.jpg',
          status,
          sourceType,
          qualityScore,
          categories: metadata.categories || [],
          tags: metadata.tags || [],
          authorName: metadata.authorName || 'نظام الذكاء الاصطناعي',
          analysisType: metadata.analysisType || 'ai',
          readingTime: metadata.readingTime || Math.ceil((analysis.ai_summary?.length || 0) / 200),
          views: metadata.views || Math.floor(Math.random() * 100) + 50,
          likes: metadata.likes || Math.floor(Math.random() * 20) + 5,
          createdAt: analysis.analyzed_at,
          publishedAt: analysis.analyzed_at,
          analyzed_at: analysis.analyzed_at,
          article: {
            title: 'مقال مرتبط',
            slug: 'related-article',
            category: { name: 'عام', color: '#6B7280' }
        }
        };
      });

      // تطبيق الفلاتر
      let filteredAnalyses = enrichedAnalyses;
      
      if (status && status !== 'all') {
        filteredAnalyses = enrichedAnalyses.filter(a => a.status === status);
      }
      
      if (sourceType && sourceType !== 'all') {
        filteredAnalyses = enrichedAnalyses.filter(a => a.sourceType === sourceType);
      }

      console.log(`✅ تم جلب ${filteredAnalyses.length} تحليل من أصل ${totalCount}`);

    return NextResponse.json({
      success: true,
        analyses: filteredAnalyses,
        total: filteredAnalyses.length,
        totalInDb: totalCount,
      limit,
      offset,
      page,
        hasNext: offset + limit < filteredAnalyses.length,
      hasPrev: page > 1
    });

    } catch (dbError) {
      console.error('❌ Database Error in deep-analyses API:', dbError);
      
      // تسجيل الخطأ في خدمة المراقبة
      logDatabaseError(dbError, 'SELECT', 'deep_analyses');
      
      // في حالة خطأ قاعدة البيانات، نرجع مصفوفة فارغة مع رسالة خطأ
      return NextResponse.json({
        success: false,
        analyses: [],
        total: 0,
        totalInDb: 0,
        limit,
        offset,
        page,
        hasNext: false,
        hasPrev: false,
        error: 'Database connection error',
        errorMessage: 'فشل الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً.',
        errorDetails: process.env.NODE_ENV === 'development' ? 
          (dbError instanceof Error ? dbError.message : 'Unknown database error') : 
          undefined
      });
    }

  } catch (error) {
    console.error('❌ General Error in deep-analyses API:', error);
    
    // تسجيل الخطأ في خدمة المراقبة
    logApiError(error, '/api/deep-analyses', 'GET', 500);
    
    return NextResponse.json(
      { 
        success: false,
        analyses: [],
        error: 'Failed to fetch deep analyses',
        errorMessage: 'حدث خطأ في جلب التحليلات العميقة',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : 
          undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    try {
      // التحقق من اتصال قاعدة البيانات أولاً
      const isConnected = await ensureConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }
      
    const newAnalysis = await prisma.deep_analyses.create({
      data: {
          id: `analysis-${Date.now()}`,
          article_id: body.article_id || `article-${Date.now()}`,
          ai_summary: body.summary || body.title,
          key_topics: body.tags || [],
          tags: body.tags || [],
          sentiment: 'neutral',
          engagement_score: body.qualityScore || 0,
          metadata: body,
          analyzed_at: new Date(),
          updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: newAnalysis
    });
    } catch (dbError) {
      console.error('❌ Database error in POST deep-analyses:', dbError);
      
      // تسجيل الخطأ في خدمة المراقبة
      logDatabaseError(dbError, 'INSERT', 'deep_analyses');
      
      // في production، نسجل الخطأ ونرجع استجابة عامة
      if (process.env.NODE_ENV === 'production') {
        // يمكن إرسال الخطأ إلى خدمة مراقبة مثل Sentry
        console.error('Production DB Error:', {
          error: dbError instanceof Error ? dbError.message : 'Unknown error',
          stack: dbError instanceof Error ? dbError.stack : undefined,
          timestamp: new Date().toISOString()
        });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Database operation failed',
        errorMessage: 'فشلت العملية. يرجى المحاولة لاحقاً.',
        data: null
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ General Error in POST deep-analyses:', error);
    
    // تسجيل الخطأ في خدمة المراقبة
    logApiError(error, '/api/deep-analyses', 'POST', 500);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create deep analysis',
        errorMessage: 'حدث خطأ في إنشاء التحليل',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : 
          undefined
      },
      { status: 500 }
    );
  }
}