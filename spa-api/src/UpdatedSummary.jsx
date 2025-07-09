import { CheckCircle, XCircle, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const UpdatedSummary = ({ summary, comparison, apiInfo }) => {
  return (
    <section className="py-12 px-6 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* إعلان التقدم الكبير */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full text-lg font-bold mb-4">
            <TrendingUp className="w-6 h-6" />
            تقدم كبير محقق!
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            النتائج المحدثة - ملف Postman الجديد
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            تغيير جذري في النتائج: من 404 (غير موجود) إلى 401 (غير مصرح) - 
            مما يؤكد وجود نقاط النهاية فعلياً!
          </p>
        </div>

        {/* مقارنة قبل وبعد */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="border-2 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                الاختبار السابق
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>رمز الاستجابة:</span>
                  <Badge className="bg-red-100 text-red-800">{comparison.before.statusCode}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>المعنى:</span>
                  <span className="text-red-700">{comparison.before.meaning}</span>
                </div>
                <div className="flex justify-between">
                  <span>نقاط النهاية:</span>
                  <span>{comparison.before.endpointsTested}</span>
                </div>
                <div className="flex justify-between">
                  <span>معدل النجاح:</span>
                  <span className="text-red-700">{comparison.before.successRate}</span>
                </div>
                <div className="text-sm text-red-600 mt-3 p-3 bg-red-100 rounded">
                  <strong>المشكلة:</strong> {comparison.before.issue}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                الاختبار الحالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>رمز الاستجابة:</span>
                  <Badge className="bg-yellow-100 text-yellow-800">{comparison.after.statusCode}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>المعنى:</span>
                  <span className="text-green-700">{comparison.after.meaning}</span>
                </div>
                <div className="flex justify-between">
                  <span>نقاط النهاية:</span>
                  <span>{comparison.after.endpointsTested}</span>
                </div>
                <div className="flex justify-between">
                  <span>معدل النجاح:</span>
                  <span className="text-yellow-700">{comparison.after.successRate}</span>
                </div>
                <div className="text-sm text-green-600 mt-3 p-3 bg-green-100 rounded">
                  <strong>المشكلة:</strong> {comparison.after.issue}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التقدم المحقق */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              التقدم المحقق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold mb-3">
              {comparison.improvement}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold">✅</div>
                <div className="text-sm">نقاط النهاية موجودة</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold">🎯</div>
                <div className="text-sm">مسارات صحيحة</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold">🔐</div>
                <div className="text-sm">مشكلة المصادقة فقط</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ملخص الحالة الحالية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                حالة الخادم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-100 text-green-800">
                {summary.serverStatus}
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                نقاط النهاية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-yellow-100 text-yellow-800">
                {summary.endpointsStatus}
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                المصادقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-orange-100 text-orange-800">
                {summary.authStatus}
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                التقدم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-blue-100 text-blue-800">
                {summary.status}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* معلومات API المحدثة */}
        <Card className="bg-white border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              معلومات API المكتشفة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">الرابط الأساسي</div>
                <div className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {apiInfo.baseUrl}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">المسار الجديد</div>
                <div className="text-sm font-mono bg-green-100 p-2 rounded text-green-800">
                  {apiInfo.newBasePath}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">إصدار Postman</div>
                <div className="text-sm">{apiInfo.postmanVersion}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">نوع الخادم</div>
                <div className="text-sm">{apiInfo.serverType}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">زمن الاستجابة</div>
                <div className="text-sm">{apiInfo.responseTime}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">الأمان</div>
                <div className="text-sm">{apiInfo.protocol}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* التوصية الرئيسية */}
        <Card className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800">التوصية الرئيسية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg text-orange-700 mb-3">
              {summary.recommendation}
            </div>
            <div className="text-sm text-orange-600">
              <strong>السبب:</strong> {summary.majorImprovement}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default UpdatedSummary;

