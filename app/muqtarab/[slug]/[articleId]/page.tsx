"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Angle, AngleArticle } from "@/types/muqtarab";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Clock,
  Cpu,
  Eye,
  Headphones,
  Heart,
  MessageCircle,
  Play,
  Share2,
  Tag,
  User,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AngleArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const articleId = params.articleId as string;

  const [angle, setAngle] = useState<Angle | null>(null);
  const [article, setArticle] = useState<AngleArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<AngleArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // جلب بيانات المقال والزاوية
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔍 جاري جلب المقال:", articleId, "من الزاوية:", slug);

        // جلب بيانات الزاوية
        const angleResponse = await fetch(
          `/api/muqtarab/angles/by-slug/${slug}`
        );
        if (!angleResponse.ok) {
          toast.error("الزاوية غير موجودة");
          router.push("/muqtarab");
          return;
        }

        const angleData = await angleResponse.json();
        console.log("✅ تم جلب بيانات الزاوية:", angleData.angle.title);
        setAngle(angleData.angle);

        // جلب بيانات المقال
        const articleResponse = await fetch(
          `/api/muqtarab/angles/${angleData.angle.id}/articles/${articleId}`
        );

        if (!articleResponse.ok) {
          toast.error("المقال غير موجود");
          router.push(`/muqtarab/${slug}`);
          return;
        }

        const articleData = await articleResponse.json();
        console.log("✅ تم جلب بيانات المقال:", articleData.article.title);
        setArticle(articleData.article);

        // جلب المقالات ذات الصلة
        const relatedResponse = await fetch(
          `/api/muqtarab/angles/${angleData.angle.id}/articles?limit=6&exclude=${articleId}`
        );

        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedArticles(relatedData.articles?.slice(0, 3) || []);
        }
      } catch (error) {
        console.error("خطأ في تحميل البيانات:", error);
        toast.error("حدث خطأ في التحميل");
        router.push("/muqtarab");
      } finally {
        setLoading(false);
      }
    };

    if (slug && articleId) {
      fetchData();
    }
  }, [slug, articleId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المقال...</p>
        </div>
      </div>
    );
  }

  if (!angle || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            المقال غير موجود
          </h1>
          <p className="text-gray-600 mb-4">لم يتم العثور على المقال المطلوب</p>
          <Link href="/muqtarab">
            <Button>العودة إلى مُقترب</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* شريط التنقل العلوي */}
      <StickyHeader angle={angle} article={article} />

      {/* محتوى المقال */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* مسار التنقل */}
        <Breadcrumbs angle={angle} article={article} />

        {/* ترويسة المقال */}
        <ArticleHeader article={article} angle={angle} />

        {/* صورة الغلاف */}
        {article.coverImage && (
          <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-lg">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* محتوى المقال */}
        <ArticleContent article={article} />

        {/* التفاعل والمشاركة */}
        <ArticleInteractions article={article} />

        <Separator className="my-8" />

        {/* العودة إلى الزاوية */}
        <BackToAngle angle={angle} />

        {/* المقالات ذات الصلة */}
        <RecommendedArticles articles={relatedArticles} angle={angle} />
      </div>
    </div>
  );
}

