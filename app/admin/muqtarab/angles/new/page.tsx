"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CreateAngleForm } from "@/types/muqtarab";
import {
  ArrowLeft,
  Eye,
  Image as ImageIcon,
  Loader2,
  Palette,
  Save,
  Send,
  Sparkles,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// مكونات إضافية للواجهة
const IconSelector = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (icon: string) => void;
}) => {
  const icons = [
    "BookOpen",
    "PenTool",
    "Brain",
    "Lightbulb",
    "Target",
    "Star",
    "Heart",
    "Zap",
    "Coffee",
    "Music",
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {icons.map((icon) => (
        <button
          key={icon}
          type="button"
          onClick={() => onChange(icon)}
          className={`p-3 rounded-lg border-2 transition-all hover:border-blue-400 ${
            value === icon ? "border-blue-500 bg-blue-50" : "border-gray-200"
          }`}
        >
          <Sparkles className="w-5 h-5 mx-auto" />
          <span className="text-xs mt-1 block">{icon}</span>
        </button>
      ))}
    </div>
  );
};

const ColorPicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) => {
  const colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={`w-8 h-8 rounded-full border-2 transition-all ${
            value === color ? "border-gray-400 scale-110" : "border-gray-200"
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
      <div className="flex items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer"
        />
      </div>
    </div>
  );
};

const AnglePreview = ({ formData }: { formData: CreateAngleForm }) => {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          معاينة الزاوية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* معاينة الغلاف */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
          {formData.coverImage ? (
            <img
              src={formData.coverImage}
              alt="غلاف الزاوية"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <ImageIcon className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* معاينة المحتوى */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: formData.themeColor }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3
              className="font-bold text-lg"
              style={{ color: formData.themeColor }}
            >
              {formData.title || "عنوان الزاوية"}
            </h3>
            {formData.isFeatured && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                مميزة
              </span>
            )}
          </div>

          <p className="text-gray-600 text-sm">
            {formData.description || "وصف الزاوية سيظهر هنا..."}
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>بقلم: المؤلف</span>
            <span>•</span>
            <span
              className={`px-2 py-1 rounded-full ${
                formData.isPublished
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {formData.isPublished ? "منشورة" : "مسودة"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CreateAnglePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAngleForm>({
    title: "",
    slug: "",
    description: "",
    icon: "",
    themeColor: "#3B82F6",
    authorId: "", // سيتم تعيينه من المستخدم الحالي
    coverImage: "",
    isFeatured: false,
    isPublished: false,
  });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // جلب بيانات المستخدم الحالي
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData((prev) => ({ ...prev, authorId: parsedUser.id }));
    }
  }, []);

  // توليد slug تلقائياً من العنوان
  useEffect(() => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[\u0600-\u06FF]/g, (match) => match) // الحفاظ على الأحرف العربية
        .replace(/[^\u0600-\u06FF\w\s-]/g, "") // إزالة الرموز الخاصة
        .replace(/\s+/g, "-") // استبدال المسافات بـ -
        .trim();
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title]);

  const handleSubmit = async (publish: boolean = false) => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("يرجى ملء العنوان والوصف");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        isPublished: publish,
      };

      const response = await fetch("/api/muqtarib/angles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          publish ? "تم نشر الزاوية بنجاح!" : "تم حفظ الزاوية كمسودة"
        );

        // التحقق من وجود معرف الزاوية قبل التوجيه
        if (data.angle && data.angle.id) {
          console.log("تم إنشاء الزاوية بمعرف:", data.angle.id);
          router.push(`/admin/muqtarab/angles/${data.angle.id}`);
        } else {
          console.error("معرف الزاوية غير موجود في الاستجابة:", data);
          // توجيه إلى صفحة قائمة الزوايا بدلاً من ذلك
          router.push("/admin/muqtarab");
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "حدث خطأ في الحفظ");
      }
    } catch (error) {
      console.error("خطأ في إنشاء الزاوية:", error);
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صحيح");
      return;
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("type", "angle-cover");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, coverImage: data.url }));
        toast.success("تم رفع الصورة بنجاح");
      } else {
        toast.error("فشل في رفع الصورة");
      }
    } catch (error) {
      console.error("خطأ في رفع الصورة:", error);
      toast.error("حدث خطأ في رفع الصورة");
    }
  };

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
                onClick={() => router.push("/admin/muqtarab")}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة لمُقترب
              </Button>
              <span className="text-gray-400">/</span>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                إنشاء زاوية جديدة
              </h1>
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
                    <Label htmlFor="title">عنوان الزاوية *</Label>
                    <Input
                      id="title"
                      placeholder="مثال: تقنيات الذكاء الاصطناعي"
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
                    <Label htmlFor="slug">رابط الزاوية</Label>
                    <Input
                      id="slug"
                      placeholder="يتم إنشاؤه تلقائياً من العنوان"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }))
                      }
                      className="text-left dir-ltr"
                    />
                    <p className="text-xs text-gray-500">
                      سيكون الرابط: /muqtarib/{formData.slug}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">وصف الزاوية *</Label>
                    <Textarea
                      id="description"
                      placeholder="وصف مختصر يوضح محتوى وهدف هذه الزاوية..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="min-h-24 text-right"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* التصميم والهوية البصرية */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    التصميم والهوية البصرية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>أيقونة الزاوية</Label>
                    <IconSelector
                      value={formData.icon}
                      onChange={(icon) =>
                        setFormData((prev) => ({ ...prev, icon }))
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>اللون المميز للزاوية</Label>
                    <ColorPicker
                      value={formData.themeColor}
                      onChange={(color) =>
                        setFormData((prev) => ({ ...prev, themeColor: color }))
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>صورة الغلاف</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {formData.coverImage ? (
                        <div className="space-y-4">
                          <img
                            src={formData.coverImage}
                            alt="غلاف الزاوية"
                            className="mx-auto max-h-32 rounded-lg"
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
                      <Label htmlFor="featured">زاوية مميزة</Label>
                      <p className="text-sm text-gray-500">
                        ستظهر في القسم المميز بالصفحة الرئيسية
                      </p>
                    </div>
                    <Switch
                      id="featured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          isFeatured: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="published">نشر فوري</Label>
                      <p className="text-sm text-gray-500">
                        جعل الزاوية متاحة للجمهور
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
                  نشر الزاوية
                </Button>
              </div>
            </div>

            {/* معاينة الزاوية */}
            <div className="lg:col-span-1">
              <AnglePreview formData={formData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
