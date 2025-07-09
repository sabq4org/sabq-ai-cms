import { Calendar, User, Globe, Mail } from 'lucide-react';

const Footer = ({ reportData }) => {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* معلومات التقرير */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-green-400">معلومات التقرير</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>التاريخ: {reportData.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>المُعد: {reportData.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>الحالة: {reportData.summary.status}</span>
              </div>
            </div>
          </div>

          {/* روابط مفيدة */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-green-400">روابط مفيدة</h3>
            <div className="space-y-2 text-sm">
              <a 
                href={reportData.supportContacts.spa.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-300 hover:text-green-400 transition-colors"
              >
                وكالة الأنباء السعودية
              </a>
              <a 
                href={reportData.supportContacts.media.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-300 hover:text-green-400 transition-colors"
              >
                وزارة الإعلام
              </a>
              <a 
                href={`mailto:${reportData.supportContacts.spa.email}`}
                className="block text-gray-300 hover:text-green-400 transition-colors"
              >
                الدعم التقني
              </a>
            </div>
          </div>

          {/* ملخص سريع */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-green-400">ملخص سريع</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>• تم اختبار 29 نقطة نهاية</p>
              <p>• 5 طرق مصادقة مختلفة</p>
              <p>• زمن استجابة: 0.55 ثانية</p>
              <p>• الخادم متاح ويعمل</p>
            </div>
          </div>
        </div>

        {/* خط الفصل */}
        <div className="border-t border-gray-700 pt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-white">
              {reportData.title}
            </h2>
            <p className="text-gray-400 mb-4">
              تقرير شامل ومفصل لاختبار الاتصال والمصادقة مع API وكالة الأنباء السعودية
            </p>
            
            <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
              <span>جميع الحقوق محفوظة © 2025</span>
              <span>•</span>
              <span>تم إنشاؤه بواسطة Manus AI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

