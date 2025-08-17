/**
 * 📱 محرر المقالات المحسن للهاتف
 * واجهة تحرير مبسطة ومحسنة للاستخدام على الهواتف الذكية
 */

"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MobileButton, MobileDropdown } from '@/components/mobile/MobileComponents';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Send, 
  Camera, 
  Type, 
  Bold, 
  Italic, 
  List, 
  Link2, 
  Quote, 
  Hash, 
  Image as ImageIcon,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle,
  Smartphone,
  Monitor,
  Tablet,
  Settings,
  Palette,
  Zap
} from 'lucide-react';

interface Article {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'pending';
  featured: boolean;
  allowComments: boolean;
  seoTitle: string;
  seoDescription: string;
}

export default function MobileArticleEditor() {
  const [article, setArticle] = useState<Article>({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    status: 'draft',
    featured: false,
    allowComments: true,
    seoTitle: '',
    seoDescription: ''
  });

  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'preview'>('content');
  const [isSaving, setIsSaving] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = async (publish = false) => {
    setIsSaving(true);
    try {
      const updatedArticle: Article = {
        ...article,
        status: publish ? 'published' : 'draft'
      };
      
      // محاكاة حفظ المقال
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setArticle(updatedArticle);
      console.log('تم حفظ المقال:', updatedArticle);
    } catch (error) {
      console.error('خطأ في حفظ المقال:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const insertFormatting = (format: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = article.content.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'نص عريض'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'نص مائل'}*`;
        break;
      case 'heading':
        formattedText = `\n## ${selectedText || 'عنوان فرعي'}\n`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText || 'عنصر قائمة'}\n`;
        break;
      case 'quote':
        formattedText = `\n> ${selectedText || 'اقتباس'}\n`;
        break;
      case 'link':
        formattedText = `[${selectedText || 'نص الرابط'}](رابط)`;
        break;
      default:
        return;
    }

    const newContent = 
      article.content.substring(0, start) + 
      formattedText + 
      article.content.substring(end);
    
    setArticle(prev => ({ ...prev, content: newContent }));
    
    // إعادة تركيز المؤشر
    setTimeout(() => {
      const newPosition = start + formattedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  };

  const getStatusBadge = () => {
    const statusConfig = {
      draft: { color: 'bg-yellow-500', text: 'مسودة', icon: Clock },
      published: { color: 'bg-green-500', text: 'منشور', icon: CheckCircle },
      pending: { color: 'bg-blue-500', text: 'معلق', icon: AlertTriangle }
    };

    const config = statusConfig[article.status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const formatButtons = [
    { id: 'bold', icon: Bold, label: 'عريض' },
    { id: 'italic', icon: Italic, label: 'مائل' },
    { id: 'heading', icon: Hash, label: 'عنوان' },
    { id: 'list', icon: List, label: 'قائمة' },
    { id: 'quote', icon: Quote, label: 'اقتباس' },
    { id: 'link', icon: Link2, label: 'رابط' }
  ];

  const categories = [
    'التقنية', 'الاقتصاد', 'الرياضة', 'الثقافة', 
    'الصحة', 'السياسة', 'التعليم', 'البيئة'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* شريط علوي */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {article.title || 'مقال جديد'}
              </h1>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                <span className="text-xs text-gray-500">
                  آخر حفظ: منذ دقيقتين
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MobileButton
              size="sm"
              variant="secondary"
              icon={<Eye className="w-4 h-4" />}
              onClick={() => setActiveTab('preview')}
            >
              معاينة
            </MobileButton>
            
            <MobileDropdown
              trigger={
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              }
              items={[
                { 
                  label: 'حفظ كمسودة', 
                  value: 'save', 
                  icon: <Save className="w-4 h-4" />,
                  action: () => handleSave(false)
                },
                { 
                  label: 'نشر المقال', 
                  value: 'publish', 
                  icon: <Send className="w-4 h-4" />,
                  action: () => handleSave(true)
                },
                { 
                  label: 'الإعدادات', 
                  value: 'settings', 
                  icon: <Settings className="w-4 h-4" />,
                  action: () => setActiveTab('settings')
                }
              ]}
            />
          </div>
        </div>

        {/* تبويبات */}
        <div className="flex border-t border-gray-200 dark:border-gray-700">
          {[
            { id: 'content', label: 'المحتوى', icon: Type },
            { id: 'settings', label: 'الإعدادات', icon: Settings },
            { id: 'preview', label: 'معاينة', icon: Eye }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'content' && (
          <div className="p-4 space-y-4">
            {/* عنوان المقال */}
            <Card>
              <CardContent className="p-4">
                <Input
                  placeholder="عنوان المقال..."
                  value={article.title}
                  onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
                  className="text-xl font-bold border-0 p-0 h-auto resize-none"
                  dir="rtl"
                />
              </CardContent>
            </Card>

            {/* شريط التنسيق */}
            <Card>
              <CardContent className="p-2">
                <div className="flex items-center gap-1 overflow-x-auto">
                  {formatButtons.map((button) => (
                    <Button
                      key={button.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting(button.id)}
                      className="flex-shrink-0 w-10 h-10 p-0"
                      title={button.label}
                    >
                      <button.icon className="w-4 h-4" />
                    </Button>
                  ))}
                  
                  <div className="w-px h-6 bg-gray-300 mx-2" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 w-10 h-10 p-0"
                    title="إضافة صورة"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 w-10 h-10 p-0"
                    title="التقاط صورة"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* محتوى المقال */}
            <Card className="flex-1">
              <CardContent className="p-4">
                <Textarea
                  ref={contentRef}
                  placeholder="ابدأ كتابة مقالك هنا...

يمكنك استخدام Markdown للتنسيق:
- **نص عريض**
- *نص مائل*
- ## عنوان فرعي
- [رابط](url)
- > اقتباس

أو استخدم أزرار التنسيق أعلاه."
                  value={article.content}
                  onChange={(e) => setArticle(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[400px] text-base leading-relaxed border-0 p-0 resize-none"
                  dir="rtl"
                />
              </CardContent>
            </Card>

            {/* ملخص المقال */}
            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ملخص المقال
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <Textarea
                  placeholder="ملخص قصير للمقال (اختياري)..."
                  value={article.excerpt}
                  onChange={(e) => setArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="h-20 text-sm"
                  dir="rtl"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-4 space-y-4">
            {/* التصنيف */}
            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  التصنيف
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <select
                  value={article.category}
                  onChange={(e) => setArticle(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">اختر التصنيف</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* العلامات */}
            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  العلامات
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <Input
                  placeholder="أدخل العلامات مفصولة بفواصل..."
                  value={article.tags.join(', ')}
                  onChange={(e) => setArticle(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                  dir="rtl"
                />
              </CardContent>
            </Card>

            {/* إعدادات النشر */}
            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  إعدادات النشر
                </h3>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    مقال مميز
                  </span>
                  <input
                    type="checkbox"
                    checked={article.featured}
                    onChange={(e) => setArticle(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    السماح بالتعليقات
                  </span>
                  <input
                    type="checkbox"
                    checked={article.allowComments}
                    onChange={(e) => setArticle(prev => ({ ...prev, allowComments: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </label>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  تحسين محركات البحث
                </h3>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Input
                  placeholder="عنوان SEO..."
                  value={article.seoTitle}
                  onChange={(e) => setArticle(prev => ({ ...prev, seoTitle: e.target.value }))}
                  dir="rtl"
                />
                <Textarea
                  placeholder="وصف SEO..."
                  value={article.seoDescription}
                  onChange={(e) => setArticle(prev => ({ ...prev, seoDescription: e.target.value }))}
                  className="h-20"
                  dir="rtl"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="p-4">
            {/* أزرار المعاينة */}
            <div className="flex items-center gap-2 mb-4">
              {[
                { id: 'mobile', icon: Smartphone, label: 'هاتف' },
                { id: 'tablet', icon: Tablet, label: 'تابلت' },
                { id: 'desktop', icon: Monitor, label: 'سطح مكتب' }
              ].map((device) => (
                <Button
                  key={device.id}
                  variant={previewMode === device.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode(device.id as any)}
                  className="flex items-center gap-2"
                >
                  <device.icon className="w-4 h-4" />
                  {device.label}
                </Button>
              ))}
            </div>

            {/* معاينة المقال */}
            <Card className={`overflow-hidden ${
              previewMode === 'mobile' ? 'max-w-sm mx-auto' :
              previewMode === 'tablet' ? 'max-w-2xl mx-auto' :
              'max-w-4xl mx-auto'
            }`}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {article.category && (
                    <Badge className="bg-blue-500 text-white">
                      {typeof article.category === 'string' ? article.category : article.category?.name || 'عام'}
                    </Badge>
                  )}
                  
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {article.title || 'عنوان المقال'}
                  </h1>
                  
                  {article.excerpt && (
                    <p className="text-lg text-gray-600 dark:text-gray-300 italic">
                      {article.excerpt}
                    </p>
                  )}
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200">
                      {article.content ? (
                        article.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-4">
                            {paragraph}
                          </p>
                        ))
                      ) : (
                        <p className="text-gray-400 italic">
                          محتوى المقال سيظهر هنا...
                        </p>
                      )}
                    </div>
                  </div>

                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {article.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* شريط الحفظ السفلي */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-3">
          <MobileButton
            variant="secondary"
            className="flex-1"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                جاري الحفظ...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                حفظ كمسودة
              </>
            )}
          </MobileButton>

          <MobileButton
            className="flex-1"
            onClick={() => handleSave(true)}
            disabled={isSaving || !article.title.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            نشر المقال
          </MobileButton>
        </div>
      </div>
    </div>
  );
}
