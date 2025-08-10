"use client";

import { ArrowLeft, Clock, Eye, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SimpleAngle {
  id: string;
  title: string;
  description?: string;
  slug: string;
  coverImage?: string;
  icon?: string;
  themeColor?: string;
  isFeatured: boolean;
  articlesCount: number;
  latestArticle?: {
    id: string;
    title: string;
    excerpt: string;
    publishDate: string;
    readingTime: number;
    views: number;
  };
}

interface ApiResponse {
  success: boolean;
  angles: SimpleAngle[];
}

export default function SimpleMuqtarabBlock() {
  const [angles, setAngles] = useState<SimpleAngle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAngles();
  }, []);

  const fetchAngles = async () => {
    try {
      console.log("🔍 [SimpleMuqtarab] جاري جلب زوايا مقترب...");

      const response = await fetch("/api/muqtarab/optimized-page");

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.angles) {
          // ترتيب الزوايا: المميزة أولاً ثم العادية
          const sortedAngles = data.angles.sort(
            (a: SimpleAngle, b: SimpleAngle) => {
              if (a.isFeatured && !b.isFeatured) return -1;
              if (!a.isFeatured && b.isFeatured) return 1;
              return 0;
            }
          );

          setAngles(sortedAngles.slice(0, 5)); // أول 5 زوايا
          console.log(
            "✅ [SimpleMuqtarab] تم جلب الزوايا:",
            sortedAngles.length
          );
        }
      }
    } catch (error) {
      console.error("❌ [SimpleMuqtarab] خطأ في جلب الزوايا:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        <div className="grid gap-6">
          {/* بطاقة مميزة */}
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>

          {/* 4 بطاقات صغيرة */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-48 bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (angles.length === 0) {
    return null;
  }

  const featuredAngle = angles.find((angle) => angle.isFeatured);
  const regularAngles = angles.filter((angle) => !angle.isFeatured).slice(0, 4);

  return (
    <section className="mb-16">
      {/* رأس القسم */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              مُقترب
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              زوايا تحليلية متخصصة
            </p>
          </div>
        </div>

        <Link
          href="/muqtarab"
          className="group flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
        >
          استكشف جميع الزوايا
          <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="space-y-6">
        {/* البطاقة المميزة */}
        {featuredAngle && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 p-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 md:p-8 h-full">
              <div className="flex flex-col md:flex-row gap-6">
                {/* المحتوى */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                      <Sparkles className="w-4 h-4 mr-1" />
                      زاوية مميزة
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {featuredAngle.articlesCount} مقال
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {featuredAngle.title}
                  </h3>

                  {featuredAngle.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {featuredAngle.description}
                    </p>
                  )}

                  {/* آخر مقال */}
                  {featuredAngle.latestArticle && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        آخر مقال:
                      </p>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
                        {featuredAngle.latestArticle.title}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {featuredAngle.latestArticle.readingTime} دقائق
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {featuredAngle.latestArticle.views}
                        </span>
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/muqtarab/${featuredAngle.slug}`}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    استكشف الزاوية
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>

                {/* الصورة */}
                {featuredAngle.coverImage && (
                  <div className="md:w-80 lg:w-96">
                    <div className="relative h-48 md:h-full rounded-lg overflow-hidden">
                      <Image
                        src={featuredAngle.coverImage}
                        alt={featuredAngle.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4 بطاقات صغيرة */}
        {regularAngles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {regularAngles.map((angle) => (
              <Link
                key={angle.id}
                href={`/muqtarab/${angle.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  {angle.icon ? (
                    <div className="text-2xl">{angle.icon}</div>
                  ) : (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                      style={{
                        backgroundColor: angle.themeColor || "#6366f1",
                      }}
                    >
                      {angle.title.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {angle.articlesCount} مقال
                  </span>
                </div>

                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {angle.title}
                </h4>

                {angle.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {angle.description}
                  </p>
                )}

                {/* آخر مقال */}
                {angle.latestArticle && (
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      آخر مقال:
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                      {angle.latestArticle.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{angle.latestArticle.readingTime} دقائق</span>
                      <span>•</span>
                      <span>{angle.latestArticle.views} مشاهدة</span>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
