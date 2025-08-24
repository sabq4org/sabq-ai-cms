"use client";

/**
 * صفحة تجريبية لعرض نظام الولاء والتتبع الذكي
 */

import React, { useState } from 'react';
import SmartTrackingLayout, { useSmartTracking } from '@/components/layout/SmartTrackingLayout';
import { Star, Heart, Share2, Bookmark, Search, Eye, Clock, TrendingUp } from 'lucide-react';

export default function SmartTrackingDemo() {
  const [userId] = useState('demo_user_123'); // في التطبيق الحقيقي، سيأتي من السياق
  const { trackEvent, awardPoints, isReady } = useSmartTracking(userId);

  const handleInteraction = (actionType: string, description: string) => {
    awardPoints(actionType, 'demo_article_456');
    
    // عرض رسالة تأكيد
    const notification = document.createElement('div');
    notification.textContent = `تم تسجيل: ${description}`;
    notification.className = 'fixed top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
  };

  return (
    <SmartTrackingLayout
      userId={userId}
      showLoyaltyWidget={true}
      showRecommendations={true}
      loyaltyWidgetPosition="sidebar"
      className="min-h-screen bg-gray-50"
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* رأس الصفحة */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎯 تجربة نظام الولاء والتتبع الذكي
          </h1>
          <p className="text-gray-600 mb-4">
            هذه صفحة تجريبية لعرض كيفية عمل نظام الولاء وتتبع السلوك. 
            جرب التفاعل مع الأزرار أدناه لرؤية النظام في العمل!
          </p>
          
          <div className="flex items-center gap-4 text-sm">
            <div className={`flex items-center gap-2 ${isReady ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {isReady ? 'نظام التتبع نشط' : 'نظام التتبع غير نشط'}
            </div>
            <div className="text-gray-500">
              معرف المستخدم: {userId}
            </div>
          </div>
        </div>

        {/* أزرار التفاعل */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            جرب الأنشطة المختلفة
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* قراءة المقال */}
            <button
              onClick={() => handleInteraction('article_read', 'قراءة مقال كامل')}
              className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Eye className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">قراءة المقال</div>
                <div className="text-sm text-gray-500">+5 نقاط</div>
              </div>
            </button>

            {/* إعجاب */}
            <button
              onClick={() => handleInteraction('article_like', 'إعجاب بمقال')}
              className="flex items-center gap-3 p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors"
            >
              <Heart className="w-6 h-6 text-red-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">إعجاب</div>
                <div className="text-sm text-gray-500">+3 نقاط</div>
              </div>
            </button>

            {/* مشاركة */}
            <button
              onClick={() => handleInteraction('article_share', 'مشاركة مقال')}
              className="flex items-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
            >
              <Share2 className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">مشاركة</div>
                <div className="text-sm text-gray-500">+8 نقاط</div>
              </div>
            </button>

            {/* حفظ */}
            <button
              onClick={() => handleInteraction('article_bookmark', 'حفظ مقال')}
              className="flex items-center gap-3 p-4 border-2 border-yellow-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
            >
              <Bookmark className="w-6 h-6 text-yellow-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">حفظ</div>
                <div className="text-sm text-gray-500">+4 نقاط</div>
              </div>
            </button>

            {/* بحث */}
            <button
              onClick={() => handleInteraction('search_usage', 'استخدام البحث')}
              className="flex items-center gap-3 p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              <Search className="w-6 h-6 text-purple-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">بحث</div>
                <div className="text-sm text-gray-500">+1 نقطة</div>
              </div>
            </button>

            {/* قراءة عميقة */}
            <button
              onClick={() => handleInteraction('deep_read', 'قراءة عميقة')}
              className="flex items-center gap-3 p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
            >
              <Clock className="w-6 h-6 text-indigo-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">قراءة عميقة</div>
                <div className="text-sm text-gray-500">+15 نقطة</div>
              </div>
            </button>

          </div>
        </div>

        {/* محتوى المقال التجريبي */}
        <article className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              مقال تجريبي: مستقبل الذكاء الاصطناعي في الصحافة
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>تاريخ النشر: {new Date().toLocaleDateString('ar-SA')}</span>
              <span>الفئة: تقنية</span>
              <span>وقت القراءة: 5 دقائق</span>
            </div>
          </header>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              يشهد عالم الصحافة تطوراً مستمراً مع دخول تقنيات الذكاء الاصطناعي، 
              حيث تساعد هذه التقنيات في تحسين جودة المحتوى وتخصيصه للقراء.
            </p>
            
            <p className="mb-4">
              من أبرز التطبيقات الحديثة للذكاء الاصطناعي في الصحافة:
            </p>
            
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>تحليل سلوك القراء وتقديم محتوى مخصص</li>
              <li>أتمتة كتابة التقارير الإخبارية البسيطة</li>
              <li>تحسين توزيع المحتوى عبر المنصات المختلفة</li>
              <li>تحليل المشاعر والآراء في التعليقات</li>
              <li>ترجمة المحتوى تلقائياً لعدة لغات</li>
            </ul>

            <p className="mb-4">
              هذا النظام الذي تجربه الآن هو مثال حي على كيفية استخدام الذكاء الاصطناعي 
              لتتبع اهتماماتك وتقديم محتوى مناسب لك، بالإضافة إلى نظام مكافآت يحفزك 
              على التفاعل المستمر.
            </p>

            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-6">
              "المستقبل للمنصات التي تفهم قراءها وتقدم لهم تجربة مخصصة وذكية"
            </blockquote>

            <p className="mb-4">
              مع تطور هذه التقنيات، نتوقع أن نرى المزيد من الابتكارات التي ستغير 
              طريقة تفاعلنا مع المحتوى الإعلامي، مما يجعل التجربة أكثر تفاعلية وإثراءً.
            </p>
          </div>

          {/* أزرار التفاعل في نهاية المقال */}
          <footer className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleInteraction('article_like', 'إعجاب بمقال')}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  أعجبني
                </button>
                
                <button
                  onClick={() => handleInteraction('article_share', 'مشاركة مقال')}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  مشاركة
                </button>
                
                <button
                  onClick={() => handleInteraction('article_bookmark', 'حفظ مقال')}
                  className="flex items-center gap-2 px-4 py-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                >
                  <Bookmark className="w-5 h-5" />
                  حفظ
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                شارك رأيك في التعليقات أدناه
              </div>
            </div>
          </footer>
        </article>

        {/* معلومات النظام */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            كيف يعمل النظام؟
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🎯 تتبع السلوك</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• تتبع الوقت المقضي في القراءة</li>
                <li>• مراقبة عمق التمرير</li>
                <li>• تسجيل النقرات والتفاعلات</li>
                <li>• تحليل أنماط الاستخدام</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">⭐ نظام الولاء</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• نقاط لكل نشاط تقوم به</li>
                <li>• مستويات ولاء متدرجة</li>
                <li>• مزايا حصرية لكل مستوى</li>
                <li>• إنجازات ومكافآت خاصة</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </SmartTrackingLayout>
  );
}
