import { Clock, Zap, Target, Phone, Settings, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const UpdatedRecommendations = ({ recommendations, nextSteps }) => {
  const priorityColors = {
    immediate: 'bg-red-100 text-red-800 border-red-200',
    technical: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    longTerm: 'bg-green-100 text-green-800 border-green-200'
  };

  const priorityIcons = {
    immediate: <Zap className="w-5 h-5 text-red-500" />,
    technical: <Settings className="w-5 h-5 text-yellow-500" />,
    longTerm: <Target className="w-5 h-5 text-green-500" />
  };

  const priorityTitles = {
    immediate: 'التوصيات الفورية (أولوية عالية)',
    technical: 'التوصيات التقنية (أولوية متوسطة)',
    longTerm: 'التوصيات طويلة المدى (تطوير مستقبلي)'
  };

  return (
    <section className="py-12 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            التوصيات المحدثة والخطوات التالية
          </h2>
          <p className="text-xl text-gray-600">
            خطة عمل شاملة بناءً على النتائج الجديدة
          </p>
        </div>

        {/* التوصيات حسب الأولوية */}
        <div className="space-y-8 mb-12">
          {Object.entries(recommendations).map(([priority, items]) => (
            <Card key={priority} className={`border-2 ${priorityColors[priority]}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {priorityIcons[priority]}
                  <span className="text-xl">{priorityTitles[priority]}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <div className="text-gray-700 leading-relaxed">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* الخطوات التالية */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <TrendingUp className="w-6 h-6" />
              الخطوات التالية المقترحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nextSteps.map((step, index) => (
                <div key={index} className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="text-sm font-medium opacity-90">
                      خطوة {index + 1}
                    </div>
                  </div>
                  <div className="text-white leading-relaxed">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* معلومات الاتصال */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                وكالة الأنباء السعودية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">الموقع الإلكتروني</div>
                  <div className="text-green-700">www.spa.gov.sa</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">البريد الإلكتروني</div>
                  <div className="text-green-700">info@spa.gov.sa</div>
                </div>
                <div className="text-sm text-green-600 bg-green-100 p-3 rounded">
                  <strong>نصيحة:</strong> اطلب التحدث مع فريق الدعم التقني أو قسم APIs
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                وزارة الإعلام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">الهاتف</div>
                  <div className="text-blue-700">0112974700</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">الموقع الإلكتروني</div>
                  <div className="text-blue-700">media.gov.sa</div>
                </div>
                <div className="text-sm text-blue-600 bg-blue-100 p-3 rounded">
                  <strong>نصيحة:</strong> قد يكونوا قادرين على توجيهك للشخص المناسب
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ملخص الوضع الحالي */}
        <Card className="mt-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              الوضع الحالي والخطوة التالية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-lg text-orange-700">
                <strong>ما تم إنجازه:</strong> تأكيد وجود API واكتشاف 7 نقاط نهاية وظيفية
              </div>
              <div className="text-lg text-orange-700">
                <strong>ما تبقى:</strong> الحصول على بيانات المصادقة الصحيحة
              </div>
              <div className="text-lg text-orange-700">
                <strong>الخطوة التالية:</strong> التواصل الفوري مع فريق وكالة الأنباء السعودية
              </div>
              <div className="bg-orange-100 p-4 rounded-lg border border-orange-200">
                <div className="text-orange-800 font-semibold mb-2">
                  🎯 نحن على بُعد خطوة واحدة من النجاح الكامل!
                </div>
                <div className="text-orange-700 text-sm">
                  التقدم من 404 (غير موجود) إلى 401 (غير مصرح) يعني أن جميع الأدوات والكود جاهز، 
                  ونحتاج فقط لبيانات المصادقة الصحيحة لبدء استخدام API بشكل كامل.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default UpdatedRecommendations;

