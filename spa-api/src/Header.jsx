import { Calendar, Clock, User, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Header = ({ reportData }) => {
  return (
    <header className="bg-gradient-to-r from-green-600 to-green-800 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {reportData.title}
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            تقرير شامل ومفصل لاختبار الاتصال والمصادقة مع API وكالة الأنباء السعودية
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg p-4">
            <Calendar className="w-5 h-5" />
            <div>
              <div className="text-sm text-green-100">التاريخ</div>
              <div className="font-semibold">{reportData.date}</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg p-4">
            <Clock className="w-5 h-5" />
            <div>
              <div className="text-sm text-green-100">الوقت</div>
              <div className="font-semibold">{reportData.time}</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg p-4">
            <User className="w-5 h-5" />
            <div>
              <div className="text-sm text-green-100">المُعد</div>
              <div className="font-semibold">{reportData.author}</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg p-4">
            <Globe className="w-5 h-5" />
            <div>
              <div className="text-sm text-green-100">الحالة</div>
              <Badge variant="secondary" className="bg-white text-green-800 font-semibold">
                {reportData.summary.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

