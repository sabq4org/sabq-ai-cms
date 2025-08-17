"use client";

import {
  ArrowLeft,
  Calendar,
  Eye,
  Link as LinkIcon,
  Save,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PLACEMENT_OPTIONS = [
  { value: "below_featured", label: "أسفل الأخبار المميزة" },
  { value: "below_custom_block", label: "أسفل المحتوى المخصص" },
  { value: "article_detail_header", label: "رأس صفحة المقال" },
  { value: "sidebar_top", label: "أعلى الشريط الجانبي" },
  { value: "sidebar_bottom", label: "أسفل الشريط الجانبي" },
  { value: "footer_banner", label: "بانر التذييل" },
];

interface FormData {
  title: string;
  image_url: string;
  target_url: string;
  placement: string;
  start_date: string;
  end_date: string;
  is_always_on: boolean; // ✅ إعلان دائم
  max_views: number | null; // ✅ حد أقصى للمشاهدات
}

export default function CreateAdPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    image_url: "",
    target_url: "",
    placement: "",
    start_date: "",
    end_date: "",
    is_always_on: false, // ✅ إعلان دائم
    max_views: null, // ✅ حد أقصى للمشاهدات
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [previewImage, setPreviewImage] = useState<string>("");

  // تسجيل دخول تلقائي للتطوير
  const ensureAuthenticated = async () => {
    try {
      const authResponse = await fetch("/api/auth-test", {
        credentials: "include",
      });

      if (!authResponse.ok) {
        // المستخدم غير مسجل دخول، قم بتسجيل دخول تلقائي
        await fetch("/api/dev-login", {
          method: "POST",
          credentials: "include",
        });
      }
    } catch (error) {
      console.warn("فشل في التحقق من المصادقة:", error);
    }
  };

  // معالجة تغيير الحقول
  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // إزالة خطأ الحقل عند التعديل
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // رفع صورة
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار ملف صورة صحيح");
      return;
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة يجب أن يكون أقل من 5MB");
      return;
    }

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "ads"); // تحديد نوع الرفع للإعلانات

      // التأكد من المصادقة
      await ensureAuthenticated();

      const response = await fetch(`/api/upload-production`, {
        method: "POST",
        credentials: "include", // ✅ إرسال الكوكيز مع الطلب
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.url) {
        handleInputChange("image_url", data.url);
        setPreviewImage(data.url);
      } else {
        console.error("فشل في رفع الصورة:", data);
        alert(`فشل في رفع الصورة: ${data.error || "خطأ غير معروف"}`);
      }
    } catch (error: any) {
      console.error("خطأ في رفع الصورة:", error);
      alert(`خطأ في رفع الصورة: ${error?.message || error}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // التحقق من صحة البيانات
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title?.trim()) {
      newErrors.title = "عنوان الإعلان مطلوب";
    }

    if (!formData.image_url) {
      newErrors.image_url = "صورة الإعلان مطلوبة";
    }

    if (!formData.target_url) {
      newErrors.target_url = "رابط الإعلان مطلوب";
    } else {
      try {
        new URL(formData.target_url);
      } catch {
        newErrors.target_url = "رابط غير صحيح";
      }
    }

    if (!formData.placement) {
      newErrors.placement = "موضع الإعلان مطلوب";
    }

    if (!formData.start_date) {
      newErrors.start_date = "تاريخ البداية مطلوب";
    }

    // التحقق من تاريخ النهاية فقط إذا لم يكن الإعلان دائماً
    if (!formData.is_always_on && !formData.end_date) {
      newErrors.end_date = "تاريخ النهاية مطلوب";
    }

    if (!formData.is_always_on && formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      if (endDate <= startDate) {
        newErrors.end_date = "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
      }
    }

    // التحقق من حد المشاهدات
    if (formData.max_views !== null && formData.max_views <= 0) {
      newErrors.max_views = "حد المشاهدات يجب أن يكون أكبر من صفر";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // التأكد من المصادقة
      await ensureAuthenticated();

      const response = await fetch("/api/ads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ إرسال الكوكيز مع الطلب
        body: JSON.stringify({
          ...formData,
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/admin/ads");
      } else {
        alert(data.error || "فشل في إنشاء الإعلان");
      }
    } catch (error) {
      console.error("خطأ في إنشاء الإعلان:", error);
      alert("خطأ في إنشاء الإعلان");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* الهيدر */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            إنشاء إعلان جديد
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            أضف إعلان جديد لعرضه في الموقع
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* النموذج */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* عنوان الإعلان */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                عنوان الإعلان (اختياري)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="أدخل عنوان الإعلان..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.title}
                </p>
              )}
            </div>

            {/* رفع الصورة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                صورة الإعلان *
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                {uploadingImage ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="mr-2 text-gray-600 dark:text-gray-400">
                      جاري الرفع...
                    </span>
                  </div>
                ) : formData.image_url ? (
                  <div className="space-y-4">
                    <div className="relative w-full h-32 mx-auto rounded-lg overflow-hidden">
                      <Image
                        src={formData.image_url}
                        alt="معاينة الإعلان"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange("image_url", "");
                        setPreviewImage("");
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      إزالة الصورة
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                          اختر صورة الإعلان
                        </span>
                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF حتى 5MB
                        </span>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
              {errors.image_url && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.image_url}
                </p>
              )}
            </div>

            {/* رابط الإعلان */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                رابط الإعلان *
              </label>
              <div className="relative">
                <LinkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="url"
                  value={formData.target_url}
                  onChange={(e) =>
                    handleInputChange("target_url", e.target.value)
                  }
                  placeholder="https://example.com"
                  className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              {errors.target_url && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.target_url}
                </p>
              )}
            </div>

            {/* موضع الإعلان */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                موضع الإعلان *
              </label>
              <select
                value={formData.placement}
                onChange={(e) => handleInputChange("placement", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">اختر موضع الإعلان</option>
                {PLACEMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.placement && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.placement}
                </p>
              )}
            </div>

            {/* التواريخ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تاريخ البداية *
                </label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) =>
                      handleInputChange("start_date", e.target.value)
                    }
                    className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.start_date}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تاريخ النهاية *
                </label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) =>
                      handleInputChange("end_date", e.target.value)
                    }
                    className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.end_date}
                  </p>
                )}
              </div>
            </div>

            {/* ✅ إعدادات متقدمة */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                إعدادات متقدمة
              </h3>

              <div className="space-y-4">
                {/* إعلان دائم */}
                <div className="flex items-center space-x-3 space-x-reverse">
                  <input
                    type="checkbox"
                    id="is_always_on"
                    checked={formData.is_always_on}
                    onChange={(e) =>
                      handleInputChange("is_always_on", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="is_always_on"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    إعلان دائم (بدون تاريخ انتهاء)
                  </label>
                </div>

                {/* حد أقصى للمشاهدات */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    عدد مرات الظهور (اختياري)
                  </label>
                  <div className="relative">
                    <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      min="1"
                      placeholder="مثال: 1000"
                      value={formData.max_views || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "max_views",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    إذا تُرك فارغاً، فلن يكون هناك حد أقصى للمشاهدات
                  </p>
                </div>
              </div>
            </div>

            {/* أزرار الحفظ */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? "جاري الحفظ..." : "حفظ الإعلان"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>

        {/* المعاينة */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              معاينة الإعلان
            </h3>
          </div>

          {formData.image_url ? (
            <div className="space-y-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                إعلان
              </div>
              <div className="relative bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-md transition-shadow">
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                  <Image
                    src={formData.image_url}
                    alt={formData.title || "إعلان"}
                    fill
                    className="object-cover"
                  />
                  {formData.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  )}
                </div>
                {formData.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-medium text-sm line-clamp-2">
                      {formData.title}
                    </h3>
                  </div>
                )}
              </div>
              {formData.target_url && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center truncate">
                  سيتم التوجه إلى: {formData.target_url}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              ارفع صورة لرؤية المعاينة
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
