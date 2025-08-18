"use client";

import React, { useEffect, useState } from "react";
import { Angle, AngleArticle } from "@/types/muqtarab";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  Edit,
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  X,
  Upload,
  Check,
  AlertCircle,
  Hash,
  Zap,
  MessageSquare
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

// مكون رفع الصور
const AngleImageUploader = ({
  onImageUpload,
  currentImage,
}: {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صحيح");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "angle-cover");

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onImageUpload(data.imageUrl);
          toast.success("تم رفع الصورة بنجاح");
        } else {
          toast.error(data.error || "فشل في رفع الصورة");
        }
      } else {
        toast.error("فشل في رفع الصورة");
      }
    } catch (error) {
      console.error("خطأ في رفع الصورة:", error);
      toast.error("حدث خطأ في رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      {currentImage && (
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Image
            src={currentImage}
            alt="صورة الزاوية"
            width={400}
            height={200}
            style={{ 
              width: '100%', 
              height: '200px', 
              objectFit: 'cover', 
              borderRadius: '12px',
              border: '1px solid hsl(var(--line))'
            }}
          />
          <button
            type="button"
            onClick={() => onImageUpload("")}
            className="btn btn-sm"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'hsl(var(--danger))',
              color: 'white',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      )}

      <div
        className="card"
        style={{
          border: dragOver ? '2px dashed hsl(var(--accent))' : '2px dashed hsl(var(--line))',
          background: dragOver ? 'hsl(var(--accent) / 0.05)' : 'hsl(var(--muted) / 0.05)',
          padding: '40px',
          textAlign: 'center',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: 'hsl(var(--accent))' }} />
            <span className="text-muted">جاري رفع الصورة...</span>
          </div>
        ) : (
          <>
            <Upload style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: 'hsl(var(--muted))' }} />
            <div style={{ marginBottom: '8px' }}>
              <p className="text-muted" style={{ marginBottom: '4px' }}>
                اسحب وأفلت صورة هنا أو انقر لاختيار صورة
              </p>
              <p className="text-xs text-muted">PNG، JPG، GIF حتى 5MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

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
    const getColorHsl = (colorName: string) => {
      const colors: Record<string, string> = {
        'bg-blue-500': 'hsl(var(--accent))',
        'bg-green-500': '#10b981',
        'bg-purple-500': '#8b5cf6',
        'bg-orange-500': '#f97316'
      };
      return colors[colorName] || colorName;
    };

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
                {trend.value >= 0 ? (
                  <ArrowUpRight style={{ 
                    width: '14px', 
                    height: '14px',
                    color: '#10b981'
                  }} />
                ) : (
                  <ArrowDownRight style={{ 
                    width: '14px', 
                    height: '14px',
                    color: '#ef4444'
                  }} />
                )}
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

