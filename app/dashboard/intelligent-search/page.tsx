/**
 * صفحة البحث الذكي
 * Intelligent Search Page
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
  FileText,
  Filter,
  RefreshCw,
  Search,
  Settings,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

interface SearchQuery {
  id: string;
  query: string;
  results: number;
  responseTime: number;
  accuracy: number;
  timestamp: string;
  category: string;
  userId?: string;
}

interface SearchAnalytics {
  totalQueries: number;
  avgResponseTime: number;
  successRate: number;
  popularCategories: string[];
}

const searchQueriesData: SearchQuery[] = [
  {
    id: "1",
    query: "أخبار الذكاء الاصطناعي في السعودية",
    results: 147,
    responseTime: 0.23,
    accuracy: 96,
    timestamp: "2024-01-26T10:30:00Z",
    category: "تقنية",
    userId: "user_123",
  },
  {
    id: "2",
    query: "رؤية 2030 التطورات الجديدة",
    results: 89,
    responseTime: 0.18,
    accuracy: 94,
    timestamp: "2024-01-26T10:25:00Z",
    category: "اقتصاد",
    userId: "user_456",
  },
  {
    id: "3",
    query: "أسعار النفط اليوم",
    results: 234,
    responseTime: 0.15,
    accuracy: 98,
    timestamp: "2024-01-26T10:20:00Z",
    category: "اقتصاد",
  },
  {
    id: "4",
    query: "كأس العالم 2026 المنتخب السعودي",
    results: 67,
    responseTime: 0.31,
    accuracy: 91,
    timestamp: "2024-01-26T10:15:00Z",
    category: "رياضة",
    userId: "user_789",
  },
];

const analyticsData: SearchAnalytics = {
  totalQueries: 15420,
  avgResponseTime: 0.22,
  successRate: 94.7,
  popularCategories: ["اقتصاد", "تقنية", "سياسة", "رياضة", "ثقافة"],
};

export default function IntelligentSearchPage() {
  const [searchQueries, setSearchQueries] = useState(searchQueriesData);
  const [analytics, setAnalytics] = useState(analyticsData);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQueries = searchQueries.filter(
    (query) =>
      query.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      query.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      تقنية: "blue",
      اقتصاد: "green",
      سياسة: "purple",
      رياضة: "orange",
      ثقافة: "pink",
    };
    return colors[category] || "gray";
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return "text-green-600";
    if (accuracy >= 90) return "text-yellow-600";
    return "text-red-600";
  };

  const getResponseTimeColor = (time: number) => {
    if (time <= 0.2) return "text-green-600";
    if (time <= 0.3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <>
      <div className="space-y-6">
        {/* شريط الأدوات العلوي */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Brain className="h-4 w-4 mr-2" />
              تحسين النموذج
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              إعدادات البحث
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              إعادة فهرسة
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="البحث في الاستعلامات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              title: "إجمالي الاستعلامات",
              value: analytics.totalQueries.toLocaleString(),
              icon: Search,
              color: "blue",
            },
            {
              title: "متوسط وقت الاستجابة",
              value: `${analytics.avgResponseTime}s`,
              icon: Zap,
              color: "green",
            },
            {
              title: "معدل النجاح",
              value: `${analytics.successRate}%`,
              icon: Target,
              color: "purple",
            },
            {
              title: "الاستعلامات اليوم",
              value: "2,847",
              icon: TrendingUp,
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

        {/* أداء النموذج */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                أداء نموذج البحث
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "دقة النتائج", value: 96, color: "green" },
                  { label: "فهم السياق", value: 91, color: "blue" },
                  { label: "المعالجة العربية", value: 94, color: "purple" },
                  { label: "سرعة البحث", value: 88, color: "orange" },
                ].map((metric) => (
                  <div key={metric.label} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">
                        {metric.label}
                      </span>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                التصنيفات الأكثر بحثاً
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.popularCategories.map((category, index) => (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full bg-${getCategoryColor(
                          category
                        )}-500`}
                      />
                      <span className="font-medium">{category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-${getCategoryColor(
                            category
                          )}-500`}
                          style={{ width: `${100 - index * 15}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {100 - index * 15}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* قائمة الاستعلامات الأخيرة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              الاستعلامات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredQueries.map((query) => (
                <div
                  key={query.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Search className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{query.query}</span>
                        <Badge
                          className={`bg-${getCategoryColor(
                            query.category
                          )}-100 text-${getCategoryColor(query.category)}-700`}
                        >
                          {query.category}
                        </Badge>
                        {query.userId && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {query.userId}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span>{query.results} نتيجة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap
                            className={`h-4 w-4 ${getResponseTimeColor(
                              query.responseTime
                            )}`}
                          />
                          <span>{query.responseTime}s</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target
                            className={`h-4 w-4 ${getAccuracyColor(
                              query.accuracy
                            )}`}
                          />
                          <span>{query.accuracy}% دقة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            {new Date(query.timestamp).toLocaleTimeString(
                              "ar-SA"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        عرض النتائج
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        تحليل
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* اختبار البحث المباشر */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Search className="h-5 w-5" />
              اختبار البحث المباشر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="جرب البحث هنا..." className="flex-1" />
                <Button className="bg-green-600 hover:bg-green-700">
                  <Search className="h-4 w-4 mr-2" />
                  بحث
                </Button>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                جرب استعلامات مختلفة لاختبار دقة وسرعة نموذج البحث الذكي
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
