/**
 * FeaturedNewsBlockWrapper.js
 * 
 * هذا الملف يعمل كوسيط بين مكون FeaturedNewsBlock الحالي والمكون المُحسّن
 * لإصلاح مشكلة عدم ظهور الصور في النسخة المكتبية
 */

"use client";

import { useEffect, useState } from 'react';

// استيراد المكون الأصلي
import OriginalFeaturedNewsBlock from './FeaturedNewsBlock';

// استيراد المكونات اللازمة
import OptimizedImage from "@/components/ui/OptimizedImage";
import { getProductionImageUrl } from "@/lib/production-image-fix";

/**
 * المكون الوسيط - يحدد تلقائيًا المكون المناسب للعرض
 * بناءً على نوع الجهاز والخيارات المحددة
 */
const FeaturedNewsBlockWrapper = (props) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [useOptimized, setUseOptimized] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  
  // تحديد نوع الجهاز عند تحميل المكون
  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    // التحقق من وجود تعريفات في localStorage
    const checkLocalStorage = () => {
      const useOptimizedFromStorage = localStorage.getItem('featured_use_optimized');
      if (useOptimizedFromStorage !== null) {
        setUseOptimized(useOptimizedFromStorage === 'true');
      }
      
      const debugModeFromStorage = localStorage.getItem('featured_debug_mode');
      if (debugModeFromStorage !== null) {
        setDebugMode(debugModeFromStorage === 'true');
      }
    };
    
    checkDevice();
    checkLocalStorage();
    
    window.addEventListener('resize', checkDevice);
    
    // تشخيص وطباعة المعلومات
    if (debugMode) {
      console.log(`🔍 FeaturedNewsBlockWrapper - معلومات التشغيل:`, {
        isDesktop: window.innerWidth >= 1024,
        useOptimized,
        article: props.article
      });
    }
    
    // إضافة أوامر للتحكم في المكون من خلال console
    window.toggleFeaturedNewsOptimized = (value) => {
      const newValue = value !== undefined ? !!value : !useOptimized;
      setUseOptimized(newValue);
      localStorage.setItem('featured_use_optimized', String(newValue));
      console.log(`🔄 تم تغيير وضع FeaturedNewsBlock إلى: ${newValue ? 'محسّن' : 'أصلي'}`);
    };
    
    window.toggleFeaturedNewsDebug = (value) => {
      const newValue = value !== undefined ? !!value : !debugMode;
      setDebugMode(newValue);
      localStorage.setItem('featured_debug_mode', String(newValue));
      console.log(`🐞 تم تغيير وضع التشخيص إلى: ${newValue ? 'مفعّل' : 'معطّل'}`);
    };
    
    window.checkFeaturedNewsImage = () => {
      if (!props.article) {
        console.log('❌ لا يوجد مقال لفحص الصورة');
        return;
      }
      
      const originalUrl = props.article.featured_image;
      const processedUrl = getProductionImageUrl(props.article.featured_image, {
        width: 800,
        height: 500,
        quality: 85,
        fallbackType: "article",
      });
      
      console.log(`🔍 فحص صورة المقال المميز:`, {
        originalUrl,
        processedUrl,
        article: props.article
      });
      
      // التحقق من الصورة
      const img = new Image();
      img.onload = () => console.log('✅ الصورة الأصلية تعمل:', originalUrl);
      img.onerror = () => console.error('❌ الصورة الأصلية لا تعمل:', originalUrl);
      img.src = originalUrl;
      
      const processedImg = new Image();
      processedImg.onload = () => console.log('✅ الصورة المعالجة تعمل:', processedUrl);
      processedImg.onerror = () => console.error('❌ الصورة المعالجة لا تعمل:', processedUrl);
      processedImg.src = processedUrl;
    };
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, [useOptimized, debugMode, props.article]);
  
  // إذا كان الجهاز مكتب وتم تفعيل المكون المحسن، عرض المكون المحسن
  if (isDesktop && useOptimized) {
    return (
      <OptimizedFeaturedNewsBlock {...props} debugMode={debugMode} />
    );
  }
  
  // في غير ذلك، عرض المكون الأصلي
  return <OriginalFeaturedNewsBlock {...props} />;
};

/**
 * المكون المحسن للنسخة المكتبية - يعالج مشكلة عدم ظهور الصور
 */
const OptimizedFeaturedNewsBlock = ({ article, debugMode }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  useEffect(() => {
    if (debugMode && article) {
      console.log(`🖼️ معلومات الصورة المحسنة:`, {
        id: article.id,
        title: article.title,
        imageUrl: article.featured_image,
        processedImageUrl: getProductionImageUrl(article.featured_image, {
          width: 800,
          height: 500,
          quality: 85,
          fallbackType: "article",
        })
      });
    }
  }, [article, debugMode]);
  
  const handleImageLoad = () => {
    if (debugMode) console.log(`✅ تم تحميل الصورة للمقال: ${article?.id}`);
    setIsImageLoaded(true);
  };
  
  const handleImageError = (e) => {
    if (debugMode) console.error(`❌ خطأ في تحميل الصورة للمقال: ${article?.id}`, e);
    // نظهر الصورة حتى لو كان هناك خطأ لتجنب مشكلة الصفحة البيضاء
    setIsImageLoaded(true);
  };
  
  // استخدام المكون الأصلي مع تعديلات الصورة فقط
  return <OriginalFeaturedNewsBlock 
    article={article} 
    ImageComponent={({ src, alt, ...props }) => (
      <div className="relative w-full h-full" style={{ minHeight: "280px" }}>
        <OptimizedImage
          src={getProductionImageUrl(src, {
            width: 800,
            height: 500,
            quality: 85,
            fallbackType: "article",
          })}
          alt={alt}
          fill={true}
          className="w-full h-full object-cover object-center rounded-xl transition-transform duration-700 group-hover:scale-105"
          priority={true}
          sizes="(max-width: 768px) 100vw, 50vw"
          onLoad={handleImageLoad}
          onError={handleImageError}
          {...props}
        />
        
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    )}
  />;
};

export default FeaturedNewsBlockWrapper;

/**
 * كيفية استخدام المكون الوسيط:
 * 
 * 1. استيراد المكون في الصفحة المستهدفة:
 *    import FeaturedNewsBlock from '@/components/FeaturedNewsBlockWrapper';
 * 
 * 2. استخدام المكون بنفس طريقة استخدام المكون الأصلي:
 *    <FeaturedNewsBlock article={article} />
 * 
 * 3. للتحكم في المكون من خلال console:
 *    - toggleFeaturedNewsOptimized(true/false) - للتبديل بين المكون المحسّن والأصلي
 *    - toggleFeaturedNewsDebug(true/false) - لتفعيل/تعطيل وضع التشخيص
 *    - checkFeaturedNewsImage() - لفحص صور المقال الحالي
 */
