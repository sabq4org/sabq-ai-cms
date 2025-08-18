"use client";

import React, { useEffect, useState } from "react";
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
  X,
  Check,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// مكون رفع الصور
const ImageUploader = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
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
      formData.append("type", "muqtarab-cover");

      const response = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onChange(data.url);
        toast.success("تم رفع الصورة بنجاح");
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
    <div>
      {value && (
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Image
            src={value}
            alt="صورة الغلاف"
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
            onClick={() => onChange("")}
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

// مكون اختيار اللون
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
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: color,
            border: value === color ? '3px solid hsl(var(--fg))' : '2px solid hsl(var(--line))',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            transform: value === color ? 'scale(1.1)' : 'scale(1)'
          }}
        />
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '2px solid hsl(var(--line))',
            cursor: 'pointer'
          }}
        />
        <span className="text-xs text-muted">مخصص</span>
      </div>
    </div>
  );
};

// مكون معاينة الزاوية
const AnglePreview = ({ formData }: { formData: CreateAngleForm }) => {
  return (
    <div className="card" style={{ position: 'sticky', top: '100px' }}>
      <div className="card-header">
        <h3 className="card-title">
          <Eye style={{ width: '20px', height: '20px' }} />
          معاينة الزاوية
        </h3>
      </div>
      <div style={{ padding: '24px' }}>
        {/* معاينة الغلاف */}
        <div style={{
          aspectRatio: '16/9',
          background: formData.coverImage ? 'transparent' : 'linear-gradient(135deg, hsl(var(--muted) / 0.1), hsl(var(--muted) / 0.2))',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '20px',
          position: 'relative'
        }}>
          {formData.coverImage ? (
            <Image
              src={formData.coverImage}
              alt="غلاف الزاوية"
              fill={true}
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'hsl(var(--muted))'
            }}>
              <ImageIcon style={{ width: '48px', height: '48px' }} />
            </div>
          )}
        </div>

        {/* معاينة المحتوى */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: formData.themeColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="heading-3" style={{ color: formData.themeColor, marginBottom: '4px' }}>
              {formData.title || "عنوان الزاوية"}
            </h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {formData.isFeatured && (
                <span className="chip" style={{ 
                  background: '#fbbf24', 
                  color: '#78350f',
                  border: '1px solid #f59e0b'
                }}>
                  مميزة
                </span>
              )}
              <span className={`chip ${formData.isPublished ? 'chip-success' : 'chip-warning'}`}>
                {formData.isPublished ? 'منشورة' : 'مسودة'}
              </span>
            </div>
          </div>
        </div>

        <p className="text-muted" style={{ lineHeight: '1.6' }}>
          {formData.description || "وصف الزاوية سيظهر هنا..."}
        </p>
      </div>
    </div>
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
    authorId: "",
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

      const response = await fetch("/api/muqtarab/angles", {
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
          router.push(`/admin/muqtarab/angles/${data.angle.id}`);
        } else {
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

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(var(--bg))', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* رسالة الترحيب */}
        <div className="card card-accent" style={{ marginBottom: '32px' }}>
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
            <div style={{ flex: 1 }}>
              <h1 className="heading-2" style={{ marginBottom: '4px' }}>
                إنشاء زاوية جديدة في مُقترب
              </h1>
              <p className="text-muted" style={{ fontSize: '14px' }}>
                أضف زاوية جديدة للكتابة والتعبير عن أفكارك المميزة
              </p>
            </div>
            <button 
              onClick={() => router.push("/admin/muqtarab")}
              className="btn btn-outline"
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              العودة لمُقترب
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          {/* نموذج الإدخال */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* المعلومات الأساسية */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">المعلومات الأساسية</h3>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                    عنوان الزاوية *
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: تقنيات الذكاء الاصطناعي"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                    رابط الزاوية
                  </label>
                  <input
                    type="text"
                    placeholder="يتم إنشاؤه تلقائياً من العنوان"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        slug: e.target.value,
                      }))
                    }
                    className="input"
                    style={{ width: '100%', direction: 'ltr' }}
                  />
                  <p className="text-xs text-muted" style={{ marginTop: '4px' }}>
                    سيكون الرابط: /muqtarab/{formData.slug}
                  </p>
                </div>

                <div>
                  <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                    وصف الزاوية *
                  </label>
                  <textarea
                    placeholder="وصف مختصر يوضح محتوى وهدف هذه الزاوية..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="input"
                    style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* التصميم والهوية البصرية */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Palette style={{ width: '20px', height: '20px' }} />
                  التصميم والهوية البصرية
                </h3>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label className="label" style={{ marginBottom: '12px', display: 'block' }}>
                    اللون المميز للزاوية
                  </label>
                  <ColorPicker
                    value={formData.themeColor}
                    onChange={(color) =>
                      setFormData((prev) => ({ ...prev, themeColor: color }))
                    }
                  />
                </div>

                <div>
                  <label className="label" style={{ marginBottom: '12px', display: 'block' }}>
                    صورة الغلاف
                  </label>
                  <ImageUploader
                    value={formData.coverImage}
                    onChange={(url) =>
                      setFormData((prev) => ({ ...prev, coverImage: url }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* إعدادات النشر */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">إعدادات النشر</h3>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label className="label">زاوية مميزة</label>
                    <p className="text-xs text-muted">ستظهر في القسم المميز بالصفحة الرئيسية</p>
                  </div>
                  <div
                    onClick={() => setFormData((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))}
                    style={{
                      width: '48px',
                      height: '28px',
                      background: formData.isFeatured ? 'hsl(var(--accent))' : '#E5E5EA',
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
                        right: formData.isFeatured ? '2px' : '22px',
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
                    <label className="label">نشر فوري</label>
                    <p className="text-xs text-muted">جعل الزاوية متاحة للجمهور</p>
                  </div>
                  <div
                    onClick={() => setFormData((prev) => ({ ...prev, isPublished: !prev.isPublished }))}
                    style={{
                      width: '48px',
                      height: '28px',
                      background: formData.isPublished ? 'hsl(var(--accent))' : '#E5E5EA',
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
                        right: formData.isPublished ? '2px' : '22px',
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

            {/* أزرار الحفظ */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save style={{ width: '16px', height: '16px' }} />
                    حفظ كمسودة
                  </>
                )}
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="btn"
                style={{ 
                  flex: 1,
                  background: 'hsl(var(--accent))',
                  color: 'white'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} />
                    جاري النشر...
                  </>
                ) : (
                  <>
                    <Send style={{ width: '16px', height: '16px' }} />
                    نشر الزاوية
                  </>
                )}
              </button>
            </div>
          </div>

          {/* معاينة الزاوية */}
          <div>
            <AnglePreview formData={formData} />
          </div>
        </div>
      </div>
    </div>
  );
}
