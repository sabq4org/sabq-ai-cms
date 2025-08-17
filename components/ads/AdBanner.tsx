import { ExternalLink, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface AdBannerProps {
  placement:
    | "below_featured"
    | "below_custom_block"
    | "article_detail_header"
    | "sidebar_top"
    | "sidebar_bottom"
    | "footer_banner";
  className?: string;
}

interface AdData {
  id: string;
  title?: string;
  image_url: string;
  target_url: string;
  placement: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ placement, className = "" }) => {
  const [ad, setAd] = useState<AdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [hasViewed, setHasViewed] = useState(false);

  // جلب الإعلان للموضع المحدد
  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await fetch(
          `/api/ads-placement/active?placement=${placement}`
        );
        const data = await response.json();

        if (data.success && data.data) {
          setAd(data.data);
        }
      } catch (error) {
        console.warn("تحذير: فشل في جلب الإعلان:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [placement]);

  // تسجيل المشاهدة عند ظهور الإعلان
  useEffect(() => {
    if (ad && isVisible && !hasViewed) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              recordView();
              setHasViewed(true);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.5 }
      );

      const adElement = document.getElementById(`ad-${ad.id}`);
      if (adElement) {
        observer.observe(adElement);
      }

      return () => observer.disconnect();
    }
  }, [ad, isVisible, hasViewed]);

  // تسجيل مشاهدة الإعلان
  const recordView = async () => {
    if (!ad) return;

    try {
      await fetch(`/api/ads/${ad.id}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: getSessionId(),
        }),
      });
    } catch (error) {
      console.warn("تحذير: فشل في تسجيل مشاهدة الإعلان:", error);
    }
  };

  // تسجيل نقرة والتوجه للرابط
  const handleClick = async () => {
    if (!ad) return;

    try {
      const response = await fetch(`/api/ads/${ad.id}/click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: getSessionId(),
        }),
      });

      const data = await response.json();
      if (data.success && data.redirect_url) {
        window.open(data.redirect_url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.warn("تحذير: فشل في تسجيل نقرة الإعلان:", error);
      // التوجه المباشر في حالة الفشل
      window.open(ad.target_url, "_blank", "noopener,noreferrer");
    }
  };

  // إخفاء الإعلان
  const handleClose = () => {
    setIsVisible(false);
  };

  // الحصول على session ID
  const getSessionId = () => {
    if (typeof window !== "undefined") {
      let sessionId = sessionStorage.getItem("session_id");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem("session_id", sessionId);
      }
      return sessionId;
    }
    return null;
  };

  // عدم عرض شيء في حالة التحميل أو عدم وجود إعلان أو إخفاؤه
  if (loading || !ad || !isVisible) {
    return null;
  }

  // تحديد أنماط CSS حسب الموضع
  const getContainerClass = () => {
    const baseClass = "relative w-full max-w-full mx-auto my-4 group";

    switch (placement) {
      case "below_featured":
        return `${baseClass} max-w-6xl`;
      case "below_custom_block":
        return `${baseClass} max-w-4xl`;
      case "article_detail_header":
        // تقليل الحجم درجة واحدة: تقليل العرض الأقصى قليلاً
        return `${baseClass} max-w-2xl`;
      case "sidebar_top":
      case "sidebar_bottom":
        return `${baseClass} max-w-sm`;
      case "footer_banner":
        return `${baseClass} max-w-7xl`;
      default:
        return baseClass;
    }
  };

  // ضبط نسبة الأبعاد للصورة حسب الموضع
  const getAspectClass = () => {
    switch (placement) {
      case "article_detail_header":
        // تقليل الارتفاع قليلاً (تكة واحدة) على كل الشاشات
        return "aspect-[18/9] sm:aspect-[22/6]"; // كان: 16/9 و 20/6
      default:
        return "aspect-[16/9] sm:aspect-[20/6]";
    }
  };

  return (
    <div className={`${getContainerClass()} ${className}`}>
      {/* تسمية الإعلان */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
        إعلان
      </div>

      {/* الإعلان */}
      <div
        id={`ad-${ad.id}`}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
        onClick={handleClick}
      >
        {/* زر الإغلاق */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="absolute top-2 left-2 z-10 w-6 h-6 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="إغلاق الإعلان"
        >
          <X className="w-3 h-3 text-white" />
        </button>

        {/* أيقونة الرابط الخارجي */}
        <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-3 h-3 text-white" />
        </div>

        {/* صورة الإعلان */}
        <div className={`relative w-full ${getAspectClass()} overflow-hidden`}>
          <Image
            src={ad.image_url}
            alt={ad.title || "إعلان"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={placement === "article_detail_header"}
          />

          {/* تدرج للنص */}
          {ad.title && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          )}
        </div>

        {/* عنوان الإعلان (إن وجد) */}
        {ad.title && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-medium text-sm sm:text-base line-clamp-2">
              {ad.title}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdBanner;
