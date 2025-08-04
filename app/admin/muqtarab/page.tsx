"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  Edit3,
  Eye,
  FileText,
  Lightbulb,
  PlusCircle,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Corner {
  id: string;
  name: string;
  slug: string;
  author_name: string;
  description: string;
  is_active: boolean;
  is_featured: boolean;
  articles_count: number;
  followers_count: number;
  category_name: string;
  created_at: string;
}

interface Stats {
  total_corners: number;
  total_articles: number;
  total_interactions: number;
  active_corners: number;
  published_articles: number;
  total_views: number;
}

export default function MuqtarabAdminPage() {
  const router = useRouter();
  const [corners, setCorners] = useState<Corner[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // جلب الإحصائيات والزوايا
      const [statsResponse, cornersResponse] = await Promise.all([
        fetch("/api/admin/muqtarab/stats"),
        fetch("/api/admin/muqtarab/corners?limit=6"),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      if (cornersResponse.ok) {
        const cornersData = await cornersResponse.json();
        setCorners(cornersData.data.corners || []);
      }
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
      setError("حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCorner = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الزاوية؟")) return;

    try {
      const response = await fetch(`/api/admin/muqtarab/corners/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCorners(corners.filter((corner) => corner.id !== id));
      } else {
        const error = await response.json();
        alert(error.error || "حدث خطأ في حذف الزاوية");
      }
    } catch (error) {
      console.error("خطأ في حذف الزاوية:", error);
      alert("حدث خطأ في حذف الزاوية");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Sparkles className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جاري تحميل وحدة مُقترَب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* شريط التنقل العلوي */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin")}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                ← العودة للوحة الرئيسية
              </Button>
              <span className="text-gray-400">/</span>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                وحدة مُقترَب
              </h1>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/admin/muqtarab/angles/new")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PlusCircle className="w-4 h-4 ml-2" />
                زاوية جديدة
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6" dir="rtl">
        {/* رأس الصفحة */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Lightbulb className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">وحدة مُقترَب</h1>
                <p className="text-blue-100 mt-1">
                  حيث يلتقي الفكر بالتقنية بالأسلوب
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/admin/muqtarib/angles/new")}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <PlusCircle className="w-5 h-5 ml-2" />
                زاوية جديدة
              </Button>
              <Button
                onClick={() => router.push("/admin/muqtarab/articles/create")}
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <FileText className="w-5 h-5 ml-2" />
                مقال جديد
              </Button>
            </div>
          </div>
        </div>

        {/* الإحصائيات */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الزوايا</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.total_corners}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Lightbulb className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي المقالات</p>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.total_articles}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي التفاعلات</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {stats.total_interactions}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي المشاهدات</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {stats.total_views}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Eye className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* الزوايا الحديثة */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                الزوايا الحديثة
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/muqtarab/corners")}
              >
                عرض الكل
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {corners.length === 0 ? (
              <div className="text-center py-12">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  لا توجد زوايا حتى الآن
                </h3>
                <p className="text-gray-600 mb-4">
                  ابدأ بإنشاء أول زاوية إبداعية
                </p>
                <Button
                  onClick={() => router.push("/admin/muqtarib/angles/new")}
                >
                  <PlusCircle className="w-4 h-4 ml-2" />
                  إنشاء زاوية جديدة
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {corners.map((corner) => (
                  <div
                    key={corner.id}
                    className="border rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">
                          {corner.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          بقلم: {corner.author_name}
                        </p>
                        {corner.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                            {corner.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            corner.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {corner.is_active ? "نشط" : "غير نشط"}
                        </span>
                        {corner.is_featured && (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            مميز
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{corner.articles_count} مقال</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{corner.followers_count} متابع</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/admin/muqtarab/corners/${corner.id}`)
                        }
                      >
                        <Eye className="w-4 h-4 ml-1" />
                        عرض
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/admin/muqtarab/corners/${corner.id}/edit`
                          )
                        }
                      >
                        <Edit3 className="w-4 h-4 ml-1" />
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCorner(corner.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 ml-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* الإجراءات السريعة */}
        <Card>
          <CardHeader>
            <CardTitle>الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => router.push("/admin/muqtarab/corners")}
              >
                <Lightbulb className="w-6 h-6 mb-2" />
                إدارة الزوايا
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => router.push("/admin/muqtarab/articles")}
              >
                <FileText className="w-6 h-6 mb-2" />
                إدارة المقالات
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => router.push("/admin/muqtarab/analytics")}
              >
                <TrendingUp className="w-6 h-6 mb-2" />
                التحليلات
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => router.push("/admin/muqtarab/settings")}
              >
                <Brain className="w-6 h-6 mb-2" />
                إعدادات الذكاء الاصطناعي
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
