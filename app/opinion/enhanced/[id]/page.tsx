'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Calendar, Clock, Eye, Heart, MessageCircle, Share2, 
  Bookmark, ThumbsUp, ThumbsDown, Volume2, Play, Pause,
  User, ChevronRight, Tag, TrendingUp, BarChart3,
  Quote, Lightbulb, CheckCircle, ArrowLeft, ArrowRight,
  Facebook, Twitter, Linkedin, Copy, Mail
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useDarkModeContext } from '@/contexts/DarkModeContext'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface OpinionAuthor {
  id: string
  name: string
  avatar?: string
  specialization?: string
  bio?: string
  articlesCount?: number
  totalViews?: number
  socialLinks?: {
    twitter?: string
    linkedin?: string
    website?: string
  }
}

interface OpinionArticle {
  id: string
  title: string
  content: string
  excerpt: string
  author: OpinionAuthor
  publishedAt: string
  views: number
  likes: number
  dislikes: number
  comments: number
  shares: number
  saves: number
  readingTime: number
  tags: string[]
  mood: 'positive' | 'negative' | 'neutral' | 'analytical'
  opinionType: 'short' | 'extended'
  isFeatured: boolean
  isPinned: boolean
  hasAudioSummary: boolean
  audioUrl?: string
  slug: string
  aiSummary?: string
  keyPoints?: string[]
  relatedArticles?: Array<{
    id: string
    title: string
    author: string
    slug: string
    publishedAt: string
  }>
  interactionData?: {
    userOpinion?: 'agree' | 'disagree' | null
    userSaved?: boolean
    userLiked?: boolean
  }
}

const SocialShareButton = ({ platform, url, title, darkMode }: any) => {
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  }

  const icons = {
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    whatsapp: MessageCircle,
    telegram: Share2
  }

  const colors = {
    facebook: 'bg-blue-600 hover:bg-blue-700',
    twitter: 'bg-sky-500 hover:bg-sky-600',
    linkedin: 'bg-blue-700 hover:bg-blue-800',
    whatsapp: 'bg-green-600 hover:bg-green-700',
    telegram: 'bg-blue-500 hover:bg-blue-600'
  }

  const Icon = icons[platform as keyof typeof icons]

  return (
    <Button
      variant="outline"
      size="sm"
      className={`${colors[platform as keyof typeof colors]} text-white border-0`}
      onClick={() => window.open(shareUrls[platform as keyof typeof shareUrls], '_blank')}
    >
      <Icon className="w-4 h-4" />
    </Button>
  )
}

const ReadingProgress = ({ progress, darkMode }: any) => (
  <div className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
    <Progress value={progress} className="h-1" />
  </div>
)

