'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { toast } from 'react-hot-toast';
import MobileDashboardLayout from '@/components/mobile/MobileDashboardLayout';
import InterestBasedBreakingNews from '@/components/mobile/InterestBasedBreakingNews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Brain, Edit, Trash2, Eye, Clock, Calendar, 
  TrendingUp, MessageSquare, MoreVertical,
  ChevronRight, AlertTriangle, CheckCircle,
  Loader2, RefreshCw, Plus, Sparkles,
  BarChart3, Target, Users, Award, Zap,
  Save, X, ChevronDown, ChevronUp
} from 'lucide-react';

interface DeepAnalysis {
  id: string;
  title: string;
  summary: string;
  content?: string;
  insights?: string[];
  keywords?: string[];
  analysis_type: 'AI' | 'Human' | 'Mixed';
  source_articles?: any[];
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published' | 'archived';
}

// مكون البطاقة القابلة للطي للتحليل
const AnalysisCard = ({ 
  analysis, 
  onEdit, 
  onDelete, 
  onView 
}: { 
  analysis: DeepAnalysis;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}) => {
  const { darkMode } = useDarkModeContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'AI': return 'bg-blue-500';
      case 'Human': return 'bg-green-500';
      case 'Mixed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'AI': return <Brain className="w-3 h-3" />;
      case 'Human': return <Users className="w-3 h-3" />;
      case 'Mixed': return <Sparkles className="w-3 h-3" />;
      default: return <BarChart3 className="w-3 h-3" />;
    }
  };

  return (
    <Card className={`
      mb-4 transition-all duration-200 hover:shadow-md
      ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
    `}>
      <CardContent className="p-4">
        {/* الهيدر */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={`
              font-semibold text-sm leading-tight mb-2
              ${darkMode ? 'text-white' : 'text-gray-900'}
            `}>
              {analysis.title}
            </h3>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                className={`${getTypeColor(analysis.analysis_type)} text-white text-xs px-2 py-1`}
              >
                {getTypeIcon(analysis.analysis_type)}
                <span className="mr-1">
                  {analysis.analysis_type === 'AI' ? 'ذكي' : 
                   analysis.analysis_type === 'Human' ? 'بشري' : 'مختلط'}
                </span>
              </Badge>
              
              <Badge 
                variant={analysis.status === 'published' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {analysis.status === 'published' ? 'منشور' : 
                 analysis.status === 'draft' ? 'مسودة' : 'مؤرشف'}
              </Badge>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1 rounded transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* الملخص */}
        <p className={`
          text-xs leading-relaxed line-clamp-2 mb-3
          ${darkMode ? 'text-gray-300' : 'text-gray-600'}
        `}>
          {analysis.summary}
        </p>

        {/* التفاصيل الموسعة */}
        {isExpanded && (
          <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            {/* الرؤى */}
            {analysis.insights && analysis.insights.length > 0 && (
              <div>
                <h4 className={`text-xs font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  الرؤى الرئيسية:
                </h4>
                <div className="space-y-1">
                  {analysis.insights.slice(0, 3).map((insight, index) => (
                    <div key={index} className={`
                      text-xs p-2 rounded-lg
                      ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                    `}>
                      • {insight}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* الكلمات المفتاحية */}
            {analysis.keywords && analysis.keywords.length > 0 && (
              <div>
                <h4 className={`text-xs font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  الكلمات المفتاحية:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.keywords.slice(0, 5).map((keyword, index) => (
                    <span
                      key={index}
                      className={`text-xs px-2 py-1 rounded-full ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* التاريخ */}
        <div className={`text-xs mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {new Date(analysis.created_at).toLocaleDateString('ar-SA')}
        </div>

        {/* أزرار العمليات */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(analysis.id)}
            className="flex-1 h-8 text-xs"
          >
            <Edit className="w-3 h-3 mr-1" />
            تحرير
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView(analysis.id)}
            className="flex-1 h-8 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            عرض
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(analysis.id)}
            className="h-8 text-xs text-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// مكون نموذج إنشاء تحليل جديد
const CreateAnalysisForm = ({ 
  onClose, 
  onSubmit 
}: { 
  onClose: () => void;
  onSubmit: (data: any) => void;
}) => {
  const { darkMode } = useDarkModeContext();
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    analysis_type: 'AI' as 'AI' | 'Human' | 'Mixed',
    keywords: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.summary) {
      toast.error('العنوان والملخص مطلوبان');
      return;
    }
    onSubmit(formData);
  };

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !formData.keywords.includes(keyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword.trim()]
      }));
    }
  };

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50">
      <div className={`
        w-full max-h-[90vh] rounded-t-2xl p-6 overflow-y-auto
        ${darkMode ? 'bg-gray-800' : 'bg-white'}
      `}>
        {/* الهيدر */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            إنشاء تحليل عميق جديد
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* العنوان */}
          <div>
            <Label htmlFor="title" className="mb-2">عنوان التحليل *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="اكتب عنواناً للتحليل..."
              className="mobile-form-input"
            />
          </div>

          {/* نوع التحليل */}
          <div>
            <Label className="mb-2">نوع التحليل *</Label>
            <div className="flex gap-2">
              {[
                { value: 'AI', label: 'ذكي', icon: <Brain className="w-4 h-4" /> },
                { value: 'Human', label: 'بشري', icon: <Users className="w-4 h-4" /> },
                { value: 'Mixed', label: 'مختلط', icon: <Sparkles className="w-4 h-4" /> }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, analysis_type: type.value as any }))}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${formData.analysis_type === type.value
                      ? 'bg-blue-500 text-white'
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
              placeholder="اكتب ملخصاً للتحليل..."
              rows={3}
              className="mobile-form-input resize-none"
            />
          </div>

          {/* المحتوى */}
          <div>
            <Label htmlFor="content" className="mb-2">محتوى التحليل</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="اكتب محتوى التحليل التفصيلي..."
              rows={5}
              className="mobile-form-input resize-none"
            />
          </div>

          {/* الكلمات المفتاحية */}
          <div>
            <Label className="mb-2">الكلمات المفتاحية</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.keywords.map((keyword, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="اضغط Enter لإضافة كلمة مفتاحية..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = (e.target as HTMLInputElement).value;
                  addKeyword(value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              className="mobile-form-input"
            />
          </div>

          {/* أزرار الحفظ */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              إلغاء
            </Button>
            
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              حفظ التحليل
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function MobileDeepAnalysisManagement() {
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyses, setAnalyses] = useState<DeepAnalysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<DeepAnalysis[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'AI' | 'Human' | 'Mixed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // جلب التحليلات
  const fetchAnalyses = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      
      const response = await fetch('/api/deep-analysis');
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses || []);
      } else {
        throw new Error('فشل في جلب التحليلات');
      }
    } catch (error) {
      console.error('خطأ في جلب التحليلات:', error);
      toast.error('خطأ في جلب التحليلات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  // تصفية التحليلات
  useEffect(() => {
    let filtered = analyses;

    // تصفية حسب النوع
    if (activeFilter !== 'all') {
      filtered = filtered.filter(analysis => analysis.analysis_type === activeFilter);
    }

    // تصفية حسب البحث
    if (searchQuery) {
      filtered = filtered.filter(analysis =>
        analysis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        analysis.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAnalyses(filtered);
  }, [analyses, activeFilter, searchQuery]);

  // إنشاء تحليل جديد
  const handleCreateAnalysis = async (data: any) => {
    try {
      const response = await fetch('/api/deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('تم إنشاء التحليل بنجاح');
        setShowCreateForm(false);
        fetchAnalyses(false);
      } else {
        throw new Error('فشل في إنشاء التحليل');
      }
    } catch (error) {
      console.error('خطأ في إنشاء التحليل:', error);
      toast.error('فشل في إنشاء التحليل');
    }
  };

  // حذف التحليل
  const handleDeleteAnalysis = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التحليل؟')) return;

    try {
      const response = await fetch(`/api/deep-analysis/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('تم حذف التحليل بنجاح');
        fetchAnalyses(false);
      } else {
        throw new Error('فشل في الحذف');
      }
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      toast.error('فشل في حذف التحليل');
    }
  };

  const filters = [
    { id: 'all', label: 'الكل', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'AI', label: 'ذكي', icon: <Brain className="w-4 h-4" /> },
    { id: 'Human', label: 'بشري', icon: <Users className="w-4 h-4" /> },
    { id: 'Mixed', label: 'مختلط', icon: <Sparkles className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <MobileDashboardLayout title="التحليلات العميقة">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`
              h-32 rounded-lg animate-pulse
              ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}
            `} />
          ))}
        </div>
      </MobileDashboardLayout>
    );
  }

  return (
    <>
      <MobileDashboardLayout
        title="التحليلات العميقة"
        showSearch={true}
        showAdd={true}
        onAdd={() => setShowCreateForm(true)}
        onSearch={setSearchQuery}
      >
        <div className="space-y-4">
          {/* شريط الإحصائيات */}
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {analyses.length}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    إجمالي
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`text-lg font-bold text-blue-600`}>
                    {analyses.filter(a => a.analysis_type === 'AI').length}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ذكي
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`text-lg font-bold text-green-600`}>
                    {analyses.filter(a => a.analysis_type === 'Human').length}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    بشري
                  </div>
                </div>
                
                <button
                  onClick={() => fetchAnalyses(false)}
                  disabled={refreshing}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* تبويبات التصفية */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  whitespace-nowrap transition-colors
                  ${activeFilter === filter.id
                    ? 'bg-blue-500 text-white'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {filter.icon}
                {filter.label}
                <Badge variant="secondary" className="text-xs">
                  {filter.id === 'all' 
                    ? analyses.length
                    : analyses.filter(a => a.analysis_type === filter.id).length
                  }
                </Badge>
              </button>
            ))}
          </div>

          {/* قائمة التحليلات */}
          {filteredAnalyses.length === 0 ? (
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-8 text-center">
                <Brain className={`w-12 h-12 mx-auto mb-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <h3 className={`text-lg font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  لا توجد تحليلات
                </h3>
                <p className={`text-sm mb-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {searchQuery 
                    ? 'لم يتم العثور على نتائج للبحث'
                    : 'لا توجد تحليلات في هذا التصنيف'
                  }
                </p>
                
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إنشاء تحليل جديد
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-0">
              {filteredAnalyses.map((analysis) => (
                <AnalysisCard
                  key={analysis.id}
                  analysis={analysis}
                  onEdit={(id) => router.push(`/dashboard/insights/edit/${id}`)}
                  onView={(id) => router.push(`/dashboard/insights/${id}`)}
                  onDelete={handleDeleteAnalysis}
                />
              ))}
            </div>
          )}

          {/* مساحة إضافية للتنقل السفلي */}
          <div className="h-16"></div>
        </div>
      </MobileDashboardLayout>

      {/* نموذج إنشاء تحليل جديد */}
      {showCreateForm && (
        <CreateAnalysisForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateAnalysis}
        />
      )}
    </>
  );
}
