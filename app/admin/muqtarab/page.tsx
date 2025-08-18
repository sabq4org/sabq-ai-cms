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

// مكون بطاقة إحصائية - Manus UI
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
    <div className="card" style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'hsl(var(--accent) / 0.1)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(var(--accent))'
        }}>
          <Icon style={{ width: '24px', height: '24px' }} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>{title}</div>
          <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
            {value}
          </div>
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ 
                width: '14px', 
                height: '14px',
                color: trend.value >= 0 ? '#10b981' : '#ef4444'
              }}>
                {trend.value >= 0 ? "↗" : "↘"}
              </span>
              <span className="text-xs" style={{ color: trend.value >= 0 ? '#10b981' : '#ef4444' }}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// مكون بطاقة الزاوية - Manus UI
const AngleCard = ({
  angle,
  handleDeleteClick,
}: {
  angle: Angle;
  handleDeleteClick: (angle: Angle) => void;
}) => {
  return (
    <div className="card interactive">
      {/* صورة الغلاف */}
      <div
        style={{
          height: '192px',
          background: angle.themeColor
            ? `linear-gradient(135deg, ${angle.themeColor}, ${angle.themeColor}80)`
            : 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-2)))',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '12px',
          marginBottom: '16px'
        }}
      >
        {angle.coverImage && (
          <img
            src={angle.coverImage}
            alt={angle.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }} />
        <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
          {angle.isFeatured && (
            <div className="chip" style={{
              background: 'rgba(251, 191, 36, 0.9)',
              color: 'white',
              border: 'none'
            }}>
              <Star style={{ width: '12px', height: '12px', marginLeft: '4px' }} />
              مميزة
            </div>
          )}
          <div
            className="chip"
            style={{
              background: angle.isPublished ? 'rgba(34, 197, 94, 0.9)' : 'rgba(107, 114, 128, 0.9)',
              color: 'white',
              border: 'none'
            }}
          >
            {angle.isPublished ? "منشورة" : "مسودة"}
          </div>
        </div>
      </div>

      {/* محتوى البطاقة */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 className="heading-3" style={{ color: 'hsl(var(--fg))', marginBottom: '0' }}>
            {angle.title}
          </h3>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'hsl(var(--line))'
          }}>
            <BookOpen style={{ width: '16px', height: '16px', color: 'hsl(var(--muted))' }} />
          </div>
        </div>

        <p className="text-sm text-muted" style={{ marginBottom: '16px', lineHeight: '1.5' }}>
          {angle.description}
        </p>

        {/* إحصائيات */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '16px',
          fontSize: '14px',
          color: 'hsl(var(--muted))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BookOpen style={{ width: '16px', height: '16px' }} />
              <span>{angle.articlesCount || 0} مقال</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Eye style={{ width: '16px', height: '16px' }} />
              <span>{angle.totalViews || 0} مشاهدة</span>
            </div>
          </div>
          <div className="text-xs text-muted">
            {new Date(angle.createdAt).toLocaleDateString("ar-SA")}
          </div>
        </div>

        {/* المؤلف والإجراءات */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'hsl(var(--line))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users style={{ width: '12px', height: '12px', color: 'hsl(var(--muted))' }} />
            </div>
            <span className="text-sm text-muted">
              {angle.author?.name || "غير محدد"}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href={`/admin/muqtarab/angles/${angle.id}`}>
              <button className="btn btn-sm btn-primary">
                إدارة
              </button>
            </Link>

            <button
              className="btn btn-sm"
              onClick={() => handleDeleteClick(angle)}
              style={{ color: '#ef4444', borderColor: 'hsl(var(--line))' }}
            >
              <Trash2 style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
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
        const response = await fetch("/api/muqtarab/angles", {
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
      const response = await fetch(
        `/api/muqtarab/corners/${angleToDelete.slug}`,
        {
          method: "DELETE",
        }
      );

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
      <>
        <link rel="stylesheet" href="/manus-ui.css" />
        <div style={{ 
          minHeight: '100vh', 
          background: 'hsl(var(--bg))', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 style={{ width: '32px', height: '32px', color: 'hsl(var(--accent))' }} className="animate-spin mx-auto mb-4" />
            <p style={{ color: 'hsl(var(--muted))' }}>جاري تحميل لوحة تحكم مُقترب...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      <div style={{ 
        minHeight: '100vh', 
        background: 'hsl(var(--bg))', 
        padding: '24px',
        color: 'hsl(var(--fg))'
      }}>
        {/* رسالة الترحيب */}
        <div className="card card-accent" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'hsl(var(--accent) / 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--accent))'
            }}>
              <BookOpen style={{ width: '24px', height: '24px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 className="heading-2" style={{ marginBottom: '8px' }}>
                نظام إدارة مُقترب المتطور
              </h2>
              <p className="text-muted" style={{ marginBottom: '16px' }}>
                إدارة شاملة للزوايا والمحتوى التحليلي مع أدوات ذكية لتنظيم المقالات
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="chip">
                  ✅ {stats.publishedAngles} زاوية منشورة
                </div>
                <div className="chip chip-muted">
                  📊 {stats.totalArticles} مقال إجمالي
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link href="/admin/muqtarab/angles/new">
                <button className="btn btn-primary">
                  <Plus style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
                  إنشاء زاوية جديدة
                </button>
              </Link>

              <button className="btn">
                <Settings style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
                إعدادات
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gap: '32px' }}>
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
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">إدارة الزوايا</h3>
            </div>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* البحث */}
                  <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: 'hsl(var(--muted))', 
                      width: '16px', 
                      height: '16px' 
                    }} />
                    <input
                      placeholder="البحث في الزوايا..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 40px 12px 12px',
                        border: '1px solid hsl(var(--line))',
                        borderRadius: '8px',
                        background: 'hsl(var(--bg-card))',
                        color: 'hsl(var(--fg))',
                        textAlign: 'right'
                      }}
                    />
                  </div>

                  {/* فلتر الحالة */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className={filterPublished === null ? "btn btn-primary btn-sm" : "btn btn-sm"}
                      onClick={() => setFilterPublished(null)}
                    >
                      الكل
                    </button>
                    <button
                      className={filterPublished === true ? "btn btn-primary btn-sm" : "btn btn-sm"}
                      onClick={() => setFilterPublished(true)}
                    >
                      منشورة
                    </button>
                    <button
                      className={filterPublished === false ? "btn btn-primary btn-sm" : "btn btn-sm"}
                      onClick={() => setFilterPublished(false)}
                    >
                      مسودات
                    </button>
                  </div>
                </div>

                {/* أدوات العرض */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className={viewMode === "grid" ? "btn btn-primary btn-sm" : "btn btn-sm"}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 style={{ width: '16px', height: '16px' }} />
                  </button>
                  <button
                    className={viewMode === "list" ? "btn btn-primary btn-sm" : "btn btn-sm"}
                    onClick={() => setViewMode("list")}
                  >
                    <List style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* قائمة الزوايا */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 className="heading-2">
                الزوايا ({filteredAngles.length})
              </h2>
              {searchTerm && (
                <p className="text-sm text-muted">
                  نتائج البحث عن: "{searchTerm}"
                </p>
              )}
            </div>

            {filteredAngles.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <BookOpen style={{ width: '48px', height: '48px', color: 'hsl(var(--muted))', margin: '0 auto 16px' }} />
                <h3 className="heading-3" style={{ marginBottom: '8px' }}>
                  لا توجد زوايا
                </h3>
                <p className="text-muted" style={{ marginBottom: '24px' }}>
                  {searchTerm
                    ? "لم يتم العثور على زوايا تطابق البحث"
                    : "ابدأ بإنشاء أول زاوية لك"}
                </p>
                <Link href="/admin/muqtarab/angles/new">
                  <button className="btn btn-primary">
                    <Plus style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
                    إنشاء زاوية جديدة
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAngles.map((angle) => (
                  <AngleCard
                    key={angle.id}
                    angle={angle}
                    handleDeleteClick={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Modal تأكيد الحذف */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent style={{
          background: 'hsl(var(--bg-card))',
          border: '1px solid hsl(var(--line))',
          color: 'hsl(var(--fg))'
        }}>
          <DialogHeader>
            <DialogTitle style={{ fontSize: '20px', color: '#ef4444' }}>
              تأكيد حذف الزاوية
            </DialogTitle>
          </DialogHeader>

          <div style={{ padding: '16px 0' }}>
            <p style={{ color: 'hsl(var(--fg))', marginBottom: '16px' }}>
              هل أنت متأكد من حذف الزاوية{" "}
              <strong style={{ color: 'hsl(var(--accent))' }}>
                "{angleToDelete?.title}"
              </strong>
              ؟
            </p>

            <div style={{
              background: 'hsl(0 60% 95%)',
              border: '1px solid hsl(0 60% 85%)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Trash2 style={{ width: '20px', height: '20px', color: '#dc2626', marginTop: '2px' }} />
                <div>
                  <p style={{ color: '#7f1d1d', fontWeight: '500', marginBottom: '4px' }}>تحذير مهم</p>
                  <ul style={{ color: '#991b1b', fontSize: '14px', listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '4px' }}>• سيتم حذف الزاوية نهائياً</li>
                    <li style={{ marginBottom: '4px' }}>• سيتم حذف جميع المقالات المرتبطة بها</li>
                    <li>• لا يمكن التراجع عن هذا الإجراء</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter style={{ gap: '8px' }}>
            <button
              className="btn"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              إلغاء
            </button>
            <button
              className="btn"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              style={{ background: '#ef4444', color: 'white', borderColor: '#ef4444' }}
            >
              {deleting ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', marginLeft: '8px' }} className="animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
                  حذف نهائي
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
