import { CheckCircle, Clock, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const EndpointsDiscovered = ({ endpoints }) => {
  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'أساسية': return 'bg-red-100 text-red-800';
      case 'مهمة': return 'bg-yellow-100 text-yellow-800';
      case 'مساعدة': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanceIcon = (importance) => {
    switch (importance) {
      case 'أساسية': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'مهمة': return <Info className="w-4 h-4 text-yellow-500" />;
      case 'مساعدة': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <section className="py-12 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            نقاط النهاية المكتشفة
          </h2>
          <p className="text-xl text-gray-600">
            7 نقاط نهاية محددة ووظيفية تم اكتشافها من ملف Postman
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {endpoints.map((endpoint, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-2 border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getImportanceIcon(endpoint.importance)}
                    <span className="text-lg">{endpoint.name}</span>
                  </div>
                  <Badge className={getImportanceColor(endpoint.importance)}>
                    {endpoint.importance}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">المسار:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                      {endpoint.path}
                    </code>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">الطريقة:</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {endpoint.method}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">الحالة:</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {endpoint.statusCode} Unauthorized
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      زمن الاستجابة: {endpoint.responseTime}s
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    <strong>الوصف:</strong> {endpoint.description}
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium text-gray-500">البيانات المطلوبة:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {endpoint.dataRequired.map((field, idx) => (
                        <Badge key={idx} className="bg-purple-100 text-purple-800 text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {endpoint.note && (
                    <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                      <strong>ملاحظة:</strong> {endpoint.note}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ملخص إحصائي */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-red-600 mb-2">2</div>
              <div className="text-sm text-red-700">نقاط نهاية أساسية</div>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-600 mb-2">1</div>
              <div className="text-sm text-yellow-700">نقطة نهاية مهمة</div>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">4</div>
              <div className="text-sm text-green-700">نقاط نهاية مساعدة</div>
            </CardContent>
          </Card>
        </div>

        {/* معلومات إضافية */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">معلومات مهمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-blue-700">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <span>جميع نقاط النهاية تستجيب بـ 401 Unauthorized، مما يؤكد وجودها</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <span>أوقات الاستجابة ممتازة (0.5-0.6 ثانية)</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <span>هناك خطأ في ملف Postman: GetAllClassifications يشير إلى مسار GetStatus</span>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <span>جميع نقاط النهاية تستخدم GET مع JSON في الـ body</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default EndpointsDiscovered;

