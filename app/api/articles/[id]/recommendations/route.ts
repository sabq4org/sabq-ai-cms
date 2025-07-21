import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface SmartRecommendation {
  id: string
  type: 'similar' | 'analysis' | 'opinion' | 'tip' | 'question'
  title: string
  excerpt?: string
  image?: string
  url: string
  badge?: string
  author?: string
  createdAt?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id
    const { category, tags } = await request.json()

    const recommendations: SmartRecommendation[] = []

    // 1. أخبار مشابهة (من نفس التصنيف)
    const similarArticles = await prisma.articles.findMany({
      where: {
        category_id: category,
        id: { not: articleId },
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        featured_image: true,
        slug: true,
        created_at: true
      },
      orderBy: { views: 'desc' },
      take: 3
    })

    similarArticles.forEach(article => {
      recommendations.push({
        id: article.id,
        type: 'similar',
        title: article.title,
        excerpt: article.excerpt || undefined,
        image: article.featured_image || undefined,
        url: `/article/${article.slug}`,
        createdAt: article.created_at.toISOString()
      })
    })

    // 2. تحليل عميق (من جدول deep_analyses)
    const deepAnalysis = await prisma.deep_analyses.findFirst({
      where: {
        ai_summary: { not: null }
      },
      orderBy: { created_at: 'desc' }
    })

    if (deepAnalysis) {
      recommendations.push({
        id: `analysis_${deepAnalysis.id}`,
        type: 'analysis',
        title: 'تحليل ذكي للأحداث الجارية',
        excerpt: deepAnalysis.ai_summary?.slice(0, 150) + '...',
        url: `/analysis/${deepAnalysis.id}`,
        badge: 'ذكاء اصطناعي'
      })
    }

    // 3. مقال رأي (من نفس التصنيف)
    const opinionArticle = await prisma.articles.findFirst({
      where: {
        category_id: category,
        id: { not: articleId },
        status: 'published',
        metadata: {
          path: ['type'],
          equals: 'opinion'
        }
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        featured_image: true,
        slug: true
      },
      orderBy: { created_at: 'desc' }
    })

    if (opinionArticle) {
      recommendations.push({
        id: opinionArticle.id,
        type: 'opinion',
        title: opinionArticle.title,
        excerpt: opinionArticle.excerpt || undefined,
        image: opinionArticle.featured_image || undefined,
        url: `/article/${opinionArticle.slug}`
      })
    }

    // 4. نصيحة ذكية (مولدة تلقائياً)
    const aiTips = [
      {
        title: 'نصيحة اليوم',
        excerpt: 'في عالم الأخبار السريع، خذ وقتك لفهم السياق الكامل قبل تكوين رأيك النهائي.'
      },
      {
        title: 'فكر بعمق',
        excerpt: 'الأخبار الجيدة تطرح أسئلة أكثر مما تقدم إجابات جاهزة. ابحث عن المصادر المتعددة.'
      },
      {
        title: 'ابق متابعاً',
        excerpt: 'القصص الإخبارية تتطور باستمرار. ما تعرفه اليوم قد يتغير غداً.'
      }
    ]

    const randomTip = aiTips[Math.floor(Math.random() * aiTips.length)]
    recommendations.push({
      id: `tip_${Date.now()}`,
      type: 'tip',
      title: randomTip.title,
      excerpt: randomTip.excerpt,
      url: '#'
    })

    // 5. سؤال تفاعلي
    const interactiveQuestions = [
      'ما رأيك في تطور الأحداث الأخيرة؟',
      'هل تعتقد أن هذا القرار سيكون فعالاً؟',
      'كيف ترى تأثير هذا الخبر على المجتمع؟',
      'ما هي توقعاتك للفترة القادمة؟'
    ]

    const randomQuestion = interactiveQuestions[Math.floor(Math.random() * interactiveQuestions.length)]
    recommendations.push({
      id: `question_${Date.now()}`,
      type: 'question',
      title: randomQuestion,
      excerpt: 'شاركنا رأيك وكن جزءاً من الحوار',
      url: '#comments'
    })

    // 6. إضافة المزيد من المقالات الشائعة إذا لم نجد ما يكفي
    if (recommendations.filter(r => r.type === 'similar').length < 2) {
      const popularArticles = await prisma.articles.findMany({
        where: {
          id: { not: articleId },
          status: 'published'
        },
        select: {
          id: true,
          title: true,
          excerpt: true,
          featured_image: true,
          slug: true,
          created_at: true
        },
        orderBy: { views: 'desc' },
        take: 2
      })

      popularArticles.forEach(article => {
        recommendations.push({
          id: article.id,
          type: 'similar',
          title: article.title,
          excerpt: article.excerpt || undefined,
          image: article.featured_image || undefined,
          url: `/article/${article.slug}`,
          createdAt: article.created_at.toISOString()
        })
      })
    }

    // ترتيب التوصيات (تنويع الأنواع)
    const sortedRecommendations = [
      ...recommendations.filter(r => r.type === 'tip').slice(0, 1),
      ...recommendations.filter(r => r.type === 'similar').slice(0, 2),
      ...recommendations.filter(r => r.type === 'analysis').slice(0, 1),
      ...recommendations.filter(r => r.type === 'opinion').slice(0, 1),
      ...recommendations.filter(r => r.type === 'question').slice(0, 1)
    ].slice(0, 6)

    return NextResponse.json({
      recommendations: sortedRecommendations,
      total: sortedRecommendations.length
    })

  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'خطأ في جلب التوصيات' },
      { status: 500 }
    )
  }
}
