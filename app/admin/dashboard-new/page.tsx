"use client";
import { DesignComponents } from "@/components/design-system/DesignSystemGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  Bell,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewDashboardPage() {
  const stats = [
    { title: "الزوار اليوم", value: "12,842", change: 9.8, up: true, color: "blue", icon: Users },
    { title: "مشاهدات المقالات", value: "48,112", change: 3.1, up: true, color: "purple", icon: TrendingUp },
    { title: "المحتوى المنشور", value: "1,284", change: 1.4, up: true, color: "green", icon: FileText },
    { title: "التعليقات", value: "3,412", change: 5.6, up: true, color: "orange", icon: MessageSquare },
    { title: "الإشعارات", value: "23", change: 2.0, up: false, color: "red", icon: Bell },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6" dir="rtl">

      {/* بطاقات الإحصاءات - تدرجات ناعمة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon as any;
          const ChangeIcon = s.up ? ArrowUpRight : ArrowDownRight;
          const colorBase =
            s.color === "blue"
              ? "from-blue-50 to-indigo-50"
              : s.color === "purple"
              ? "from-purple-50 to-fuchsia-50"
              : s.color === "green"
              ? "from-emerald-50 to-green-50"
              : s.color === "orange"
              ? "from-orange-50 to-amber-50"
              : "from-rose-50 to-red-50";
          const colorText =
            s.color === "blue"
              ? "text-blue-600"
              : s.color === "purple"
              ? "text-purple-600"
              : s.color === "green"
              ? "text-emerald-600"
              : s.color === "orange"
              ? "text-orange-600"
              : "text-rose-600";
          return (
            <Card key={idx} className={cn("border-0 shadow-sm overflow-hidden")}> 
              <CardContent className={cn("p-0")}> 
                <div className={cn("p-5 bg-gradient-to-br", colorBase)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-gray-500">{s.title}</div>
                      <div className={cn("text-2xl font-bold mt-2", colorText)}>{s.value}</div>
                      <div className={cn("mt-1 inline-flex items-center gap-1 text-sm", s.up ? "text-emerald-600" : "text-rose-600")}> 
                        <ChangeIcon className="h-4 w-4" />
                        <span>{s.change}%</span>
                      </div>
                    </div>
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-white/70")}> 
                      <Icon className={cn("h-5 w-5", colorText)} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* الرسوم البيانية + النشاطات */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <DesignComponents.StandardCard className="xl:col-span-2 p-0">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">أداء المنصة</h3>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-200">آخر 7 أيام</Badge>
          </div>
          <Separator />
          {/* Placeholder للرسوم البيانية، يمكن استبداله لاحقاً بـ Recharts */}
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 flex items-center justify-center text-blue-600">
            مخطط بياني (Line/Bar/Pie)
          </div>
        </DesignComponents.StandardCard>

        <DesignComponents.StandardCard className="p-0">
          <div className="p-5 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold">النشاطات الأخيرة</h3>
          </div>
          <Separator />
          <div className="p-4 space-y-4">
            {["نشر مقال جديد", "تعليق جديد بانتظار المراجعة", "تحديث إعدادات النظام"].map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">{i + 1}</div>
                <div>
                  <div className="text-sm font-medium">{t}</div>
                  <div className="text-xs text-gray-500">منذ {5 * (i + 1)} دقائق</div>
                </div>
              </div>
            ))}
          </div>
        </DesignComponents.StandardCard>
      </div>

      {/* أنظمة الذكاء + روابط سريعة */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DesignComponents.StandardCard className="p-0 lg:col-span-2">
          <div className="p-5 flex items-center justify-between">
            <h3 className="font-semibold">حالة الأنظمة الذكية</h3>
            <Badge variant="secondary">مستقر</Badge>
          </div>
          <Separator />
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[
              { name: "التوصيات الذكية", acc: 92.4 },
              { name: "تحليل المشاعر", acc: 94.8 },
              { name: "البحث الذكي", acc: 96.1 },
              { name: "تصنيف المحتوى", acc: 89.2 },
              { name: "كشف الأخطاء", acc: 97.0 },
              { name: "تحسين الأداء", acc: 95.3 },
            ].map((sys, i) => (
              <div key={i} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{sys.name}</span>
                  <span className="text-xs text-gray-500">دقة</span>
                </div>
                <div className="text-lg font-bold text-emerald-600">{sys.acc}%</div>
              </div>
            ))}
          </div>
        </DesignComponents.StandardCard>

        <DesignComponents.StandardCard className="p-0">
          <div className="p-5"><h3 className="font-semibold">روابط سريعة</h3></div>
          <Separator />
          <div className="p-4 grid grid-cols-2 gap-2">
            {[
              { label: "مقال جديد", href: "/admin/news/unified?mode=create" },
              { label: "المستخدمون", href: "/admin/modern/users" },
              { label: "التحليلات", href: "/admin/modern/analytics" },
              { label: "الإعدادات", href: "/admin/modern/settings" },
              { label: "الوسائط", href: "/admin/modern/media" },
              { label: "أنظمة AI", href: "/admin/ai-editor" },
            ].map((link, i) => (
              <a key={i} href={link.href}>
                <Button variant="outline" className="w-full justify-center">
                  {link.label}
                </Button>
              </a>
            ))}
          </div>
        </DesignComponents.StandardCard>
      </div>

      {/* تبويبات إضافية للاستعراض المرئي */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="traffic">الزيارات</TabsTrigger>
          <TabsTrigger value="content">المحتوى</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <DesignComponents.StandardCard className="p-6">قسم نظرة عامة</DesignComponents.StandardCard>
        </TabsContent>
        <TabsContent value="traffic">
          <DesignComponents.StandardCard className="p-6">مصادر الزيارات</DesignComponents.StandardCard>
        </TabsContent>
        <TabsContent value="content">
          <DesignComponents.StandardCard className="p-6">أداء المحتوى</DesignComponents.StandardCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