export default function EnhancedOpinionDetailPage() {
  const params = useParams()
  const { darkMode } = useDarkModeContext()
  const { toast } = useToast()

  const [article, setArticle] = useState<OpinionArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [readingProgress, setReadingProgress] = useState(0)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [userInteraction, setUserInteraction] = useState({
    liked: false,
    saved: false,
    opinion: null as 'agree' | 'disagree' | null
  })

  useEffect(() => {
    if (params.id) {
      fetchArticle()
    }
  }, [params.id])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setReadingProgress(Math.min(progress, 100))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/articles/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        // تحويل البيانات للشكل المطلوب
        const transformedArticle: OpinionArticle = {
          id: data.article.id,
          title: data.article.title,
          content: data.article.content,
          excerpt: data.article.excerpt,
          author: {
            id: data.article.opinion_author?.id || data.article.author_id,
            name: data.article.opinion_author?.name || data.article.author_name || 'غير محدد',
            avatar: data.article.opinion_author?.avatar,
            specialization: data.article.opinion_author?.specialization,
            bio: data.article.opinion_author?.bio,
            articlesCount: data.article.opinion_author?.articles_count,
            totalViews: data.article.opinion_author?.total_views,
            socialLinks: data.article.opinion_author?.social_links
          },
          publishedAt: data.article.published_at || data.article.created_at,
          views: data.article.views || 0,
          likes: data.article.likes || 0,
          dislikes: data.article.dislikes || 0,
          comments: data.article._count?.comments || 0,
          shares: data.article.shares || 0,
          saves: data.article.saves || 0,
          readingTime: data.article.reading_time || 5,
          tags: data.article.metadata?.tags || [],
          mood: data.article.metadata?.mood || 'neutral',
          opinionType: data.article.metadata?.opinion_type || 'short',
          isFeatured: data.article.metadata?.is_featured || false,
          isPinned: data.article.metadata?.is_pinned || false,
          hasAudioSummary: !!data.article.metadata?.audio_url,
          audioUrl: data.article.metadata?.audio_url,
          slug: data.article.slug,
          aiSummary: data.article.metadata?.ai_summary,
          keyPoints: data.article.metadata?.key_points || [],
          relatedArticles: data.relatedArticles || [],
          interactionData: data.userInteractions || {}
        }
        
        setArticle(transformedArticle)
        
        // تحديث عداد المشاهدات
        updateViewCount()
      } else {
        throw new Error('المقال غير موجود')
      }
    } catch (error) {
      console.error('Error fetching article:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المقال',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateViewCount = async () => {
    try {
      await fetch(`/api/articles/${params.id}/view`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error updating view count:', error)
    }
  }

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/articles/${params.id}/like`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setUserInteraction(prev => ({ ...prev, liked: !prev.liked }))
        setArticle(prev => prev ? {
          ...prev,
          likes: prev.likes + (userInteraction.liked ? -1 : 1)
        } : null)
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تسجيل الإعجاب',
        variant: 'destructive'
      })
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/articles/${params.id}/save`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setUserInteraction(prev => ({ ...prev, saved: !prev.saved }))
        toast({
          title: userInteraction.saved ? 'تمت الإزالة' : 'تم الحفظ',
          description: userInteraction.saved ? 'تمت إزالة المقال من المحفوظات' : 'تم حفظ المقال في قائمة القراءة'
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ المقال',
        variant: 'destructive'
      })
    }
  }

  const handleOpinion = async (opinion: 'agree' | 'disagree') => {
    try {
      const response = await fetch(`/api/articles/${params.id}/opinion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opinion })
      })
      
      if (response.ok) {
        setUserInteraction(prev => ({ 
          ...prev, 
          opinion: prev.opinion === opinion ? null : opinion 
        }))
        
        toast({
          title: 'تم تسجيل رأيك',
          description: opinion === 'agree' ? 'تم تسجيل موافقتك على المقال' : 'تم تسجيل عدم موافقتك'
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تسجيل الرأي',
        variant: 'destructive'
      })
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/opinion/${article?.slug}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: url
        })
      } catch (error) {
        console.log('Share failed:', error)
      }
    } else {
      navigator.clipboard.writeText(url)
      toast({
        title: 'تم نسخ الرابط',
        description: 'تم نسخ رابط المقال إلى الحافظة'
      })
    }

    // تحديث عداد المشاركات
    try {
      await fetch(`/api/articles/${params.id}/share`, {
        method: 'POST'
      })
      setArticle(prev => prev ? { ...prev, shares: prev.shares + 1 } : null)
    } catch (error) {
      console.error('Error updating share count:', error)
    }
  }

  const copyLink = () => {
    const url = `${window.location.origin}/opinion/${article?.slug}`
    navigator.clipboard.writeText(url)
    toast({
      title: 'تم نسخ الرابط',
      description: 'تم نسخ رابط المقال إلى الحافظة'
    })
  }

  const getMoodBadge = (mood: string) => {
    const moodConfig: Record<string, { label: string; color: string; icon: any }> = {
      positive: { label: 'إيجابي', color: 'bg-green-100 text-green-800', icon: TrendingUp },
      negative: { label: 'نقدي', color: 'bg-red-100 text-red-800', icon: BarChart3 },
      neutral: { label: 'محايد', color: 'bg-gray-100 text-gray-800', icon: Quote },
      analytical: { label: 'تحليلي', color: 'bg-blue-100 text-blue-800', icon: Lightbulb }
    }
    
    const config = moodConfig[mood] || moodConfig.neutral
    const Icon = config.icon
    
    return (
      <Badge className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className={`h-8 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
            <div className={`h-64 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`h-4 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            المقال غير موجود
          </h1>
          <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            لم يتم العثور على المقال المطلوب
          </p>
          <Link href="/opinion">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة إلى قسم الرأي
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/opinion/${article.slug}`

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ReadingProgress progress={readingProgress} darkMode={darkMode} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* العودة */}
        <div className="mb-6">
          <Link href="/opinion">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة إلى قسم الرأي
            </Button>
          </Link>
        </div>

        {/* رأس المقال */}
        <header className="mb-8">
          {/* الشارات */}
          <div className="flex items-center gap-2 mb-4">
            {getMoodBadge(article.mood)}
            <Badge variant="outline">
              {article.opinionType === 'short' ? 'مقالة قصيرة' : 'تحليل رأي موسع'}
            </Badge>
            {article.isFeatured && (
              <Badge className="bg-yellow-100 text-yellow-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                مميز
              </Badge>
            )}
            {article.isPinned && (
              <Badge className="bg-blue-100 text-blue-800">
                مثبت
              </Badge>
            )}
          </div>

          {/* العنوان */}
          <h1 className={`text-3xl md:text-4xl font-bold leading-tight mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {article.title}
          </h1>

          {/* معلومات الكاتب والمقال */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {article.author.avatar && (
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  width={60}
                  height={60}
                  className="w-15 h-15 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className={`font-medium text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {article.author.name}
                </h3>
                {article.author.specialization && (
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {article.author.specialization}
                  </p>
                )}
                <div className={`flex items-center gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(article.publishedAt), 'dd MMMM yyyy', { locale: ar })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {article.readingTime} دقيقة قراءة
                  </div>
                </div>
              </div>
            </div>

            {/* إحصائيات التفاعل */}
            <div className={`flex items-center gap-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {article.views.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {article.likes}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {article.comments}
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="w-4 h-4" />
                {article.shares}
              </div>
            </div>
          </div>

          {/* أدوات التفاعل */}
          <div className="flex items-center justify-between py-4 border-t border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Button
                variant={userInteraction.liked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                className="flex items-center gap-2"
              >
                <Heart className={`w-4 h-4 ${userInteraction.liked ? 'fill-current' : ''}`} />
                إعجاب
              </Button>

              <Button
                variant={userInteraction.saved ? "default" : "outline"}
                size="sm"
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Bookmark className={`w-4 h-4 ${userInteraction.saved ? 'fill-current' : ''}`} />
                حفظ
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                مشاركة
              </Button>

              {article.hasAudioSummary && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="flex items-center gap-2"
                >
                  {isPlayingAudio ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  استمع للملخص
                </Button>
              )}
            </div>

            {/* مشاركة على الشبكات الاجتماعية */}
            <div className="flex items-center gap-2">
              <SocialShareButton platform="twitter" url={currentUrl} title={article.title} darkMode={darkMode} />
              <SocialShareButton platform="facebook" url={currentUrl} title={article.title} darkMode={darkMode} />
              <SocialShareButton platform="linkedin" url={currentUrl} title={article.title} darkMode={darkMode} />
              <SocialShareButton platform="whatsapp" url={currentUrl} title={article.title} darkMode={darkMode} />
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* المحتوى الرئيسي */}
          <div className="lg:col-span-3 space-y-8">
            {/* الملخص الذكي */}
            {article.aiSummary && (
              <Card className={`${darkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-blue-100' : 'text-blue-800'}`}>
                    <Lightbulb className="w-5 h-5" />
                    الملخص الذكي
                    {article.hasAudioSummary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className={`mr-auto ${darkMode ? 'text-blue-200 hover:text-blue-100' : 'text-blue-700 hover:text-blue-800'}`}
                      >
                        <Volume2 className="w-4 h-4 mr-1" />
                        استمع
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`leading-relaxed ${darkMode ? 'text-blue-100' : 'text-blue-800'}`}>
                    {article.aiSummary}
                  </p>
                  
                  {article.hasAudioSummary && article.audioUrl && (
                    <audio
                      src={article.audioUrl}
                      controls
                      className="w-full mt-4"
                      onPlay={() => setIsPlayingAudio(true)}
                      onPause={() => setIsPlayingAudio(false)}
                      onEnded={() => setIsPlayingAudio(false)}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* النقاط الأساسية */}
            {article.keyPoints && article.keyPoints.length > 0 && (
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    النقاط الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {article.keyPoints.map((point, index) => (
                      <li key={index} className={`flex items-start gap-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* محتوى المقال */}
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-8">
                <div 
                  className={`prose prose-lg max-w-none leading-relaxed ${
                    darkMode 
                      ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-blockquote:text-gray-300 prose-blockquote:border-blue-500' 
                      : 'prose-headings:text-gray-900 prose-p:text-gray-700 prose-blockquote:border-blue-500'
                  }`}
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </CardContent>
            </Card>

            {/* التفاعل مع المقال */}
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  ما رأيك في هذا المقال؟
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    variant={userInteraction.opinion === 'agree' ? "default" : "outline"}
                    onClick={() => handleOpinion('agree')}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    أوافق
                  </Button>
                  
                  <Button
                    variant={userInteraction.opinion === 'disagree' ? "default" : "outline"}
                    onClick={() => handleOpinion('disagree')}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    لا أوافق
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    شارك رأيك
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* الوسوم */}
            {article.tags.length > 0 && (
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Tag className="w-5 h-5" />
                    الوسوم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-blue-100">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            {/* معلومات الكاتب */}
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  عن الكاتب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {article.author.avatar && (
                    <Image
                      src={article.author.avatar}
                      alt={article.author.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                    />
                  )}
                  <h3 className={`font-bold text-lg mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {article.author.name}
                  </h3>
                  {article.author.specialization && (
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {article.author.specialization}
                    </p>
                  )}
                  {article.author.bio && (
                    <p className={`text-sm leading-relaxed mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {article.author.bio}
                    </p>
                  )}
                  
                  {/* إحصائيات الكاتب */}
                  <div className="grid grid-cols-2 gap-4 text-center mb-4">
                    <div>
                      <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {article.author.articlesCount || 0}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        مقال
                      </div>
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {(article.author.totalViews || 0).toLocaleString()}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        مشاهدة
                      </div>
                    </div>
                  </div>

                  {/* روابط التواصل */}
                  {article.author.socialLinks && (
                    <div className="flex justify-center gap-2">
                      {article.author.socialLinks.twitter && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(article.author.socialLinks?.twitter, '_blank')}
                        >
                          <Twitter className="w-4 h-4" />
                        </Button>
                      )}
                      {article.author.socialLinks.linkedin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(article.author.socialLinks?.linkedin, '_blank')}
                        >
                          <Linkedin className="w-4 h-4" />
                        </Button>
                      )}
                      {article.author.socialLinks.website && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(article.author.socialLinks?.website, '_blank')}
                        >
                          <User className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* مقالات ذات صلة */}
            {article.relatedArticles && article.relatedArticles.length > 0 && (
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader>
                  <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                    مقالات ذات صلة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {article.relatedArticles.map((relatedArticle) => (
                      <Link
                        key={relatedArticle.id}
                        href={`/opinion/${relatedArticle.slug}`}
                        className={`block p-3 rounded-lg border transition-colors hover:bg-opacity-50 ${
                          darkMode 
                            ? 'border-gray-600 hover:bg-gray-700' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <h4 className={`font-medium text-sm leading-tight mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {relatedArticle.title}
                        </h4>
                        <div className={`flex items-center justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span>{relatedArticle.author}</span>
                          <span>{format(new Date(relatedArticle.publishedAt), 'dd/MM', { locale: ar })}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* إحصائيات التفاعل */}
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <BarChart3 className="w-5 h-5" />
                  إحصائيات التفاعل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>المشاهدات</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {article.views.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>الإعجابات</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {article.likes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>التعليقات</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {article.comments}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>المشاركات</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {article.shares}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>المحفوظات</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {article.saves}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
