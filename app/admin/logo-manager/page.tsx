"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل إعدادات اللوجو...</p>
        </div>
      </div>
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
              background: 'linear-gradient(135deg, hsl(var(--accent-2)), hsl(var(--accent)))',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Palette style={{ width: '24px', height: '24px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 className="heading-2" style={{ marginBottom: '8px' }}>
                إدارة لوجو الموقع
              </h2>
              <p className="text-muted" style={{ marginBottom: '16px' }}>
                رفع وإدارة لوجو صحيفة سبق الإلكترونية مع معاينة فورية
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="chip">
                  🖼️ معاينة فورية
                </div>
                <div className="chip chip-muted">
                  ☁️ رفع سحابي
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">

      {/* اللوجو الحالي */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Eye style={{ width: '20px', height: '20px', marginLeft: '8px' }} />
            اللوجو الحالي
          </h3>
        </div>
        <div style={{ padding: '0 24px 24px 24px' }}>
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
          <h3 className="card-title">
            <Upload style={{ width: '20px', height: '20px', marginLeft: '8px' }} />
            رفع لوجو جديد
          </h3>
        </div>
        <div style={{ padding: '0 24px 24px 24px', display: 'grid', gap: '16px' }}>
          {/* منطقة الرفع */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".png,.jpg,.jpeg,.svg"
              className="hidden"
              disabled={uploading}
            />

            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>

              <div>
                <p className="text-lg font-semibold text-gray-700">
                  اختر لوجو جديد
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PNG، SVG، JPG - حد أقصى 5MB
                </p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn btn-primary"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
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
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleSaveLogo}
                  className="btn"
                  style={{
                    background: 'hsl(var(--accent-3))',
                    color: 'white',
                    borderColor: 'hsl(var(--accent-3))'
                  }}
                >
                  <Save style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
                  حفظ اللوجو الجديد
                </button>

                <button onClick={handleReset} className="btn">
                  <RotateCcw style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
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
          <h3 className="card-title">
            <AlertCircle style={{ width: '20px', height: '20px', marginLeft: '8px' }} />
            معلومات مهمة
          </h3>
        </div>
        <div style={{ padding: '0 24px 24px 24px' }}>
          <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', background: 'hsl(var(--accent))', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
              <p>
                <strong>الأحجام المناسبة:</strong> يُفضل أن يكون اللوجو بأبعاد
                140×45 بكسل أو مضاعفاتها
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', background: 'hsl(var(--accent))', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
              <p>
                <strong>الصيغ المدعومة:</strong> PNG (مُفضل للشفافية)، SVG
                (للجودة العالية)، JPG
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', background: 'hsl(var(--accent))', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
              <p>
                <strong>الخلفية:</strong> يُنصح باستخدام خلفية شفافة (PNG)
                للتوافق مع الوضع الليلي
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', background: 'hsl(var(--accent-4))', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
              <p>
                <strong>ملاحظة تقنية:</strong> بعد الحفظ، قد تحتاج لتحديث الصفحة
                لرؤية اللوجو الجديد
              </p>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </>)
  );
}
