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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Angle } from "@/types/muqtarab";
import {
  BookOpen,
  Calendar,
  Eye,
  Grid3X3,
  List,
  Loader2,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

// مكون بطاقة الزاوية
const AngleCard = ({ angle }: { angle: Angle }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
      <CardContent className="p-0">
        {/* صورة الغلاف */}
        <div
          className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden rounded-t-lg"
          style={{
            background: angle.themeColor
              ? `linear-gradient(135deg, ${angle.themeColor}, ${angle.themeColor}80)`
              : undefined,
          }}
        >
          {angle.coverImage && (
            <img
              src={angle.coverImage}
              alt={angle.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-4 left-4 flex gap-2">
            {angle.isFeatured && (
              <Badge className="bg-yellow-500/90 text-white">
                <Star className="w-3 h-3 ml-1" />
                مميزة
              </Badge>
            )}
            <Badge
              variant={angle.isPublished ? "default" : "secondary"}
              className={
                angle.isPublished
                  ? "bg-green-500/90 text-white"
                  : "bg-gray-500/90 text-white"
              }
            >
              {angle.isPublished ? "منشورة" : "مسودة"}
            </Badge>
          </div>
        </div>

        {/* محتوى البطاقة */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {angle.title}
            </h3>
            <div className="text-right">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                <BookOpen className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {angle.description}
          </p>

          {/* إحصائيات */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{angle.articlesCount || 0} مقال</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{angle.totalViews || 0} مشاهدة</span>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {new Date(angle.createdAt).toLocaleDateString("ar-SA")}
            </div>
          </div>

          {/* المؤلف */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <Users className="w-3 h-3 text-gray-600" />
              </div>
              <span className="text-sm text-gray-600">
                {angle.author?.name || "غير محدد"}
              </span>
            </div>

            <div className="flex gap-2">
              <Link href={`/admin/muqtarab/angles/${angle.id}`}>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  إدارة
                </Button>
              </Link>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteClick(angle)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MuqtaribDashboard() {
  const router = useRouter();
  const [angles, setAngles] = useState<Angle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPublished, setFilterPublished] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // حالة الحذف
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [angleToDelete, setAngleToDelete] = useState<Angle | null>(null);
  const [deleting, setDeleting] = useState(false);

  // إحصائيات عامة
  const [stats, setStats] = useState({
    totalAngles: 0,
    publishedAngles: 0,
    totalArticles: 0,
    totalViews: 0,
  });

  // جلب البيانات
  useEffect(() => {
    let isMounted = true; // تجنب Race Conditions

    const fetchData = async () => {
      try {
        if (!isMounted) return; // تجنب التنفيذ إذا تم إلغاء التحميل
        setLoading(true);

        // جلب جميع الزوايا
        console.log("🔍 جاري جلب جميع الزوايا من الصفحة الرئيسية...");
        const response = await fetch("/api/muqtarib/angles", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        console.log("📡 استجابة API الزوايا:", response.status, response.ok);

        if (response.ok && isMounted) {
          const data = await response.json();
          console.log("✅ تم جلب الزوايا:", data.angles?.length || 0);
          setAngles(data.angles || []);

          // حساب الإحصائيات
          const totalAngles = data.angles?.length || 0;
          const publishedAngles =
            data.angles?.filter((angle: Angle) => angle.isPublished).length ||
            0;
          const totalArticles =
            data.angles?.reduce(
              (sum: number, angle: Angle) => sum + (angle.articlesCount || 0),
              0
            ) || 0;
          const totalViews =
            data.angles?.reduce(
              (sum: number, angle: Angle) => sum + (angle.totalViews || 0),
              0
            ) || 0;

          setStats({
            totalAngles,
            publishedAngles,
            totalArticles,
            totalViews,
          });
        } else if (isMounted) {
          console.error(
            "❌ فشل API الزوايا:",
            response.status,
            response.statusText
          );
          const errorText = await response.text();
          console.error("📄 محتوى الخطأ:", errorText);
          toast.error("فشل في تحميل الزوايا");
        }
      } catch (error) {
        if (isMounted) {
          console.error("خطأ في جلب البيانات:", error);
          toast.error("حدث خطأ في تحميل البيانات");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // تنظيف عند إلغاء التحميل
    return () => {
      isMounted = false;
    };
  }, []);

  // فلترة الزوايا
  const filteredAngles = angles.filter((angle) => {
    const matchesSearch =
      angle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      angle.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterPublished === null || angle.isPublished === filterPublished;

    return matchesSearch && matchesFilter;
  });

  // وظائف الحذف
  const handleDeleteClick = (angle: Angle) => {
    setAngleToDelete(angle);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!angleToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/muqtarib/angles/${angleToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // إزالة الزاوية من القائمة
        setAngles((prev) =>
          prev.filter((angle) => angle.id !== angleToDelete.id)
        );
        toast.success("تم حذف الزاوية بنجاح!");
        setDeleteModalOpen(false);
        setAngleToDelete(null);

        // تحديث الإحصائيات
        setStats((prev) => ({
          ...prev,
          totalAngles: prev.totalAngles - 1,
          publishedAngles: angleToDelete.isPublished
            ? prev.publishedAngles - 1
            : prev.publishedAngles,
        }));
      } else {
        const error = await response.json();
        toast.error(error.error || "حدث خطأ في حذف الزاوية");
      }
    } catch (error) {
      console.error("خطأ في حذف الزاوية:", error);
      toast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جاري تحميل لوحة تحكم مُقترب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* شريط التنقل العلوي */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">مُقترب</h1>
              <Badge className="bg-blue-100 text-blue-800">
                نظام إدارة الزوايا
              </Badge>
            </div>

            <div className="flex gap-3">
              <Link href="/admin/muqtarab/angles/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء زاوية جديدة
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
          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="إجمالي الزوايا"
              value={stats.totalAngles}
              icon={BookOpen}
              color="bg-blue-500"
              trend={{ value: 8, label: "هذا الشهر" }}
            />

            <StatCard
              title="الزوايا المنشورة"
              value={stats.publishedAngles}
              icon={Eye}
              color="bg-green-500"
            />

            <StatCard
              title="إجمالي المقالات"
              value={stats.totalArticles}
              icon={Calendar}
              color="bg-purple-500"
            />

            <StatCard
              title="إجمالي المشاهدات"
              value={stats.totalViews}
              icon={TrendingUp}
              color="bg-orange-500"
              trend={{ value: 15, label: "هذا الأسبوع" }}
            />
          </div>

          {/* أدوات البحث والفلترة */}
          <Card>
            <CardHeader>
              <CardTitle>إدارة الزوايا</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 flex-1">
                  {/* البحث */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="البحث في الزوايا..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 text-right"
                    />
                  </div>

                  {/* فلتر الحالة */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={filterPublished === null ? "default" : "outline"}
                      onClick={() => setFilterPublished(null)}
                    >
                      الكل
                    </Button>
                    <Button
                      size="sm"
                      variant={filterPublished === true ? "default" : "outline"}
                      onClick={() => setFilterPublished(true)}
                    >
                      منشورة
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        filterPublished === false ? "default" : "outline"
                      }
                      onClick={() => setFilterPublished(false)}
                    >
                      مسودات
                    </Button>
                  </div>
                </div>

                {/* أدوات العرض */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={viewMode === "grid" ? "default" : "outline"}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "list" ? "default" : "outline"}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* قائمة الزوايا */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                الزوايا ({filteredAngles.length})
              </h2>
              {searchTerm && (
                <p className="text-sm text-gray-500">
                  نتائج البحث عن: "{searchTerm}"
                </p>
              )}
            </div>

            {filteredAngles.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    لا توجد زوايا
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm
                      ? "لم يتم العثور على زوايا تطابق البحث"
                      : "ابدأ بإنشاء أول زاوية لك"}
                  </p>
                  <Link href="/admin/muqtarab/angles/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 ml-2" />
                      إنشاء زاوية جديدة
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAngles.map((angle) => (
                  <AngleCard key={angle.id} angle={angle} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal تأكيد الحذف */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600">
              تأكيد حذف الزاوية
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-700 mb-4">
              هل أنت متأكد من حذف الزاوية{" "}
              <strong className="text-gray-900">
                "{angleToDelete?.title}"
              </strong>
              ؟
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium mb-1">تحذير مهم</p>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• سيتم حذف الزاوية نهائياً</li>
                    <li>• سيتم حذف جميع المقالات المرتبطة بها</li>
                    <li>• لا يمكن التراجع عن هذا الإجراء</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف نهائي
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
