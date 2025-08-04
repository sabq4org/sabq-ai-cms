"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  Eye,
  Share2,
  Sparkles,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Corner {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon?: string;
  themeColor: string;
  coverImage?: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  articlesCount: number;
  author?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  published_at: string;
  read_time: number;
  views: number;
  likes: number;
  ai_compatibility_score?: number;
}

export default function CornerPage() {
  const params = useParams();
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const [corner, setCorner] = useState<Corner | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (params.slug) {
      fetchCornerData();
    }
  }, [params.slug]);

  const fetchCornerData = async () => {
    try {
      setLoading(true);

      // جلب بيانات الزاوية
      const cornerResponse = await fetch(
        `/api/muqtarab/angles/by-slug/${params.slug}`
      );
      if (cornerResponse.ok) {
        const cornerResult = await cornerResponse.json();
        const cornerData = cornerResult.angle;
        setCorner(cornerData);
        setFollowersCount(0); // لاحقاً سيتم تطبيق نظام المتابعة

        // جلب مقالات الزاوية
        const articlesResponse = await fetch(
          `/api/muqtarab/angles/${cornerData.id}/articles`
        );
        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          setArticles(articlesData || []);
        }
      }
    } catch (error) {
      console.error("خطأ في جلب بيانات الزاوية:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(
        `/api/muqtarab/corners/${params.slug}/follow`,
        {
          method: isFollowing ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("خطأ في متابعة الزاوية:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!corner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            الزاوية غير موجودة
          </h2>
          <Button onClick={() => router.push("/muqtarab")}>
            العودة إلى مقترب
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
      dir="rtl"
    >
      {/* غلاف الزاوية */}
      <div className="relative h-96 overflow-hidden">
        {corner.cover_image && (
          <Image
            src={corner.cover_image}
            alt={corner.name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* محتوى الغلاف */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {corner.is_featured && (
                  <Badge className="mb-4 bg-yellow-500 text-black">
                    <Sparkles className="w-4 h-4 ml-1" />
                    زاوية مميزة
                  </Badge>
                )}

                <h1 className="text-4xl font-bold text-white mb-4">
                  {corner.name}
                </h1>

                {corner.description && (
                  <p className="text-xl text-gray-200 mb-6 max-w-2xl">
                    {corner.description}
                  </p>
                )}

                <div className="flex items-center gap-6 text-gray-300">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{corner.author_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>بدأت في {formatDate(corner.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span>{corner.articles_count} مقال</span>
                  </div>
                </div>
              </div>

              {/* أزرار التفاعل */}
              <div className="flex gap-3">
                <Button
                  onClick={handleFollow}
                  className={`flex items-center gap-2 ${
                    isFollowing
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white`}
                >
                  {isFollowing ? (
                    <>
                      <BellOff className="w-4 h-4" />
                      إلغاء المتابعة
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      متابعة الزاوية
                    </>
                  )}
                  <span className="text-sm">({followersCount})</span>
                </Button>

                <Button
                  variant="outline"
                  className="text-white border-white hover:bg-white/10"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* زر العودة */}
        <div className="absolute top-8 right-8">
          <Button
            variant="outline"
            onClick={() => router.push("/muqtarab")}
            className="text-white border-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة لمقترب
          </Button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* أرشيف المواضيع */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                أرشيف المواضيع ({articles.length})
              </h2>
            </div>

            {articles.length > 0 ? (
              <div className="space-y-6">
                {articles.map((article) => (
                  <Card
                    key={article.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="flex">
                      {article.cover_image && (
                        <div className="w-48 h-32 relative flex-shrink-0">
                          <Image
                            src={article.cover_image}
                            alt={article.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link
                              href={`/muqtarab/${corner.slug}/${article.slug}`}
                              className="block hover:text-blue-600 transition-colors"
                            >
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                {article.title}
                              </h3>
                            </Link>

                            {article.excerpt && (
                              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                {article.excerpt}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(article.published_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {article.views} مشاهدة
                              </span>
                              <span>{article.read_time} دقائق قراءة</span>
                            </div>
                          </div>

                          {/* مؤشر التوافق */}
                          {article.ai_compatibility_score && (
                            <div className="text-center ml-4">
                              <div className="text-2xl font-bold text-blue-600">
                                {article.ai_compatibility_score}%
                              </div>
                              <div className="text-xs text-gray-500">
                                يلائم ذوقك
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  لا توجد مقالات في هذه الزاوية حتى الآن
                </p>
              </div>
            )}
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            {/* معلومات الكاتب */}
            <Card>
              <CardHeader>
                <CardTitle>عن الكاتب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-2">
                    {corner.author_name}
                  </h3>
                  {corner.author_bio && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {corner.author_bio}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* إحصائيات الزاوية */}
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>عدد المقالات</span>
                    <span className="font-bold">{corner.articles_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المتابعون</span>
                    <span className="font-bold">{followersCount}</span>
                  </div>
                  {corner.category_name && (
                    <div className="flex justify-between">
                      <span>التصنيف</span>
                      <Badge variant="secondary">{corner.category_name}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
