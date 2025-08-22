"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Eye, Star, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import "@/styles/muqtarab-cards.css";
import "@/styles/news-card-desktop.css";
import ArticleViews from "@/components/ui/ArticleViews";

interface MuqtarabCardProps {
  article: {
    id: string;
    title: string;
    excerpt: string;
    slug: string;
    coverImage?: string;
    readingTime: number;
    publishDate: string;
    views: number;
    tags?: string[];
    isFeatured?: boolean;
    isRecent?: boolean;
    link?: string;

    angle: {
      id?: string;
      title: string;
      slug: string;
      icon?: string;
      themeColor?: string;
    };

    author: {
      id?: string;
      name: string;
      avatar?: string;
    };
  };
  variant?: "large" | "medium" | "small";
  className?: string;
}

export default function MuqtarabCard({
  article,
  variant = "medium",
  className,
}: MuqtarabCardProps) {
  const themeColor = article.angle?.themeColor || "var(--theme-primary, #6366f1)";
  const articleLink = article.link || `/muqtarab/${article.slug}`;

  const isValidImageSrc = (src?: string) => {
    if (!src) return false;
    return /^(https?:\/\/|\/|data:)/.test(src);
  };

  const displaySrc = isValidImageSrc(article.coverImage)
    ? (article.coverImage as string)
    : "/images/default-article.jpg";

  // نفس نظام الألوان من بطاقات الأخبار
  const baseBg = 'hsl(var(--bg-elevated))';
  const hoverBg = 'hsl(var(--accent) / 0.06)';
  const baseBorder = '1px solid hsl(var(--line))';

  // تحديد أحجام الصور حسب النوع
  const getImageHeight = () => {
    switch (variant) {
      case "large":
        return "h-64 md:h-80";
      case "small":
        return "h-32";
      default:
        return "h-36 sm:h-48";
    }
  };

  // هل المقال جديد (آخر 24 ساعة) أو موسوم isRecent
  const isNew = (): boolean => {
    if (article.isRecent) return true;
    try {
      const d = new Date(article.publishDate);
      const diff = Date.now() - d.getTime();
      return diff <= 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  };

  const formatGregorianDate = (dateString: string) => {
    const d = new Date(dateString);
    try {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = d.getFullYear();
      return `${dd}/${mm}/${yy}`;
    }
  };

  // مكون بطاقة المقال المميز الكبير
  if (variant === "large") {
    return (
      <Card className="group overflow-hidden transition-all duration-300 border border-gray-200 dark:border-gray-700 relative rounded-xl muqtarab-themed-card bg-white" style={{ backgroundColor: '#ffffff' }}>
        {/* تصميم الديسكتوب - نصف صورة ونصف محتوى */}
        <div className="hidden md:grid md:grid-cols-2 gap-0">
          {/* صورة المقال */}
          <div className="relative h-64 md:h-80 overflow-hidden rounded-t-xl">
            <Image
              src={displaySrc}
              alt={article.title}
              fill={true}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="50vw"
              priority={false}
            />

            {/* تدرج للنص */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* شارة مميز كبيرة - يسار */}
            {article.isFeatured && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 py-1.5 text-sm font-bold">
                  <Star className="w-4 h-4 mr-1.5" />
                  مقال مميز
                </Badge>
              </div>
            )}

            {/* ليبل الزاوية بلونها - فوق يمين */}
            <Badge
              className="absolute top-4 right-4 px-3 py-1.5 font-bold text-sm border-0"
              style={{
                backgroundColor: `${themeColor}15`,
                color: themeColor,
                border: `1px solid ${themeColor}30`
              }}
            >
              {article.angle.icon && (
                <span className="mr-1.5">{article.angle.icon}</span>
              )}
              {article.angle.title}
            </Badge>
          </div>

          {/* محتوى البطاقة للديسكتوب */}
          <div className="p-6 md:p-8 flex flex-col justify-center">
            {/* عنوان المقال */}
            <Link
              href={articleLink}
              className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              <h3 className="font-bold text-2xl leading-tight line-clamp-2 mb-4">
                {article.title}
              </h3>
            </Link>

            {/* مقتطف المقال */}
            <p className="text-gray-600 dark:text-gray-300 text-base line-clamp-3 mb-6 leading-relaxed">
              {article.excerpt}
            </p>

            {/* معلومات إضافية */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.readingTime} دقائق قراءة
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.views.toLocaleString()} مشاهدة
                </span>
              </div>

              <time className="text-sm">
                {new Date(article.publishDate).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>

            {/* معلومات المؤلف */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {article.author.avatar ? (
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{article.author.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">كاتب</p>
              </div>
            </div>
          </div>
        </div>

        {/* تصميم الهواتف - صورة كاملة مع overlay */}
        <div className="md:hidden">
          <div className="relative h-48 overflow-hidden rounded-xl">
            <Image
              src={displaySrc}
              alt={article.title}
              fill={true}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="100vw"
              priority={false}
            />

            {/* تدرج للنص */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* شارة مميز - يسار */}
            {article.isFeatured && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-2 py-1 text-xs font-bold">
                  <Star className="w-3 h-3 mr-1" />
                  مميز
                </Badge>
              </div>
            )}

            {/* شارات: جديد + اسم الزاوية جنب بعض */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {isNew() && (
                <div className="old-style-news-new-badge">
                  <span className="old-style-fire-emoji" aria-hidden>🔥</span>
                  <span>جديد</span>
                  <span className="old-style-news-date-inline">{formatGregorianDate(article.publishDate)}</span>
                </div>
              )}
              <div
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md"
                style={{
                  backgroundColor: themeColor as any,
                  color: '#ffffff',
                  border: `1px solid ${themeColor}`
                }}
              >
                {article.angle.icon && <span className="mr-0.5">{article.angle.icon}</span>}
                <span>{article.angle.title}</span>
              </div>
            </div>
          </div>

          {/* محتوى البطاقة للهواتف */}
          <CardContent className="p-4 space-y-3">
            {/* عنوان المقال */}
            <Link
              href={articleLink}
              className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-2">
                {article.title}
              </h3>
            </Link>

            {/* مقتطف المقال */}
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>

            {/* معلومات إضافية */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readingTime} دقائق
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {article.views.toLocaleString()}
                </span>
              </div>

              <time className="text-xs">
                {new Date(article.publishDate).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>

            {/* معلومات المؤلف */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {article.author.avatar ? (
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-3 h-3 text-gray-500" />
                )}
              </div>
              <span className="text-xs font-medium">{article.author.name}</span>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // مكون بطاقة المقال العادية (medium و small) - مطابق لبطاقة الأخبار حرفياً
  return (
    <Link href={articleLink} style={{ textDecoration: 'none' }}>
      <div 
        style={{
          background: '#ffffff',
          border: baseBorder,
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.background = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.background = '#ffffff';
        }}
      >
        {/* صورة المقال */}
        <div style={{
          position: 'relative',
          height: '180px',
          width: '100%',
          background: 'hsl(var(--bg))',
          overflow: 'hidden'
        }}>
          <Image
            src={displaySrc}
            alt={article.title}
            fill={true}
            className="object-cover transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />

          {/* شارة الزاوية */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'hsl(var(--accent))',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {article.angle.icon && <span>{article.angle.icon}</span>}
            <span>{article.angle.title}</span>
          </div>

          {/* شارة جديد */}
          {isNew() && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              zIndex: 10
            }}>
              <span>🔥</span>
              <span>جديد</span>
            </div>
          )}
        </div>

        {/* محتوى البطاقة */}
        <div style={{
          padding: '16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* العنوان */}
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'hsl(var(--fg))',
            marginBottom: '12px',
            lineHeight: '1.5',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}>
            {article.title}
          </h3>

          {/* الملخص */}
          {article.excerpt && (
            <p style={{
              fontSize: '14px',
              color: 'hsl(var(--muted))',
              marginBottom: '12px',
              lineHeight: '1.4',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {article.excerpt}
            </p>
          )}

          {/* البيانات الوصفية */}
          <div style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'hsl(var(--muted))'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock style={{ width: '12px', height: '12px' }} />
              <span>{formatGregorianDate(article.publishDate)}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArticleViews
                count={article.views || 0}
                size="sm"
                showLabel={false}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