// مكون بطاقة المقال
const ArticleCard = ({
  article,
  onDelete,
}: {
  article: AngleArticle;
  onDelete: () => void;
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
        return { bg: '#10b98110', color: '#10b981', label: 'إيجابي' };
      case "critical":
        return { bg: '#ef444410', color: '#ef4444', label: 'نقدي' };
      default:
        return { bg: 'hsl(var(--accent) / 0.1)', color: 'hsl(var(--accent))', label: 'محايد' };
    }
  };

  const sentiment = getSentimentColor(article.sentiment);

    return (
    <div className="card" style={{ padding: '24px', transition: 'all 0.2s ease' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}>
      <div style={{ display: 'flex', gap: '20px' }}>
                {article.coverImage && (
                  <Image
                    src={article.coverImage}
                    alt={article.title}
            width={80}
            height={80}
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '12px', 
              objectFit: 'cover',
              border: '1px solid hsl(var(--line))'
            }}
          />
        )}

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <div>
              <h3 className="heading-3" style={{ marginBottom: '8px' }}>{article.title}</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <span 
                  className="chip" 
                  style={{ 
                    background: sentiment.bg,
                    color: sentiment.color,
                    border: `1px solid ${sentiment.color}20`
                  }}
                >
                  {sentiment.label}
                </span>
                <span className={`chip ${article.isPublished ? 'chip-success' : 'chip-warning'}`}>
                  {article.isPublished ? 'منشور' : 'مسودة'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href={`/muqtarab/articles/${article.slug}`}>
                <button className="btn btn-sm btn-ghost" title="مشاهدة">
                  <Eye style={{ width: '16px', height: '16px' }} />
                </button>
              </Link>
              <Link href={`/admin/muqtarab/articles/${article.slug}/edit`}>
                <button className="btn btn-sm btn-ghost" title="تعديل">
                  <Edit style={{ width: '16px', height: '16px' }} />
                </button>
              </Link>
              <button 
                onClick={onDelete}
                className="btn btn-sm btn-ghost"
                style={{ color: 'hsl(var(--danger))' }}
                title="حذف"
              >
                <Trash2 style={{ width: '16px', height: '16px' }} />
              </button>
                    </div>
                  </div>

                  {article.excerpt && (
            <p className="text-muted" style={{ marginBottom: '12px', lineHeight: '1.6' }}>
                      {article.excerpt}
                    </p>
                  )}

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users style={{ width: '14px', height: '14px', color: 'hsl(var(--muted))' }} />
              <span className="text-sm text-muted">{article.author?.name}</span>
                    </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar style={{ width: '14px', height: '14px', color: 'hsl(var(--muted))' }} />
              <span className="text-sm text-muted">{formatDate(article.createdAt)}</span>
                    </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye style={{ width: '14px', height: '14px', color: 'hsl(var(--muted))' }} />
              <span className="text-sm text-muted">{article.views || 0} مشاهدة</span>
                    </div>
                    {article.readingTime && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock style={{ width: '14px', height: '14px', color: 'hsl(var(--muted))' }} />
                <span className="text-sm text-muted">{article.readingTime} دقيقة</span>
                      </div>
                    )}
                  </div>
                </div>
                </div>
    </div>
  );
};

