"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Angle, MuqtaribArticleForm } from "@/types/muqtarab";
import {
  ArrowLeft,
  Brain,
  Calendar,
  Clock,
  Eye,
  Hash,
  Image as ImageIcon,
  Loader2,
  Save,
  Send,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// مكونات محرر المحتوى المتقدم
const ContentEditor = ({
  content,
  onChange,
}: {
  content: string;
  onChange: (content: string) => void;
}) => {
  return (
    <div className="space-y-3">
      <div className="border rounded-lg p-4 min-h-[400px] bg-white">
        <div className="flex items-center gap-2 pb-3 border-b mb-3">
          <div className="flex gap-1">
            <button className="p-2 rounded hover:bg-gray-100" title="عريض">
              <strong>B</strong>
            </button>
            <button className="p-2 rounded hover:bg-gray-100" title="مائل">
              <em>I</em>
            </button>
            <button className="p-2 rounded hover:bg-gray-100" title="تسطير">
              <u>U</u>
            </button>
          </div>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <div className="flex gap-1">
            <button className="p-2 rounded hover:bg-gray-100" title="عنوان 1">
              H1
            </button>
            <button className="p-2 rounded hover:bg-gray-100" title="عنوان 2">
              H2
            </button>
            <button className="p-2 rounded hover:bg-gray-100" title="عنوان 3">
              H3
            </button>
          </div>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button className="p-2 rounded hover:bg-gray-100" title="رابط">
            🔗
          </button>
          <button className="p-2 rounded hover:bg-gray-100" title="صورة">
            📷
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="اكتب محتوى المقال هنا..."
          className="w-full h-80 resize-none border-none outline-none text-right"
          dir="rtl"
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock className="w-4 h-4" />
        <span>
          وقت القراءة المقدر: {Math.ceil(content.split(" ").length / 200)} دقيقة
        </span>
      </div>
    </div>
  );
};

// منتقي الوسوم
const TagsInput = ({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      onChange([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="أضف وسم..."
          className="flex-1 text-right"
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag}>
          <Hash className="w-4 h-4" />
        </Button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

// منتقي اتجاه المقال
const SentimentSelector = ({
  value,
  onChange,
}: {
  value: "neutral" | "positive" | "critical";
  onChange: (sentiment: "neutral" | "positive" | "critical") => void;
}) => {
  const sentiments = [
    {
      key: "neutral",
      label: "محايد",
      color: "bg-blue-100 text-blue-800",
      icon: "😐",
    },
    {
      key: "positive",
      label: "إيجابي",
      color: "bg-green-100 text-green-800",
      icon: "😊",
    },
    {
      key: "critical",
      label: "نقدي",
      color: "bg-red-100 text-red-800",
      icon: "🤔",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {sentiments.map((sentiment) => (
        <button
          key={sentiment.key}
          type="button"
          onClick={() => onChange(sentiment.key as any)}
          className={`p-4 rounded-lg border-2 transition-all text-center ${
            value === sentiment.key
              ? "border-blue-500 " + sentiment.color
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="text-2xl mb-2">{sentiment.icon}</div>
          <div className="font-medium">{sentiment.label}</div>
        </button>
      ))}
    </div>
  );
};

// معاينة المقال
const ArticlePreview = ({
  formData,
  angle,
}: {
  formData: MuqtaribArticleForm;
  angle: Angle;
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "😊";
      case "critical":
        return "🤔";
      default:
        return "😐";
    }
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          معاينة المقال
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* معلومات الزاوية */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: angle.themeColor }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-sm">{angle.title}</p>
            <p className="text-xs text-gray-500">الزاوية</p>
          </div>
        </div>

        {/* صورة الغلاف */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
          {formData.coverImage ? (
            <img
              src={formData.coverImage}
              alt="غلاف المقال"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <ImageIcon className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* محتوى المعاينة */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg leading-tight">
            {formData.title || "عنوان المقال"}
          </h3>

          {formData.excerpt && (
            <p className="text-gray-600 text-sm leading-relaxed">
              {formData.excerpt}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs">
            <Badge className="text-xs">
              {getSentimentIcon(formData.sentiment || "neutral")}
              {formData.sentiment === "positive"
                ? "إيجابي"
                : formData.sentiment === "critical"
                ? "نقدي"
                : "محايد"}
            </Badge>

            <Badge variant="outline" className="text-xs">
              {formData.isPublished ? "منشور" : "مسودة"}
            </Badge>
          </div>

          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {formData.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{formData.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>المؤلف</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(new Date())}</span>
            </div>
            {formData.readingTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formData.readingTime} دقيقة</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CreateAngleArticlePage() {
  const router = useRouter();
  const params = useParams();
  const angleId = params.angleId as string;

  const [loading, setLoading] = useState(false);
  const [angle, setAngle] = useState<Angle | null>(null);
  const [angleLoading, setAngleLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const [formData, setFormData] = useState<MuqtaribArticleForm>({
    angleId,
    title: "",
    excerpt: "",
    content: "",
    tags: [],
    readingTime: 0,
    authorId: "", // سيتم تعيينه من المستخدم الحالي
    sentiment: "neutral",
    isPublished: false,
  });

  const [user, setUser] = useState<any>(null);

  // جلب بيانات الزاوية والمستخدم
  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب بيانات المستخدم
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setFormData((prev) => ({
            ...prev,
            authorId: parsedUser.id,
          }));
        } else {
          // fallback: استخدام أول مستخدم من النظام
          try {
            const usersResponse = await fetch('/api/users');
            if (usersResponse.ok) {
              const usersData = await usersResponse.json();
              if (usersData.users && usersData.users.length > 0) {
                setFormData((prev) => ({ ...prev, authorId: usersData.users[0].id }));
              }
            }
          } catch (error) {
            console.error('خطأ في جلب المستخدمين:', error);
          }
        }

        // جلب بيانات الزاوية
        const response = await fetch(`/api/muqtarib/angles/${angleId}`);
        if (response.ok) {
          const data = await response.json();
          setAngle(data.angle);
        } else {
          toast.error("الزاوية غير موجودة");
          router.push("/admin/muqtarib");
        }
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        toast.error("حدث خطأ في تحميل البيانات");
      } finally {
        setAngleLoading(false);
      }
    };

    fetchData();
  }, [angleId, router]);

  // حساب وقت القراءة تلقائياً
  useEffect(() => {
    const wordCount = formData.content
      .split(" ")
      .filter((word) => word.trim()).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 كلمة في الدقيقة
    setFormData((prev) => ({ ...prev, readingTime }));
  }, [formData.content]);

  // تحليل اتجاه المقال بالذكاء الاصطناعي
  const analyzeSentiment = async () => {
    if (!formData.content.trim()) {
      toast.error("يرجى كتابة محتوى المقال أولاً");
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch("/api/ai/analyze-sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: formData.content,
          title: formData.title,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, sentiment: data.sentiment }));
        toast.success(
          `تم تحليل الاتجاه: ${
            data.sentiment === "positive"
              ? "إيجابي"
              : data.sentiment === "critical"
              ? "نقدي"
              : "محايد"
          }`
        );
      } else {
        toast.error("فشل في تحليل الاتجاه");
      }
    } catch (error) {
      console.error("خطأ في تحليل الاتجاه:", error);
      toast.error("حدث خطأ في تحليل الاتجاه");
    } finally {
      setAnalyzing(false);
    }
  };

  // رفع صورة الغلاف
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صحيح");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("type", "article-cover");

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFormData((prev) => ({ ...prev, coverImage: data.imageUrl }));
          toast.success("تم رفع الصورة بنجاح");
          if (data.fallback) {
            toast("تم استخدام حفظ محلي للصورة", { icon: "⚠️" });
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
    }
  };

  // حفظ المقال
  const handleSubmit = async (publish: boolean = false) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("يرجى ملء العنوان والمحتوى");
      return;
    }

    if (!formData.authorId) {
      toast.error("خطأ في تحديد المؤلف، يرجى تسجيل الدخول مرة أخرى");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        isPublished: publish,
        publishDate: publish ? new Date() : undefined,
      };

      console.log("📤 إرسال بيانات المقال:", payload);

      const response = await fetch(`/api/muqtarib/angles/${angleId}/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📡 استجابة API:", response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ تم حفظ المقال:", data);
        toast.success(
          publish ? "تم نشر المقال بنجاح!" : "تم حفظ المقال كمسودة"
        );
        router.push(`/admin/muqtarib/angles/${angleId}`);
      } else {
        const errorText = await response.text();
        console.error("❌ خطأ API:", response.status, errorText);

        try {
          const errorJson = JSON.parse(errorText);
          toast.error(errorJson.error || "حدث خطأ في الحفظ");
        } catch {
          toast.error(`خطأ ${response.status}: ${errorText.substring(0, 100)}`);
        }
      }
    } catch (error) {
      console.error("خطأ في حفظ المقال:", error);
      toast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  if (angleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جاري تحميل بيانات الزاوية...</p>
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
                onClick={() => router.push(`/admin/muqtarib/angles/${angleId}`)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                {angle.title}
              </Button>
              <span className="text-gray-400">/</span>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                مقال جديد
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={analyzeSentiment}
                disabled={analyzing || !formData.content.trim()}
              >
                {analyzing ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 ml-2" />
                )}
                تحليل الاتجاه
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* نموذج الإدخال */}
            <div className="lg:col-span-2 space-y-6">
              {/* المعلومات الأساسية */}
              <Card>
                <CardHeader>
                  <CardTitle>المعلومات الأساسية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان المقال *</Label>
                    <Input
                      id="title"
                      placeholder="عنوان جذاب ومعبر..."
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">الملخص (اختياري)</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="ملخص مختصر يظهر في بطاقة المقال..."
                      value={formData.excerpt}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          excerpt: e.target.value,
                        }))
                      }
                      className="min-h-20 text-right"
                      maxLength={300}
                    />
                    <p className="text-xs text-gray-500 text-left">
                      {formData.excerpt?.length || 0}/300
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* محتوى المقال */}
              <Card>
                <CardHeader>
                  <CardTitle>محتوى المقال</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContentEditor
                    content={formData.content}
                    onChange={(content) =>
                      setFormData((prev) => ({ ...prev, content }))
                    }
                  />
                </CardContent>
              </Card>

              {/* التصنيف والوسوم */}
              <Card>
                <CardHeader>
                  <CardTitle>التصنيف والوسوم</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>اتجاه المقال</Label>
                    <SentimentSelector
                      value={formData.sentiment || "neutral"}
                      onChange={(sentiment) =>
                        setFormData((prev) => ({ ...prev, sentiment }))
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>الوسوم</Label>
                    <TagsInput
                      tags={formData.tags || []}
                      onChange={(tags) =>
                        setFormData((prev) => ({ ...prev, tags }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* صورة الغلاف */}
              <Card>
                <CardHeader>
                  <CardTitle>صورة الغلاف</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {formData.coverImage ? (
                      <div className="space-y-4">
                        <img
                          src={formData.coverImage}
                          alt="غلاف المقال"
                          className="mx-auto max-h-48 rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              coverImage: undefined,
                            }))
                          }
                        >
                          إزالة الصورة
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 mx-auto text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">
                            اسحب وأفلت الصورة هنا أو
                          </p>
                          <Label
                            htmlFor="cover-upload"
                            className="cursor-pointer text-blue-600 hover:text-blue-700"
                          >
                            اختر ملف
                          </Label>
                          <input
                            id="cover-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG أو GIF (أقصى حجم: 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* إعدادات النشر */}
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات النشر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="published">نشر فوري</Label>
                      <p className="text-sm text-gray-500">
                        جعل المقال متاحاً للقراء
                      </p>
                    </div>
                    <Switch
                      id="published"
                      checked={formData.isPublished}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          isPublished: checked,
                        }))
                      }
                    />
                  </div>

                  {formData.isPublished && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        سيتم نشر المقال فور الحفظ وسيكون متاحاً للقراء في زاوية
                        "{angle.title}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* أزرار الحفظ */}
              <div className="flex gap-4">
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 ml-2" />
                  )}
                  حفظ كمسودة
                </Button>
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 ml-2" />
                  )}
                  نشر المقال
                </Button>
              </div>
            </div>

            {/* معاينة المقال */}
            <div className="lg:col-span-1">
              <ArticlePreview formData={formData} angle={angle} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
