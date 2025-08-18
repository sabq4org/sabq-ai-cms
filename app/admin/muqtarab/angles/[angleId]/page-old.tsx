"use client";

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
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// مكون رفع الصور للزاوية
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
          if (data.fallback) {
            toast("✅ تم حفظ الصورة محلياً - تعمل بشكل طبيعي", {
              icon: "💾",
              duration: 4000,
            });
          }
        } else {
          toast.error(data.error || "فشل في رفع الصورة");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "فشل في رفع الصورة");
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
    <div className="space-y-3">
      {currentImage && (
        <div className="relative">
          <Image
            src={currentImage}
            alt="صورة الزاوية"
            width={400}
            height={128}
            className="w-full h-32 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => onImageUpload("")}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">جاري رفع الصورة...</span>
          </div>
        ) : (
          <>
            <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                اسحب وأفلت صورة هنا أو انقر لاختيار صورة
              </p>
              <p className="text-xs text-gray-500">PNG، JPG، GIF حتى 5MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
          background: `${getColorHsl(color)}10`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: getColorHsl(color)
        }}>
          <Icon style={{ width: '24px', height: '24px' }} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>{title}</div>
          <div className="heading-3" style={{ margin: '4px 0', color: getColorHsl(color) }}>
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

// مكون قائمة المقالات
const ArticlesList = ({
  articles,
  loading,
  onDeleteArticle,
}: {
  articles: AngleArticle[];
  loading: boolean;
  onDeleteArticle: (article: AngleArticle) => void;
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
      {articles
        .filter((article) => article && article.id)
        .map((article) => (
          <Card key={article.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {article.coverImage && (
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    width={64}
                    height={64}
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
                  <Link href={`/muqtarab/articles/${article.slug}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Link href={`/admin/muqtarab/articles/${article.slug}/edit`}>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeleteArticle(article)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
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
  const [articleToDelete, setArticleToDelete] = useState<AngleArticle | null>(
    null
  );
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
        console.log("🔍 جاري جلب بيانات الزاوية:", angleId);
        const angleResponse = await fetch(`/api/muqtarab/angles/${angleId}`, {
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
              coverImage: angleData.angle.coverImage || "",
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
          router.push("/admin/muqtarab");
          return;
        }

        // جلب المقالات (منشورة ومسودات)
        setArticlesLoading(true);
        console.log("🔍 جاري جلب مقالات الزاوية:", angleId);
        const articlesResponse = await fetch(
          `/api/muqtarab/angles/${angleId}/articles?limit=10`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );
        console.log(
          "📡 استجابة API المقالات:",
          articlesResponse.status,
          articlesResponse.ok
        );

        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          console.log(
            "✅ تم جلب المقالات:",
            articlesData.articles?.length || 0
          );
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

    console.log("🚀 بدء تحميل الصفحة مع angleId:", angleId);
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [angleId, router]);

  // دالة بدء حذف المقال
  const handleDeleteArticleClick = (article: AngleArticle) => {
    console.log("🗑️ طلب حذف المقال:", article.title);
    setArticleToDelete(article);
    setDeleteArticleModalOpen(true);
  };

  // دالة تأكيد حذف المقال
  const handleDeleteArticleConfirm = async () => {
    if (!articleToDelete || !angle) {
      console.error("❌ لا توجد بيانات للحذف");
      return;
    }

    try {
      setDeletingArticle(true);
      console.log("🗑️ جاري حذف المقال:", articleToDelete.title);

      const response = await fetch(
        `/api/muqtarab/articles/${articleToDelete.slug}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      if (response.ok) {
        console.log("✅ تم حذف المقال بنجاح");
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
        console.error("❌ خطأ في حذف المقال:", errorData);
        toast.error(errorData.error || "حدث خطأ أثناء حذف المقال");
      }
    } catch (error) {
      console.error("خطأ في حذف المقال:", error);
      toast.error("حدث خطأ أثناء حذف المقال");
    } finally {
      setDeletingArticle(false);
    }
  };

  // جلب بيانات الزاوية والمقالات
  useEffect(() => {
    if (!angleId) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);

        // جلب بيانات الزاوية
        console.log("🔍 جاري جلب بيانات الزاوية:", angleId);
        const angleResponse = await fetch(`/api/muqtarab/angles/${angleId}`, {
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
              coverImage: angleData.angle.coverImage || "",
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
          router.push("/admin/muqtarab");
          return;
        }

        // جلب المقالات (منشورة ومسودات)
        setArticlesLoading(true);
        console.log("🔍 جاري جلب مقالات الزاوية:", angleId);
        const articlesResponse = await fetch(
          `/api/muqtarab/angles/${angleId}/articles?limit=10`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );
        console.log(
          "📡 استجابة API المقالات:",
          articlesResponse.status,
          articlesResponse.ok
        );

        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          console.log(
            "✅ تم جلب المقالات:",
            articlesData.articles?.length || 0
          );
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

    console.log("🚀 بدء تحميل الصفحة مع angleId:", angleId);
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [angleId, router]);

  if (!angleId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">معرف الزاوية غير صحيح</p>
          <Button
            onClick={() => router.push("/admin/muqtarab")}
            className="mt-4"
          >
            العودة لمُقترب
          </Button>
        </div>
      </div>
    );
  }

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
          <Button onClick={() => router.push("/admin/muqtarab")}>
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة لمُقترب
          </Button>
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

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* هيدر الزاوية */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                {angle.coverImage ? (
                  <Image
                    src={angle.coverImage}
                    alt={angle.title}
                    width={96}
                    height={96}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* قائمة المقالات */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  المقالات ({articles.length})
                </h3>

                <Link href={`/admin/muqtarab/angles/${angleId}/articles/new`}>
                  <Button size="sm">
                    <Plus className="w-4 h-4 ml-2" />
                    مقال جديد
                  </Button>
                </Link>
              </div>

              <ArticlesList
                articles={articles}
                loading={articlesLoading}
                onDeleteArticle={handleDeleteArticleClick}
              />
            </div>

            {/* الشريط الجانبي */}
            <div className="space-y-6">
              {/* النشاط الحديث */}
              <RecentActivity
                activities={
                  articles?.slice(0, 5).map((article: AngleArticle) => ({
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

                        {/* صورة الغلاف */}
                        <div className="grid gap-2">
                          <Label>صورة الغلاف</Label>
                          <AngleImageUploader
                            onImageUpload={(imageUrl) =>
                              handleEditFormChange("coverImage", imageUrl)
                            }
                            currentImage={editFormData.coverImage}
                          />
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

      {/* Modal تأكيد حذف المقال */}
      <Dialog
        open={deleteArticleModalOpen}
        onOpenChange={setDeleteArticleModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">تأكيد حذف المقال</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-700 mb-2">
              هل أنت متأكد من حذف المقال التالي؟
            </p>
            {articleToDelete && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900">
                  {articleToDelete.title}
                </h4>
                {articleToDelete.excerpt && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {articleToDelete.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span>المؤلف: {articleToDelete.author?.name}</span>
                  <span>•</span>
                  <span>{articleToDelete.isPublished ? "منشور" : "مسودة"}</span>
                </div>
              </div>
            )}
            <p className="text-red-600 text-sm mt-3 font-medium">
              ⚠️ هذا الإجراء لا يمكن التراجع عنه
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteArticleModalOpen(false);
                setArticleToDelete(null);
              }}
              disabled={deletingArticle}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteArticleConfirm}
              disabled={deletingArticle}
            >
              {deletingArticle ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف المقال
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
