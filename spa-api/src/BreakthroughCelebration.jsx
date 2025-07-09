import { Trophy, Zap, CheckCircle, Star, Sparkles, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BreakthroughCelebration = ({ celebrationData, successfulTest }) => {
  return (
    <section className="py-16 px-6 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-green-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-purple-400 rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" />
            <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
            <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {celebrationData.title}
          </h1>
          
          <p className="text-2xl text-gray-700 mb-6">
            {celebrationData.subtitle}
          </p>
          
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
              <CheckCircle className="w-5 h-5 mr-2" />
              200 OK - نجاح كامل
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
              <Zap className="w-5 h-5 mr-2" />
              مصادقة ناجحة
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
              <Star className="w-5 h-5 mr-2" />
              أول نجاح
            </Badge>
          </div>
        </div>

        {/* بطاقة النجاح الرئيسية */}
        <Card className="mb-12 border-4 border-green-200 bg-gradient-to-r from-green-50 to-blue-50 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-green-800 flex items-center justify-center gap-3">
              <Target className="w-8 h-8" />
              الاختبار الناجح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white rounded-lg shadow-md">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {successfulTest.endpoint}
                </div>
                <div className="text-sm text-gray-600">نقطة النهاية</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {successfulTest.statusCode}
                </div>
                <div className="text-sm text-gray-600">رمز الاستجابة</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg shadow-md">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {successfulTest.responseTime}s
                </div>
                <div className="text-sm text-gray-600">زمن الاستجابة</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg shadow-md">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {successfulTest.authMethod}
                </div>
                <div className="text-sm text-gray-600">طريقة المصادقة</div>
              </div>
            </div>
            
            {/* عرض الاستجابة */}
            <div className="mt-8 p-6 bg-gray-900 rounded-lg">
              <div className="text-green-400 font-mono text-lg mb-2">
                📄 استجابة الخادم:
              </div>
              <pre className="text-green-300 font-mono text-sm overflow-x-auto">
{JSON.stringify(successfulTest.response, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* رسالة الاحتفال */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-orange-800 mb-4">
                {celebrationData.description}
              </h2>
              <blockquote className="text-xl italic text-orange-700 border-l-4 border-orange-400 pl-4 mx-auto max-w-4xl">
                "{celebrationData.quote}"
              </blockquote>
            </div>
            
            <div className="flex justify-center gap-8 flex-wrap">
              <div className="text-center">
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-sm font-medium text-orange-700">هدف محقق</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🚀</div>
                <div className="text-sm font-medium text-orange-700">انطلاقة جديدة</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">💡</div>
                <div className="text-sm font-medium text-orange-700">إمكانيات لا محدودة</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🌟</div>
                <div className="text-sm font-medium text-orange-700">نجاح باهر</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إحصائيات سريعة */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="text-center bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-green-600 mb-2">1st</div>
              <div className="text-sm text-green-700">نجاح أول</div>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">200</div>
              <div className="text-sm text-blue-700">OK Status</div>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">0.6s</div>
              <div className="text-sm text-purple-700">سرعة الاستجابة</div>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-yellow-600 mb-2">100%</div>
              <div className="text-sm text-yellow-700">دقة التكامل</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BreakthroughCelebration;

