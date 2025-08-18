"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import React, { useRef, useState } from "react";
// تم إزالة DashboardLayout - تستخدم الصفحة layout.tsx الأساسي
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Image as ImageIcon,
  Palette,
  RotateCcw,
  Save,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";

interface LogoPreviewProps {
  src: string;
  title: string;
  width: number;
  height: number;
  className?: string;
}

const LogoPreview = ({
  src,
  title,
  width,
  height,
  className = "",
}: LogoPreviewProps) => (
  <div
    className={`bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 ${className}`}
  >
    <h4 className="text-sm font-semibold mb-2 text-center text-gray-600">
      {title}
    </h4>
    <div className="flex items-center justify-center">
      <img
        src={src}
        alt={title}
        width={width}
        height={height}
        style={{ objectFit: "contain", maxWidth: "100%", height: "auto" }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
        }}
      />
    </div>
    <p className="text-xs text-gray-500 text-center mt-2">
      {width}×{height} بكسل
    </p>
    <p className="text-[10px] text-center text-gray-400 mt-1 break-all">
      {src}
    </p>
  </div>
);

export default function LogoManagerPage() {
  const [newLogoUrl, setNewLogoUrl] = useState("");
  const [currentLogoUrl, setCurrentLogoUrl] = useState("/logo.png");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // جلب اللوجو الحالي عند تحميل الصفحة
  React.useEffect(() => {
    const fetchCurrentLogo = async () => {
      try {
        const response = await fetch("/api/admin/logo");
        const data = await response.json();

        if (data.success && data.logoUrl) {
          setCurrentLogoUrl(data.logoUrl);
        }
      } catch (error) {
        console.error("خطأ في جلب اللوجو الحالي:", error);
        // البقاء على القيمة الافتراضية
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentLogo();
  }, []);

  // رفع اللوجو الجديد
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("📁 تم تحديد ملف اللوجو:", file.name);

    // التحقق من نوع الملف
    if (
      !file.type.includes("png") &&
      !file.type.includes("svg") &&
      !file.type.includes("jpeg") &&
      !file.type.includes("jpg")
    ) {
      const error = "يرجى اختيار ملف PNG أو SVG أو JPG فقط";
      setUploadError(error);
      toast.error(error);
      return;
    }

    // التحقق من حجم الملف (5MB كحد أقصى)
    if (file.size > 5 * 1024 * 1024) {
      const error = "حجم اللوجو يجب أن يكون أقل من 5MB";
      setUploadError(error);
      toast.error(error);
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const uploadToast = toast.loading("⏳ جاري رفع اللوجو الجديد...");

    try {
      console.log("📤 بدء رفع اللوجو...");

      // إنشاء FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "logo");

      // رفع اللوجو إلى Cloudinary
      const response = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل رفع اللوجو");
      }

      const data = await response.json();

      if (data.success && data.url) {
        console.log("✅ تم الرفع بنجاح، URL:", data.url);

        setNewLogoUrl(data.url);
        setUploadSuccess(true);

        toast.success("✅ تم رفع اللوجو بنجاح! استخدم الزر أدناه لحفظه", {
          id: uploadToast,
          duration: 4000,
        });
      } else {
        throw new Error("فشل في الحصول على رابط اللوجو");
      }
    } catch (error) {
      console.error("❌ خطأ في رفع اللوجو:", error);
      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ أثناء رفع اللوجو";
      setUploadError(errorMessage);

      toast.error(`❌ ${errorMessage}`, {
        id: uploadToast,
        duration: 5000,
      });
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // حفظ اللوجو الجديد
  const handleSaveLogo = async () => {
    if (!newLogoUrl) {
      toast.error("لا يوجد لوجو للحفظ");
      return;
    }

    const saveToast = toast.loading("⏳ جاري حفظ اللوجو...");

    try {
      const response = await fetch("/api/admin/logo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logoUrl: newLogoUrl }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentLogoUrl(newLogoUrl);
        setNewLogoUrl("");
        setUploadSuccess(false);

        toast.success("✅ تم حفظ اللوجو الجديد بنجاح!", { id: saveToast });

        // رسالة توضيحية
        toast(
          "💡 تحديث: قد تحتاج لتحديث الصفحة لرؤية اللوجو الجديد في الهيدر",
          {
            duration: 6000,
            icon: "💡",
          }
        );
      } else {
        throw new Error(data.error || "فشل في حفظ اللوجو");
      }
    } catch (error) {
      console.error("خطأ في حفظ اللوجو:", error);
      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ أثناء حفظ اللوجو";
      toast.error(`❌ ${errorMessage}`, { id: saveToast });
    }
  };

  // إعادة تعيين
  const handleReset = () => {
    setNewLogoUrl("");
    setUploadError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("تم إعادة تعيين النموذج");
  };

  if (loading) {
    return (
      <div 
        className="p-6 flex items-center justify-center h-64"
        style={{ 
          backgroundColor: 'hsl(var(--bg))',
          color: 'hsl(var(--fg))'
        }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: 'hsl(var(--accent))' }}
          ></div>
          <p style={{ color: 'hsl(var(--text-muted))' }}>جاري تحميل إعدادات اللوجو...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="space-y-6"
      style={{ 
        backgroundColor: 'hsl(var(--bg))',
        color: 'hsl(var(--fg))',
        padding: '24px'
      }}
    >
      {/* رسالة ترحيب بتصميم Manus UI */}
      <div className="card card-accent">
        <div className="card-header">
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-2xl shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))'
              }}
            >
              <Palette className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="heading-2">إدارة لوجو الموقع</h1>
              <p className="text-muted mt-1">
                رفع وإدارة لوجو صحيفة سبق الإلكترونية
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <span className="chip">إدارة الهوية البصرية</span>
            <span className="chip">رفع ملفات</span>
            <span className="chip">معاينة مباشرة</span>
          </div>
        </div>
      </div>

      {/* اللوجو الحالي */}
      <div className="card">
        <div className="card-header">
          <div className="card-title flex items-center gap-2">
            <Eye className="w-5 h-5" />
            اللوجو الحالي
          </div>
        </div>
        <div 
          className="p-6"
          style={{ 
            backgroundColor: 'hsl(var(--card-bg))',
            borderTop: '1px solid hsl(var(--border))'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LogoPreview
              src={currentLogoUrl}
              title="الهيدر الرئيسي"
              width={140}
              height={45}
            />
            <LogoPreview
              src={currentLogoUrl}
              title="النسخة المتوسطة"
              width={120}
              height={40}
            />
            <LogoPreview
              src={currentLogoUrl}
              title="النسخة الصغيرة (موبايل)"
              width={100}
              height={32}
            />
          </div>
        </div>
      </div>

      {/* رفع لوجو جديد */}
      <div className="card">
        <div className="card-header">
          <div className="card-title flex items-center gap-2">
            <Upload className="w-5 h-5" />
            رفع لوجو جديد
          </div>
        </div>
        <div 
          className="p-6 space-y-4"
          style={{ 
            backgroundColor: 'hsl(var(--card-bg))',
            borderTop: '1px solid hsl(var(--border))'
          }}
        >
          {/* منطقة الرفع */}
          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
            style={{ 
              borderColor: 'hsl(var(--border))',
              backgroundColor: 'hsl(var(--bg-subtle))'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'hsl(var(--accent))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'hsl(var(--border))';
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".png,.jpg,.jpeg,.svg"
              className="hidden"
              disabled={uploading}
            />

            <div className="space-y-4">
              <div 
                className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'hsl(var(--bg-muted))' }}
              >
                <ImageIcon className="w-8 h-8" style={{ color: 'hsl(var(--text-muted))' }} />
              </div>

              <div>
                <p 
                  className="text-lg font-semibold"
                  style={{ color: 'hsl(var(--fg))' }}
                >
                  اختر لوجو جديد
                </p>
                <p 
                  className="text-sm mt-1"
                  style={{ color: 'hsl(var(--text-muted))' }}
                >
                  PNG، SVG، JPG - حد أقصى 5MB
                </p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn btn-outline"
                style={{ 
                  padding: '12px 24px',
                  fontSize: '16px'
                }}
              >
                {uploading ? (
                  <>
                    <div 
                      className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2"
                      style={{ borderColor: 'hsl(var(--accent))' }}
                    ></div>
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    اختيار ملف
                  </>
                )}
              </button>
            </div>
          </div>

          {/* رسائل الحالة */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {uploadSuccess && newLogoUrl && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                تم رفع اللوجو بنجاح! يمكنك معاينته أدناه ثم حفظه.
              </AlertDescription>
            </Alert>
          )}

          {/* معاينة اللوجو الجديد */}
          {newLogoUrl && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                معاينة اللوجو الجديد
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <LogoPreview
                  src={newLogoUrl}
                  title="الهيدر الرئيسي"
                  width={140}
                  height={45}
                  className="border-green-300 bg-green-50"
                />
                <LogoPreview
                  src={newLogoUrl}
                  title="النسخة المتوسطة"
                  width={120}
                  height={40}
                  className="border-green-300 bg-green-50"
                />
                <LogoPreview
                  src={newLogoUrl}
                  title="النسخة الصغيرة (موبايل)"
                  width={100}
                  height={32}
                  className="border-green-300 bg-green-50"
                />
              </div>

              {/* أزرار التحكم */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleSaveLogo}
                  className="btn"
                  style={{ 
                    backgroundColor: 'hsl(var(--success))',
                    color: 'white',
                    padding: '12px 24px',
                    fontSize: '16px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  حفظ اللوجو الجديد
                </button>

                <button 
                  onClick={handleReset} 
                  className="btn btn-outline"
                  style={{ 
                    padding: '12px 24px',
                    fontSize: '16px'
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  إعادة تعيين
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="card">
        <div className="card-header">
          <div className="card-title flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            معلومات مهمة
          </div>
        </div>
        <div 
          className="p-6"
          style={{ 
            backgroundColor: 'hsl(var(--card-bg))',
            borderTop: '1px solid hsl(var(--border))'
          }}
        >
          <div className="space-y-3 text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
            <div className="flex items-start gap-2">
              <div 
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: 'hsl(var(--accent))' }}
              ></div>
              <p>
                <strong style={{ color: 'hsl(var(--fg))' }}>الأحجام المناسبة:</strong> يُفضل أن يكون اللوجو بأبعاد
                140×45 بكسل أو مضاعفاتها
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div 
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: 'hsl(var(--accent))' }}
              ></div>
              <p>
                <strong style={{ color: 'hsl(var(--fg))' }}>الصيغ المدعومة:</strong> PNG (مُفضل للشفافية)، SVG
                (للجودة العالية)، JPG
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div 
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: 'hsl(var(--accent))' }}
              ></div>
              <p>
                <strong style={{ color: 'hsl(var(--fg))' }}>الخلفية:</strong> يُنصح باستخدام خلفية شفافة (PNG)
                للتوافق مع الوضع الليلي
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div 
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: 'hsl(var(--warning))' }}
              ></div>
              <p>
                <strong style={{ color: 'hsl(var(--fg))' }}>ملاحظة تقنية:</strong> بعد الحفظ، قد تحتاج لتحديث الصفحة
                لرؤية اللوجو الجديد
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