export default function AngleDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const angleId = params?.angleId as string;

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
    coverImage: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  // حالة حذف المقالات
  const [deleteArticleModalOpen, setDeleteArticleModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<AngleArticle | null>(null);
  const [deletingArticle, setDeletingArticle] = useState(false);

  // جلب بيانات الزاوية والمقالات
  useEffect(() => {
    if (!angleId) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);

        // جلب بيانات الزاوية
        const angleResponse = await fetch(`/api/muqtarab/angles/${angleId}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (angleResponse.ok) {
          const angleData = await angleResponse.json();
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
              coverImage: angleData.angle.coverImage || "",
            });
          }
        } else {
          toast.error("الزاوية غير موجودة");
          router.push("/admin/muqtarab");
          return;
        }

        // جلب المقالات
        setArticlesLoading(true);
        const articlesResponse = await fetch(
          `/api/muqtarab/angles/${angleId}/articles?limit=10`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          setArticles(articlesData.articles || []);
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

    fetchData();

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

      const response = await fetch(`/api/muqtarab/angles/${angleId}`, {
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

  // دالة بدء حذف المقال
  const handleDeleteArticleClick = (article: AngleArticle) => {
    setArticleToDelete(article);
    setDeleteArticleModalOpen(true);
  };

  // دالة تأكيد حذف المقال
  const handleDeleteArticleConfirm = async () => {
    if (!articleToDelete || !angle) return;

    try {
      setDeletingArticle(true);

      const response = await fetch(
        `/api/muqtarab/articles/${articleToDelete.slug}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("تم حذف المقال بنجاح");

        // تحديث قائمة المقالات
        setArticles((prevArticles) =>
          prevArticles.filter((article) => article.id !== articleToDelete.id)
        );

        // إغلاق Modal
        setDeleteArticleModalOpen(false);
        setArticleToDelete(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "حدث خطأ أثناء حذف المقال");
      }
    } catch (error) {
      console.error("خطأ في حذف المقال:", error);
      toast.error("حدث خطأ أثناء حذف المقال");
    } finally {
      setDeletingArticle(false);
    }
  };

  if (!angleId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--bg))' }}>
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <AlertCircle style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: 'hsl(var(--danger))' }} />
          <p className="heading-3" style={{ marginBottom: '16px' }}>معرف الزاوية غير صحيح</p>
          <button
            onClick={() => router.push("/admin/muqtarab")}
            className="btn"
            style={{ background: 'hsl(var(--accent))', color: 'white' }}
          >
            العودة لمُقترب
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--bg))' }}>
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <Loader2 className="animate-spin" style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: 'hsl(var(--accent))' }} />
          <p className="text-muted">جاري تحميل لوحة تحكم الزاوية...</p>
        </div>
      </div>
    );
  }

  if (!angle) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--bg))' }}>
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <Sparkles style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: 'hsl(var(--muted))' }} />
          <h2 className="heading-2" style={{ marginBottom: '12px' }}>الزاوية غير موجودة</h2>
          <p className="text-muted" style={{ marginBottom: '24px' }}>لم يتم العثور على الزاوية المطلوبة</p>
          <button
            onClick={() => router.push("/admin/muqtarab")}
            className="btn"
            style={{ background: 'hsl(var(--accent))', color: 'white' }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            العودة لمُقترب
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(var(--bg))', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* رسالة الترحيب */}
        <div className="card card-accent" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 className="heading-2" style={{ marginBottom: '4px' }}>
                  إدارة زاوية: {angle.title}
              </h1>
                <p className="text-muted" style={{ fontSize: '14px' }}>
                  {angle.description}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {angle.isFeatured && (
                <span className="chip" style={{ 
                  background: '#fbbf24', 
                  color: '#78350f',
                  border: '1px solid #f59e0b'
                }}>
                  <Sparkles style={{ width: '14px', height: '14px' }} />
                  مميزة
                </span>
              )}
              <span className={`chip ${angle.isPublished ? 'chip-success' : 'chip-warning'}`}>
                {angle.isPublished ? 'منشورة' : 'مسودة'}
              </span>
              <Link href={`/admin/muqtarab/angles/${angleId}/articles/new`}>
                <button className="btn" style={{ background: 'hsl(var(--accent))', color: 'white' }}>
                  <Plus style={{ width: '16px', height: '16px' }} />
                  مقال جديد
                </button>
              </Link>
              <button 
                className="btn btn-outline"
                onClick={() => setEditModalOpen(true)}
              >
                <Settings style={{ width: '16px', height: '16px' }} />
                إعدادات
              </button>
          </div>
        </div>
      </div>

        {/* معلومات الزاوية */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'start' }}>
                {angle.coverImage ? (
                  <Image
                    src={angle.coverImage}
                    alt={angle.title}
                width={120}
                height={120}
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '16px', 
                  objectFit: 'cover',
                  border: '1px solid hsl(var(--line))'
                }}
                  />
                ) : (
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '16px',
                background: angle.themeColor || 'hsl(var(--accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles style={{ width: '48px', height: '48px', color: 'white' }} />
                  </div>
                )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Users style={{ width: '16px', height: '16px', color: 'hsl(var(--muted))' }} />
                <span className="text-muted">بقلم: {angle.author?.name}</span>
                <span className="text-muted">•</span>
                <Calendar style={{ width: '16px', height: '16px', color: 'hsl(var(--muted))' }} />
                <span className="text-muted">
                        {new Date(angle.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
              <Link href={`/muqtarab/${angle.slug}`}>
                <button className="btn btn-outline" style={{ marginTop: '16px' }}>
                  <Eye style={{ width: '16px', height: '16px' }} />
                        مشاهدة الزاوية
                </button>
                    </Link>
                  </div>
                </div>
              </div>

          {/* بطاقات الإحصائيات */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
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
              value={`${Math.round((angle as any).avgReadingTime || 5)} دقيقة`}
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
            {/* قائمة المقالات */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="heading-2">المقالات ({articles.length})</h2>
                <Link href={`/admin/muqtarab/angles/${angleId}/articles/new`}>
                <button className="btn btn-outline">
                  <Plus style={{ width: '16px', height: '16px' }} />
                    مقال جديد
                </button>
                </Link>
              </div>

            {articlesLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card animate-pulse" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ width: '80px', height: '80px', background: 'hsl(var(--muted) / 0.1)', borderRadius: '12px' }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: '24px', background: 'hsl(var(--muted) / 0.1)', borderRadius: '8px', marginBottom: '12px', width: '70%' }}></div>
                        <div style={{ height: '16px', background: 'hsl(var(--muted) / 0.1)', borderRadius: '6px', marginBottom: '8px' }}></div>
                        <div style={{ height: '16px', background: 'hsl(var(--muted) / 0.1)', borderRadius: '6px', width: '40%' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="card" style={{ padding: '80px', textAlign: 'center' }}>
                <FileText style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: 'hsl(var(--muted))' }} />
                <h3 className="heading-3" style={{ marginBottom: '12px' }}>لا توجد مقالات</h3>
                <p className="text-muted" style={{ marginBottom: '24px' }}>ابدأ بإنشاء أول مقال في هذه الزاوية</p>
                <Link href={`/admin/muqtarab/angles/${angleId}/articles/new`}>
                  <button className="btn" style={{ background: 'hsl(var(--accent))', color: 'white' }}>
                    <Plus style={{ width: '16px', height: '16px' }} />
                    إنشاء مقال جديد
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onDelete={() => handleDeleteArticleClick(article)}
                  />
                ))}
              </div>
            )}
            </div>

            {/* الشريط الجانبي */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* النشاط الحديث */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <BarChart3 style={{ width: '20px', height: '20px' }} />
                  النشاط الحديث
                </h3>
              </div>
              <div style={{ padding: '20px' }}>
                {articles.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <BarChart3 style={{ width: '32px', height: '32px', margin: '0 auto 8px', color: 'hsl(var(--muted))' }} />
                    <p className="text-sm text-muted">لا يوجد نشاط حديث</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {articles.slice(0, 5).map((article, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: 'hsl(var(--accent) / 0.1)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FileText style={{ width: '16px', height: '16px', color: 'hsl(var(--accent))' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p className="text-sm" style={{ marginBottom: '2px' }}>
                            تم {article.isPublished ? "نشر" : "حفظ"} "{article.title}"
                          </p>
                          <p className="text-xs text-muted">
                            {new Date(article.createdAt).toLocaleDateString("ar-SA")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

              {/* إعدادات سريعة */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Settings style={{ width: '20px', height: '20px' }} />
                  إعدادات سريعة
                </h3>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  onClick={() => setEditModalOpen(true)}
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <Edit style={{ width: '16px', height: '16px' }} />
                        تعديل معلومات الزاوية
                </button>
                <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  <BarChart3 style={{ width: '16px', height: '16px' }} />
                  إحصائيات مفصلة
                </button>
                <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  <Settings style={{ width: '16px', height: '16px' }} />
                  إعدادات الخصوصية
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal تعديل الزاوية */}
      {editModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '32px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="heading-2">تعديل معلومات الزاوية</h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="btn btn-ghost"
                style={{ padding: '8px' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* العنوان */}
              <div>
                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>العنوان*</label>
                <input
                  type="text"
                            value={editFormData.title}
                  onChange={(e) => handleEditFormChange("title", e.target.value)}
                  className="input"
                  style={{ width: '100%' }}
                            placeholder="أدخل عنوان الزاوية"
                          />
                        </div>

                        {/* الرابط */}
              <div>
                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>الرابط (slug)*</label>
                <input
                  type="text"
                            value={editFormData.slug}
                  onChange={(e) => handleEditFormChange("slug", e.target.value)}
                  className="input"
                  style={{ width: '100%', direction: 'ltr' }}
                            placeholder="رابط-الزاوية"
                          />
                <p className="text-xs text-muted" style={{ marginTop: '4px' }}>
                  سيكون الرابط: /muqtarab/{editFormData.slug}
                          </p>
                        </div>

                        {/* الوصف */}
              <div>
                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>الوصف*</label>
                <textarea
                            value={editFormData.description}
                  onChange={(e) => handleEditFormChange("description", e.target.value)}
                  className="input"
                  style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                            placeholder="وصف مختصر عن الزاوية"
                          />
                        </div>

                        {/* اللون المميز */}
              <div>
                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>اللون المميز</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                              type="color"
                              value={editFormData.themeColor}
                    onChange={(e) => handleEditFormChange("themeColor", e.target.value)}
                    style={{
                      width: '60px',
                      height: '40px',
                      border: '1px solid hsl(var(--line))',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  />
                  <input
                    type="text"
                              value={editFormData.themeColor}
                    onChange={(e) => handleEditFormChange("themeColor", e.target.value)}
                    className="input"
                    style={{ flex: 1, direction: 'ltr' }}
                              placeholder="#3B82F6"
                            />
                          </div>
                        </div>

                        {/* صورة الغلاف */}
              <div>
                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>صورة الغلاف</label>
                          <AngleImageUploader
                  onImageUpload={(imageUrl) => handleEditFormChange("coverImage", imageUrl)}
                            currentImage={editFormData.coverImage}
                          />
                        </div>

                        {/* الإعدادات */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label className="label">زاوية مميزة</label>
                    <p className="text-xs text-muted">إظهار الزاوية في القسم المميز</p>
                            </div>
                  <div
                    onClick={() => handleEditFormChange("isFeatured", !editFormData.isFeatured)}
                    style={{
                      width: '48px',
                      height: '28px',
                      background: editFormData.isFeatured ? 'hsl(var(--accent))' : '#E5E5EA',
                      borderRadius: '14px',
                      position: 'relative',
                      transition: 'background 0.3s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '2px',
                        right: editFormData.isFeatured ? '2px' : '22px',
                        width: '24px',
                        height: '24px',
                        background: 'white',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        transition: 'right 0.3s ease'
                      }}
                    />
                  </div>
                          </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label className="label">نشر الزاوية</label>
                    <p className="text-xs text-muted">جعل الزاوية مرئية للقراء</p>
                            </div>
                  <div
                    onClick={() => handleEditFormChange("isPublished", !editFormData.isPublished)}
                    style={{
                      width: '48px',
                      height: '28px',
                      background: editFormData.isPublished ? 'hsl(var(--accent))' : '#E5E5EA',
                      borderRadius: '14px',
                      position: 'relative',
                      transition: 'background 0.3s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '2px',
                        right: editFormData.isPublished ? '2px' : '22px',
                        width: '24px',
                        height: '24px',
                        background: 'white',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        transition: 'right 0.3s ease'
                      }}
                    />
                  </div>
                          </div>
                        </div>
                      </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button
                          onClick={() => setEditModalOpen(false)}
                          disabled={editLoading}
                className="btn btn-outline"
                        >
                          إلغاء
              </button>
              <button
                          onClick={handleUpdateAngle}
                disabled={editLoading || !editFormData.title || !editFormData.slug || !editFormData.description}
                className="btn"
                style={{ 
                  background: 'hsl(var(--accent))', 
                  color: 'white',
                  flex: 1,
                  opacity: editLoading || !editFormData.title || !editFormData.slug || !editFormData.description ? 0.6 : 1
                }}
                        >
                          {editLoading ? (
                            <>
                    <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} />
                              جاري التحديث...
                            </>
                          ) : (
                  'حفظ التغييرات'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal حذف المقال */}
      {deleteArticleModalOpen && articleToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '32px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'hsl(var(--danger) / 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Trash2 style={{ width: '32px', height: '32px', color: 'hsl(var(--danger))' }} />
              </div>
              <h2 className="heading-2" style={{ marginBottom: '8px' }}>تأكيد حذف المقال</h2>
              <p className="text-muted">هل أنت متأكد من حذف المقال التالي؟</p>
      </div>

            <div className="card" style={{ 
              background: 'hsl(var(--muted) / 0.05)',
              border: '1px solid hsl(var(--line))',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h4 className="heading-3" style={{ marginBottom: '8px' }}>{articleToDelete.title}</h4>
                {articleToDelete.excerpt && (
                <p className="text-sm text-muted" style={{ marginBottom: '8px' }}>
                    {articleToDelete.excerpt}
                  </p>
                )}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span className="text-xs text-muted">المؤلف: {articleToDelete.author?.name}</span>
                <span className="text-xs text-muted">•</span>
                <span className="text-xs text-muted">{articleToDelete.isPublished ? "منشور" : "مسودة"}</span>
                </div>
              </div>

            <div className="alert alert-danger" style={{ marginBottom: '24px' }}>
              <AlertCircle style={{ width: '16px', height: '16px' }} />
              هذا الإجراء لا يمكن التراجع عنه
          </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
              onClick={() => {
                setDeleteArticleModalOpen(false);
                setArticleToDelete(null);
              }}
              disabled={deletingArticle}
                className="btn btn-outline"
                style={{ flex: 1 }}
            >
              إلغاء
              </button>
              <button
              onClick={handleDeleteArticleConfirm}
              disabled={deletingArticle}
                className="btn"
                style={{ 
                  background: 'hsl(var(--danger))', 
                  color: 'white',
                  flex: 1,
                  opacity: deletingArticle ? 0.6 : 1
                }}
            >
              {deletingArticle ? (
                <>
                    <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} />
                  جاري الحذف...
                </>
              ) : (
                <>
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                  حذف المقال
                </>
              )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
