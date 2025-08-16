'use client';

import React from 'react';
import { SmartIntegrationProvider } from '@/components/smart-integration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  CheckCircle, 
  Sparkles,
  Info,
  Zap
} from 'lucide-react';

export default function SmartIntegrationPage() {
  return (
    <SmartIntegrationProvider>
      <div className="container mx-auto p-6 space-y-6" dir="rtl">
        {/* العنوان الرئيسي */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">التكامل الذكي النشط</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            النظام الذكي يعمل الآن في الخلفية لتحسين تجربة المستخدم وتقديم محتوى مخصص
          </p>
        </div>

        {/* تأكيد التفعيل */}
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>تم التفعيل بنجاح!</strong> النظام الذكي نشط ويعمل في الوقت الفعلي.
            جميع المكونات تم تحميلها وهي جاهزة للاستخدام.
          </AlertDescription>
        </Alert>

        {/* معلومات النظام */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="text-center">
              <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-blue-800">التوصيات الذكية</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-blue-700">
                نظام متطور لتوصية المحتوى المناسب لكل مستخدم بناءً على اهتماماته وسلوكه
              </CardDescription>
              <Badge className="w-full justify-center mt-3 bg-blue-100 text-blue-800">
                نشط الآن
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="text-center">
              <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-purple-800">الذكاء التحليلي</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-purple-700">
                تحليل متقدم لسلوك المستخدمين وتقديم رؤى ذكية لتحسين المحتوى والتفاعل
              </CardDescription>
              <Badge className="w-full justify-center mt-3 bg-purple-100 text-purple-800">
                نشط الآن
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-green-800">التحديثات المباشرة</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-green-700">
                تحديثات فورية للمحتوى والإشعارات الذكية للحفاظ على تفاعل المستخدمين
              </CardDescription>
              <Badge className="w-full justify-center mt-3 bg-green-100 text-green-800">
                نشط الآن
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* إحصائيات النظام */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              إحصائيات النظام الذكي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">8</div>
                <div className="text-sm text-muted-foreground">مكونات ذكية</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">100%</div>
                <div className="text-sm text-muted-foreground">نسبة التفعيل</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">∞</div>
                <div className="text-sm text-muted-foreground">إمكانيات</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">24/7</div>
                <div className="text-sm text-muted-foreground">نشاط مستمر</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* معلومات المطور */}
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            <strong>للمطورين:</strong> يمكنك الوصول إلى النظام الذكي من خلال{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">useSmartIntegration()</code> hook
            أو استخدام المكونات الفردية مباشرة من{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">@/components/smart-integration</code>
          </AlertDescription>
        </Alert>
      </div>
    </SmartIntegrationProvider>
  );
}
