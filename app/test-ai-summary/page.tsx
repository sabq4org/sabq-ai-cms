'use client';

import ArticleAISummary from '@/components/article/ArticleAISummary';

const mockContent = `
أعلنت وزارة الصحة السعودية اليوم عن إطلاق مبادرة وطنية شاملة للصحة الرقمية، تهدف إلى تحويل القطاع الصحي في المملكة وتحسين جودة الخدمات المقدمة للمواطنين والمقيمين. 

تشمل المبادرة الجديدة عدة محاور رئيسية، من أبرزها تطوير منصة موحدة للسجلات الصحية الإلكترونية، وإطلاق تطبيقات ذكية للاستشارات الطبية عن بُعد، بالإضافة إلى استخدام تقنيات الذكاء الاصطناعي في التشخيص المبكر للأمراض.

وقال وزير الصحة في مؤتمر صحفي عُقد اليوم: "هذه المبادرة تمثل نقلة نوعية في مستقبل الرعاية الصحية بالمملكة، وتأتي في إطار رؤية 2030 لبناء مجتمع حيوي واقتصاد مزدهر".

من المتوقع أن تستفيد أكثر من 20 مليون شخص من هذه الخدمات الرقمية المتطورة خلال السنوات الثلاث القادمة، مع توفير أكثر من 5 مليارات ريال من تكاليف الرعاية الصحية.
`;

const mockSummary = `أطلقت وزارة الصحة السعودية مبادرة وطنية للصحة الرقمية تشمل منصة موحدة للسجلات الصحية وتطبيقات للاستشارات عن بُعد واستخدام الذكاء الاصطناعي في التشخيص، متوقعة استفادة 20 مليون شخص وتوفير 5 مليارات ريال.`;

export default function TestAISummaryPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
          اختبار مكون الموجز الذكي المحسّن
        </h1>
        
        <div className="space-y-12">
          {/* حالة مع موجز موجود */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              1. مقال مع موجز موجود
            </h2>
            <ArticleAISummary
              articleId="test-1"
              title="وزارة الصحة تطلق مبادرة الصحة الرقمية"
              content={mockContent}
              existingSummary={mockSummary}
            />
          </div>

          {/* حالة بدون موجز (للمحررين) */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              2. مقال بدون موجز (يظهر زر التوليد للمحررين فقط)
            </h2>
            <ArticleAISummary
              articleId="test-2"
              title="مقال جديد بدون موجز"
              content={mockContent}
            />
          </div>

          {/* حالة مع موجز طويل */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              3. مقال مع موجز طويل
            </h2>
            <ArticleAISummary
              articleId="test-3"
              title="مقال مع موجز مفصل"
              content={mockContent}
              existingSummary={`${mockSummary} كما تتضمن المبادرة تدريب أكثر من 50 ألف من الكوادر الطبية على استخدام التقنيات الرقمية الحديثة، وإنشاء مراكز متخصصة للابتكار الصحي في جميع مناطق المملكة. وستعمل الوزارة على تطوير شراكات استراتيجية مع كبرى الشركات التقنية العالمية لضمان تطبيق أحدث الحلول الرقمية في القطاع الصحي.`}
            />
          </div>

          {/* معلومات حول التصميم */}
          <div className="mt-16 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              مميزات التصميم الجديد:
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• حجم أصغر وأكثر أناقة (max-w-lg)</li>
              <li>• خلفية متدرجة جميلة من البنفسجي إلى الوردي</li>
              <li>• أيقونات أصغر مع tooltips واضحة</li>
              <li>• زر صوت أنيق مع تأثيرات hover محسّنة</li>
              <li>• line-clamp للنص الطويل لمنع التمدد الزائد</li>
              <li>• حشو أقل وتصميم مضغوط</li>
              <li>• ظلال خفيفة وحدود أنيقة</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 