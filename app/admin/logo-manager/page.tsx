'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
// تم إزالة DashboardLayout - تستخدم الصفحة layout.tsx الأساسي
import { 
  Upload, 
  Image as ImageIcon, 
  Download, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Save,
  Eye,
  Monitor,
  Smartphone,
  Palette
} from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface LogoPreviewProps {
  src: string;
  title: string;
  width: number;
  height: number;
  className?: string;
}

const LogoPreview = ({ src, title, width, height, className = '' }: LogoPreviewProps) => (
  <div className={`bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
    <h4 className="text-sm font-semibold mb-2 text-center text-gray-600">{title}</h4>
    <div className="flex items-center justify-center">
      <Image
        src={src}
        alt={title}
        width={width}
        height={height}
        className="object-contain"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    </div>
    <p className="text-xs text-gray-500 text-center mt-2">{width}×{height} بكسل</p>
  </div>
);

export default function LogoManagerPage() {
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [currentLogoUrl, setCurrentLogoUrl] = useState('/logo.png');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // جلب اللوجو الحالي عند تحميل الصفحة
  React.useEffect(() => {
    const fetchCurrentLogo = async () => {
      try {
        const response = await fetch('/api/admin/logo');
        const data = await response.json();
        
        if (data.success && data.logoUrl) {
          setCurrentLogoUrl(data.logoUrl);
        }
      } catch (error) {
        console.error('خطأ في جلب اللوجو الحالي:', error);
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

    console.log('📁 تم تحديد ملف اللوجو:', file.name);
    
    // التحقق من نوع الملف
    if (!file.type.includes('png') && !file.type.includes('svg') && !file.type.includes('jpeg') && !file.type.includes('jpg')) {
      const error = 'يرجى اختيار ملف PNG أو SVG أو JPG فقط';
      setUploadError(error);
      toast.error(error);
      return;
    }

    // التحقق من حجم الملف (5MB كحد أقصى)
    if (file.size > 5 * 1024 * 1024) {
      const error = 'حجم اللوجو يجب أن يكون أقل من 5MB';
      setUploadError(error);
      toast.error(error);
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    
    const uploadToast = toast.loading('⏳ جاري رفع اللوجو الجديد...');

    try {
      console.log('📤 بدء رفع اللوجو...');
      
      // إنشاء FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');

      // رفع اللوجو إلى Cloudinary
      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل رفع اللوجو');
      }

      const data = await response.json();
      
      if (data.success && data.url) {
        console.log('✅ تم الرفع بنجاح، URL:', data.url);
        
        setNewLogoUrl(data.url);
        setUploadSuccess(true);
        
        toast.success('✅ تم رفع اللوجو بنجاح! استخدم الزر أدناه لحفظه', { 
          id: uploadToast,
          duration: 4000 
        });
      } else {
        throw new Error('فشل في الحصول على رابط اللوجو');
      }
      
    } catch (error) {
      console.error('❌ خطأ في رفع اللوجو:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء رفع اللوجو';
      setUploadError(errorMessage);
      
      toast.error(`❌ ${errorMessage}`, { 
        id: uploadToast,
        duration: 5000 
      });
    } finally {
      setUploading(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // حفظ اللوجو الجديد
  const handleSaveLogo = async () => {
    if (!newLogoUrl) {
      toast.error('لا يوجد لوجو للحفظ');
      return;
    }

    const saveToast = toast.loading('⏳ جاري حفظ اللوجو...');

    try {
      const response = await fetch('/api/admin/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logoUrl: newLogoUrl })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentLogoUrl(newLogoUrl);
        setNewLogoUrl('');
        setUploadSuccess(false);
        
        toast.success('✅ تم حفظ اللوجو الجديد بنجاح!', { id: saveToast });
        
        // رسالة توضيحية
        toast('💡 تحديث: قد تحتاج لتحديث الصفحة لرؤية اللوجو الجديد في الهيدر', {
          duration: 6000,
          icon: '💡'
        });
      } else {
        throw new Error(data.error || 'فشل في حفظ اللوجو');
      }
      
    } catch (error) {
      console.error('خطأ في حفظ اللوجو:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ اللوجو';
      toast.error(`❌ ${errorMessage}`, { id: saveToast });
    }
  };

  // إعادة تعيين
  const handleReset = () => {
    setNewLogoUrl('');
    setUploadError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('تم إعادة تعيين النموذج');
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
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* العنوان */}
        <div className="text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
            <Palette className="w-8 h-8 text-blue-600" />
            إدارة لوجو الموقع
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            رفع وإدارة لوجو صحيفة سبق الإلكترونية
          </p>
        </div>

        {/* اللوجو الحالي */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              اللوجو الحالي
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* رفع لوجو جديد */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              رفع لوجو جديد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <p className="text-lg font-semibold text-gray-700">اختر لوجو جديد</p>
                  <p className="text-sm text-gray-500 mt-1">
                    PNG، SVG، JPG - حد أقصى 5MB
                  </p>
                </div>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  variant="outline"
                  size="lg"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      اختيار ملف
                    </>
                  )}
                </Button>
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
                  <Button
                    onClick={handleSaveLogo}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    حفظ اللوجو الجديد
                  </Button>
                  
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    إعادة تعيين
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* معلومات إضافية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              معلومات مهمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>الأحجام المناسبة:</strong> يُفضل أن يكون اللوجو بأبعاد 140×45 بكسل أو مضاعفاتها</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>الصيغ المدعومة:</strong> PNG (مُفضل للشفافية)، SVG (للجودة العالية)، JPG</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>الخلفية:</strong> يُنصح باستخدام خلفية شفافة (PNG) للتوافق مع الوضع الليلي</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>ملاحظة تقنية:</strong> بعد الحفظ، قد تحتاج لتحديث الصفحة لرؤية اللوجو الجديد</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}