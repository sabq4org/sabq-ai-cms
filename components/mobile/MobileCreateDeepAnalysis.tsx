'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { toast } from 'react-hot-toast';
import MobileDashboardLayout from '@/components/mobile/MobileDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Brain, Users, Sparkles, Save, ArrowLeft, 
  ChevronDown, ChevronUp, Plus, X, Target,
  BarChart3, TrendingUp, Lightbulb, FileText,
  Loader2, AlertTriangle, CheckCircle, Wand2,
  Eye, Settings, Upload, Download, Zap,
  MessageSquare, Calendar, Clock, Award
} from 'lucide-react';

// مكون البطاقة القابلة للطي
const CollapsibleCard = ({ 
  title, 
  icon, 
  children, 
  defaultExpanded = false,
  required = false,
  completed = false
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  required?: boolean;
  completed?: boolean;
}) => {
  const { darkMode } = useDarkModeContext();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className={`
      mb-4 transition-all duration-200
      ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      ${completed ? 'ring-2 ring-green-500' : ''}
    `}>
      <CardHeader 
        className="pb-2 cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              completed ? 'bg-green-500 text-white' : 
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {completed ? <CheckCircle className="w-4 h-4" /> : icon}
            </div>
            
            <div>
              <CardTitle className={`text-sm font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
                {required && <span className="text-red-500 mr-1">*</span>}
              </CardTitle>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {completed && (
              <Badge className="bg-green-500 text-white text-xs">
                مكتمل
              </Badge>
            )}
            <button className={`p-1 rounded transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

// مكون شريط التقدم
const ProgressBar = ({ progress }: { progress: number }) => {
  const { darkMode } = useDarkModeContext();
  
  return (
    <div className={`
      mb-6 p-4 rounded-lg
      ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
    `}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          تقدم الإنشاء
        </span>
        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {Math.round(progress)}%
        </span>
      </div>
      
      <div className={`w-full h-2 rounded-full ${
        darkMode ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <div 
          className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default function MobileCreateDeepAnalysis() {
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    analysis_type: 'AI' as 'AI' | 'Human' | 'Mixed',
    keywords: [] as string[],
    insights: [] as string[],
    source_articles: [] as string[],
    auto_generate: true,
    advanced_features: {
      sentiment_analysis: false,
      trend_detection: false,
      entity_extraction: false,
      readability_score: false
    }
  });

  // حساب التقدم
  const calculateProgress = () => {
    let progress = 0;
    const totalFields = 5;
    
    if (formData.title) progress += 20;
    if (formData.summary) progress += 20;
    if (formData.content) progress += 20;
    if (formData.keywords.length > 0) progress += 20;
    if (formData.insights.length > 0) progress += 20;
    
    return progress;
  };

  // إضافة كلمة مفتاحية
  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !formData.keywords.includes(keyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword.trim()]
      }));
    }
  };

  // إزالة كلمة مفتاحية
  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  // إضافة رؤية
  const addInsight = (insight: string) => {
    if (insight.trim() && !formData.insights.includes(insight.trim())) {
      setFormData(prev => ({
        ...prev,
        insights: [...prev.insights, insight.trim()]
      }));
    }
  };

  // إزالة رؤية
  const removeInsight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      insights: prev.insights.filter((_, i) => i !== index)
    }));
  };

  // توليد محتوى بالذكاء الاصطناعي
  const generateAIContent = async () => {
    if (!formData.title) {
      toast.error('يرجى إدخال العنوان أولاً');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/ai/generate-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          existing_content: formData.content,
          analysis_type: formData.analysis_type
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          content: data.content || prev.content,
          summary: data.summary || prev.summary,
          keywords: [...prev.keywords, ...(data.keywords || [])],
          insights: [...prev.insights, ...(data.insights || [])]
        }));
        toast.success('تم توليد المحتوى بنجاح');
      } else {
        throw new Error('فشل في توليد المحتوى');
      }
    } catch (error) {
      console.error('خطأ في توليد المحتوى:', error);
      toast.error('فشل في توليد المحتوى');
    } finally {
      setLoading(false);
    }
  };

  // حفظ التحليل
  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    if (!formData.title || !formData.summary) {
      toast.error('العنوان والملخص مطلوبان');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const response = await fetch('/api/deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(`تم ${status === 'published' ? 'نشر' : 'حفظ'} التحليل بنجاح`);
        router.push('/dashboard/insights/mobile');
      } else {
        throw new Error('فشل في الحفظ');
      }
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      toast.error('فشل في حفظ التحليل');
    } finally {
      setLoading(false);
    }
  };

  const analysisTypes = [
    { value: 'AI', label: 'ذكي', icon: <Brain className="w-4 h-4" />, color: 'blue' },
    { value: 'Human', label: 'بشري', icon: <Users className="w-4 h-4" />, color: 'green' },
    { value: 'Mixed', label: 'مختلط', icon: <Sparkles className="w-4 h-4" />, color: 'purple' }
  ];

  return (
    <MobileDashboardLayout
      title="إنشاء تحليل عميق"
      showBack={true}
      onBack={() => router.back()}
    >
      <div className="space-y-4">
        {/* شريط التقدم */}
        <ProgressBar progress={calculateProgress()} />

        {/* المعلومات الأساسية */}
        <CollapsibleCard
          title="المعلومات الأساسية"
          icon={<FileText className="w-4 h-4" />}
          defaultExpanded={true}
          required={true}
          completed={!!(formData.title && formData.summary)}
        >
          <div className="space-y-4">
            {/* العنوان */}
            <div>
              <Label htmlFor="title" className="mb-2">عنوان التحليل *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="اكتب عنواناً واضحاً للتحليل..."
                className="mobile-form-input"
              />
            </div>

            {/* نوع التحليل */}
            <div>
              <Label className="mb-2">نوع التحليل *</Label>
              <div className="grid grid-cols-3 gap-2">
                {analysisTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, analysis_type: type.value as any }))}
                    className={`
                      flex flex-col items-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors
                      ${formData.analysis_type === type.value
                        ? `bg-${type.color}-500 text-white`
                        : darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* الملخص */}
            <div>
              <Label htmlFor="summary" className="mb-2">ملخص التحليل *</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="اكتب ملخصاً واضحاً ومفيداً للتحليل..."
                rows={4}
                className="mobile-form-input resize-none"
              />
              <div className={`text-xs mt-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formData.summary.length}/500 حرف
              </div>
            </div>
          </div>
        </CollapsibleCard>

        {/* المحتوى التفصيلي */}
        <CollapsibleCard
          title="المحتوى التفصيلي"
          icon={<MessageSquare className="w-4 h-4" />}
          completed={!!formData.content}
        >
          <div className="space-y-4">
            {/* توليد تلقائي بالذكاء الاصطناعي */}
            {formData.analysis_type === 'AI' && (
              <div className={`p-3 rounded-lg border-2 border-dashed ${
                darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Wand2 className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    التوليد الذكي
                  </span>
                </div>
                
                <p className={`text-xs mb-3 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  اتركه للذكاء الاصطناعي لتوليد محتوى تحليلي متقدم
                </p>
                
                <Button
                  onClick={generateAIContent}
                  disabled={loading || !formData.title}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  size="sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  توليد المحتوى
                </Button>
              </div>
            )}

            {/* محرر المحتوى */}
            <div>
              <Label htmlFor="content" className="mb-2">محتوى التحليل</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="اكتب المحتوى التفصيلي للتحليل..."
                rows={8}
                className="mobile-form-input resize-none"
              />
            </div>
          </div>
        </CollapsibleCard>

        {/* الكلمات المفتاحية */}
        <CollapsibleCard
          title="الكلمات المفتاحية"
          icon={<Target className="w-4 h-4" />}
          completed={formData.keywords.length > 0}
        >
          <div className="space-y-3">
            {/* الكلمات المضافة */}
            {formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* إضافة كلمة جديدة */}
            <Input
              placeholder="اكتب كلمة مفتاحية واضغط Enter..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = (e.target as HTMLInputElement).value;
                  if (value.trim()) {
                    addKeyword(value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
              className="mobile-form-input"
            />
          </div>
        </CollapsibleCard>

        {/* الرؤى والتحليلات */}
        <CollapsibleCard
          title="الرؤى والتحليلات"
          icon={<Lightbulb className="w-4 h-4" />}
          completed={formData.insights.length > 0}
        >
          <div className="space-y-3">
            {/* الرؤى المضافة */}
            {formData.insights.length > 0 && (
              <div className="space-y-2">
                {formData.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border flex items-start gap-2 ${
                      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-1 text-sm">
                      {insight}
                    </div>
                    <button
                      onClick={() => removeInsight(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* إضافة رؤية جديدة */}
            <Textarea
              placeholder="اكتب رؤية تحليلية واضغط Enter..."
              rows={3}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  const value = (e.target as HTMLTextAreaElement).value;
                  if (value.trim()) {
                    addInsight(value);
                    (e.target as HTMLTextAreaElement).value = '';
                  }
                }
              }}
              className="mobile-form-input resize-none"
            />
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              اضغط Ctrl + Enter للإضافة
            </p>
          </div>
        </CollapsibleCard>

        {/* الميزات المتقدمة */}
        <CollapsibleCard
          title="الميزات المتقدمة"
          icon={<Settings className="w-4 h-4" />}
        >
          <div className="space-y-4">
            {Object.entries({
              sentiment_analysis: 'تحليل المشاعر',
              trend_detection: 'اكتشاف الاتجاهات',
              entity_extraction: 'استخراج الكيانات',
              readability_score: 'نقاط القابلية للقراءة'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="text-sm">{label}</Label>
                <Switch
                  id={key}
                  checked={formData.advanced_features[key as keyof typeof formData.advanced_features]}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      advanced_features: {
                        ...prev.advanced_features,
                        [key]: checked
                      }
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </CollapsibleCard>

        {/* مساحة إضافية للأزرار الثابتة */}
        <div className="h-20"></div>
      </div>

      {/* أزرار الحفظ الثابتة */}
      <div className={`
        fixed bottom-0 left-0 right-0 p-4 border-t
        ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
        safe-area-inset-bottom
      `}>
        <div className="flex gap-3">
          <Button
            onClick={() => handleSave('draft')}
            disabled={loading || !formData.title || !formData.summary}
            variant="outline"
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            حفظ كمسودة
          </Button>
          
          <Button
            onClick={() => handleSave('published')}
            disabled={loading || !formData.title || !formData.summary || !formData.content}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            نشر التحليل
          </Button>
        </div>
      </div>
    </MobileDashboardLayout>
  );
}
