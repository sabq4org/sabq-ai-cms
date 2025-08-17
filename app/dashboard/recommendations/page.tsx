/**
 * صفحة التوصيات الذكية
 * Smart Recommendations Page
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import {
  BarChart3,
  Brain,
  Clock,
  Eye,
  RefreshCw,
  Settings,
  Target,
  ThumbsUp,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

interface Recommendation {
  id: string;
  title: string;
  type: "article" | "user" | "category";
  confidence: number;
  views: number;
  engagement: number;
  createdAt: string;
  status: "active" | "pending" | "disabled";
}

const recommendationsData: Recommendation[] = [
  {
    id: "1",
    title: "مقال: اتجاهات الذكاء الاصطناعي في 2025",
    type: "article",
    confidence: 94,
    views: 12450,
    engagement: 87,
    createdAt: "2024-01-26T10:30:00Z",
    status: "active",
  },
  {
    id: "2",
    title: "فئة المستخدمين: مهتمون بالتقنية",
    type: "user",
    confidence: 89,
    views: 8230,
    engagement: 76,
    createdAt: "2024-01-26T09:15:00Z",
    status: "active",
  },
  {
    id: "3",
    title: "تصنيف: أخبار الاقتصاد السعودي",
    type: "category",
    confidence: 92,
    views: 15670,
    engagement: 82,
    createdAt: "2024-01-26T08:45:00Z",
    status: "pending",
  },
];

export default function SmartRecommendationsPage() {
  const [recommendations, setRecommendations] = useState(recommendationsData);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecommendations = recommendations.filter((rec) =>
    rec.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return Target;
      case "user":
        return Users;
      case "category":
        return BarChart3;
      default:
        return Brain;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "article":
        return <Badge className="bg-blue-100 text-blue-700">مقال</Badge>;
      case "user":
        return <Badge className="bg-green-100 text-green-700">مستخدم</Badge>;
      case "category":
        return <Badge className="bg-purple-100 text-purple-700">تصنيف</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">نشط</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">معلق</Badge>;
      case "disabled":
        return <Badge variant="secondary">معطل</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* شريط الأدوات العلوي */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Brain className="h-4 w-4 mr-2" />
              تحديث النموذج
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              إعدادات التوصيات
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              إعادة تدريب
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="البحث في التوصيات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              title: "إجمالي التوصيات",
              value: recommendations.length.toString(),
              icon: Brain,
              color: "blue",
            },
            { title: "معدل الدقة", value: "91%", icon: Target, color: "green" },
            { title: "التفاعل", value: "84%", icon: ThumbsUp, color: "purple" },
            {
              title: "المشاهدات اليوم",
              value: "45.2K",
              icon: Eye,
              color: "orange",
            },
          ].map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* نموذج الأداء */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              أداء نموذج التوصيات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "دقة التوصيات", value: 91, color: "green" },
                { label: "سرعة الاستجابة", value: 88, color: "blue" },
                { label: "رضا المستخدمين", value: 94, color: "purple" },
              ].map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <span className="text-sm font-bold">{metric.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-${metric.color}-500 transition-all duration-300`}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* قائمة التوصيات */}
        <div className="space-y-4">
          {filteredRecommendations.map((recommendation) => {
            const TypeIcon = getTypeIcon(recommendation.type);

            return (
              <Card
                key={recommendation.id}
                className="hover:shadow-lg transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                        <TypeIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold">
                            {recommendation.title}
                          </h3>
                          {getTypeBadge(recommendation.type)}
                          {getStatusBadge(recommendation.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-green-500" />
                            <span>الثقة: {recommendation.confidence}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-blue-500" />
                            <span>
                              المشاهدات: {recommendation.views.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4 text-purple-500" />
                            <span>التفاعل: {recommendation.engagement}%</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(
                              recommendation.createdAt
                            ).toLocaleDateString("ar-SA")}
                          </span>
                        </div>

                        {/* شريط الثقة */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>مستوى الثقة</span>
                            <span>{recommendation.confidence}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                              style={{ width: `${recommendation.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        عرض
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        تحرير
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* نصائح تحسين الأداء */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <TrendingUp className="h-5 w-5" />
              اقتراحات لتحسين التوصيات
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 dark:text-blue-300">
            <ul className="space-y-2 text-sm">
              <li>• زيادة كمية البيانات التدريبية لتحسين دقة النموذج</li>
              <li>• تحديث النموذج أسبوعياً لمواكبة تغييرات سلوك المستخدمين</li>
              <li>• تفعيل التعلم المتزايد لتحسين التوصيات في الوقت الفعلي</li>
              <li>• إضافة المزيد من معايير التقييم لضمان جودة التوصيات</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
