'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, User, TrendingUp, Lightbulb, FileText, Eye, Edit } from 'lucide-react';

interface SmartRecommendation {
  id: string;
  title: string;
  summary?: string;
  slug: string;
  type: 'news' | 'analysis' | 'opinion' | 'question' | 'tip';
  badge: string;
  featuredImage?: string;
  author?: string;
  readTime?: number;
  views?: number;
  category?: string;
  publishedAt?: string;
}

interface SmartRecommendationBlockProps {
  articleId: string;
  className?: string;
}

// بيانات تجريبية متنوعة
const mockRecommendations: SmartRecommendation[] = [
  {
    id: '1',
    title: 'السعودية تعلن عن مشروع جديد للطاقة المتجددة في نيوم',
    summary: 'مشروع طموح يهدف لإنتاج 9 جيجاواط من الطاقة الشمسية',
    slug: 'neom-renewable-energy-project',
    type: 'news',
    badge: 'أخبار مشابهة',
    featuredImage: '/images/news-placeholder.jpg',
    author: 'أحمد السعيد',
    readTime: 3,
    views: 1250,
    category: 'طاقة',
    publishedAt: '2025-01-12T10:30:00Z'
  },
  {
    id: '2',
    title: 'تحليل: مستقبل الذكاء الاصطناعي في القطاع المصرفي السعودي',
    slug: 'ai-banking-sector-analysis',
    type: 'analysis',
    badge: 'تحليل عميق',
    author: 'د. فاطمة النجار',
    readTime: 8,
    category: 'تقنية'
  },
  {
    id: '3',
    title: 'التحول الرقمي في التعليم: فرص ومخاطر',
    summary: 'نظرة شاملة على تأثير التكنولوجيا على منظومة التعليم',
    slug: 'digital-transformation-education',
    type: 'news',
    badge: 'أخبار مشابهة',
    featuredImage: '/images/education-tech.jpg',
    author: 'سارة الحربي',
    readTime: 5,
    views: 890,
    category: 'تعليم',
    publishedAt: '2025-01-12T08:15:00Z'
  },
  {
    id: '4',
    title: 'رأي: هل نحن مستعدون للثورة التكنولوجية القادمة؟',
    slug: 'tech-revolution-opinion',
    type: 'opinion',
    badge: 'مقال رأي',
    author: 'خالد المنصوري',
    readTime: 6,
    category: 'رأي'
  },
  {
    id: '5',
    title: 'الاستثمار في البنية التحتية الرقمية يحقق نمواً اقتصادياً مستداماً',
    summary: 'دراسة حديثة تكشف عن تأثير الاستثمار التقني على الاقتصاد',
    slug: 'digital-infrastructure-investment',
    type: 'news',
    badge: 'أخبار مشابهة',
    featuredImage: '/images/digital-infrastructure.jpg',
    author: 'نور العتيبي',
    readTime: 4,
    views: 567,
    category: 'اقتصاد',
    publishedAt: '2025-01-12T06:45:00Z'
  },
  {
    id: '6',
    title: 'تحليل متعمق: الأمن السيبراني في عصر إنترنت الأشياء',
    slug: 'cybersecurity-iot-analysis',
    type: 'analysis',
    badge: 'تحليل عميق',
    author: 'د. محمد الزهراني',
    readTime: 10,
    category: 'أمن معلومات'
  },
  {
    id: '7',
    title: 'مبادرة جديدة لدعم الشركات الناشئة في مجال التقنية المالية',
    summary: 'صندوق استثماري بقيمة 500 مليون ريال لدعم الفنتك',
    slug: 'fintech-startup-initiative',
    type: 'news',
    badge: 'أخبار مشابهة',
    featuredImage: '/images/fintech-startups.jpg',
    author: 'ريم الشهري',
    readTime: 3,
    views: 1100,
    category: 'مالية',
    publishedAt: '2025-01-12T14:20:00Z'
  },
  {
    id: '8',
    title: 'رأي: التوازن بين الابتكار والخصوصية في العصر الرقمي',
    slug: 'innovation-privacy-balance',
    type: 'opinion',
    badge: 'مقال رأي',
    author: 'أمل القحطاني',
    readTime: 7,
    category: 'تقنية'
  }
];

const getBadgeIcon = (type: string) => {
  switch (type) {
    case 'news':
      return '📰';
    case 'analysis':
      return '🧠';
    case 'opinion':
      return '✍️';
    case 'question':
      return '💬';
    case 'tip':
      return '💡';
    default:
      return '📝';
  }
};

