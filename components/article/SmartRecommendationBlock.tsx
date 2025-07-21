import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Brain, 
  Heart, 
  MessageCircle, 
  Lightbulb, 
  ArrowRight, 
  Eye,
  Calendar,
  User,
  Tag,
  TrendingUp,
  Sparkles,
  BookOpen,
  FileText
} from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'similar' | 'analysis' | 'opinion' | 'question' | 'tip';
  title: string;
  description?: string;
  link?: string;
  author?: string;
  date?: string;
  category?: string;
  views?: number;
  tags?: string[];
}

interface SmartRecommendationBlockProps {
  articleId: string;
  category?: string;
  tags?: string[];
  className?: string;
}

export default function SmartRecommendationBlock({
  articleId,
  category,
  tags = [],
  className = ""
}: SmartRecommendationBlockProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [articleId, category]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      // محاكاة جلب التوصيات من مصادر مختلفة
      const mockRecommendations: Recommendation[] = [
        // أخبار مشابهة
        {
          id: '1',
          type: 'similar',
          title: 'تطورات جديدة في نفس السياق',
          description: 'مقال يكمل هذا الموضوع بتفاصيل إضافية ومعلومات حديثة',
          link: '/article/similar-1',
          author: 'محمد أحمد',
          date: 'منذ ساعتين',
          category: category || 'أخبار',
          views: 1250
        },
        // تحليل عميق
        {
          id: '2',
          type: 'analysis',
          title: 'تحليل عميق: خلفيات الموضوع وتداعياته',
          description: 'دراسة شاملة تحلل الموضوع من جوانب متعددة مع استشراف المستقبل',
          link: '/insights/deep-analysis-1',
          author: 'د. سارة المطيري',
          date: 'أمس',
          views: 890
        },
        // مقال رأي
        {
          id: '3',
          type: 'opinion',
          title: 'وجهة نظر: ما الذي يعنيه هذا حقاً؟',
          description: 'رؤية تحليلية من كاتب رأي حول تأثيرات الموضوع على المجتمع',
          link: '/opinion/perspective-1',
          author: 'أحمد الكاتب',
          date: 'منذ يوم',
          category: 'رأي',
          views: 670
        },
        // سؤال تفاعلي
        {
          id: '4',
          type: 'question',
          title: 'ما رأيك في التطورات الأخيرة؟',
          description: 'شاركنا وجهة نظرك حول هذا الموضوع المهم'
        },
        // نصيحة ذكية
        {
          id: '5',
          type: 'tip',
          title: 'نصيحة ذكية: كيف تتابع هذا الموضوع',
          description: 'اشترك في تنبيهات هذا التصنيف لتكون أول من يعرف بالتطورات الجديدة'
        }
      ];

      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('خطأ في جلب التوصيات:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeConfig = (type: string) => {
    switch (type) {
      case 'similar':
        return {
          icon: <FileText className="w-3 h-3" />,
          text: 'مشابه',
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text_color: 'text-blue-600 dark:text-blue-400'
        };
      case 'analysis':
        return {
          icon: <Brain className="w-3 h-3" />,
          text: 'تحليل عميق',
          bg: 'bg-purple-100 dark:bg-purple-900/30',
          text_color: 'text-purple-600 dark:text-purple-400'
        };
      case 'opinion':
        return {
          icon: <Heart className="w-3 h-3" />,
          text: 'رأي',
          bg: 'bg-red-100 dark:bg-red-900/30',
          text_color: 'text-red-600 dark:text-red-400'
        };
      case 'question':
        return {
          icon: <MessageCircle className="w-3 h-3" />,
          text: 'سؤال تفاعلي',
          bg: 'bg-green-100 dark:bg-green-900/30',
          text_color: 'text-green-600 dark:text-green-400'
        };
      case 'tip':
        return {
          icon: <Lightbulb className="w-3 h-3" />,
          text: 'نصيحة ذكية',
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text_color: 'text-yellow-600 dark:text-yellow-400'
        };
      default:
        return {
          icon: <Sparkles className="w-3 h-3" />,
          text: 'توصية',
          bg: 'bg-gray-100 dark:bg-gray-800',
          text_color: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'ك';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-600 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-600 ${className}`}>
      {/* العنوان */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
            محتوى مخصص لك
          </h3>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-indigo-200 to-transparent dark:from-indigo-700"></div>
      </div>

      {/* التوصيات */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const badge = getBadgeConfig(rec.type);
          
          return (
            <div
              key={rec.id}
              className="group relative bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-300"
            >
              {/* شارة النوع */}
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium mb-3 ${badge.bg} ${badge.text_color}`}>
                {badge.icon}
                <span>{badge.text}</span>
              </div>

              {/* المحتوى */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {rec.title}
                </h4>
                
                {rec.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {rec.description}
                  </p>
                )}

                {/* معلومات إضافية */}
                {(rec.author || rec.date || rec.views) && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-600">
                    {rec.author && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{rec.author}</span>
                      </div>
                    )}
                    {rec.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{rec.date}</span>
                      </div>
                    )}
                    {rec.views && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatNumber(rec.views)} مشاهدة</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* رابط */}
              {rec.link ? (
                <Link 
                  href={rec.link}
                  className="absolute inset-0 z-10"
                  aria-label={`اقرأ: ${rec.title}`}
                />
              ) : rec.type === 'question' ? (
                <button 
                  onClick={() => {
                    // يمكن إضافة منطق فتح نموذج السؤال هنا
                    console.log('فتح سؤال تفاعلي');
                  }}
                  className="absolute inset-0 z-10"
                  aria-label={rec.title}
                />
              ) : null}

              {/* سهم التوجيه */}
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-4 h-4 text-indigo-500 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* رابط عرض المزيد */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <Link
          href="/for-you"
          className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>استكشف المزيد من المحتوى المخصص لك</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
} 