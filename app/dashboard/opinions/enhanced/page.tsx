'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Plus, FileText, Eye, Edit, Trash2, TrendingUp, BookOpen, Clock, 
  Star, Pin, Copy, Calendar, Filter, Search, MoreVertical, 
  Users, MessageCircle, ThumbsUp, Share2, Download, BarChart3,
  CheckCircle, XCircle, AlertCircle, PlusCircle, Settings,
  Volume2, Headphones, PlayCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { useDarkModeContext } from '@/contexts/DarkModeContext'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface OpinionAuthor {
  id: string
  name: string
  avatar?: string
  specialization?: string
  articlesCount?: number
}

interface OpinionArticle {
  id: string
  title: string
  author: OpinionAuthor
  status: 'published' | 'draft' | 'pending_review' | 'scheduled'
  views: number
  likes: number
  comments: number
  shares: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
  scheduledAt?: string
  isFeatured: boolean
  isPinned: boolean
  opinionType: 'short' | 'extended'
  readingTime: number
  tags: string[]
  excerpt: string
  hasAudioSummary: boolean
  audioUrl?: string
  mood?: 'positive' | 'negative' | 'neutral' | 'analytical'
  slug: string
}

const StatsCard = ({ title, value, subtitle, icon: Icon, bgColor, iconColor, darkMode }: any) => (
  <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{title}</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          {subtitle && (
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${bgColor || 'bg-blue-100'}`}>
          <Icon className={`w-6 h-6 ${iconColor || 'text-blue-600'}`} />
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function EnhancedOpinionsPage() {
  const { darkMode } = useDarkModeContext()
  const { toast } = useToast()

  // الحالات الأساسية
  const [articles, setArticles] = useState<OpinionArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  // فلاتر البحث والتصفية
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all')
  const [authorFilter, setAuthorFilter] = useState<'all' | string>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all')
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'views' | 'engagement'>('latest')
  
  // إحصائيات
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    pending: 0,
    scheduled: 0,
    featured: 0,
    pinned: 0,
    totalViews: 0,
    totalEngagement: 0,
    avgReadingTime: 0
  })

  // قائمة الكتاب
  const [authors, setAuthors] = useState<OpinionAuthor[]>([])

  // جلب البيانات
  useEffect(() => {
    fetchArticles()
    fetchAuthors()
  }, [])

  // تحديث الإحصائيات عند تغيير المقالات
  useEffect(() => {
    calculateStats()
  }, [articles])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/articles?type=OPINION&status=all&limit=100&sort=latest')
      const data = await response.json()
      
      if (data.success) {
        // تحويل البيانات للشكل المطلوب
        const transformedArticles: OpinionArticle[] = (data.articles || []).map((article: any) => ({
          id: article.id,
          title: article.title,
          author: {
            id: article.opinion_author?.id || article.author_id || 'unknown',
            name: article.opinion_author?.name || article.author_name || 'غير محدد',
            avatar: article.opinion_author?.avatar,
            specialization: article.opinion_author?.specialization
          },
          status: article.status,
          views: article.views || 0,
          likes: article.likes || 0,
          comments: article._count?.comments || 0,
          shares: article.shares || 0,
          createdAt: article.created_at,
          updatedAt: article.updated_at,
          publishedAt: article.published_at,
          scheduledAt: article.scheduled_at,
          isFeatured: article.metadata?.is_featured || article.featured || false,
          isPinned: article.metadata?.is_pinned || false,
          opinionType: article.metadata?.opinion_type || 'short',
          readingTime: article.reading_time || 5,
          tags: article.metadata?.tags || [],
          excerpt: article.excerpt || '',
          hasAudioSummary: !!article.metadata?.audio_url,
          audioUrl: article.metadata?.audio_url,
          mood: article.metadata?.mood || 'neutral',
          slug: article.slug
        }))
        
        setArticles(transformedArticles)
      } else {
        toast({
          title: 'خطأ في جلب المقالات',
          description: 'حدث خطأ أثناء جلب مقالات الرأي',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
      toast({
        title: 'خطأ في الاتصال',
        description: 'تعذر الاتصال بالخادم',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/opinion-authors?active=true')
      const data = await response.json()
      
      if (data.success) {
        setAuthors(data.authors || [])
      }
    } catch (error) {
      console.error('Error fetching authors:', error)
    }
  }

  const calculateStats = () => {
    const total = articles.length
    const published = articles.filter(a => a.status === 'published').length
    const draft = articles.filter(a => a.status === 'draft').length
    const pending = articles.filter(a => a.status === 'pending_review').length
    const scheduled = articles.filter(a => a.status === 'scheduled').length
    const featured = articles.filter(a => a.isFeatured).length
    const pinned = articles.filter(a => a.isPinned).length
    const totalViews = articles.reduce((sum, a) => sum + a.views, 0)
    const totalEngagement = articles.reduce((sum, a) => sum + a.likes + a.comments + a.shares, 0)
    const avgReadingTime = articles.length > 0 ? articles.reduce((sum, a) => sum + a.readingTime, 0) / articles.length : 0

    setStats({
      total,
      published,
      draft,
      pending,
      scheduled,
      featured,
      pinned,
      totalViews,
      totalEngagement,
      avgReadingTime: Math.round(avgReadingTime)
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return
    
    setDeleting(id)
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast({
          title: 'تم الحذف بنجاح',
          description: 'تم حذف مقال الرأي بنجاح'
        })
        fetchArticles()
      } else {
        toast({
          title: 'خطأ في الحذف',
          description: 'حدث خطأ أثناء حذف المقال',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      toast({
        title: 'خطأ في الاتصال',
        description: 'تعذر الاتصال بالخادم',
        variant: 'destructive'
      })
    } finally {
      setDeleting(null)
    }
  }

  const toggleFeature = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          metadata: { is_featured: !currentStatus }
        })
      })
      
      if (response.ok) {
        toast({
          title: !currentStatus ? 'تم تمييز المقال' : 'تم إلغاء تمييز المقال',
          description: !currentStatus ? 'سيظهر المقال مع شارة خاصة' : 'تم إزالة الشارة الخاصة'
        })
        fetchArticles()
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث المقال',
        variant: 'destructive'
      })
    }
  }

  const togglePin = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          metadata: { is_pinned: !currentStatus }
        })
      })
      
      if (response.ok) {
        toast({
          title: !currentStatus ? 'تم تثبيت المقال' : 'تم إلغاء تثبيت المقال',
          description: !currentStatus ? 'سيظهر المقال أولاً في القائمة' : 'تم إزالة التثبيت'
        })
        fetchArticles()
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث المقال',
        variant: 'destructive'
      })
    }
  }

  const copyArticleLink = (slug: string) => {
    const link = `${window.location.origin}/opinion/${slug}`
    navigator.clipboard.writeText(link)
    toast({
      title: 'تم نسخ الرابط',
      description: 'تم نسخ رابط المقال إلى الحافظة'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      published: { label: 'منشور', variant: 'default' },
      draft: { label: 'مسودة', variant: 'secondary' },
      pending_review: { label: 'قيد المراجعة', variant: 'outline' },
      scheduled: { label: 'مجدول', variant: 'outline' }
    }
    
    const config = variants[status] || variants.draft
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    )
  }

  const getMoodBadge = (mood: string) => {
    const moodConfig: Record<string, { label: string; color: string }> = {
      positive: { label: 'إيجابي', color: 'bg-green-100 text-green-800' },
      negative: { label: 'نقدي', color: 'bg-red-100 text-red-800' },
      neutral: { label: 'محايد', color: 'bg-gray-100 text-gray-800' },
      analytical: { label: 'تحليلي', color: 'bg-blue-100 text-blue-800' }
    }
    
    const config = moodConfig[mood] || moodConfig.neutral
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  // تصفية المقالات
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter
    const matchesAuthor = authorFilter === 'all' || article.author.id === authorFilter
    const matchesType = typeFilter === 'all' || article.opinionType === typeFilter
    
    return matchesSearch && matchesStatus && matchesAuthor && matchesType
  })

  // ترتيب المقالات
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'views':
        return b.views - a.views
      case 'engagement':
        return (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-pulse space-y-6">
          <div className={`h-8 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-24 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
            ))}
          </div>
          <div className={`h-96 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* الرأس */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            إدارة مقالات الرأي
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            إدارة شاملة لمقالات الرأي والتحليلات من قادة الفكر
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Link href="/dashboard/opinions/create">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">مقال رأي جديد</span>
              <span className="sm:hidden">جديد</span>
            </Button>
          </Link>
          
          <Link href="/dashboard/opinion-authors">
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">إدارة الكتاب</span>
            </Button>
          </Link>
          
          <Link href="/dashboard/opinions/analytics">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">التحليلات</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatsCard
          title="إجمالي المقالات"
          value={stats.total}
          subtitle="مقال"
          icon={FileText}
          bgColor={darkMode ? 'bg-blue-900' : 'bg-blue-100'}
          iconColor={darkMode ? 'text-blue-400' : 'text-blue-600'}
          darkMode={darkMode}
        />
        
        <StatsCard
          title="المنشورة"
          value={stats.published}
          subtitle="مقال منشور"
          icon={CheckCircle}
          bgColor={darkMode ? 'bg-green-900' : 'bg-green-100'}
          iconColor={darkMode ? 'text-green-400' : 'text-green-600'}
          darkMode={darkMode}
        />
        
        <StatsCard
          title="المسودات"
          value={stats.draft}
          subtitle="مقال مسودة"
          icon={Edit}
          bgColor={darkMode ? 'bg-yellow-900' : 'bg-yellow-100'}
          iconColor={darkMode ? 'text-yellow-400' : 'text-yellow-600'}
          darkMode={darkMode}
        />
        
        <StatsCard
          title="المميزة"
          value={stats.featured}
          subtitle="مقال مميز"
          icon={Star}
          bgColor={darkMode ? 'bg-purple-900' : 'bg-purple-100'}
          iconColor={darkMode ? 'text-purple-400' : 'text-purple-600'}
          darkMode={darkMode}
        />
        
        <StatsCard
          title="إجمالي المشاهدات"
          value={stats.totalViews.toLocaleString()}
          subtitle="مشاهدة"
          icon={Eye}
          bgColor={darkMode ? 'bg-indigo-900' : 'bg-indigo-100'}
          iconColor={darkMode ? 'text-indigo-400' : 'text-indigo-600'}
          darkMode={darkMode}
        />
        
        <StatsCard
          title="متوسط القراءة"
          value={`${stats.avgReadingTime} دقيقة`}
          subtitle="وقت القراءة"
          icon={Clock}
          bgColor={darkMode ? 'bg-teal-900' : 'bg-teal-100'}
          iconColor={darkMode ? 'text-teal-400' : 'text-teal-600'}
          darkMode={darkMode}
        />
      </div>

      {/* شريط البحث والفلاتر */}
      <Card className={`mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* البحث */}
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <Input
                  placeholder="البحث في المقالات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            
            {/* الفلاتر */}
            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={`w-40 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="published">منشور</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="pending_review">قيد المراجعة</SelectItem>
                  <SelectItem value="scheduled">مجدول</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={authorFilter} onValueChange={setAuthorFilter}>
                <SelectTrigger className={`w-40 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                  <SelectValue placeholder="الكاتب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الكتاب</SelectItem>
                  {authors.map(author => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className={`w-40 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="short">مقالة قصيرة</SelectItem>
                  <SelectItem value="extended">تحليل موسع</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className={`w-40 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                  <SelectValue placeholder="الترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">الأحدث أولاً</SelectItem>
                  <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                  <SelectItem value="views">الأكثر مشاهدة</SelectItem>
                  <SelectItem value="engagement">الأكثر تفاعلاً</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول المقالات */}
      <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
              قائمة المقالات ({sortedArticles.length})
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {sortedArticles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className={`w-16 h-16 mx-auto mb-4 opacity-50 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                لا توجد مقالات رأي
              </p>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchTerm || statusFilter !== 'all' ? 'لا توجد نتائج تطابق فلاترك' : 'ابدأ بإنشاء أول مقال رأي'}
              </p>
              <Link href="/dashboard/opinions/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  إنشاء مقال جديد
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                  <tr>
                    <th className={`text-right py-4 px-6 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      المقال
                    </th>
                    <th className={`text-right py-4 px-6 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      الكاتب
                    </th>
                    <th className={`text-center py-4 px-6 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      الحالة
                    </th>
                    <th className={`text-center py-4 px-6 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      الإحصائيات
                    </th>
                    <th className={`text-center py-4 px-6 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      التاريخ
                    </th>
                    <th className={`text-center py-4 px-6 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedArticles.map((article) => (
                    <tr 
                      key={article.id} 
                      className={`border-b hover:bg-opacity-50 transition-colors duration-150 ${
                        darkMode 
                          ? 'border-gray-700 hover:bg-gray-700' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {/* معلومات المقال */}
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-medium text-sm leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {article.title}
                              </h3>
                              
                              {/* الشارات */}
                              <div className="flex items-center gap-1">
                                {article.isPinned && (
                                  <Pin className="w-3 h-3 text-blue-500" />
                                )}
                                {article.isFeatured && (
                                  <Star className="w-3 h-3 text-yellow-500" />
                                )}
                                {article.hasAudioSummary && (
                                  <Headphones className="w-3 h-3 text-purple-500" />
                                )}
                              </div>
                            </div>
                            
                            {article.excerpt && (
                              <p className={`text-xs leading-relaxed mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {article.excerpt.length > 120 ? `${article.excerpt.substring(0, 120)}...` : article.excerpt}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              {getMoodBadge(article.mood || 'neutral')}
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {article.opinionType === 'short' ? 'مقالة قصيرة' : 'تحليل موسع'}
                              </span>
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {article.readingTime} دقيقة قراءة
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* معلومات الكاتب */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {article.author.avatar && (
                            <Image
                              src={article.author.avatar}
                              alt={article.author.name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {article.author.name}
                            </p>
                            {article.author.specialization && (
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {article.author.specialization}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      {/* الحالة */}
                      <td className="py-4 px-6 text-center">
                        {getStatusBadge(article.status)}
                      </td>
                      
                      {/* الإحصائيات */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <Eye className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                              {article.views.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                              {article.likes}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                              {article.comments}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      {/* التاريخ */}
                      <td className="py-4 px-6 text-center">
                        <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {article.publishedAt ? (
                            <div>
                              <div>نُشر</div>
                              <div>{format(new Date(article.publishedAt), 'dd/MM/yyyy', { locale: ar })}</div>
                            </div>
                          ) : article.scheduledAt ? (
                            <div>
                              <div>مجدول</div>
                              <div>{format(new Date(article.scheduledAt), 'dd/MM/yyyy', { locale: ar })}</div>
                            </div>
                          ) : (
                            <div>
                              <div>أُنشئ</div>
                              <div>{format(new Date(article.createdAt), 'dd/MM/yyyy', { locale: ar })}</div>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* الإجراءات */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/opinion/${article.slug}`} target="_blank">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          
                          <Link href={`/dashboard/opinions/edit/${article.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => toggleFeature(article.id, article.isFeatured)}
                              >
                                <Star className="w-4 h-4 mr-2" />
                                {article.isFeatured ? 'إلغاء التمييز' : 'تمييز المقال'}
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={() => togglePin(article.id, article.isPinned)}
                              >
                                <Pin className="w-4 h-4 mr-2" />
                                {article.isPinned ? 'إلغاء التثبيت' : 'تثبيت المقال'}
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={() => copyArticleLink(article.slug)}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                نسخ الرابط
                              </DropdownMenuItem>
                              
                              {article.hasAudioSummary && (
                                <DropdownMenuItem>
                                  <Volume2 className="w-4 h-4 mr-2" />
                                  تشغيل الملخص الصوتي
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                onClick={() => handleDelete(article.id)}
                                className="text-red-600"
                                disabled={deleting === article.id}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                حذف المقال
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
