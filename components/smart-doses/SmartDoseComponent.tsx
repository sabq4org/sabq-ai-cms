'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Clock, Share2, Heart, BookmarkPlus, Play, Pause, Volume2, Star, Trophy, Target, Zap, Coffee, Sun, Moon, Sunset } from 'lucide-react';
import { getCurrentTimeSlot, DOSE_TIMING_CONFIGS } from '@/lib/smart-doses/dose-timing';
import { selectBestArticlesForDose } from '@/lib/smart-doses/scoring-system';
import { DOSE_REWARDS_SYSTEM, INTERACTIVE_FEATURES } from '@/lib/smart-doses/user-interaction';
import { assessDoseQuality } from '@/lib/smart-doses/human-review';

interface SmartDoseProps {
  articles: any[];
  userPreferences?: string[];
  userId?: string;
}

export default function SmartDoseComponent({ articles, userPreferences, userId }: SmartDoseProps) {
  const [currentTimeSlot, setCurrentTimeSlot] = useState('morning');
  const [selectedDose, setSelectedDose] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [dailyProgress, setDailyProgress] = useState(0);
  const [showPoll, setShowPoll] = useState(false);
  const [poll, setPoll] = useState<any>(null);

  useEffect(() => {
    const timeSlot = getCurrentTimeSlot();
    setCurrentTimeSlot(timeSlot);
    generateSmartDose(timeSlot);
  }, [articles]);

  const generateSmartDose = (timeSlot: string) => {
    const config = DOSE_TIMING_CONFIGS[timeSlot];
    if (!config) return;

    // اختيار أفضل المقالات باستخدام نظام التقييم
    const { articles: bestArticles, scores } = selectBestArticlesForDose(
      articles,
      timeSlot,
      config.maxItems,
      userPreferences
    );

    // إنشاء ملخص ذكي
    const summary = generateSmartSummary(bestArticles, config);

    // تقييم الجودة
    const doseContent = {
      id: `dose_${Date.now()}`,
      title: getDoseTitle(timeSlot),
      summary,
      articles: bestArticles,
      aiGenerated: true,
      review: {} as any,
      timeSlot,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    const qualityAssessment = assessDoseQuality(doseContent);
    doseContent.review = qualityAssessment;

    setSelectedDose({ ...doseContent, scores });

    // إنشاء استطلاع تفاعلي
    if (Math.random() > 0.7) { // 30% احتمال
      const newPoll = INTERACTIVE_FEATURES.createDailyPoll(doseContent);
      setPoll(newPoll);
      setShowPoll(true);
    }
  };

  const getDoseTitle = (timeSlot: string): string => {
    const titles = {
      morning: '☀️ جرعتك الصباحية - طاقة ونشاط',
      noon: '🎯 جرعة الظهيرة - أهم المستجدات', 
      evening: '🌆 جرعة المساء - تحليل وإلهام',
      night: '🌙 جرعة الليل - هدوء وإيجابية'
    };
    return titles[timeSlot as keyof typeof titles] || titles.morning;
  };

  const generateSmartSummary = (articles: any[], config: any): string => {
    if (!articles.length) return 'لا توجد مقالات متاحة حالياً.';

    const topicsCount = articles.length;
    const categories = [...new Set(articles.map(a => a.category_name))];
    
    let summary = `${config.mood === 'energetic' ? '🚀' : '📰'} `;
    summary += `${topicsCount} موضوع مختار بعناية `;
    
    if (categories.length > 1) {
      summary += `من ${categories.length} تصنيف مختلف `;
    }
    
    summary += `${config.tone === 'محفز ونشيط' ? 'لبداية يوم مثمر' : 'لتبقى على اطلاع'}. `;
    
    // إضافة أبرز العناوين
    const topArticle = articles[0];
    if (topArticle) {
      summary += `أبرز الأخبار: ${topArticle.title.substring(0, 60)}...`;
    }

    return summary;
  };

  const getTimeIcon = (timeSlot: string) => {
    const icons = {
      morning: Coffee,
      noon: Sun,
      evening: Sunset,
      night: Moon
    };
    return icons[timeSlot as keyof typeof icons] || Coffee;
  };

  const handleInteraction = async (type: string, data?: any) => {
    // حفظ التفاعل
    const interaction = {
      userId: userId || 'anonymous',
      doseId: selectedDose?.id,
      viewedAt: new Date().toISOString(),
      viewDuration: 0,
      interactionType: type,
      ...data
    };

    // حساب النقاط
    let points = 0;
    switch (type) {
      case 'viewed': points = DOSE_REWARDS_SYSTEM.POINTS.VIEW_DOSE; break;
      case 'liked': points = DOSE_REWARDS_SYSTEM.POINTS.RATE_DOSE; break;
      case 'shared': points = DOSE_REWARDS_SYSTEM.POINTS.SHARE_DOSE; break;
    }

    setUserPoints(prev => prev + points);

    // TODO: حفظ في قاعدة البيانات
    console.log('User interaction:', interaction);
  };

  const handleShare = (platform: string) => {
    if (!selectedDose) return;
    
    const shareText = INTERACTIVE_FEATURES.generateShareText(selectedDose, platform);
    
    // فتح نافذة المشاركة
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`);
    }
    
    handleInteraction('shared', { shareMethod: platform });
  };

  const handlePollResponse = (optionIndex: number) => {
    if (!poll) return;
    
    // حفظ الاستجابة
    handleInteraction('poll_response', { pollId: poll.id, option: optionIndex });
    setShowPoll(false);
    
    // منح نقاط إضافية للمشاركة
    setUserPoints(prev => prev + 15);
  };

  if (!selectedDose) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-300">جاري إعداد جرعتك الذكية...</p>
        </div>
      </div>
    );
  }

  const TimeIcon = getTimeIcon(currentTimeSlot);
  const config = DOSE_TIMING_CONFIGS[currentTimeSlot];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* رأس الجرعة مع النقاط */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TimeIcon className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">{selectedDose.title}</h2>
              <p className="text-blue-100 text-sm">{config?.tone}</p>
            </div>
          </div>
          
          {/* نظام النقاط */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <Star className="w-5 h-5" />
              <span className="font-bold">{userPoints}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <Target className="w-5 h-5" />
              <span className="text-sm">{dailyProgress}/4</span>
            </div>
          </div>
        </div>

        {/* تقييم الجودة */}
        {selectedDose.review?.qualityScore && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span className="text-sm">جودة المحتوى: {selectedDose.review.qualityScore}%</span>
            </div>
            {selectedDose.review.qualityScore > 85 && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">ممتاز</span>
            )}
          </div>
        )}

        <p className="text-blue-50 leading-relaxed">{selectedDose.summary}</p>
      </div>

      {/* أزرار التحكم */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isPlaying ? 'إيقاف' : 'استماع'}
        </button>
        
        <button
          onClick={() => handleInteraction('liked')}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-colors"
        >
          <Heart className="w-5 h-5" />
          أعجبني
        </button>

        <button
          onClick={() => handleInteraction('saved')}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition-colors"
        >
          <BookmarkPlus className="w-5 h-5" />
          حفظ
        </button>
      </div>

      {/* المقالات */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          المقالات المختارة
        </h3>
        
        {selectedDose.articles.map((article: any, index: number) => (
          <div key={article.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              {article.featured_image && (
                <img 
                  src={article.featured_image} 
                  alt={article.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                  {article.title}
                </h4>
                
                {article.excerpt && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{article.category_name}</span>
                  <span>{article.views_count || 0} مشاهدة</span>
                  {selectedDose.scores?.[index] && (
                    <span className="text-blue-600">
                      نقاط: {selectedDose.scores[index].finalScore}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* أزرار المشاركة */}
      <div className="flex items-center justify-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">شارك جرعتك:</span>
        <button
          onClick={() => handleShare('whatsapp')}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          واتساب
        </button>
        <button
          onClick={() => handleShare('twitter')}
          className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          تويتر
        </button>
      </div>

      {/* الاستطلاع التفاعلي */}
      {showPoll && poll && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
            سؤال سريع:
          </h4>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">{poll.question}</p>
          
          <div className="grid grid-cols-2 gap-2">
            {poll.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handlePollResponse(index)}
                className="bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded-lg text-sm transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* تحذيرات الجودة */}
      {selectedDose.review?.flaggedIssues?.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
          <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
            ملاحظات على المحتوى:
          </h4>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            {selectedDose.review.flaggedIssues.map((issue: string, index: number) => (
              <li key={index}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
