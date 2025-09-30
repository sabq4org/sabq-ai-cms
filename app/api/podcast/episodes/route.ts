import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// نوع بيانات حلقة البودكاست
interface PodcastEpisode {
  id: string;
  title: string;
  description: string | null;
  audioUrl: string;
  duration: number;
  publishedAt: Date | null;
  category: string | null;
  playCount: number;
  voiceName: string | null;
  isNew?: boolean;
  status: string;
  isFeatured: boolean;
  likeCount: number;
  shareCount: number;
  downloadCount: number;
}

// دالة مساعدة لتحويل تاريخ النشر إلى isNew
function isEpisodeNew(publishedAt: Date | null): boolean {
  if (!publishedAt) return false;
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return publishedAt > oneDayAgo;
}

// بيانات تجريبية محسنة للحلقات
const mockEpisodes: PodcastEpisode[] = [
  {
    id: '1',
    title: 'تحليل عميق: تطورات السوق السعودي وتأثير رؤية 2030',
    description: 'نظرة شاملة على التطورات الاقتصادية الأخيرة في المملكة وكيفية تأثير رؤية 2030 على مختلف القطاعات الاستثمارية والنمو المستقبلي.',
    audioUrl: '/audio/podcast/episode-1.mp3',
    duration: 300,
    publishedAt: new Date(),
    category: 'الاقتصاد',
    playCount: 1250,
    likeCount: 45,
    shareCount: 23,
    downloadCount: 89,
    voiceName: 'آلاء الذكية',
    isNew: true,
    status: 'PUBLISHED',
    isFeatured: true
  },
  {
    id: '2',
    title: 'الذكاء الاصطناعي في التعليم: نقلة نوعية في التعلم',
    description: 'كيف يغير الذكاء الاصطناعي مستقبل التعليم من خلال التعلم المخصص والتقييم الذكي وتحسين تجربة الطلاب.',
    audioUrl: '/audio/podcast/episode-2.mp3',
    duration: 280,
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    category: 'التكنولوجيا',
    playCount: 980,
    likeCount: 38,
    shareCount: 15,
    downloadCount: 67,
    voiceName: 'أحمد التقني',
    status: 'PUBLISHED',
    isFeatured: false
  },
  {
    id: '3',
    title: 'مستقبل الطاقة المتجددة في المنطقة',
    description: 'استكشاف الفرص والتحديات في قطاع الطاقة المتجددة وكيفية تحول المنطقة نحو الاستدامة البيئية.',
    audioUrl: '/audio/podcast/episode-3.mp3',
    duration: 310,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    category: 'تحليلات',
    playCount: 750,
    likeCount: 29,
    shareCount: 12,
    downloadCount: 45,
    voiceName: 'سارة البيئية',
    status: 'PUBLISHED',
    isFeatured: false
  },
  {
    id: '4',
    title: 'تقنيات البلوك تشين وتطبيقاتها في الحكومة الرقمية',
    description: 'دور البلوك تشين في تطوير الخدمات الحكومية الرقمية وتحسين الشفافية والأمان.',
    audioUrl: '/audio/podcast/episode-4.mp3',
    duration: 295,
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    category: 'التكنولوجيا',
    playCount: 650,
    likeCount: 22,
    shareCount: 8,
    downloadCount: 34,
    voiceName: 'محمد الرقمي',
    status: 'PUBLISHED',
    isFeatured: false
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const featured = searchParams.get('featured') === 'true';
    const mainPage = searchParams.get('mainPage') === 'true';
    const search = searchParams.get('search');

    let filteredEpisodes = [...mockEpisodes];

    // تصفية حسب الفئة
    if (category && category !== 'all') {
      filteredEpisodes = filteredEpisodes.filter(episode => 
        episode.category === category
      );
    }

    // تصفية المميزة فقط
    if (featured) {
      filteredEpisodes = filteredEpisodes.filter(episode => episode.isFeatured);
    }

    // تصفية للصفحة الرئيسية
    if (mainPage) {
      filteredEpisodes = filteredEpisodes.slice(0, 3);
    }

    // البحث في العنوان والوصف
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEpisodes = filteredEpisodes.filter(episode =>
        episode.title.toLowerCase().includes(searchLower) ||
        episode.description?.toLowerCase().includes(searchLower)
      );
    }

    // ترتيب بالمميز أولاً ثم بالتاريخ
    filteredEpisodes.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) {
        return a.isFeatured ? -1 : 1;
      }
      return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
    });

    // ترقيم الصفحات
    const startIndex = (page - 1) * limit;
    const paginatedEpisodes = filteredEpisodes.slice(startIndex, startIndex + limit);

    // تحديث خاصية isNew
    const formattedEpisodes = paginatedEpisodes.map(episode => ({
      ...episode,
      isNew: isEpisodeNew(episode.publishedAt),
      publishedAt: episode.publishedAt?.toISOString()
    }));

    return NextResponse.json({
      episodes: formattedEpisodes,
      pagination: {
        page,
        limit,
        total: filteredEpisodes.length,
        totalPages: Math.ceil(filteredEpisodes.length / limit)
      }
    });

    /* 
    // في المستقبل عند استخدام Prisma:
    
    const whereConditions: any = {
      status: 'PUBLISHED'
    };

    if (category && category !== 'all') {
      whereConditions.category = category;
    }

    if (featured) {
      whereConditions.isFeatured = true;
    }

    if (mainPage) {
      whereConditions.isMainPage = true;
    }

    if (search) {
      whereConditions.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [episodes, totalCount] = await Promise.all([
      prisma.podcastEpisode.findMany({
        where: whereConditions,
        orderBy: [
          { isFeatured: 'desc' },
          { publishedAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          categoryRelation: {
            select: {
              nameAr: true,
              color: true,
              icon: true
            }
          }
        }
      }),
      prisma.podcastEpisode.count({ where: whereConditions })
    ]);
    */

  } catch (error) {
    console.error('خطأ في جلب حلقات البودكاست:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب البيانات' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { episodeId, action, userId, playPosition, playDuration } = body;

    if (!episodeId) {
      return NextResponse.json(
        { error: 'معرف الحلقة مطلوب' },
        { status: 400 }
      );
    }

    // العثور على الحلقة في البيانات التجريبية
    const episodeIndex = mockEpisodes.findIndex(ep => ep.id === episodeId);
    if (episodeIndex === -1) {
      return NextResponse.json(
        { error: 'الحلقة غير موجودة' },
        { status: 404 }
      );
    }

    // تحديث الإحصائيات حسب نوع العمل
    switch (action) {
      case 'play':
        mockEpisodes[episodeIndex].playCount += 1;
        break;
      case 'like':
        mockEpisodes[episodeIndex].likeCount += 1;
        break;
      case 'share':
        mockEpisodes[episodeIndex].shareCount += 1;
        break;
      case 'download':
        mockEpisodes[episodeIndex].downloadCount += 1;
        break;
    }

    /* 
    // في المستقبل عند استخدام Prisma:
    
    // التحقق من وجود الحلقة
    const episode = await prisma.podcastEpisode.findUnique({
      where: { id: episodeId }
    });

    if (!episode) {
      return NextResponse.json(
        { error: 'الحلقة غير موجودة' },
        { status: 404 }
      );
    }

    // تسجيل التفاعل
    const interactionData: any = {
      episodeId,
      interactionType: action.toUpperCase(),
      userId: userId || null,
      playPosition: playPosition || 0,
      playDuration: playDuration || 0,
      sessionId: request.headers.get('x-session-id'),
      deviceType: request.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop',
      userAgent: request.headers.get('user-agent')
    };

    if (action === 'play' && playDuration && episode.duration > 0) {
      interactionData.completionRate = Math.min((playDuration / episode.duration) * 100, 100);
    }

    await prisma.podcastInteraction.create({
      data: interactionData
    });

    // تحديث الإحصائيات
    const updateData: any = {};
    switch (action) {
      case 'play':
        updateData.playCount = { increment: 1 };
        break;
      case 'like':
        updateData.likeCount = { increment: 1 };
        break;
      case 'share':
        updateData.shareCount = { increment: 1 };
        break;
      case 'download':
        updateData.downloadCount = { increment: 1 };
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.podcastEpisode.update({
        where: { id: episodeId },
        data: updateData
      });
    }
    */

    return NextResponse.json({
      success: true,
      episode: mockEpisodes[episodeIndex],
      message: `تم ${action} بنجاح`
    });

  } catch (error) {
    console.error('خطأ في تحديث بيانات البودكاست:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في التحديث' },
      { status: 500 }
    );
  }
}
