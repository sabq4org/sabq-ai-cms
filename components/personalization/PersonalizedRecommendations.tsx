"use client";

/**
 * مكون التوصيات المخصصة بناءً على سلوك المستخدم
 */

import React, { useState, useEffect } from 'react';
import { Eye, Clock, TrendingUp, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Recommendation {
  contentId: string;
  score: number;
  reason: string;
  category: string;
}

interface UserInterest {
  category: string;
  score: number;
  lastInteraction: string;
  interactionCount: number;
}

interface BehaviorPatterns {
  peakActivityHours: number[];
  preferredContentTypes: string[];
  averageSessionDuration: number;
  totalInteractions: number;
  lastActivity: string | null;
}

interface RecommendationsData {
  recommendations: Recommendation[];
  userInterests: UserInterest[];
  behaviorPatterns: BehaviorPatterns;
  generatedAt: string;
  totalRecommendations: number;
}

interface PersonalizedRecommendationsProps {
  userId: string;
  limit?: number;
  className?: string;
  showInsights?: boolean;
}

export default function PersonalizedRecommendations({
  userId,
  limit = 10,
  className = '',
  showInsights = true
}: PersonalizedRecommendationsProps) {
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    }
  }, [userId, limit]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/behavior/recommendations/${userId}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('فشل في جلب التوصيات');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'حدث خطأ غير معروف');
      }
    } catch (err) {
      console.error('خطأ في جلب التوصيات:', err);
      setError('فشل في تحميل التوصيات');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 15) return 'text-green-600 bg-green-100';
    if (score >= 10) return 'text-blue-600 bg-blue-100';
    if (score >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const formatActivityHour = (hour: number) => {
    const period = hour >= 12 ? 'م' : 'ص';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour} ${period}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} دقيقة`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours} ساعة${remainingMinutes > 0 ? ` و ${remainingMinutes} دقيقة` : ''}`;
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={fetchRecommendations}
          className="text-red-700 underline text-sm mt-2 hover:no-underline"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!data || data.recommendations.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد توصيات متاحة</h3>
        <p className="text-gray-600 text-sm">
          تفاعل مع المحتوى أكثر للحصول على توصيات مخصصة
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* عنوان القسم */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          مخصص لك
        </h2>
        <span className="text-sm text-gray-500">
          {data.totalRecommendations} توصية
        </span>
      </div>

      {/* التوصيات */}
      <div className="grid gap-4">
        {data.recommendations.map((recommendation, index) => (
          <RecommendationCard 
            key={`${recommendation.contentId}-${index}`}
            recommendation={recommendation}
            index={index}
          />
        ))}
      </div>

      {/* رؤى السلوك */}
      {showInsights && data.behaviorPatterns && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            رؤى حول نشاطك
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* أوقات النشاط */}
            {data.behaviorPatterns.peakActivityHours.length > 0 && (
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  أوقات نشاطك المفضلة
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {data.behaviorPatterns.peakActivityHours.map((hour, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {formatActivityHour(hour)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* إحصائيات النشاط */}
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-600" />
                إحصائيات نشاطك
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">متوسط مدة الجلسة:</span>
                  <span className="font-medium">
                    {formatDuration(data.behaviorPatterns.averageSessionDuration)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">إجمالي التفاعلات:</span>
                  <span className="font-medium">
                    {data.behaviorPatterns.totalInteractions.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* اهتماماتك */}
          {data.userInterests.length > 0 && (
            <div className="mt-4 bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-3">اهتماماتك الرئيسية</h4>
              <div className="flex gap-2 flex-wrap">
                {data.userInterests.slice(0, 6).map((interest, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm"
                  >
                    <span className="font-medium">{interest.category}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getScoreColor(interest.score)}`}>
                      {Math.round(interest.score)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* معلومات التحديث */}
      <div className="text-center text-xs text-gray-500">
        آخر تحديث: {new Date(data.generatedAt).toLocaleString('ar-SA')}
      </div>
    </div>
  );
}

// مكون بطاقة التوصية
function RecommendationCard({ 
  recommendation, 
  index 
}: { 
  recommendation: Recommendation; 
  index: number;
}) {
  const [articleData, setArticleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب بيانات المقال (يمكن تحسين هذا بجلب البيانات مع التوصيات)
    fetchArticleData();
  }, [recommendation.contentId]);

  const fetchArticleData = async () => {
    try {
      // هذا مثال - يجب تعديله حسب API المقالات الفعلي
      const response = await fetch(`/api/articles/${recommendation.contentId}`);
      if (response.ok) {
        const data = await response.json();
        setArticleData(data);
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المقال:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
              {articleData?.title || `مقال رقم ${recommendation.contentId}`}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {recommendation.reason}
            </p>
            {articleData?.excerpt && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                {articleData.excerpt}
              </p>
            )}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ml-3 ${
            recommendation.score >= 15 ? 'bg-green-100 text-green-800' :
            recommendation.score >= 10 ? 'bg-blue-100 text-blue-800' :
            recommendation.score >= 5 ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {Math.round(recommendation.score)}%
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">
              {recommendation.category}
            </span>
            {articleData?.created_at && (
              <span>
                {new Date(articleData.created_at).toLocaleDateString('ar-SA')}
              </span>
            )}
          </div>
          
          <Link 
            href={`/article/${recommendation.contentId}`}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={() => {
              // تتبع النقر على التوصية
              if (window.behaviorTracker) {
                window.behaviorTracker.awardLoyaltyPoints('related_articles_click', recommendation.contentId);
              }
            }}
          >
            اقرأ المزيد
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
