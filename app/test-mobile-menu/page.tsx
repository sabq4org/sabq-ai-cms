'use client';

import MobileHeaderEnhanced from '@/components/mobile/MobileHeader-Enhanced';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

export default function TestMobileMenuPage() {
  const { darkMode } = useDarkModeContext();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* الهيدر المحسن للموبايل */}
      <MobileHeaderEnhanced showUserMenu={true} />
      
      {/* محتوى تجريبي */}
      <div className="pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            صفحة اختبار القائمة المنسدلة للموبايل
          </h1>
          
          <div className="space-y-6">
            {/* بطاقة تعليمات */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                تعليمات الاختبار 📋
              </h2>
              <ol className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">1.</span>
                  <span>انقر على أيقونة القائمة الجانبية (☰) للتأكد من أنها تحتوي فقط على أقسام الموقع</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  <span>انقر على أيقونة المستخدم (👤) لفتح القائمة المنسدلة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">3.</span>
                  <span>تحقق من وجود: الملف الشخصي، رحلتي المعرفية، المحفوظات، الإعدادات</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">4.</span>
                  <span>تأكد من وجود زر تسجيل الخروج باللون الأحمر</span>
                </li>
              </ol>
            </div>
            
            {/* بطاقة المحتوى المنقول */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-300">
                العناصر المنقولة للقائمة المنسدلة ✅
              </h3>
              <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                <li>• الملف الشخصي - /profile</li>
                <li>• رحلتي المعرفية - /knowledge-journey</li>
                <li>• المحفوظات - /bookmarks</li>
                <li>• الإعدادات - /settings</li>
                <li>• تسجيل الخروج (زر أحمر)</li>
              </ul>
            </div>
            
            {/* بطاقة القائمة الجانبية */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-900 dark:text-green-300">
                محتوى القائمة الجانبية الرئيسية 📱
              </h3>
              <ul className="space-y-2 text-green-800 dark:text-green-200">
                <li>• الرئيسية</li>
                <li>• اللحظة بلحظة</li>
                <li>• الأخبار</li>
                <li>• التحليل العميق</li>
                <li>• مقالات الرأي</li>
                <li>• الميديا</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