// مكون الشريط العلوي الثابت
function StickyHeader({
  angle,
  article,
}: {
  angle: Angle;
  article: AngleArticle;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b z-50 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/muqtarab/${angle.slug}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 ml-1" />
              {angle.title}
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-gray-600 truncate max-w-md">
            {article.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost">
            <Bookmark className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// مكون مسار التنقل
function Breadcrumbs({
  angle,
  article,
}: {
  angle: Angle;
  article: AngleArticle;
}) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <Link href="/muqtarab" className="hover:text-blue-600 transition-colors">
        مُقترب
      </Link>
      <span>/</span>
      <Link
        href={`/muqtarab/${angle.slug}`}
        className="hover:text-blue-600 transition-colors"
      >
        {angle.title}
      </Link>
      <span>/</span>
      <span className="text-gray-900 font-medium">{article.title}</span>
    </nav>
  );
}

// مكون ترويسة المقال
function ArticleHeader({
  article,
  angle,
}: {
  article: AngleArticle;
  angle: Angle;
}) {
  return (
    <div className="mb-8">
      {/* شارات وتصنيفات */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Link href={`/muqtarab/${angle.slug}`}>
          <Badge
            variant="secondary"
            className="hover:bg-blue-100 transition-colors cursor-pointer"
            style={{
              backgroundColor: angle.themeColor + "20",
              color: angle.themeColor,
            }}
          >
            <Cpu className="w-3 h-3 ml-1" />
            {angle.title}
          </Badge>
        </Link>

        {article.tags && article.tags.length > 0 && (
          <>
            {article.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="w-3 h-3 ml-1" />
                {tag}
              </Badge>
            ))}
          </>
        )}

        {article.sentiment && (
          <Badge
            variant="outline"
            className={
              article.sentiment === "positive"
                ? "text-green-600 border-green-200"
                : article.sentiment === "negative"
                ? "text-red-600 border-red-200"
                : "text-gray-600 border-gray-200"
            }
          >
            {article.sentiment === "positive"
              ? "😊 إيجابي"
              : article.sentiment === "negative"
              ? "😞 سلبي"
              : "😐 محايد"}
          </Badge>
        )}
      </div>

      {/* عنوان المقال */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
        {article.title}
      </h1>

      {/* مقدمة المقال */}
      {article.excerpt && (
        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
          {article.excerpt}
        </p>
      )}

      {/* معلومات المؤلف والنشر */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white rounded-xl border">
        <div className="flex items-center gap-4">
          {article.author?.image ? (
            <Image
              src={article.author.image}
              alt={article.author.name}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          )}

          <div>
            <p className="font-semibold text-gray-900">
              {article.author?.name}
            </p>
            <p className="text-sm text-gray-500">كاتب في {angle.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(
                article.publishDate || article.createdAt
              ).toLocaleDateString("ar-SA")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{article.readingTime || 5} دقائق قراءة</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>1,234 مشاهدة</span>
          </div>
        </div>
      </div>

      {/* مشغل الصوت */}
      <AudioPlayer article={article} />
    </div>
  );
}

// مكون مشغل الصوت
function AudioPlayer({ article }: { article: AngleArticle }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              isPlaying
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 border-2 border-blue-200"
            }`}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <div className="w-3 h-3 bg-white rounded-sm"></div>
            ) : (
              <Play className="w-5 h-5 mr-0.5" />
            )}
          </div>

          <div>
            <p className="font-medium text-gray-900">استمع للمقال</p>
            <p className="text-sm text-gray-600">
              تحويل النص إلى صوت بالذكاء الاصطناعي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-blue-600" />
          <Volume2 className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {isPlaying && (
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-1 bg-blue-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full w-1/3 transition-all duration-1000"></div>
          </div>
          <span className="text-xs text-gray-500">01:23 / 04:57</span>
        </div>
      )}
    </div>
  );
}

// مكون محتوى المقال
function ArticleContent({ article }: { article: AngleArticle }) {
  return (
    <div className="prose prose-lg prose-gray max-w-none mb-8">
      {/* معالجة محتوى Tiptap */}
      <div className="bg-white rounded-xl p-8 shadow-sm border">
        {article.content ? (
          <div
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>محتوى المقال غير متاح حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}

// مكون التفاعل
function ArticleInteractions({ article }: { article: AngleArticle }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div className="flex items-center justify-between p-6 bg-white rounded-xl border">
      <div className="flex items-center gap-4">
        <Button
          variant={liked ? "default" : "outline"}
          size="sm"
          onClick={() => setLiked(!liked)}
          className={liked ? "bg-red-600 hover:bg-red-700" : ""}
        >
          <Heart className={`w-4 h-4 ml-2 ${liked ? "fill-current" : ""}`} />
          {liked ? "أعجبني" : "إعجاب"} (47)
        </Button>

        <Button variant="outline" size="sm">
          <MessageCircle className="w-4 h-4 ml-2" />
          تعليق (12)
        </Button>

        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 ml-2" />
          مشاركة
        </Button>
      </div>

      <Button
        variant={bookmarked ? "default" : "outline"}
        size="sm"
        onClick={() => setBookmarked(!bookmarked)}
      >
        <Bookmark
          className={`w-4 h-4 ml-2 ${bookmarked ? "fill-current" : ""}`}
        />
        {bookmarked ? "محفوظ" : "حفظ"}
      </Button>
    </div>
  );
}

// مكون العودة إلى الزاوية
function BackToAngle({ angle }: { angle: Angle }) {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
        <Cpu className="w-5 h-5" />
        <Link href={`/muqtarab/${angle.slug}`} className="text-lg font-medium">
          ← العودة إلى زاوية {angle.title}
        </Link>
      </div>
    </div>
  );
}

// مكون المقالات ذات الصلة
function RecommendedArticles({
  articles,
  angle,
}: {
  articles: AngleArticle[];
  angle: Angle;
}) {
  if (articles.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">مقالات ذات صلة</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card
            key={article.id}
            className="group rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <div className="relative h-40 w-full overflow-hidden">
              {article.coverImage ? (
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                {article.title}
              </h3>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{article.author?.name}</span>
                <span>{article.readingTime || 5} دقائق</span>
              </div>

              <Link href={`/muqtarab/${angle.slug}/${article.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-blue-600 p-0 h-6"
                >
                  قراءة المقال ←
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
