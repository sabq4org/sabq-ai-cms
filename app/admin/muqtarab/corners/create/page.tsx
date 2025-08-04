"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// تم إزالة DashboardLayout - تستخدم الصفحة layout.tsx الأساسي
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Lightbulb, Palette, Save, Upload, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

// مكون منتقي الألوان
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

// مكون رفع الصورة
const ImageUploader = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (imageUrl: string) => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value || "");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار ملف صورة فقط");
      return;
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    setUploading(true);

    try {
      // إنشاء FormData لرفع الصورة
      const formData = new FormData();
      formData.append("file", file);

      // رفع باستخدام API المحلي
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPreview(data.imageUrl);
          onChange(data.imageUrl);
        } else {
          alert(data.error || "فشل في رفع الصورة");
          throw new Error(data.error);
        }
      } else {
        throw new Error("فشل في رفع الصورة");
      }
    } catch (error) {
      console.error("خطأ في رفع الصورة:", error);
      // Fallback: إنشاء preview محلي
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onChange(result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview("");
    onChange("");
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="معاينة صورة الغلاف"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-gray-600">اختر صورة غلاف للزاوية</p>
            <p className="text-sm text-gray-500">PNG, JPG, GIF حتى 5MB</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="cover-image-upload"
          disabled={uploading}
        />
        <label
          htmlFor="cover-image-upload"
          className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              جاري الرفع...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {preview ? "تغيير الصورة" : "رفع صورة"}
            </>
          )}
        </label>

        {preview && !value?.startsWith("data:") && (
          <Input
            type="url"
            placeholder="أو أدخل رابط صورة"
            value={preview}
            onChange={(e) => {
              setPreview(e.target.value);
              onChange(e.target.value);
            }}
            className="flex-1"
          />
        )}
      </div>
    </div>
  );
};

interface FormData {
  name: string;
  slug: string;
  author_name: string;
  author_bio: string;
  description: string;
  cover_image: string;
  category_id: string;
  themeColor: string;
  ai_enabled: boolean;
  is_active: boolean;
  is_featured: boolean;
}

export default function CreateCornerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    author_name: "",
    author_bio: "",
    description: "",
    cover_image: "",
    category_id: "",
    themeColor: "#3B82F6",
    ai_enabled: true,
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("خطأ في جلب التصنيفات:", error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, "")
      .replace(/-+/g, "-")
      .trim("-");
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // توليد الرابط تلقائياً عند تغيير الاسم
      if (field === "name" && typeof value === "string") {
        updated.slug = generateSlug(value);
      }

      return updated;
    });
  };

  const validateForm = () => {
    const required = ["name", "slug", "author_name"];
    const missing = required.filter(
      (field) => !formData[field as keyof FormData]
    );

    if (missing.length > 0) {
      alert(`يرجى ملء الحقول المطلوبة: ${missing.join(", ")}`);
      return false;
    }

    // التحقق من صحة الرابط
    if (!/^[a-zA-Z0-9\u0600-\u06FF-]+$/.test(formData.slug)) {
      alert("الرابط يجب أن يحتوي على حروف وأرقام وشرطات فقط");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const response = await fetch("/api/admin/muqtarab/corners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/muqtarab/corners?success=created");
      } else {
        const error = await response.json();
        alert(error.error || "حدث خطأ في إنشاء الزاوية");
      }
    } catch (error) {
      console.error("خطأ في إنشاء الزاوية:", error);
      alert("حدث خطأ في إنشاء الزاوية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          رجوع
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            إنشاء زاوية جديدة
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            إنشاء زاوية إبداعية جديدة في منصة مُقترَب
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* العمود الرئيسي */}
          <div className="lg:col-span-2 space-y-6">
            {/* المعلومات الأساسية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  المعلومات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">اسم الزاوية *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="مثال: زاوية أحمد الرحالة"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">رابط الزاوية *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        handleInputChange("slug", e.target.value)
                      }
                      placeholder="مثال: ahmed-rahala"
                      required
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      سيظهر كـ: /muqtarab/{formData.slug}
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">وصف الزاوية</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="وصف مختصر لمحتوى الزاوية وتخصصها..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="cover_image">صورة غلاف الزاوية</Label>
                  <ImageUploader
                    value={formData.cover_image}
                    onChange={(imageUrl) =>
                      handleInputChange("cover_image", imageUrl)
                    }
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    اختر صورة معبرة تمثل محتوى الزاوية وهويتها البصرية
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* معلومات الكاتب */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الكاتب المسؤول</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="author_name">اسم الكاتب *</Label>
                  <Input
                    id="author_name"
                    value={formData.author_name}
                    onChange={(e) =>
                      handleInputChange("author_name", e.target.value)
                    }
                    placeholder="الاسم الكامل للكاتب المسؤول عن الزاوية"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="author_bio">نبذة عن الكاتب</Label>
                  <Textarea
                    id="author_bio"
                    value={formData.author_bio}
                    onChange={(e) =>
                      handleInputChange("author_bio", e.target.value)
                    }
                    placeholder="نبذة مختصرة عن خبرة وتخصص الكاتب..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            {/* إعدادات النشر */}
            <Card>
              <CardHeader>
                <CardTitle>إعدادات النشر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">نشط</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      handleInputChange("is_active", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured">مميز</Label>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      handleInputChange("is_featured", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai_enabled">دعم AI</Label>
                  <Switch
                    id="ai_enabled"
                    checked={formData.ai_enabled}
                    onCheckedChange={(checked) =>
                      handleInputChange("ai_enabled", checked)
                    }
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
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>اللون المميز للزاوية</Label>
                  <ColorPicker
                    value={formData.themeColor}
                    onChange={(color) => handleInputChange("themeColor", color)}
                  />
                  <p className="text-xs text-gray-500">
                    اللون المميز سيظهر في رأس الزاوية والعناصر التفاعلية
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* التصنيف */}
            <Card>
              <CardHeader>
                <CardTitle>التصنيف</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="category_id">تصنيف الزاوية</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    handleInputChange("category_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون تصنيف</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* أزرار الحفظ */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 ml-2" />
                        إنشاء الزاوية
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.back()}
                  >
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
