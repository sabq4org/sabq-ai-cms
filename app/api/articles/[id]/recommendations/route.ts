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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id
    
    const recommendations: SmartRecommendation[] = []

    // 1. أخبار مشابهة
    const similarArticles = await prisma.articles.findMany({
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

    // 2. نصيحة ذكية
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

    // 3. سؤال تفاعلي
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

    // 4. مقال تحليلي (محاكاة)
    recommendations.push({
      id: `analysis_${Date.now()}`,
      type: 'analysis',
      title: 'تحليل ذكي للأحداث الجارية',
      excerpt: 'فهم عميق للأحداث الحالية وتأثيرها على المستقبل...',
      url: `#analysis`,
      badge: 'ذكاء اصطناعي'
    })

    // 5. مقال رأي (محاكاة)
    recommendations.push({
      id: `opinion_${Date.now()}`,
      type: 'opinion',
      title: 'وجهة نظر: قراءة في الأحداث',
      excerpt: 'نظرة تحليلية متعمقة في القضايا المعاصرة...',
      url: '#opinion'
    })

    return NextResponse.json({
      recommendations: recommendations.slice(0, 6),
      total: recommendations.length
    })

  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'خطأ في جلب التوصيات' },
      { status: 500 }
    )
  }
}
