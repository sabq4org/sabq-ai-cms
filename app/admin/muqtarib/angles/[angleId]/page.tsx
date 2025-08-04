"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Angle, AngleArticle } from "@/types/muqtarab";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  Edit,
  Eye,
  FileText,
  Loader2,
  Plus,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// مكون بطاقة إحصائية
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: { value: number; label: string };
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p
                className={`text-xs ${
                  trend.value >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.value >= 0 ? "↗" : "↘"} {Math.abs(trend.value)}%{" "}
                {trend.label}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// مكون قائمة المقالات
const ArticlesList = ({
  articles,
  loading,
}: {
  articles: AngleArticle[];
  loading: boolean;
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getSentimentLabel = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "إيجابي";
      case "critical":
        return "نقدي";
      default:
        return "محايد";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          لا توجد مقالات
        </h3>
        <p className="text-gray-600 mb-4">
          ابدأ بإنشاء أول مقال في هذه الزاوية
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <Card key={article.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {article.coverImage && (
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {article.title}
                  </h3>

                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-xs ${getSentimentColor(
                        article.sentiment
                      )}`}
                    >
                      {getSentimentLabel(article.sentiment)}
                    </Badge>

                    <Badge
                      variant={article.isPublished ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {article.isPublished ? "منشور" : "مسودة"}
                    </Badge>
                  </div>
                </div>

                {article.excerpt && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{article.author?.name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(article.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{article.views || 0} مشاهدة</span>
                  </div>

                  {article.readingTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readingTime} دقيقة</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/article/${article.id}`}>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>

                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// نشاط حديث
const RecentActivity = ({ activities }: { activities: any[] }) => {
  if (activities.length === 0) {
    return (
      <Card className="p-6 text-center">
        <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm text-gray-500">لا يوجد نشاط حديث</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">النشاط الحديث</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-3 pb-4 border-b last:border-b-0"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString("ar-SA")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function AngleDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const angleId = params.angleId as string;

  const [angle, setAngle] = useState<Angle | null>(null);
  const [articles, setArticles] = useState<AngleArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(false);

  // حالة modal التعديل
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    slug: "",
    description: "",
    themeColor: "#3B82F6",
    isFeatured: false,
    isPublished: false,
  });
  const [editLoading, setEditLoading] = useState(false);

  // جلب بيانات الزاوية والمقالات
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);

        // جلب بيانات الزاوية
        console.log("🔍 جاري جلب بيانات الزاوية:", angleId);
        const angleResponse = await fetch(`/api/muqtarib/angles/${angleId}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        console.log(
          "📡 استجابة API الزاوية:",
          angleResponse.status,
          angleResponse.ok
        );

        if (angleResponse.ok) {
          const angleData = await angleResponse.json();
          console.log("✅ تم جلب بيانات الزاوية:", angleData.angle?.title);
          setAngle(angleData.angle);

          // تحديث form data للتعديل
          if (angleData.angle) {
            setEditFormData({
              title: angleData.angle.title || "",
              slug: angleData.angle.slug || "",
              description: angleData.angle.description || "",
              themeColor: angleData.angle.themeColor || "#3B82F6",
              isFeatured: angleData.angle.isFeatured || false,
              isPublished: angleData.angle.isPublished || false,
            });
          }
        } else {
          console.error(
            "❌ خطأ في جلب الزاوية:",
            angleResponse.status,
            angleResponse.statusText
          );
          const errorText = await angleResponse.text();
          console.error("📄 محتوى خطأ الزاوية:", errorText);
          toast.error("الزاوية غير موجودة");
          router.push("/admin/muqtarib");
          return;
        }

        // جلب المقالات (منشورة ومسودات)
        setArticlesLoading(true);
        console.log("🔍 جاري جلب مقالات الزاوية:", angleId);
        const articlesResponse = await fetch(
          `/api/muqtarib/angles/${angleId}/articles?limit=10`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );
        console.log("📡 استجابة API المقالات:", articlesResponse.status, articlesResponse.ok);
        
        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          console.log("✅ تم جلب المقالات:", articlesData.articles?.length || 0);
          setArticles(articlesData.articles || []);
        } else {
          console.error("❌ خطأ في جلب المقالات:", articlesResponse.status);
          const errorText = await articlesResponse.text();
          console.error("📄 محتوى خطأ المقالات:", errorText);
        }
      } catch (error) {
        if (isMounted) {
          console.error("خطأ في جلب البيانات:", error);
          toast.error("حدث خطأ في تحميل البيانات");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setArticlesLoading(false);
        }
      }
    };

    if (angleId) {
      console.log("🚀 بدء تحميل الصفحة مع angleId:", angleId);
      fetchData();
    } else {
      console.error("❌ angleId غير موجود");
    }

    return () => {
      isMounted = false;
    };
  }, [angleId, router]);

  // وظائف التعديل
  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateAngle = async () => {
    try {
      setEditLoading(true);

      const response = await fetch(`/api/muqtarib/angles/${angleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setAngle(updatedData.angle);
        setEditModalOpen(false);
        toast.success("تم تحديث معلومات الزاوية بنجاح!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "حدث خطأ في التحديث");
      }
    } catch (error) {
      console.error("خطأ في تحديث الزاوية:", error);
      toast.error("حدث خطأ في التحديث");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جاري تحميل لوحة تحكم الزاوية...</p>
        </div>
      </div>
    );
  }

  if (!angle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            الزاوية غير موجودة
          </h2>
          <p className="text-gray-600 mb-6">
            لم يتم العثور على الزاوية المطلوبة
          </p>
          <Button onClick={() => router.push("/admin/muqtarib")}>
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة لمُقترب
          </Button>
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
                onClick={() => router.push("/admin/muqtarib")}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                مُقترب
              </Button>
              <span className="text-gray-400">/</span>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {angle.title}
              </h1>
              {angle.isFeatured && (
                <Badge className="bg-yellow-100 text-yellow-800">مميزة</Badge>
              )}
              <Badge variant={angle.isPublished ? "default" : "secondary"}>
                {angle.isPublished ? "منشورة" : "مسودة"}
              </Badge>
            </div>

            <div className="flex gap-3">
              <Link href={`/admin/muqtarib/angles/${angleId}/articles/new`}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 ml-2" />
                  مقال جديد
                </Button>
              </Link>

              <Button variant="outline">
                <Settings className="w-4 h-4 ml-2" />
                إعدادات
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* هيدر الزاوية */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                {angle.coverImage ? (
                  <img
                    src={angle.coverImage}
                    alt={angle.title}
                    className="w-24 h-24 rounded-2xl object-cover"
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: angle.themeColor }}
                  >
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {angle.title}
                  </h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {angle.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>بقلم: {angle.author?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        أُنشئت في{" "}
                        {new Date(angle.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                    <Link href={`/muqtarib/${angle.slug}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 ml-2" />
                        مشاهدة الزاوية
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="المقالات المنشورة"
              value={angle.articlesCount || 0}
              icon={BookOpen}
              color="bg-blue-500"
            />

            <StatCard
              title="إجمالي المشاهدات"
              value={angle.totalViews || 0}
              icon={Eye}
              color="bg-green-500"
            />

            <StatCard
              title="متوسط وقت القراءة"
              value={`${Math.round(angle.avgReadingTime || 0)} دقيقة`}
              icon={Clock}
              color="bg-purple-500"
            />

            <StatCard
              title="مؤشر النشاط"
              value="85%"
              icon={TrendingUp}
              color="bg-orange-500"
              trend={{ value: 12, label: "هذا الشهر" }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* قائمة المقالات */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  المقالات ({articles.length})
                </h3>

                <Link href={`/admin/muqtarib/angles/${angleId}/articles/new`}>
                  <Button size="sm">
                    <Plus className="w-4 h-4 ml-2" />
                    مقال جديد
                  </Button>
                </Link>
              </div>

              <ArticlesList articles={articles} loading={articlesLoading} />
            </div>

            {/* الشريط الجانبي */}
            <div className="space-y-6">
              {/* النشاط الحديث */}
              <RecentActivity
                activities={
                  angle.recentArticles?.map((article) => ({
                    title: `تم ${article.isPublished ? "نشر" : "حفظ"} "${
                      article.title
                    }"`,
                    timestamp: article.createdAt,
                  })) || []
                }
              />

              {/* إعدادات سريعة */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إعدادات سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Edit className="w-4 h-4 ml-2" />
                        تعديل معلومات الزاوية
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl">
                          تعديل معلومات الزاوية
                        </DialogTitle>
                      </DialogHeader>

                      <div className="grid gap-6 py-4">
                        {/* العنوان */}
                        <div className="grid gap-2">
                          <Label htmlFor="edit-title">العنوان*</Label>
                          <Input
                            id="edit-title"
                            value={editFormData.title}
                            onChange={(e) =>
                              handleEditFormChange("title", e.target.value)
                            }
                            placeholder="أدخل عنوان الزاوية"
                            className="text-right"
                          />
                        </div>

                        {/* الرابط */}
                        <div className="grid gap-2">
                          <Label htmlFor="edit-slug">الرابط (slug)*</Label>
                          <Input
                            id="edit-slug"
                            value={editFormData.slug}
                            onChange={(e) =>
                              handleEditFormChange("slug", e.target.value)
                            }
                            placeholder="رابط-الزاوية"
                            className="text-left direction-ltr"
                          />
                          <p className="text-xs text-gray-500">
                            سيكون الرابط: /muqtarib/{editFormData.slug}
                          </p>
                        </div>

                        {/* الوصف */}
                        <div className="grid gap-2">
                          <Label htmlFor="edit-description">الوصف*</Label>
                          <Textarea
                            id="edit-description"
                            value={editFormData.description}
                            onChange={(e) =>
                              handleEditFormChange(
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="وصف مختصر عن الزاوية"
                            className="text-right min-h-[100px]"
                          />
                        </div>

                        {/* اللون المميز */}
                        <div className="grid gap-2">
                          <Label htmlFor="edit-theme-color">اللون المميز</Label>
                          <div className="flex items-center gap-3">
                            <Input
                              id="edit-theme-color"
                              type="color"
                              value={editFormData.themeColor}
                              onChange={(e) =>
                                handleEditFormChange(
                                  "themeColor",
                                  e.target.value
                                )
                              }
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={editFormData.themeColor}
                              onChange={(e) =>
                                handleEditFormChange(
                                  "themeColor",
                                  e.target.value
                                )
                              }
                              placeholder="#3B82F6"
                              className="flex-1 text-left direction-ltr"
                            />
                          </div>
                        </div>

                        {/* الإعدادات */}
                        <div className="grid gap-4">
                          <div className="flex items-center justify-between">
                            <div className="grid gap-1">
                              <Label htmlFor="edit-featured">زاوية مميزة</Label>
                              <p className="text-xs text-gray-500">
                                إظهار الزاوية في القسم المميز
                              </p>
                            </div>
                            <Switch
                              id="edit-featured"
                              checked={editFormData.isFeatured}
                              onCheckedChange={(checked) =>
                                handleEditFormChange("isFeatured", checked)
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="grid gap-1">
                              <Label htmlFor="edit-published">
                                نشر الزاوية
                              </Label>
                              <p className="text-xs text-gray-500">
                                جعل الزاوية مرئية للقراء
                              </p>
                            </div>
                            <Switch
                              id="edit-published"
                              checked={editFormData.isPublished}
                              onCheckedChange={(checked) =>
                                handleEditFormChange("isPublished", checked)
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <DialogFooter className="gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditModalOpen(false)}
                          disabled={editLoading}
                        >
                          إلغاء
                        </Button>
                        <Button
                          onClick={handleUpdateAngle}
                          disabled={
                            editLoading ||
                            !editFormData.title ||
                            !editFormData.slug ||
                            !editFormData.description
                          }
                        >
                          {editLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin ml-2" />
                              جاري التحديث...
                            </>
                          ) : (
                            "حفظ التغييرات"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 ml-2" />
                    إحصائيات مفصلة
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 ml-2" />
                    إعدادات الخصوصية
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
