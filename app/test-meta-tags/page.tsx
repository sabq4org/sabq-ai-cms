import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'اختبار Meta Tags - صحيفة سبق',
  description: 'صفحة اختبار للتأكد من عمل Open Graph Tags بشكل صحيح',
  openGraph: {
    title: 'اختبار المشاركة الاجتماعية',
    description: 'هذه صفحة تجريبية لاختبار ظهور المعاينة في واتساب وتويتر',
    url: 'https://sabq.org/test-meta-tags',
    siteName: 'صحيفة سبق الإلكترونية',
    images: [
      {
        url: 'https://sabq.org/images/sabq-logo-social.jpg',
        width: 1200,
        height: 630,
        alt: 'شعار صحيفة سبق',
      }
    ],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'اختبار المشاركة الاجتماعية',
    description: 'هذه صفحة تجريبية لاختبار ظهور المعاينة في واتساب وتويتر',
    images: ['https://sabq.org/images/sabq-logo-social.jpg'],
  },
};

export default function TestMetaTagsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            🧪 اختبار Meta Tags للمشاركة الاجتماعية
          </h1>
          
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                ✅ تم تطبيق Meta Tags بنجاح!
              </h2>
              <p className="text-green-700 dark:text-green-300">
                تم إضافة جميع Open Graph tags المطلوبة لعرض معاينة الرابط في:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-green-700 dark:text-green-300">
                <li>واتساب WhatsApp</li>
                <li>تويتر Twitter</li>
                <li>تيليجرام Telegram</li>
                <li>فيسبوك Facebook</li>
                <li>لينكد إن LinkedIn</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                📝 Meta Tags المضافة:
              </h2>
              <div className="space-y-2 text-sm font-mono bg-gray-100 dark:bg-gray-700 p-3 rounded">
                <div>og:title - عنوان المقال</div>
                <div>og:description - وصف المقال</div>
                <div>og:image - صورة المقال</div>
                <div>og:url - رابط المقال</div>
                <div>og:type - نوع المحتوى (article)</div>
                <div>og:site_name - اسم الموقع</div>
                <div>og:locale - اللغة العربية</div>
                <div>twitter:card - Twitter Card</div>
                <div>article:author - المؤلف</div>
                <div>article:published_time - تاريخ النشر</div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                🔧 كيفية الاختبار:
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-yellow-700 dark:text-yellow-300">
                <li>انسخ رابط أي مقال من الموقع</li>
                <li>شاركه في واتساب أو تويتر</li>
                <li>ستظهر معاينة تحتوي على:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>عنوان المقال</li>
                    <li>وصف مختصر</li>
                    <li>صورة المقال</li>
                    <li>اسم الموقع</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                🛠️ أدوات الاختبار المفيدة:
              </h2>
              <div className="space-y-2">
                <div>
                  <strong>Facebook Debugger:</strong>{' '}
                  <a 
                    href="https://developers.facebook.com/tools/debug/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    developers.facebook.com/tools/debug/
                  </a>
                </div>
                <div>
                  <strong>Twitter Card Validator:</strong>{' '}
                  <a 
                    href="https://cards-dev.twitter.com/validator" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    cards-dev.twitter.com/validator
                  </a>
                </div>
                <div>
                  <strong>WhatsApp Link Preview:</strong>{' '}
                  اختبر مباشرة بإرسال الرابط في واتساب
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
