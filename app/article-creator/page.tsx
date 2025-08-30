'use client'

import React, { useState } from 'react'
import { AdvancedEditor } from '@/components/ui/advanced-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  Eye, 
  Upload, 
  FileText,
  Clock,
  User,
  Tag
} from 'lucide-react'

export default function ArticleCreatorDemo() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [author, setAuthor] = useState('محرر سبق')
  const [isSaving, setIsSaving] = useState(false)

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // محاكاة الحفظ
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSaving(false)
    console.log('تم حفظ المقال:', { title, content, tags, author })
  }

  const getContentStats = () => {
    const text = content.replace(/<[^>]*>/g, '')
    const words = text.split(/\s+/).filter(Boolean).length
    const images = (content.match(/<img/g) || []).length
    const readingTime = Math.ceil(words / 200) // متوسط 200 كلمة في الدقيقة
    
    return { characters: text.length, words, images, readingTime }
  }

  const stats = getContentStats()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* رأس الصفحة */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📝 منشئ المقالات المتقدم
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            أنشئ مقالاً احترافياً مع الصور والإيموجي والتنسيق المتقدم
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            معاينة
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !title.trim() || !content.trim()}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <Upload className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'جاري الحفظ...' : 'حفظ المقال'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* المحتوى الرئيسي */}
        <div className="lg:col-span-2 space-y-6">
          {/* عنوان المقال */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                عنوان المقال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="اكتب عنوان المقال..."
                className="text-xl font-bold"
              />
            </CardContent>
          </Card>

          {/* المحرر المتقدم */}
          <Card>
            <CardHeader>
              <CardTitle>محتوى المقال</CardTitle>
            </CardHeader>
            <CardContent>
              <AdvancedEditor
                value={content}
                onChange={setContent}
                placeholder="اكتب محتوى المقال هنا... يمكنك إضافة الصور والإيموجي والنصوص المنسقة"
                className="min-h-[500px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* الشريط الجانبي */}
        <div className="space-y-6">
          {/* إحصائيات المقال */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 إحصائيات المقال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.characters}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">حرف</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.words}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">كلمة</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.images}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">صورة</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.readingTime}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">دقيقة</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* معلومات الكاتب */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                معلومات الكاتب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="اسم الكاتب"
              />
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                {new Date().toLocaleDateString('ar-SA')} - {new Date().toLocaleTimeString('ar-SA')}
              </div>
            </CardContent>
          </Card>

          {/* الكلمات المفتاحية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                الكلمات المفتاحية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="أضف كلمة مفتاحية..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1"
                />
                <Button onClick={handleAddTag} size="sm">
                  إضافة
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* نصائح الكتابة */}
          <Card>
            <CardHeader>
              <CardTitle>💡 نصائح للكتابة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-2">
                <div className={stats.characters > 300 ? 'text-green-600' : 'text-orange-600'}>
                  • {stats.characters > 300 ? '✅' : '⚠️'} طول المقال مناسب ({stats.characters > 300 ? 'جيد' : 'قصير'})
                </div>
                <div className={title.length > 30 ? 'text-green-600' : 'text-orange-600'}>
                  • {title.length > 30 ? '✅' : '⚠️'} طول العنوان ({title.length > 30 ? 'مناسب' : 'قصير'})
                </div>
                <div className={stats.images > 0 ? 'text-green-600' : 'text-gray-500'}>
                  • {stats.images > 0 ? '✅' : '💡'} الصور ({stats.images > 0 ? 'متوفرة' : 'أضف صوراً'})
                </div>
                <div className={tags.length > 2 ? 'text-green-600' : 'text-orange-600'}>
                  • {tags.length > 2 ? '✅' : '⚠️'} الكلمات المفتاحية ({tags.length > 2 ? 'كافية' : 'أضف المزيد'})
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
