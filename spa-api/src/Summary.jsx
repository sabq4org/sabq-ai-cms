import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Summary = ({ summary, apiInfo }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'متاح':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'غير متاح (404)':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'يبدو صحيحاً':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'متاح':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'غير متاح (404)':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'يبدو صحيحاً':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <section className="py-12 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          ملخص النتائج
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {getStatusIcon(summary.serverStatus)}
                حالة الخادم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(summary.serverStatus)}>
                {summary.serverStatus}
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {getStatusIcon(summary.endpointsStatus)}
                نقاط النهاية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(summary.endpointsStatus)}>
                {summary.endpointsStatus}
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {getStatusIcon(summary.authStatus)}
                المصادقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(summary.authStatus)}>
                {summary.authStatus}
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                التوصية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                {summary.recommendation}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <Info className="w-6 h-6" />
              معلومات الـ API
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
                <div className="text-sm font-medium text-gray-500">نوع الخادم</div>
                <div className="text-sm">{apiInfo.serverType}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">البروتوكول</div>
                <div className="text-sm">{apiInfo.protocol}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">الشهادة</div>
                <div className="text-sm">{apiInfo.certificate}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">زمن الاستجابة</div>
                <div className="text-sm">{apiInfo.responseTime}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Summary;

