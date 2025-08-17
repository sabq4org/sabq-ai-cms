import { CheckCircle, XCircle, AlertTriangle, Clock, Server, Shield, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DetailedResults = ({ testResults }) => {
  const getStatusIcon = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (statusCode === 404) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else if (statusCode >= 400 && statusCode < 500) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-100 text-green-800">نجح</Badge>;
    } else if (statusCode === 404) {
      return <Badge className="bg-red-100 text-red-800">غير موجود</Badge>;
    } else if (statusCode >= 400 && statusCode < 500) {
      return <Badge className="bg-yellow-100 text-yellow-800">خطأ عميل</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">خطأ خادم</Badge>;
    }
  };

  return (
    <section className="py-12 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          النتائج المفصلة
        </h2>

        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="connection" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              اختبار الاتصال
            </TabsTrigger>
            <TabsTrigger value="authentication" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              اختبار المصادقة
            </TabsTrigger>
            <TabsTrigger value="endpoints" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              نقاط النهاية
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connection">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-500" />
                  نتائج اختبار الاتصال الأساسي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(testResults.connection.statusCode)}
                      <span className="font-medium">حالة الاتصال</span>
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      {testResults.connection.status}
                    </div>
                    <div className="text-sm text-gray-600">
                      تم الاتصال بالخادم بنجاح
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">زمن الاستجابة</span>
                    </div>
                    <div className="text-lg font-semibold text-purple-600">
                      {testResults.connection.responseTime} ثانية
                    </div>
                    <div className="text-sm text-gray-600">
                      أداء ممتاز وسريع
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">نوع الخادم</span>
                    </div>
                    <div className="text-lg font-semibold text-blue-600">
                      {testResults.connection.server}
                    </div>
                    <div className="text-sm text-gray-600">
                      خادم Microsoft IIS
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">تفاصيل الأمان</h4>
                  <p className="text-sm text-blue-700">
                    {testResults.connection.security}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authentication">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  نتائج اختبار طرق المصادقة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.authentication.map((auth, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(auth.statusCode)}
                        <div>
                          <div className="font-medium">{auth.method}</div>
                          <div className="text-sm text-gray-600">{auth.notes}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(auth.statusCode)}
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {auth.statusCode}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">ملاحظة مهمة</h4>
                  <p className="text-sm text-yellow-700">
                    جميع طرق المصادقة أعطت نفس النتيجة (404)، مما يشير إلى أن المشكلة في المسارات وليس في المصادقة.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-red-500" />
                  نتائج اختبار نقاط النهاية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {testResults.endpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(endpoint.statusCode)}
                        <span className="font-mono text-sm">{endpoint.path}</span>
                      </div>
                      <span className="text-sm font-mono bg-red-100 text-red-800 px-2 py-1 rounded">
                        {endpoint.statusCode}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">خلاصة النتائج</h4>
                  <p className="text-sm text-red-700 mb-2">
                    جميع نقاط النهاية المختبرة (29 نقطة) أعطت استجابة 404 Not Found.
                  </p>
                  <p className="text-sm text-red-700">
                    هذا يشير إلى أن الـ API قد يستخدم مسارات مخصصة غير تقليدية أو أن الخدمة غير متاحة حالياً.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default DetailedResults;

