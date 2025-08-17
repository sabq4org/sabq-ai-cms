import { Lightbulb, Clock, Settings, TrendingUp, Phone, Mail, Globe, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Recommendations = ({ recommendations, supportContacts, nextSteps }) => {
  return (
    <section className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          التوصيات والخطوات التالية
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* التوصيات الفورية */}
          <Card className="border-2 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Clock className="w-5 h-5" />
                التوصيات الفورية
              </CardTitle>
              <Badge className="bg-red-100 text-red-800 w-fit">أولوية عالية</Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recommendations.immediate.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* التوصيات التقنية */}
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Settings className="w-5 h-5" />
                التوصيات التقنية
              </CardTitle>
              <Badge className="bg-yellow-100 text-yellow-800 w-fit">أولوية متوسطة</Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recommendations.technical.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-yellow-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* التوصيات طويلة المدى */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <TrendingUp className="w-5 h-5" />
                التوصيات طويلة المدى
              </CardTitle>
              <Badge className="bg-green-100 text-green-800 w-fit">تطوير مستقبلي</Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recommendations.longTerm.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* معلومات الاتصال للدعم */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Phone className="w-5 h-5" />
                {supportContacts.spa.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <a 
                  href={supportContacts.spa.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  {supportContacts.spa.website}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <a 
                  href={`mailto:${supportContacts.spa.email}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {supportContacts.spa.email}
                </a>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                تواصل مع وكالة الأنباء
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Phone className="w-5 h-5" />
                {supportContacts.media.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-600" />
                <a 
                  href={supportContacts.media.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline text-sm"
                >
                  {supportContacts.media.website}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="text-sm">{supportContacts.media.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-600" />
                <a 
                  href={`mailto:${supportContacts.media.email}`}
                  className="text-green-600 hover:underline text-sm"
                >
                  {supportContacts.media.email}
                </a>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                تواصل مع وزارة الإعلام
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* الخطوات التالية */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Lightbulb className="w-5 h-5" />
              الخطوات التالية المقترحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nextSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Recommendations;

