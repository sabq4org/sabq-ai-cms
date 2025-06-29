'use client';

import { Clock3, Heart, Bookmark, Brain, Search, Share2 } from "lucide-react";
// import { useDarkMode } from '@/hooks/useDarkMode'; // تم تعطيل الوضع الليلي
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useInteractions } from '@/hooks/useInteractions';

interface DeepInsight {
  id: string;
  title: string;
  summary: string;
  author: string;
  createdAt: string;
  readTime: number;
  views: number;
  aiConfidence: number;
  tags: string[];
  type: 'AI' | 'تحرير بشري';
  url: string;
  isNew?: boolean;
  qualityScore?: number;
  category?: string;
}

interface DeepAnalysisWidgetProps {
  insights: DeepInsight[];
}

export default function DeepAnalysisWidget({ insights }: DeepAnalysisWidgetProps) {
  console.log('[DeepAnalysisWidget] Received insights:', insights);
  console.log('[DeepAnalysisWidget] Insights length:', insights?.length);
  console.log('[DeepAnalysisWidget] First insight:', insights?.[0]);
  
  // تحقق من أن المكون يتم عرضه
  useEffect(() => {
    console.log('[DeepAnalysisWidget] Component mounted with insights:', insights);
  }, []);
  
  const darkMode = false; // تم تعطيل الوضع الليلي
  const { recordInteraction } = useInteractions();
  
  // التحقق من حالة تسجيل الدخول
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsAuthenticated(!!userId && userId !== 'anonymous');
  }, []);

  const [readItems, setReadItems] = useState<string[]>([]);
  
  // حل بديل مؤقت: استخدام localStorage مباشرة
  const [localLikes, setLocalLikes] = useState<string[]>([]);
  const [localSaves, setLocalSaves] = useState<string[]>([]);
  
  // تحميل البيانات من localStorage عند التحميل
  useEffect(() => {
    const loadLocalData = () => {
      try {
        const likes = localStorage.getItem('deep_analysis_likes');
        const saves = localStorage.getItem('deep_analysis_saves');
        if (likes) setLocalLikes(JSON.parse(likes));
        if (saves) setLocalSaves(JSON.parse(saves));
      } catch (e) {
        console.error('[DeepAnalysisWidget] خطأ في تحميل البيانات المحلية:', e);
      }
    };
    loadLocalData();
  }, []);
  
  // دوال مساعدة للتحقق من الحالة
  const isLiked = (id: string) => localLikes.includes(id);
  const isSaved = (id: string) => localSaves.includes(id);

  useEffect(() => {
    // قراءة العناصر المقروءة من localStorage
    const read = localStorage.getItem('readAnalysis');
    if (read) {
      setReadItems(JSON.parse(read));
    }
  }, []);

  const handleSave = (id: string) => {
    console.log(`[DeepAnalysisWidget] handleSave clicked for id: ${id}`);
    
    const userId = localStorage.getItem('userId') || 'anonymous';
    
    // إذا كان المستخدم غير مسجل، نعرض رسالة واحدة فقط
    if (userId === 'anonymous') {
      toast('سجل دخولك للاحتفاظ بمحفوظاتك', {
        duration: 4000,
        icon: '🔐',
        style: {
          background: '#8b5cf6',
          color: '#fff',
        }
      });
      return; // نوقف التنفيذ هنا
    }
    
    // تحديث الحالة المحلية فقط للمستخدمين المسجلين
    const newSaves = isSaved(id) 
      ? localSaves.filter(item => item !== id)
      : [...localSaves, id];
    
    setLocalSaves(newSaves);
    localStorage.setItem('deep_analysis_saves', JSON.stringify(newSaves));
    
    if (!isSaved(id)) {
      toast.success('تم حفظ التحليل');
    } else {
      toast.success('تم إلغاء الحفظ');
    }
    
    // سجل تفاعل الحفظ
    recordInteraction({
      userId: userId,
      articleId: id,
      interactionType: 'save'
    }).then(() => {
      console.log(`[DeepAnalysisWidget] سجلت تفاعل حفظ للمقالة ${id}`);
    }).catch(error => {
      console.error('[DeepAnalysisWidget] خطأ في تسجيل تفاعل الحفظ:', error);
      toast.error('حدث خطأ في تسجيل التفاعل');
    });
  };

  const handleLike = (id: string) => {
    console.log(`[DeepAnalysisWidget] handleLike clicked for id: ${id}`);
    console.log('[DeepAnalysisWidget] Current userId:', localStorage.getItem('userId'));
    
    const userId = localStorage.getItem('userId') || 'anonymous';
    
    // إذا كان المستخدم غير مسجل، نعرض رسالة واحدة فقط
    if (userId === 'anonymous') {
      toast('سجل دخولك للاحتفاظ بتفاعلاتك', {
        duration: 4000,
        icon: '🔐',
        style: {
          background: '#3b82f6',
          color: '#fff',
        }
      });
      return; // نوقف التنفيذ هنا
    }
    
    // تحديث الحالة المحلية فقط للمستخدمين المسجلين
    const newLikes = isLiked(id) 
      ? localLikes.filter(item => item !== id)
      : [...localLikes, id];
    
    setLocalLikes(newLikes);
    localStorage.setItem('deep_analysis_likes', JSON.stringify(newLikes));
    console.log('[DeepAnalysisWidget] Updated likes:', newLikes);
    
    if (!isLiked(id)) {
      toast.success('تم الإعجاب بالتحليل', { icon: '💙' });
    } else {
      toast.success('تم إلغاء الإعجاب');
    }
    
    // سجل تفاعل الإعجاب عبر API
    recordInteraction({
      userId: userId,
      articleId: id,
      interactionType: 'like'
    })
      .then((result) => {
        console.log(`[DeepAnalysisWidget] سجلت تفاعل إعجاب للمقالة ${id}`, result);
      })
      .catch(err => {
        console.error('[DeepAnalysisWidget] خطأ في تسجيل التفاعل:', err);
        toast.error('حدث خطأ في تسجيل التفاعل');
      });
  };

  const handleShare = (item: DeepInsight) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.summary,
        url: window.location.origin + item.url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + item.url);
      toast.success('تم نسخ الرابط');
    }
  };

  const markAsRead = (id: string) => {
    const newReadItems = [...readItems, id];
    setReadItems(newReadItems);
    localStorage.setItem('readAnalysis', JSON.stringify(newReadItems));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
    }
  };

  const truncateAuthor = (author: string) => {
    if (author.length > 15) {
      return author.substring(0, 15) + '...';
    }
    return author;
  };

  // تحديد ما إذا كان التحليل جديد (خلال آخر 24 ساعة)
  const isNewInsight = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    return diffInHours < 24;
  };

  // اختيار الأيقونة بناءً على نوع التحليل
  const getInsightIcon = (category?: string) => {
    switch(category?.toLowerCase()) {
      case 'research':
      case 'أبحاث':
        return '🧠';
      case 'report':
      case 'تقارير':
        return '📊';
      case 'global':
      case 'عالمي':
        return '🌍';
      case 'tech':
      case 'تقنية':
        return '💻';
      case 'economy':
      case 'اقتصاد':
        return '💰';
      default:
        return '📈';
    }
  };

  return (
    <TooltipProvider>
      <div id="deep-analysis-highlight" className="py-6 md:py-8 relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
        {/* تمت إزالة الطبقات الزخرفية لمنع أي تفتيح غير مرغوب */}
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* العنوان والوصف */}
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 flex items-center justify-center gap-3 text-white">
              <Brain className="w-8 h-8 text-blue-300" />
              التحليل العميق من سبق
            </h2>
            <p className="text-lg text-gray-100/90">
              رؤى استراتيجية ودراسات معمقة بالذكاء الاصطناعي والخبرة البشرية
            </p>
          </div>

          {/* البطاقات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {insights.map((item) => {
              const isUnread = !readItems.includes(item.id);
              const isAI = item.type === 'AI';
              const isNew = isNewInsight(item.createdAt);
              
              return (
                <div 
                  key={item.id} 
                  className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-2 group bg-white backdrop-blur-lg border border-gray-200 shadow-lg hover:shadow-xl"
                >
                  <div className="p-6">
                    {/* مؤشر جديد - نقطة حمراء صغيرة */}
                    {isNew && (
                      <div className="absolute top-4 left-4">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      </div>
                    )}

                    {/* الشريط العلوي مع الأيقونة الدلالية */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        {/* أيقونة دلالية */}
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-gradient-to-br from-blue-100 to-purple-100 shadow-sm">
                          {getInsightIcon(item.category)}
                        </div>
                        
                        {/* بادج تحليل عميق - محدث بتدرج ناعم */}
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-300 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm">
                          تحليل عميق
                        </span>
                        
                        {isAI && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors duration-300 bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm">
                            AI
                          </span>
                        )}
                      </div>
                    </div>

                    {/* العنوان */}
                    <h3 className="font-bold text-xl leading-tight mb-3 line-clamp-2 text-gray-900">
                      {item.title}
                    </h3>

                    {/* الوسوم */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* الإحصائيات - مبسطة */}
                    <div className="flex items-center justify-between text-sm mb-5 text-gray-600">
                      <span className="flex items-center gap-2">
                        <Clock3 className="w-4 h-4 text-gray-500" /> 
                        {item.readTime} دقيقة • {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {/* زر القراءة وأزرار التفاعل في سطر واحد */}
                    <div className="flex items-center justify-between gap-3">
                      {/* عناصر التفاعل - محاذاة يمين */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleShare(item)}
                          className="p-1.5 rounded-lg transition-all duration-300 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-200"
                          title="مشاركة"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleSave(item.id)}
                              className={`p-1.5 rounded-lg transition-all duration-300 border ${
                                isAuthenticated
                                  ? (isSaved(item.id)
                                    ? 'text-purple-600 bg-purple-100 border-purple-300' 
                                    : 'text-gray-600 hover:text-purple-600 bg-gray-100 hover:bg-purple-100 border-gray-200')
                                  : 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                              }`}
                              title="حفظ"
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${
                                isSaved(item.id) ? 'fill-current' : ''
                              }`} />
                            </button>
                          </TooltipTrigger>
                          {!isAuthenticated && (
                            <TooltipContent>
                              <p>سجل دخولك للاحتفاظ بمحفوظاتك</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleLike(item.id)}
                              id={`like-btn-${item.id}`}
                              data-testid={`like-btn-${item.id}`}
                              className={`p-1.5 rounded-lg transition-all duration-300 border ${
                                isAuthenticated
                                  ? (isLiked(item.id)
                                    ? 'text-red-500 bg-red-100 border-red-300' 
                                    : 'text-gray-600 hover:text-red-500 bg-gray-100 hover:bg-red-100 border-gray-200')
                                  : 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                              }`}
                              title="إعجاب"
                            >
                              <Heart className={`w-3.5 h-3.5 ${
                                isLiked(item.id) ? 'fill-current' : ''
                              }`} />
                            </button>
                          </TooltipTrigger>
                          {!isAuthenticated && (
                            <TooltipContent>
                              <p>سجل دخولك للاحتفاظ بتفاعلاتك</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </div>

                      {/* زر القراءة - أصغر ومحاذاة يسار */}
                      <a href={item.url} onClick={() => markAsRead(item.id)} className="flex-shrink-0">
                        <button className="py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm hover:shadow-md">
                          <span>اقرأ التحليل</span>
                          <Brain className="w-3.5 h-3.5" />
                        </button>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* زر استكشاف المزيد */}
          <div className="text-center">
            <a href="/insights/deep" className="inline-block">
              <button className="px-8 py-3 rounded-xl font-medium text-base transition-all duration-300 transform hover:scale-105 flex items-center gap-2 bg-gradient-to-r from-blue-600/70 to-purple-600/70 hover:from-blue-600 hover:to-purple-700 text-white border border-transparent hover:border-white/40 shadow-xl hover:shadow-2xl">
                <Search className="w-5 h-5" />
                استكشف جميع التحليلات العميقة
              </button>
            </a>
          </div>
          
          {/* نص إضافي */}
          <div className="text-center mt-6">
            <p className="text-sm text-blue-200/60">
              • يتم تحديث تحليلات جديدة يومياً
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
} 