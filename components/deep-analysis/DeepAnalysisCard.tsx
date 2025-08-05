"use client";

import { Brain } from "lucide-react";
import Link from "next/link";

interface DeepAnalysisCardProps {
  title: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * مكون بطاقة التحليل العميق المبسط - مصمم للموبايل
 * حسب تعليمات التصميم الذكي من "سبق الذكية"
 */
export const DeepAnalysisCard = ({
  title,
  href,
  onClick,
  className = "",
}: DeepAnalysisCardProps) => {
  const handleClick = () => {
    onClick?.();
    // يمكن إضافة منطق تتبع هنا
  };

  const cardContent = (
    <div
      onClick={handleClick}
      className={`
        rounded-xl border border-zinc-200 dark:border-zinc-800
        bg-white dark:bg-zinc-900 p-3 space-y-2 min-h-[80px] h-fit
        hover:shadow-md active:scale-[.98] transition-all cursor-pointer
        ${className}
      `}
    >
      {/* رأس البطاقة - أيقونة ونوع التحليل */}
      <div className="flex items-center space-x-2">
        <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
          تحليل عميق
        </span>
      </div>

      {/* عنوان التحليل - التركيز الرئيسي */}
      <h2 className="text-sm font-bold leading-tight line-clamp-2 text-zinc-800 dark:text-white">
        {title}
      </h2>
    </div>
  );

  // إذا كان هناك رابط، استخدم Link، وإلا استخدم div عادي
  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default DeepAnalysisCard;
