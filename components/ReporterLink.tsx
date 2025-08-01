'use client';

import React from 'react';
import Link from 'next/link';
import { User, CheckCircle, Star, Award } from 'lucide-react';

interface Reporter {
  id: string;
  full_name: string;
  slug: string;
  is_verified?: boolean;
  verification_badge?: string;
}

interface ReporterLinkProps {
  reporter?: Reporter | null;
  authorName?: string;
  className?: string;
  showIcon?: boolean;
  showVerification?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// دالة للحصول على أيقونة التحقق
function getVerificationIcon(badge: string = 'verified') {
  const iconClass = "w-3 h-3 text-white";
  
  switch (badge) {
    case 'expert':
      return <Star className={iconClass} />;
    case 'senior':
      return <Award className={iconClass} />;
    case 'verified':
    default:
      return <CheckCircle className={iconClass} />;
  }
}

export default function ReporterLink({
  reporter,
  authorName,
  className = '',
  showIcon = true,
  showVerification = true,
  size = 'md'
}: ReporterLinkProps) {
  const displayName = reporter?.full_name || authorName;
  
  // إذا لم يكن هناك مراسل أو اسم، لا نعرض شيئاً
  if (!displayName) return null;
  
  // تحديد أحجام النص والأيقونات
  const sizeClasses = {
    sm: {
      text: 'text-xs',
      icon: 'w-3 h-3',
      badge: 'w-3 h-3'
    },
    md: {
      text: 'text-sm',
      icon: 'w-4 h-4', 
      badge: 'w-4 h-4'
    },
    lg: {
      text: 'text-base',
      icon: 'w-5 h-5',
      badge: 'w-5 h-5'
    }
  };
  
  const classes = sizeClasses[size];
  
  // إذا كان لدينا reporter مع slug، نعرض رابط
  if (reporter?.slug) {
    return (
      <Link
        href={`/reporter/${reporter.slug}`}
        className={`inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showIcon && (
          <User className={`${classes.icon} group-hover:text-blue-600 dark:group-hover:text-blue-400`} />
        )}
        <span className={`font-medium ${classes.text}`}>
          {displayName}
        </span>
        {showVerification && reporter.is_verified && (
          <div className="flex items-center">
            <div className={`rounded-full p-0.5 ${
              reporter.verification_badge === 'expert' ? 'bg-yellow-500' :
              reporter.verification_badge === 'senior' ? 'bg-purple-500' :
              'bg-green-500'
            }`}>
              {getVerificationIcon(reporter.verification_badge)}
            </div>
          </div>
        )}
      </Link>
    );
  }
  
  // إذا لم يكن هناك رابط، نعرض النص فقط
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {showIcon && (
        <User className={classes.icon} />
      )}
      <span className={`font-medium ${classes.text}`}>
        {displayName}
      </span>
    </div>
  );
}

// مكون مساعد للحصول على المراسل من team_members
export async function getReporterByTeamId(teamId: string): Promise<Reporter | null> {
  try {
    const response = await fetch(`/api/reporters/by-team/${teamId}`);
    if (response.ok) {
      const data = await response.json();
      return data.reporter;
    }
  } catch (error) {
    console.error('خطأ في جلب المراسل:', error);
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
