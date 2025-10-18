"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Loader2, 
  Save, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Palette, 
  Tag, 
  Hash, 
  ChevronRight,
  Upload,
  ImageIcon,
  Trash2
} from "lucide-react";

type CategoryResponse = {
  id: string | number;
  name?: string;
  name_ar?: string;
  description?: string;
  is_active?: boolean;
  color?: string;
  icon_url?: string;
  metadata?: any;
  created_at?: string;
};

export default function EditCategoryPageEnhanced() {
  const router = useRouter();
  const params = useParams();
  const id = useMemo(() => String((params as any)?.id || ""), [params]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [color, setColor] = useState("#3B82F6");
  const [iconUrl, setIconUrl] = useState("");
  const [templateType, setTemplateType] = useState<"grid" | "featured" | "mixed">("grid");

  useEffect(() => {
    if (!id) return;
    let canceled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const tryFetch = async (url: string) => {
          const res = await fetch(url, { cache: "no-store", credentials: "include" });
          if (!res.ok) throw new Error(String(res.status));
          return res.json();
        };

        let data: any = null;
        try {
          data = await tryFetch(`/api/categories/${id}`);
        } catch {
          data = await tryFetch(`/api/categories/by-id/${id}`);
        }

        const cat: CategoryResponse = data?.category || data?.data || data;
        if (!cat) throw new Error("NOT_FOUND");

        if (!canceled) {
          setName(cat.name_ar || cat.name || "");
          setDescription(cat.description || "");
          setIsActive(cat.is_active !== false);
          setColor(cat.color || cat?.metadata?.color_hex || "#3B82F6");
          setIconUrl(cat.icon_url || cat?.metadata?.icon_url || "");
          try {
            const meta = typeof cat.metadata === "string" ? JSON.parse(cat.metadata) : (cat.metadata || {});
            const tpl = (meta.template_type || meta.templateType || "grid").toString().toLowerCase();
            setTemplateType(["grid","featured","mixed"].includes(tpl) ? (tpl as any) : "grid");
          } catch {
            setTemplateType("grid");
          }
        }
      } catch (e: any) {
        if (!canceled) setError("تعذر جلب بيانات التصنيف");
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    load();
    return () => { canceled = true; };
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح');
      return;
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('فشل رفع الصورة');
      }

      const data = await res.json();
      setIconUrl(data.url || data.path || '');
      setSuccess('تم رفع الصورة بنجاح');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e?.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setIconUrl('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload: any = {
        name,
        description,
        is_active: isActive,
        color,
        icon_url: iconUrl, // إرسال الـ URL مرة واحدة فقط
        metadata: {
          template_type: templateType,
          // عدم تكرار icon_url في metadata
        },
      };

      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ خطأ API:', errorData);
        throw new Error(errorData.details || errorData.error || "فشل الحفظ");
      }

      setSuccess("تم حفظ التعديلات بنجاح");
      setTimeout(() => {
        router.push("/admin/categories");
      }, 900);
    } catch (e: any) {
      setError(e?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <div className="text-lg text-gray-600 dark:text-gray-400">معرّف التصنيف غير صالح</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-sm">
            <Link 
              href="/admin/categories" 
              className="text-brand-primary hover:text-brand-accent transition-colors"
            >
              التصنيفات
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">تعديل</span>
            <span className="text-gray-900 dark:text-white font-medium">#{id}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
              <span className="mr-3 text-gray-600 dark:text-gray-400">جاري تحميل بيانات التصنيف...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <span className="text-red-800 dark:text-red-200">{error}</span>
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-green-800 dark:text-green-200">{success}</span>
                  </div>
                </div>
              )}

              {/* اسم التصنيف */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline ml-2" />
                  اسم التصنيف
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="أدخل اسم التصنيف"
                />
              </div>

              {/* الوصف */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الوصف
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="وصف مختصر للتصنيف"
                  rows={3}
                />
              </div>

              {/* صورة التصنيف */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <ImageIcon className="w-4 h-4 inline ml-2" />
                  صورة التصنيف (أيقونة)
                </label>
                
                {iconUrl ? (
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                      <Image
                        src={iconUrl}
                        alt="صورة التصنيف"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {iconUrl}
                      </p>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        إزالة الصورة
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="icon-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="icon-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {uploading ? (
                        <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                      ) : (
                        <Upload className="w-12 h-12 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {uploading ? 'جاري الرفع...' : 'انقر لرفع صورة'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        PNG, JPG, SVG (حد أقصى 5MB)
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* الحالة وقالب العرض */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الحالة
                  </label>
                  <select
                    value={isActive ? 'active' : 'inactive'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    قالب العرض
                  </label>
                  <select
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="grid">Grid (شبكة)</option>
                    <option value="featured">Featured + List (مميز + قائمة)</option>
                    <option value="mixed">Mixed (مختلط)</option>
                  </select>
                </div>
              </div>

              {/* اللون */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Palette className="w-4 h-4 inline ml-2" />
                  لون التصنيف
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="#3B82F6"
                  />
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>

              {/* الأزرار */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  حفظ التعديلات
                </button>
                <button
                  onClick={() => router.push('/admin/categories')}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  <X className="w-5 h-5" />
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

