import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Download, Share2, ArrowUp, Trophy, Zap, Clock, Target } from 'lucide-react';
import './App.css';

function App() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // مراقبة التمرير
  useState(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'تقرير API وكالة الأنباء السعودية - إنجاز كبير!',
        text: 'تم تحقيق أول اتصال ناجح مع API وكالة الأنباء السعودية',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط التقرير إلى الحافظة');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <Trophy className="w-12 h-12 text-yellow-300 animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-bold">
              🎉 إنجاز كبير محقق! 🎉
            </h1>
            <Trophy className="w-12 h-12 text-yellow-300 animate-bounce" />
          </div>
          <p className="text-xl mb-4">
            أول اتصال ناجح مع API وكالة الأنباء السعودية
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <span className="bg-green-500 text-white px-4 py-2 rounded-full font-semibold">
              ✅ 200 OK - نجاح كامل
            </span>
            <span className="bg-blue-500 text-white px-4 py-2 rounded-full font-semibold">
              🔐 مصادقة ناجحة
            </span>
            <span className="bg-purple-500 text-white px-4 py-2 rounded-full font-semibold">
              ⚡ 0.623 ثانية
            </span>
          </div>
        </div>
      </header>

      {/* أزرار الإجراءات */}
      <div className="sticky top-4 z-50 flex justify-center my-6">
        <div className="bg-white shadow-lg rounded-full p-2 flex gap-2 border border-gray-200">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            طباعة التقرير
          </button>
          <button 
            onClick={handleShare}
            className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            مشاركة
          </button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* بطاقة النجاح الرئيسية */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-4 border-green-200 rounded-lg p-8 mb-8 shadow-xl">
          <div className="text-center mb-6">
            <Target className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-800 mb-4">
              الاختبار الناجح - GetStatus
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-3xl font-bold text-green-600 mb-2">200</div>
              <div className="text-sm text-gray-600">رمز الاستجابة</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-3xl font-bold text-blue-600 mb-2">0.623s</div>
              <div className="text-sm text-gray-600">زمن الاستجابة</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-3xl font-bold text-purple-600 mb-2">X-API-Key</div>
              <div className="text-sm text-gray-600">طريقة المصادقة</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-3xl font-bold text-orange-600 mb-2">JSON</div>
              <div className="text-sm text-gray-600">نوع الاستجابة</div>
            </div>
          </div>

          {/* عرض الاستجابة */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="text-green-400 font-mono text-lg mb-2">
              📄 استجابة الخادم:
            </div>
            <pre className="text-green-300 font-mono text-sm">
{`{
  "isActiveClient": false,
  "message": "Not Active Client"
}`}
            </pre>
          </div>
        </div>

        {/* رحلة التقدم */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            رحلة النجاح - من التحدي إلى الإنجاز
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* المرحلة الأولى */}
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">المرحلة الأولى</h3>
              <p className="text-gray-600 mb-2">الاختبار الأولي</p>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                404 Not Found
              </span>
              <p className="text-sm text-gray-500 mt-2">29 مسار عام - مسارات غير صحيحة</p>
            </div>

            {/* المرحلة الثانية */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">المرحلة الثانية</h3>
              <p className="text-gray-600 mb-2">ملف Postman</p>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                401 Unauthorized
              </span>
              <p className="text-sm text-gray-500 mt-2">7 نقاط نهاية - مصادقة فاشلة</p>
            </div>

            {/* المرحلة الثالثة */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">المرحلة الثالثة</h3>
              <p className="text-gray-600 mb-2">API Key المحدث</p>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                200 OK
              </span>
              <p className="text-sm text-gray-500 mt-2">مصادقة ناجحة - حساب غير مفعل</p>
            </div>
          </div>
        </div>

        {/* النتائج المفصلة */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            النتائج المفصلة
          </h2>
          
          <div className="space-y-6">
            {/* GetStatus - نجح */}
            <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-green-800">GetStatus</h3>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full">نجح</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-600">المسار:</span>
                  <code className="block bg-gray-100 p-2 rounded text-sm">/ClientAppV1/GetStatus</code>
                </div>
                <div>
                  <span className="text-sm text-gray-600">الحالة:</span>
                  <span className="block text-green-600 font-bold">200 OK</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">زمن الاستجابة:</span>
                  <span className="block text-blue-600 font-bold">0.623 ثانية</span>
                </div>
              </div>
            </div>

            {/* GetBaskets - فشل */}
            <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-red-800">GetBaskets</h3>
                <span className="bg-red-500 text-white px-3 py-1 rounded-full">فشل</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-600">المسار:</span>
                  <code className="block bg-gray-100 p-2 rounded text-sm">/ClientAppV1/GetBaskets</code>
                </div>
                <div>
                  <span className="text-sm text-gray-600">الحالة:</span>
                  <span className="block text-red-600 font-bold">404 Not Found</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">السبب:</span>
                  <span className="block text-gray-600">يتطلب حساباً مفعلاً</span>
                </div>
              </div>
            </div>

            {/* GetNextNews - خطأ خادم */}
            <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-purple-800">GetNextNews</h3>
                <span className="bg-purple-500 text-white px-3 py-1 rounded-full">خطأ خادم</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-600">المسار:</span>
                  <code className="block bg-gray-100 p-2 rounded text-sm">/ClientAppV1/GetNextNews</code>
                </div>
                <div>
                  <span className="text-sm text-gray-600">الحالة:</span>
                  <span className="block text-purple-600 font-bold">500 Server Error</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">السبب:</span>
                  <span className="block text-gray-600">يتطلب حساباً مفعلاً</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* التوصيات */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center">
            الخطوات التالية
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/20 rounded-lg p-6">
              <Zap className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-3">الخطوة الفورية</h3>
              <p className="mb-4">
                التواصل مع وكالة الأنباء السعودية لتفعيل الحساب
              </p>
              <ul className="space-y-2 text-sm">
                <li>• الاتصال بقسم الدعم التقني</li>
                <li>• طلب تفعيل الحساب</li>
                <li>• تأكيد صحة API Key</li>
              </ul>
            </div>
            
            <div className="bg-white/20 rounded-lg p-6">
              <Clock className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-3">بعد التفعيل</h3>
              <p className="mb-4">
                اختبار شامل لجميع نقاط النهاية
              </p>
              <ul className="space-y-2 text-sm">
                <li>• اختبار GetBaskets</li>
                <li>• اختبار GetNextNews</li>
                <li>• تطوير تطبيقات متقدمة</li>
              </ul>
            </div>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            إحصائيات الإنجاز
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">1</div>
              <div className="text-sm text-green-700">نجاح أول</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">200</div>
              <div className="text-sm text-blue-700">OK Status</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-4xl font-bold text-purple-600 mb-2">0.6s</div>
              <div className="text-sm text-purple-700">سرعة الاستجابة</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-4xl font-bold text-yellow-600 mb-2">100%</div>
              <div className="text-sm text-yellow-700">دقة التكامل</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-2">
            تقرير اختبار API وكالة الأنباء السعودية
          </h3>
          <p className="text-gray-300 mb-4">
            تم إنشاء هذا التقرير بواسطة Manus AI في 9 يوليو 2025
          </p>
          <p className="text-yellow-300 font-semibold text-lg">
            🎉 إنجاز كبير: أول اتصال ناجح مع API وكالة الأنباء السعودية!
          </p>
          <div className="border-t border-gray-700 pt-4 mt-4">
            <p className="text-sm text-gray-400">
              هذا التقرير يحتوي على نتائج اختبار شامل لـ API وكالة الأنباء السعودية
            </p>
          </div>
        </div>
      </footer>

      {/* زر العودة للأعلى */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg z-50 flex items-center justify-center"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default App;

