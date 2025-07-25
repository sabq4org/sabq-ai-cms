'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Save, Send, Calendar, Clock, Tag, User, FileText, 
  Sparkles, Volume2, Eye, ArrowLeft, Settings, 
  BookOpen, MessageSquare, Star, Pin, Upload,
  PlusCircle, X, Play, Pause, RotateCcw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useDarkModeContext } from '@/contexts/DarkModeContext'
import dynamic from 'next/dynamic'

// تحميل المحرر بشكل ديناميكي
const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />
})

interface OpinionAuthor {
  id: string
  name: string
  avatar?: string
  specialization?: string
  bio?: string
}

interface ArticleFormData {
  title: string
  excerpt: string
  content: string
  authorId: string
  opinionType: 'short' | 'extended'
  tags: string[]
  isFeatured: boolean
  isPinned: boolean
  allowComments: boolean
  mood: 'positive' | 'negative' | 'neutral' | 'analytical'
  publishOption: 'now' | 'draft' | 'schedule'
  scheduledDate: string
  scheduledTime: string
  enableAudioSummary: boolean
  audioSummaryText: string
  seoTitle: string
  seoDescription: string
  readingTime: number
}

const StatsCard = ({ title, value, subtitle, icon: Icon, bgColor, iconColor, darkMode }: any) => (
  <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{title}</p>
          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          {subtitle && (
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
          )}
        </div>
        <div className={`p-2 rounded-full ${bgColor || 'bg-blue-100'}`}>
          <Icon className={`w-5 h-5 ${iconColor || 'text-blue-600'}`} />
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function EnhancedOpinionCreatePage() {
  const { darkMode } = useDarkModeContext()
  const { toast } = useToast()
  const router = useRouter()
  const editorRef = useRef<any>(null)

  // حالات النموذج
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    excerpt: '',
    content: '',
    authorId: '',
    opinionType: 'short',
    tags: [],
    isFeatured: false,
    isPinned: false,
    allowComments: true,
    mood: 'neutral',
    publishOption: 'draft',
    scheduledDate: '',
    scheduledTime: '',
    enableAudioSummary: false,
    audioSummaryText: '',
    seoTitle: '',
    seoDescription: '',
    readingTime: 5
  })

  // حالات إضافية
  const [authors, setAuthors] = useState<OpinionAuthor[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentTag, setCurrentTag] = useState('')
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null)
  const [isPlayingPreview, setIsPlayingPreview] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // إحصائيات المحرر
  const [stats, setStats] = useState({
    wordCount: 0,
    charCount: 0,
    readingTime: 0,
    contentScore: 0
  })

  useEffect(() => {
    fetchAuthors()
  }, [])

  // تحديث الإحصائيات عند تغيير المحتوى
  useEffect(() => {
    calculateStats()
  }, [formData.content, formData.title])

  // تحديث وقت القراءة المقدر
  useEffect(() => {
    setFormData(prev => ({ ...prev, readingTime: stats.readingTime }))
  }, [stats.readingTime])

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/opinion-authors?active=true')
      const data = await response.json()
      if (data.success) {
        setAuthors(data.authors || [])
      }
    } catch (error) {
      console.error('Error fetching authors:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في جلب قائمة الكتّاب',
        variant: 'destructive'
      })
    }
  }

  const calculateStats = () => {
    const text = formData.content.replace(/<[^>]*>/g, '') // إزالة HTML tags
    const words = text.trim().split(/\s+/).filter(word => word.length > 0)
    const wordCount = words.length
    const charCount = text.length
    const readingTime = Math.ceil(wordCount / 200) || 1 // 200 كلمة في الدقيقة
    
    // تقييم جودة المحتوى (مبسط)
    let contentScore = 0
    if (formData.title.length > 10) contentScore += 20
    if (formData.excerpt.length > 50) contentScore += 20
    if (wordCount > 100) contentScore += 20
    if (formData.tags.length > 0) contentScore += 20
    if (formData.authorId) contentScore += 20

    setStats({
      wordCount,
      charCount,
      readingTime,
      contentScore
    })
  }

  const handleInputChange = (field: keyof ArticleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const generateAISummary = async () => {
    if (!formData.content.trim()) {
      toast({
        title: 'تنبيه',
        description: 'يرجى كتابة محتوى المقال أولاً',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: formData.content,
          type: 'excerpt'
        })
      })

      const data = await response.json()
      if (data.success) {
        setFormData(prev => ({ ...prev, excerpt: data.summary }))
        toast({
          title: 'تم توليد الملخص',
          description: 'تم توليد ملخص ذكي للمقال'
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في توليد الملخص الذكي',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const generateAudioSummary = async () => {
    if (!formData.audioSummaryText && !formData.excerpt) {
      toast({
        title: 'تنبيه',
        description: 'يرجى كتابة نص الملخص الصوتي أو الملخص العادي أولاً',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsGeneratingAudio(true)
      const textToSpeak = formData.audioSummaryText || formData.excerpt

      const response = await fetch('/api/ai/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: textToSpeak,
          voice: 'ar-SA-ZariyahNeural' // صوت عربي
        })
      })

      const data = await response.json()
      if (data.success) {
        setAudioPreviewUrl(data.audioUrl)
        toast({
          title: 'تم توليد الملخص الصوتي',
          description: 'يمكنك الآن الاستماع للمعاينة'
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في توليد الملخص الصوتي',
        variant: 'destructive'
      })
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast({
        title: 'خطأ في النموذج',
        description: 'يرجى إدخال عنوان المقال',
        variant: 'destructive'
      })
      return false
    }

    if (!formData.content.trim() || formData.content === '<p></p>') {
      toast({
        title: 'خطأ في النموذج',
        description: 'يرجى كتابة محتوى المقال',
        variant: 'destructive'
      })
      return false
    }

    if (!formData.authorId) {
      toast({
        title: 'خطأ في النموذج',
        description: 'يرجى اختيار كاتب المقال',
        variant: 'destructive'
      })
      return false
    }

    if (!formData.excerpt.trim()) {
      toast({
        title: 'خطأ في النموذج',
        description: 'يرجى كتابة مقتطف من المقال',
        variant: 'destructive'
      })
      return false
    }

    if (formData.publishOption === 'schedule' && (!formData.scheduledDate || !formData.scheduledTime)) {
      toast({
        title: 'خطأ في النموذج',
        description: 'يرجى تحديد تاريخ ووقت النشر المجدول',
        variant: 'destructive'
      })
      return false
    }

    return true
  }

  const handleSubmit = async (action: 'draft' | 'publish' | 'schedule') => {
    if (!validateForm()) return

    try {
      setSaving(true)
      
      const articleData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        type: 'OPINION',
        opinionAuthorId: formData.authorId,
        status: action === 'draft' ? 'draft' : action === 'schedule' ? 'scheduled' : 'published',
        tags: formData.tags,
        reading_time: formData.readingTime,
        allow_comments: formData.allowComments,
        metadata: {
          opinion_type: formData.opinionType,
          mood: formData.mood,
          is_featured: formData.isFeatured,
          is_pinned: formData.isPinned,
          seo_title: formData.seoTitle,
          seo_description: formData.seoDescription,
          enable_audio_summary: formData.enableAudioSummary,
          audio_summary_text: formData.audioSummaryText,
          audio_url: audioPreviewUrl,
          ...(action === 'schedule' && {
            scheduled_at: new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
          })
        }
      }

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'تم الحفظ بنجاح',
          description: action === 'draft' 
            ? 'تم حفظ المقال كمسودة' 
            : action === 'schedule'
            ? 'تم جدولة المقال للنشر'
            : 'تم نشر المقال بنجاح'
        })
        
        router.push('/dashboard/opinions')
      } else {
        throw new Error(data.error || 'فشل في حفظ المقال')
      }
    } catch (error) {
      console.error('Error saving article:', error)
      toast({
        title: 'خطأ في الحفظ',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ المقال',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const selectedAuthor = authors.find(a => a.id === formData.authorId)

  return (
    <div className={`min-h-screen p-6 transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* الرأس */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <Link href="/dashboard/opinions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة
            </Button>
          </Link>
          
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              إنشاء مقال رأي جديد
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              محرر متقدم لكتابة وتحرير مقالات الرأي والتحليلات
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            حفظ كمسودة
          </Button>
          
          <Button
            onClick={() => handleSubmit('publish')}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4 mr-2" />
            نشر المقال
          </Button>
        </div>
      </div>

      {/* إحصائيات المحرر */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="عدد الكلمات"
          value={stats.wordCount.toLocaleString()}
          subtitle="كلمة"
          icon={FileText}
          bgColor={darkMode ? 'bg-blue-900' : 'bg-blue-100'}
          iconColor={darkMode ? 'text-blue-400' : 'text-blue-600'}
          darkMode={darkMode}
        />
        
        <StatsCard
          title="وقت القراءة"
          value={`${stats.readingTime} دقيقة`}
          subtitle="تقدير"
          icon={Clock}
          bgColor={darkMode ? 'bg-green-900' : 'bg-green-100'}
          iconColor={darkMode ? 'text-green-400' : 'text-green-600'}
          darkMode={darkMode}
        />
        
        <StatsCard
          title="عدد الأحرف"
          value={stats.charCount.toLocaleString()}
          subtitle="حرف"
          icon={BookOpen}
          bgColor={darkMode ? 'bg-purple-900' : 'bg-purple-100'}
          iconColor={darkMode ? 'text-purple-400' : 'text-purple-600'}
          darkMode={darkMode}
        />
        
        <StatsCard
          title="جودة المحتوى"
          value={`${stats.contentScore}%`}
          subtitle="نقطة"
          icon={Star}
          bgColor={darkMode ? 'bg-yellow-900' : 'bg-yellow-100'}
          iconColor={darkMode ? 'text-yellow-400' : 'text-yellow-600'}
          darkMode={darkMode}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* المحرر الرئيسي */}
        <div className="lg:col-span-2 space-y-6">
          {/* معلومات أساسية */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* العنوان */}
              <div>
                <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  عنوان المقال *
                </Label>
                <Input
                  placeholder="اكتب عنواناً جذاباً ومعبراً..."
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`mt-1 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>

              {/* الكاتب */}
              <div>
                <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  كاتب المقال *
                </Label>
                <Select value={formData.authorId} onValueChange={(value) => handleInputChange('authorId', value)}>
                  <SelectTrigger className={`mt-1 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                    <SelectValue placeholder="اختر الكاتب" />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        <div className="flex items-center gap-2">
                          {author.avatar && (
                            <Image
                              src={author.avatar}
                              alt={author.name}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <div>
                            <div className="font-medium">{author.name}</div>
                            {author.specialization && (
                              <div className="text-xs text-gray-500">{author.specialization}</div>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* المقتطف */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    مقتطف من المقال *
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateAISummary}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    توليد ذكي
                  </Button>
                </div>
                <Textarea
                  placeholder="مقتطف قصير يلخص فكرة المقال الرئيسية..."
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  rows={3}
                  className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>

              {/* نوع المقال */}
              <div>
                <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  نوع المقال
                </Label>
                <Select value={formData.opinionType} onValueChange={(value: 'short' | 'extended') => handleInputChange('opinionType', value)}>
                  <SelectTrigger className={`mt-1 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">مقالة قصيرة</SelectItem>
                    <SelectItem value="extended">تحليل رأي موسع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* محرر المحتوى */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                محتوى المقال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                ref={editorRef}
                content={formData.content}
                onChange={(content) => handleInputChange('content', content)}
                placeholder="ابدأ بكتابة مقالك هنا..."
                className="min-h-[400px]"
              />
            </CardContent>
          </Card>

          {/* الملخص الصوتي */}
          {formData.enableAudioSummary && (
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Volume2 className="w-5 h-5" />
                  الملخص الصوتي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    نص الملخص الصوتي
                  </Label>
                  <Textarea
                    placeholder="اكتب نصاً مختصراً للملخص الصوتي (أو اتركه فارغاً لاستخدام المقتطف)"
                    value={formData.audioSummaryText}
                    onChange={(e) => handleInputChange('audioSummaryText', e.target.value)}
                    rows={3}
                    className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={generateAudioSummary}
                    disabled={isGeneratingAudio}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isGeneratingAudio ? (
                      <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Volume2 className="w-4 h-4 mr-2" />
                    )}
                    توليد ملخص صوتي
                  </Button>

                  {audioPreviewUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                    >
                      {isPlayingPreview ? (
                        <Pause className="w-4 h-4 mr-2" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      معاينة
                    </Button>
                  )}
                </div>

                {audioPreviewUrl && (
                  <audio
                    src={audioPreviewUrl}
                    controls
                    className="w-full"
                    onPlay={() => setIsPlayingPreview(true)}
                    onPause={() => setIsPlayingPreview(false)}
                    onEnded={() => setIsPlayingPreview(false)}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* الشريط الجانبي */}
        <div className="space-y-6">
          {/* خيارات النشر */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                خيارات النشر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  وقت النشر
                </Label>
                <Select value={formData.publishOption} onValueChange={(value: 'now' | 'draft' | 'schedule') => handleInputChange('publishOption', value)}>
                  <SelectTrigger className={`mt-1 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">نشر فوري</SelectItem>
                    <SelectItem value="draft">حفظ كمسودة</SelectItem>
                    <SelectItem value="schedule">نشر مجدول</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.publishOption === 'schedule' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      التاريخ
                    </Label>
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                      className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <Label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      الوقت
                    </Label>
                    <Input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                      className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
              )}

              <Separator />

              {/* خيارات المقال */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    تمييز المقال
                  </Label>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    تثبيت المقال
                  </Label>
                  <Switch
                    checked={formData.isPinned}
                    onCheckedChange={(checked) => handleInputChange('isPinned', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    السماح بالتعليقات
                  </Label>
                  <Switch
                    checked={formData.allowComments}
                    onCheckedChange={(checked) => handleInputChange('allowComments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    تفعيل الملخص الصوتي
                  </Label>
                  <Switch
                    checked={formData.enableAudioSummary}
                    onCheckedChange={(checked) => handleInputChange('enableAudioSummary', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الوسوم */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                الوسوم والتصنيف
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  نبرة المقال
                </Label>
                <Select value={formData.mood} onValueChange={(value: any) => handleInputChange('mood', value)}>
                  <SelectTrigger className={`mt-1 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">إيجابي</SelectItem>
                    <SelectItem value="negative">نقدي</SelectItem>
                    <SelectItem value="neutral">محايد</SelectItem>
                    <SelectItem value="analytical">تحليلي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  الوسوم
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="أضف وسم..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className={`flex-1 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    size="sm"
                    variant="outline"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className={`flex items-center gap-1 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* معلومات الكاتب المختار */}
          {selectedAuthor && (
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  الكاتب المختار
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  {selectedAuthor.avatar && (
                    <Image
                      src={selectedAuthor.avatar}
                      alt={selectedAuthor.name}
                      width={60}
                      height={60}
                      className="w-15 h-15 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedAuthor.name}
                    </h3>
                    {selectedAuthor.specialization && (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedAuthor.specialization}
                      </p>
                    )}
                    {selectedAuthor.bio && (
                      <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedAuthor.bio}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* إعدادات متقدمة */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  إعدادات متقدمة
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            {showAdvanced && (
              <CardContent className="space-y-4">
                <div>
                  <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    عنوان SEO
                  </Label>
                  <Input
                    placeholder="عنوان محسن لمحركات البحث..."
                    value={formData.seoTitle}
                    onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                    className={`mt-1 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>

                <div>
                  <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    وصف SEO
                  </Label>
                  <Textarea
                    placeholder="وصف مختصر لمحركات البحث..."
                    value={formData.seoDescription}
                    onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                    rows={2}
                    className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>

                <div>
                  <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    وقت القراءة المقدر (دقائق)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.readingTime}
                    onChange={(e) => handleInputChange('readingTime', parseInt(e.target.value) || 5)}
                    className={`mt-1 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