const getBadgeColor = (type: string) => {
  switch (type) {
    case 'news':
      return 'bg-blue-100 text-blue-800';
    case 'analysis':
      return 'bg-purple-100 text-purple-800';
    case 'opinion':
      return 'bg-green-100 text-green-800';
    case 'question':
      return 'bg-orange-100 text-orange-800';
    case 'tip':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatTimeAgo = (dateString?: string) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'الآن';
  if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `منذ ${diffInDays} يوم`;
};

// مكون البطاقة الكاملة
const RecommendationCard: React.FC<{ recommendation: SmartRecommendation }> = ({ recommendation }) => (
  <Link href={`/article/${recommendation.slug}`} className="group block">
    <article className="recommendation-card bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-200">
      {recommendation.featuredImage && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={recommendation.featuredImage}
            alt={recommendation.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(recommendation.type)}`}>
              <span className="ml-1">{getBadgeIcon(recommendation.type)}</span>
              {recommendation.badge}
            </span>
          </div>
        </div>
      )}
      
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors">
          {recommendation.title}
        </h3>
        
        {recommendation.summary && (
          <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
            {recommendation.summary}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-reverse space-x-4">
            {recommendation.author && (
              <div className="flex items-center">
                <User className="w-3 h-3 ml-1" />
                <span>{recommendation.author}</span>
              </div>
            )}
            {recommendation.readTime && (
              <div className="flex items-center">
                <Clock className="w-3 h-3 ml-1" />
                <span>{recommendation.readTime} دقائق</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-reverse space-x-3">
            {recommendation.views && (
              <div className="flex items-center">
                <Eye className="w-3 h-3 ml-1" />
                <span>{recommendation.views.toLocaleString()}</span>
              </div>
            )}
            {recommendation.publishedAt && (
              <span>{formatTimeAgo(recommendation.publishedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  </Link>
);

// مكون الرابط السريع
const QuickLink: React.FC<{ recommendation: SmartRecommendation }> = ({ recommendation }) => (
  <Link href={`/article/${recommendation.slug}`} className="group block">
    <div className="quick-link bg-gray-50 rounded-lg p-4 border-r-4 border-blue-400 hover:bg-blue-50 hover:border-blue-600 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-lg ml-2">{getBadgeIcon(recommendation.type)}</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(recommendation.type)}`}>
              {recommendation.badge}
            </span>
          </div>
          
          <h4 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-blue-600 transition-colors mb-2">
            {recommendation.title}
          </h4>
          
          <div className="flex items-center space-x-reverse space-x-4 text-xs text-gray-500">
            {recommendation.author && (
              <div className="flex items-center">
                <User className="w-3 h-3 ml-1" />
                <span>{recommendation.author}</span>
              </div>
            )}
            {recommendation.readTime && (
              <div className="flex items-center">
                <Clock className="w-3 h-3 ml-1" />
                <span>{recommendation.readTime} دقائق</span>
              </div>
            )}
            {recommendation.category && (
              <span className="bg-gray-200 px-2 py-1 rounded">{recommendation.category}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center text-blue-600 group-hover:text-blue-800 transition-colors">
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>
    </div>
  </Link>
);

const SmartRecommendationBlock: React.FC<SmartRecommendationBlockProps> = ({ 
  articleId, 
  className = '' 
}) => {
  const renderItem = (recommendation: SmartRecommendation, index: number) => {
    // نمط التبديل: أول 3 بطاقات، ثم 3 روابط، ثم بطاقات، ثم روابط...
    const cyclePosition = index % 6;
    
    // إذا كان الموضع في النصف الثاني من الدورة (3-5) أو كان من نوع الرأي/التحليل، نعرضه كرابط سريع
    if (cyclePosition >= 3 || recommendation.type === 'opinion' || recommendation.type === 'analysis') {
      return (
        <div key={recommendation.id} className="mb-4">
          <QuickLink recommendation={recommendation} />
        </div>
      );
    }
    
    // وإلا نعرضه كبطاقة كاملة
    return (
      <div key={recommendation.id} className="mb-6">
        <RecommendationCard recommendation={recommendation} />
      </div>
    );
  };

  return (
    <section className={`smart-recommendation-block bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* الهيدر مع النص التوضيحي */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <Lightbulb className="w-6 h-6 text-blue-600 ml-2" />
          <h2 className="text-2xl font-bold text-gray-900">محتوى مخصص لك</h2>
        </div>
        <p className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg inline-flex items-center">
          <span className="ml-2">🧠</span>
          يتم توليد هذا المحتوى بناءً على اهتماماتك وتفاعلاتك
        </p>
      </div>

      {/* قائمة التوصيات مع التنويع البصري */}
      <div className="space-y-0">
        {mockRecommendations.map((recommendation, index) => 
          renderItem(recommendation, index)
        )}
      </div>

      {/* رابط عرض المزيد */}
      <div className="text-center mt-8 pt-6 border-t border-gray-200">
        <Link 
          href="/for-you" 
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <FileText className="w-4 h-4 ml-2" />
          عرض المزيد من التوصيات
          <TrendingUp className="w-4 h-4 mr-2" />
        </Link>
      </div>
    </section>
  );
};

export default SmartRecommendationBlock; 