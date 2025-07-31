'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Lightbulb, 
  Brain, 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  TrendingUp,
  Users,
  ArrowLeft,
  Star
} from 'lucide-react';

interface Corner {
  id: string;
  name: string;
  slug: string;
  author_name: string;
  description: string;
  cover_image: string;
  category_name: string;
  articles_count: number;
  followers_count: number;
  is_featured: boolean;
  created_at: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  author_name: string;
  corner_name: string;
  corner_slug: string;
  read_time: number;
  ai_sentiment: string;
  ai_compatibility_score: number;
  view_count: number;
  created_at: string;
}

export default function MuqtarabHomePage() {
  const router = useRouter();
  const [featuredCorners, setFeaturedCorners] = useState<Corner[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // محاكاة جلب البيانات (سيتم استبدالها بـ APIs حقيقية)
      const mockCorners: Corner[] = [
        {
          id: '1',
          name: 'زاوية أحمد الرحالة',
          slug: 'ahmed-rahala',
          author_name: 'أحمد الرحالة',
          description: 'زاوية تحليلية مختصة في الشؤون الاقتصادية والاجتماعية',
          cover_image: '/images/placeholder.jpg',
          category_name: 'تحليل',
          articles_count: 15,
          followers_count: 1240,
          is_featured: true,
          created_at: '2024-01-15'
        },
        {
          id: '2',
          name: 'كتابات سارة',
          slug: 'sara-writings',
          author_name: 'سارة أحمد',
          description: 'مقالات متنوعة في الثقافة والمجتمع',
          cover_image: '/images/placeholder.jpg',
          category_name: 'ثقافة',
          articles_count: 22,
          followers_count: 890,
          is_featured: true,
          created_at: '2024-01-10'
        }
      ];

      const mockArticles: Article[] = [
        {
          id: '1',
          title: 'مستقبل الذكاء الاصطناعي في الصحافة العربية',
          slug: 'ai-future-arabic-journalism',
          excerpt: 'نظرة على كيفية تأثير الذكاء الاصطناعي على مستقبل الصحافة والإعلام في العالم العربي...',
          cover_image: '/images/ai-future.jpg',
          author_name: 'أحمد الرحالة',
          corner_name: 'زاوية أحمد الرحالة',
          corner_slug: 'ahmed-rahala',
          read_time: 8,
          ai_sentiment: 'تحليلي',
          ai_compatibility_score: 87,
          view_count: 1520,
          created_at: '2024-01-20'
        },
        {
          id: '2',
          title: 'رحلة في عالم الكتابة الإبداعية',
          slug: 'creative-writing-journey',
          excerpt: 'تجربة شخصية في عالم الكتابة الإبداعية ونصائح للكتّاب الناشئين...',
          cover_image: '/images/placeholder.jpg',
          author_name: 'سارة أحمد',
          corner_name: 'كتابات سارة',
          corner_slug: 'sara-writings',
          read_time: 6,
          ai_sentiment: 'إلهامي',
          ai_compatibility_score: 92,
          view_count: 980,
          created_at: '2024-01-18'
        }
      ];

      setFeaturedCorners(mockCorners);
      setRecentArticles(mockArticles);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    const icons = {
      'ساخر': '😏',
      'تأملي': '🤔',
      'عاطفي': '❤️',
      'تحليلي': '🔍',
      'إلهامي': '✨'
    };
    return icons[sentiment as keyof typeof icons] || '📝';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Lightbulb className="w-12 h-12 animate-pulse mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">جاري تحميل منصة مُقترَب...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900" dir="rtl">
      {/* الهيدر */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">مُقترَب</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">حيث يلتقي الفكر بالتقنية بالأسلوب</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* البحث */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="البحث في الزوايا والمقالات الإبداعية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-12 text-lg py-3"
              />
            </div>
          </CardContent>
        </Card>

        {/* الزوايا المميزة */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الزوايا المميزة</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredCorners.map((corner) => (
              <Card 
                key={corner.id}
                className="hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => router.push(`/muqtarab/${corner.slug}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl">
                      {corner.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{corner.name}</h3>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          مميز
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{corner.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{corner.followers_count} متابع</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{corner.articles_count} مقال</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          بقلم: <span className="font-medium">{corner.author_name}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* المقالات الحديثة */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">المقالات الحديثة</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recentArticles.map((article) => (
              <Card 
                key={article.id}
                className="hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => router.push(`/muqtarab/${article.corner_slug}/${article.slug}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg">
                      {getSentimentIcon(article.ai_sentiment)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          {article.ai_sentiment}
                        </Badge>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          💡 {article.ai_compatibility_score}% متوافق
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{article.read_time} دقائق</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{article.view_count}</span>
                          </div>
                        </div>
                        <span>{formatDate(article.created_at)}</span>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          في زاوية: <span className="font-medium text-blue-600">{article.corner_name}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* دعوة للمشاركة */}
        <Card className="mt-12 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <CardContent className="p-8 text-center">
            <Lightbulb className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h3 className="text-2xl font-bold mb-2">انضم إلى مُقترَب</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              شارك أفكارك الإبداعية واكتشف محتوى مخصص بناءً على اهتماماتك. 
              منصة مُقترَب تجمع بين الفكر والتقنية لتقدم لك تجربة قراءة فريدة.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                variant="secondary"
                onClick={() => router.push('/register')}
              >
                إنشاء حساب
              </Button>
              <Button 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => router.push('/login')}
              >
                تسجيل الدخول
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}