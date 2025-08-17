import React from 'react';
import SmartRecommendationBlock from '@/components/article/SmartRecommendationBlock';

/**
 * 🎯 مثال تطبيقي للنظام الذكي للتوصيات
 * 
 * هذا المثال يوضح كيفية استخدام SmartRecommendationBlock
 * في صفحة المقال مع التخصيص المناسب
 */

interface ArticlePageExampleProps {
  articleId: string;
  category: string;
  tags: string[];
}

const ArticlePageExample: React.FC<ArticlePageExampleProps> = ({
  articleId,
  category,
  tags
}) => {
  return (
    <div className="article-page-container">
      {/* محتوى المقال الرئيسي */}
      <article className="main-article">
        <h1>عنوان المقال</h1>
        <div className="article-content">
          {/* محتوى المقال */}
        </div>
      </article>

      {/* نظام التوصيات الذكي */}
      <aside className="recommendations-section mt-12">
        <SmartRecommendationBlock
          articleId={articleId}
          category={category}
          tags={tags}
          className="shadow-xl" // تخصيص إضافي
        />
      </aside>

      {/* أقسام إضافية */}
      <section className="related-content mt-8">
        {/* محتوى إضافي */}
      </section>
    </div>
  );
};

export default ArticlePageExample;

/**
 * 📊 أمثلة لبيانات التوصيات المختلفة:
 * 
 * 1. مقال أخبار عادي:
 * {
 *   id: "1",
 *   title: "أخبار السوق اليوم",
 *   type: "news",
 *   category_name: "اقتصاد"
 * }
 * 
 * 2. تحليل عميق:
 * {
 *   id: "2", 
 *   title: "تحليل شامل لأداء الأسواق",
 *   type: "analysis",
 *   category_name: "تحليل عميق"
 * }
 * 
 * 3. مقال رأي:
 * {
 *   id: "3",
 *   title: "وجهة نظر حول السياسة الاقتصادية", 
 *   type: "opinion",
 *   category_name: "رأي"
 * }
 * 
 * 🎨 نمط العرض المتوقع:
 * 
 * العنصر 0 (أخبار): بطاقة كاملة ✅
 * العنصر 1 (تحليل): بطاقة كاملة ✅ (أولوية عالية)
 * العنصر 2 (أخبار): بطاقة كاملة ✅
 * العنصر 3 (أخبار): رابط سريع ⚡
 * العنصر 4 (رأي): بطاقة كاملة ✅ (أولوية عالية)
 * العنصر 5 (أخبار): رابط سريع ⚡
 * العنصر 6 (أخبار): بطاقة كاملة ✅ (دورة جديدة)
 * ...وهكذا
 */
