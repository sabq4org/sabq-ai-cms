"use client";

import { Award, CheckCircle, Star, User } from "lucide-react";
import Link from "next/link";
import React from "react";

interface Reporter {
  id: string;
  full_name: string;
  slug: string;
  is_verified?: boolean;
  verification_badge?: string;
}

interface Author {
  id: string;
  name: string;
  reporter?: Reporter;
}

interface ReporterLinkProps {
  reporter?: Reporter | null;
  author?: Author | null;
  authorName?: string;
  userId?: string;
  className?: string;
  showIcon?: boolean;
  showVerification?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: (e: React.MouseEvent) => void;
}

// دالة للحصول على أيقونة التحقق
function getVerificationIcon(badge: string = "verified", size: string = "md") {
  const sizeClasses = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
  };

  const iconClass = `${
    sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md
  } text-white`;

  switch (badge) {
    case "expert":
      return <Star className={iconClass} />;
    case "senior":
      return <Award className={iconClass} />;
    case "verified":
    default:
      return <CheckCircle className={iconClass} />;
  }
}

// دالة تحويل الأسماء العربية إلى slugs لاتينية
function convertArabicNameToSlug(name: string): string {
  return name
    .replace(/عبدالله/g, "abdullah")
    .replace(/البرقاوي/g, "barqawi")
    .replace(/علي/g, "ali")
    .replace(/الحازمي/g, "alhazmi")
    .replace(/أحمد/g, "ahmed")
    .replace(/محمد/g, "mohammed")
    .replace(/فاطمة/g, "fatima")
    .replace(/نورا/g, "nora")
    .replace(/عمر/g, "omar")
    .replace(/النجار/g, "najjar")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/[^\w\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ReporterLink({
  reporter,
  author,
  authorName,
  userId,
  className = "",
  showIcon = true,
  showVerification = true,
  size = "md",
  onClick,
}: ReporterLinkProps) {
  // تحديد اسم العرض والمعلومات
  const displayName =
    reporter?.full_name ||
    author?.reporter?.full_name ||
    author?.name ||
    authorName;
  const reporterData = reporter || author?.reporter;

  // إذا لم يكن هناك مراسل أو اسم، لا نعرض شيئاً
  if (!displayName) return null;

  // تحديد أحجام النص والأيقونات
  const sizeClasses = {
    sm: {
      text: "text-xs",
      icon: "w-3 h-3",
      badge: "w-3 h-3",
    },
    md: {
      text: "text-sm",
      icon: "w-4 h-4",
      badge: "w-4 h-4",
    },
    lg: {
      text: "text-base",
      icon: "w-5 h-5",
      badge: "w-5 h-5",
    },
  };

  const classes = sizeClasses[size];

  // تحديد الرابط المناسب
  let linkHref = "";
  if (reporterData?.slug) {
    // استخدام الـ slug الصحيح من قاعدة البيانات
    linkHref = `/reporter/${reporterData.slug}`;
  } else if (displayName) {
    // توحيد الروابط إلى Slug لاتيني لضمان الاتساق وعدم وجود روابط عربية
    const latinSlug = convertArabicNameToSlug(displayName);
    linkHref = `/reporter/${latinSlug}`;
  } else if (userId) {
    linkHref = `/user/${userId}`;
  }

  // إذا كان لدينا رابط، نعرضه
  if (linkHref) {
    return (
      <Link
        href={linkHref}
        className={`inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group ${className}`}
        onClick={onClick}
      >
        {showIcon && (
          <User
            className={`${classes.icon} group-hover:text-blue-600 dark:group-hover:text-blue-400`}
          />
        )}
        <span className={`font-medium ${classes.text}`}>{displayName}</span>
        {showVerification &&
          (reporterData?.role === "senior" ||
            reporterData?.role === "expert" ||
            reporterData?.ai_score > 80) && (
            <div className="flex items-center">
              <div
                className={`rounded-full p-0.5 ${
                  reporterData.role === "expert" || reporterData.ai_score >= 95
                    ? "bg-yellow-500"
                    : reporterData.role === "senior" ||
                      reporterData.ai_score >= 80
                    ? "bg-purple-500"
                    : "bg-green-500"
                }`}
              >
                {getVerificationIcon(
                  reporterData.role === "expert"
                    ? "expert"
                    : reporterData.role === "senior"
                    ? "senior"
                    : "verified",
                  size
                )}
              </div>
            </div>
          )}
      </Link>
    );
  }

  // إذا لم يكن هناك رابط، نعرض النص فقط
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {showIcon && <User className={classes.icon} />}
      <span className={`font-medium ${classes.text}`}>{displayName}</span>
      {showVerification &&
        (reporterData?.role === "senior" ||
          reporterData?.role === "expert" ||
          reporterData?.ai_score > 80) && (
          <div className="flex items-center">
            <div
              className={`rounded-full p-0.5 ${
                reporterData.role === "expert" || reporterData.ai_score >= 95
                  ? "bg-yellow-500"
                  : reporterData.role === "senior" ||
                    reporterData.ai_score >= 80
                  ? "bg-purple-500"
                  : "bg-green-500"
              }`}
            >
              {getVerificationIcon(
                reporterData.role === "expert"
                  ? "expert"
                  : reporterData.role === "senior"
                  ? "senior"
                  : "verified",
                size
              )}
            </div>
          </div>
        )}
    </div>
  );
}

// مكون مساعد للحصول على المراسل من team_members
export async function getReporterByTeamId(
  teamId: string
): Promise<Reporter | null> {
  try {
    const response = await fetch(`/api/reporters/by-team/${teamId}`);
    if (response.ok) {
      const data = await response.json();
      return data.reporter;
    }
  } catch (error) {
    console.error("خطأ في جلب المراسل:", error);
  }
  return null;
}

// Hook للحصول على المراسل
export function useReporter(teamId?: string) {
  const [reporter, setReporter] = React.useState<Reporter | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (teamId) {
      setLoading(true);
      getReporterByTeamId(teamId)
        .then(setReporter)
        .finally(() => setLoading(false));
    }
  }, [teamId]);

  return { reporter, loading };
}
