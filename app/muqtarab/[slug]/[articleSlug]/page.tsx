'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, User, Calendar, Eye, Heart, Share2, BookmarkPlus,
  Clock, Sparkles, Bell, BellOff, MessageCircle, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  author_name: string;
  published_at: string;
  read_time: number;
  views: number;
  likes: number;
  shares: number;
  ai_summary: string;
  ai_compatibility_score?: number;
  ai_sentiment: string;
  ai_keywords: string[];
  tags: string[];
  corner: {
    id: string;
    name: string;
    slug: string;
    author_name: string;
    followers_count: number;
  };
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (params.slug && params.articleSlug) {
      fetchArticle();
    }
  }, [params.slug, params.articleSlug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/muqtarab/corners/${params.slug}/articles/${params.articleSlug}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setArticle(data.article);
        
        // تسجيل مشاهدة المقال
        fetch(`/api/muqtarab/articles/${data.article.id}/view`, {
          method: 'POST'
        }).catch(console.error);
      }
    } catch (error) {
      console.error('خطأ في جلب المقال:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!article) return;
    
    try {
      const response = await fetch(`/api/muqtarab/articles/${article.id}/like`, {
        method: hasLiked ? 'DELETE' : 'POST'
      });
      
      if (response.ok) {
        setHasLiked(!hasLiked);
        setArticle(prev => prev ? {
          ...prev,
          likes: hasLiked ? prev.likes - 1 : prev.likes + 1
        } : prev);
      }
    } catch (error) {
      console.error('خطأ في الإعجاب:', error);
    }
  };

  const handleBookmark = async () => {
    if (!article) return;
    
    try {
      const response = await fetch(`/api/muqtarab/articles/${article.id}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST'
      });
      
      if (response.ok) {
        setIsBookmarked(!isBookmarked);
      }
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
    }
  };

  const handleFollow = async () => {
    if (!article) return;
    
    try {
      const response = await fetch(`/api/muqtarab/corners/${article.corner.id}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST'
      });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('خطأ في المتابعة:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href
        });
      } catch (error) {
        // Fallback للمتصفحات التي لا تدعم Web Share API
        navigator.clipboard.writeText(window.location.href);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSentimentEmoji = (sentiment: string) => {
    const sentiments: { [key: string]: string } = {
      'ساخر': '😏',
      'تأملي': '🤔',
      'عاطفي': '❤️',
      'تحليلي': '🔍',
      'إلهامي': '✨',
      'إيجابي': '😊',
      'سلبي': '😔',
      'محايد': '😐'
    };
    return sentiments[sentiment] || '📝';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            المقال غير موجود
          </h2>
          <Button onClick={() => router.back()}>
            العودة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} dir="rtl">
      {/* شريط التنقل */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <Link href="/muqtarab" className="hover:text-blue-600">
                مقترب
              </Link>
              <span className="mx-2">/</span>
              <Link 
                href={`/muqtarab/${article.corner.slug}`}
                className="hover:text-blue-600"
              >
                {article.corner.name}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* رأس المقال */}
        <div className="mb-8">
          {/* الصورة المميزة */}
          {article.cover_image && (
            <div className="relative h-96 rounded-2xl overflow-hidden mb-8">
              <Image
                src={article.cover_image}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          
          {/* العنوان والمعلومات */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {article.title}
            </h1>
            
            {article.excerpt && (
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                {article.excerpt}
              </p>
            )}
            
            {/* معلومات المقال */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-medium">{article.author_name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(article.published_at)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{article.read_time} دقائق قراءة</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{article.views} مشاهدة</span>
              </div>
              
              {article.ai_sentiment && (
                <div className="flex items-center gap-2">
                  <span>{getSentimentEmoji(article.ai_sentiment)}</span>
                  <span>{article.ai_sentiment}</span>
                </div>
              )}
            </div>
            
            {/* مؤشر التوافق */}
            {article.ai_compatibility_score && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-bold text-blue-600 text-lg">
                      هذا المقال يلائم ذوقك بنسبة {article.ai_compatibility_score}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      بناءً على اهتماماتك وقراءاتك السابقة
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* أزرار التفاعل */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                onClick={handleLike}
                variant={hasLiked ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                <span>{article.likes}</span>
              </Button>
              
              <Button
                onClick={handleBookmark}
                variant={isBookmarked ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <BookmarkPlus className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                حفظ
              </Button>
              
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                مشاركة
              </Button>
              
              <Button
                onClick={handleFollow}
                variant={isFollowing ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                {isFollowing ? (
                  <BellOff className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                {isFollowing ? 'إلغاء متابعة' : 'متابعة'} {article.corner.name}
              </Button>
            </div>
          </div>
        </div>
        
        {/* محتوى المقال */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <div 
            dangerouslySetInnerHTML={{ __html: article.content }}
            className="leading-relaxed"
          />
        </div>
        
        {/* ملخص الذكاء الاصطناعي */}
        {article.ai_summary && (
          <Card className="mb-8 border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Sparkles className="w-5 h-5" />
                ملخص الذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {article.ai_summary}
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* الكلمات المفتاحية والتصنيفات */}
        {(article.ai_keywords.length > 0 || article.tags.length > 0) && (
          <div className="space-y-4 mb-8">
            {article.ai_keywords.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  الكلمات المفتاحية:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.ai_keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {article.tags.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  التصنيفات:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* معلومات الزاوية */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-2">
                  المزيد من {article.corner.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  اكتشف المزيد من المقالات المميزة بقلم {article.corner.author_name}
                </p>
                <div className="text-sm text-gray-500">
                  {article.corner.followers_count} متابع
                </div>
              </div>
              
              <Link href={`/muqtarab/${article.corner.slug}`}>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  زيارة الزاوية
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}