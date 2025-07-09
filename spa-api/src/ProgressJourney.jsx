import { CheckCircle, AlertTriangle, XCircle, ArrowRight, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ProgressJourney = ({ progressData, timelineData }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'نجاح': return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'تقدم': return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'فشل': return <XCircle className="w-8 h-8 text-red-500" />;
      default: return <Clock className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'نجاح': return 'from-green-100 to-green-50 border-green-200';
      case 'تقدم': return 'from-yellow-100 to-yellow-50 border-yellow-200';
      case 'فشل': return 'from-red-100 to-red-50 border-red-200';
      default: return 'from-gray-100 to-gray-50 border-gray-200';
    }
  };

  const getTimelineIcon = (status) => {
    switch (status) {
      case 'نجاح': return '🎉';
      case 'فرصة': return '💡';
      case 'تقدم': return '📈';
      case 'تحدي': return '⚡';
      case 'بداية': return '🚀';
      default: return '📍';
    }
  };

  return (
    <section className="py-12 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            رحلة التقدم والإنجاز
          </h2>
          <p className="text-xl text-gray-600">
            من التحديات إلى النجاح - قصة مثابرة وإصرار
          </p>
        </div>

        {/* مراحل التقدم */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            مراحل التطوير الرئيسية
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {progressData.map((phase, index) => (
              <div key={index} className="relative">
                <Card className={`bg-gradient-to-br ${getStatusColor(phase.status)} border-2 hover:shadow-lg transition-shadow`}>
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      {getStatusIcon(phase.status)}
                    </div>
                    <CardTitle className="text-xl">
                      {phase.phase}
                    </CardTitle>
                    <p className="text-gray-600">{phase.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <Badge className={`text-lg px-4 py-2 ${
                          phase.status === 'نجاح' ? 'bg-green-100 text-green-800' :
                          phase.status === 'تقدم' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {phase.result}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                        <strong>التفاصيل:</strong> {phase.details}
                      </div>
                      
                      <div className="text-center">
                        <span className="text-2xl">{phase.icon}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* سهم الانتقال */}
                {index < progressData.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* الخط الزمني */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            الخط الزمني للإنجاز
          </h3>
          
          <div className="relative">
            {/* الخط الرئيسي */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-red-300 via-yellow-300 to-green-300"></div>
            
            <div className="space-y-8">
              {timelineData.map((event, index) => (
                <div key={index} className="relative flex items-center">
                  {/* النقطة */}
                  <div className={`absolute left-6 w-5 h-5 rounded-full border-4 border-white shadow-lg ${
                    event.status === 'نجاح' ? 'bg-green-500' :
                    event.status === 'فرصة' ? 'bg-blue-500' :
                    event.status === 'تقدم' ? 'bg-yellow-500' :
                    event.status === 'تحدي' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}></div>
                  
                  {/* المحتوى */}
                  <div className="ml-16 flex-1">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{getTimelineIcon(event.status)}</span>
                              <h4 className="font-semibold text-gray-800">{event.event}</h4>
                            </div>
                            <p className="text-sm text-gray-600">{event.date}</p>
                          </div>
                          <Badge className={`${
                            event.status === 'نجاح' ? 'bg-green-100 text-green-800' :
                            event.status === 'فرصة' ? 'bg-blue-100 text-blue-800' :
                            event.status === 'تقدم' ? 'bg-yellow-100 text-yellow-800' :
                            event.status === 'تحدي' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {event.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* إحصائيات الرحلة */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-blue-800">
              إحصائيات رحلة النجاح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                <div className="text-sm text-blue-700">مراحل رئيسية</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">6</div>
                <div className="text-sm text-green-700">أحداث مهمة</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">1.5</div>
                <div className="text-sm text-purple-700">ساعة عمل</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
                <div className="text-sm text-orange-700">إصرار ومثابرة</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* رسالة ملهمة */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardContent className="p-8">
              <Zap className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                درس في المثابرة والإصرار
              </h3>
              <p className="text-lg leading-relaxed max-w-4xl mx-auto">
                هذه الرحلة تُظهر أن النجاح ليس مجرد وصول إلى الهدف، بل هو رحلة من التعلم والتطوير المستمر. 
                من الفشل الأولي إلى التقدم التدريجي وصولاً إلى النجاح الكامل، كل خطوة كانت ضرورية لتحقيق الإنجاز النهائي.
              </p>
              <div className="mt-6 text-xl font-semibold">
                "النجاح هو القدرة على الانتقال من فشل إلى فشل دون فقدان الحماس" 🌟
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProgressJourney;

