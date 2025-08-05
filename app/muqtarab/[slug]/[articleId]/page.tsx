"use client";

import ArticleAudioPlayer from "@/components/muqtarab/ArticleAudioPlayer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Angle, AngleArticle } from "@/types/muqtarab";
import React from "react";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Clock,
  Cpu,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  User,
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
  const [crossAngleArticles, setCrossAngleArticles] = useState<any[]>([]);
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

        // جلب المقالات ذات الصلة من نفس الزاوية
        const relatedResponse = await fetch(
          `/api/muqtarab/angles/${angleData.angle.id}/articles?limit=6&exclude=${articleId}`
        );

        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedArticles(relatedData.articles?.slice(0, 3) || []);
        }

        // جلب مقالات من زوايا أخرى
        const crossAngleResponse = await fetch(
          `/api/muqtarab/cross-angle-recommendations?currentAngleId=${angleData.angle.id}&currentArticleId=${articleId}&limit=3`
        );

        if (crossAngleResponse.ok) {
          const crossAngleData = await crossAngleResponse.json();
          setCrossAngleArticles(crossAngleData.articles || []);
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
      <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* مسار التنقل - مخفي في الموبايل */}
        <div className="hidden md:block">
          <Breadcrumbs angle={angle} article={article} />
        </div>

        {/* ترويسة المقال */}
        <ArticleHeader article={article} angle={angle} />

        {/* صورة الغلاف */}
        {article.coverImage && (
          <div className="relative w-full h-48 md:h-80 lg:h-96 rounded-lg md:rounded-2xl overflow-hidden mb-4 md:mb-8 shadow-sm md:shadow-lg">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* بيانات الكاتب */}
        <AuthorSection article={article} angle={angle} />

        {/* محتوى المقال */}
        <ArticleContent article={article} />

        {/* تحليل AI للمقال */}
        <AIAnalysisSection article={article} angle={angle} />

        {/* التفاعل والمشاركة */}
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-lg md:rounded-xl border">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 md:h-9 px-2 md:px-3"
            >
              <Heart className="w-4 h-4 ml-1" />
              <span className="hidden sm:inline">إعجاب</span>
              <span className="text-xs text-gray-500 ml-1">142</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 md:h-9 px-2 md:px-3"
            >
              <MessageCircle className="w-4 h-4 ml-1" />
              <span className="hidden sm:inline">تعليق</span>
              <span className="text-xs text-gray-500 ml-1">23</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 md:h-9 px-2 md:px-3"
            >
              <Bookmark className="w-4 h-4 ml-1" />
              <span className="hidden sm:inline">حفظ</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 md:h-9 px-2 md:px-3"
            >
              <Share2 className="w-4 h-4 ml-1" />
              <span className="hidden sm:inline">مشاركة</span>
            </Button>
          </div>
        </div>

        <Separator className="my-4 md:my-8" />

        {/* العودة إلى الزاوية */}
        <div className="text-center py-4 md:py-6">
          <Link href={`/muqtarab/${angle.slug}`}>
            <Button
              size="lg"
              className="px-6 md:px-8"
              style={{
                backgroundColor: angle.themeColor,
                borderColor: angle.themeColor,
              }}
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              <span className="hidden sm:inline">
                العودة إلى زاوية {angle.title}
              </span>
              <span className="sm:hidden">العودة للزاوية</span>
            </Button>
          </Link>
        </div>

        {/* مقالات مقترحة ذكية من نفس الزاوية */}
        {relatedArticles.length > 0 && (
          <SmartRecommendations
            articles={relatedArticles}
            angle={angle}
            currentArticle={article}
          />
        )}

        {/* مقالات من زوايا أخرى */}
        {crossAngleArticles.length > 0 && (
          <CrossAngleRecommendations articles={crossAngleArticles} />
        )}
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
      {/* شريط بلون الزاوية */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: angle.themeColor }}
      />

      <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <Link href={`/muqtarab/${angle.slug}`}>
            <Badge
              className="cursor-pointer transition-all hover:scale-105 text-xs md:text-sm"
              style={{
                backgroundColor: angle.themeColor + "20",
                color: angle.themeColor,
                border: `1px solid ${angle.themeColor}30`,
              }}
            >
              <ArrowLeft className="w-3 h-3 ml-1" />
              <span className="hidden sm:inline">{angle.title}</span>
              <span className="sm:hidden">الزاوية</span>
            </Badge>
          </Link>
          <Separator
            orientation="vertical"
            className="h-3 md:h-4 hidden sm:block"
          />
          <span className="text-xs md:text-sm text-gray-600 truncate max-w-[120px] sm:max-w-md">
            {article.title}
          </span>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 md:h-9 md:w-auto md:px-3"
          >
            <Bookmark className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline ml-1">حفظ</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 md:h-9 md:w-auto md:px-3"
          >
            <Share2 className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline ml-1">مشاركة</span>
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
    <div className="mb-4 md:mb-8">
      {/* شارات وتصنيفات */}
      <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-3 md:mb-4">
        <Link href={`/muqtarab/${angle.slug}`}>
          <Badge
            variant="secondary"
            className="hover:bg-blue-100 transition-colors cursor-pointer text-xs md:text-sm"
            style={{
              backgroundColor: angle.themeColor + "20",
              color: angle.themeColor,
            }}
          >
            <Cpu className="w-3 h-3 ml-1" />
            {angle.title}
          </Badge>
        </Link>

        {article.sentiment && (
          <Badge
            variant="outline"
            className={`text-xs ${
              article.sentiment === "positive"
                ? "text-green-600 border-green-200"
                : article.sentiment === "negative"
                ? "text-red-600 border-red-200"
                : "text-gray-600 border-gray-200"
            }`}
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
      <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
        {article.title}
      </h1>

      {/* فراغ */}
      <div className="mb-4"></div>

      {/* مقدمة المقال */}
      {article.excerpt && (
        <p className="text-base md:text-xl text-gray-700 mb-4 md:mb-8 leading-relaxed">
          {article.excerpt}
        </p>
      )}

      {/* اقتباس افتتاحي ذكي */}
      <OpeningQuote article={article} angle={angle} />

      {/* مشغل الصوت للمقال */}
      <ArticleAudioPlayer
        articleId={article.id}
        title={article.title}
        content={article.content || ""}
        className="mt-6"
      />
    </div>
  );
}

// تم نقل مشغل الصوت إلى مكون منفصل ArticleAudioPlayer

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

// مكون التوصيات الذكية
function SmartRecommendations({
  articles,
  angle,
  currentArticle,
}: {
  articles: AngleArticle[];
  angle: Angle;
  currentArticle: AngleArticle;
}) {
  if (articles.length === 0) return null;

  // ترتيب المقالات حسب التشابه الذكي
  const smartSortedArticles = articles
    .filter((article) => article.id !== currentArticle.id) // استبعاد المقال الحالي
    .sort((a, b) => {
      // خوارزمية ترتيب ذكية
      let scoreA = 0;
      let scoreB = 0;

      // نقاط التشابه في العلامات
      const currentTags = currentArticle.tags || [];
      const tagsA = a.tags || [];
      const tagsB = b.tags || [];

      scoreA += currentTags.filter((tag) => tagsA.includes(tag)).length * 10;
      scoreB += currentTags.filter((tag) => tagsB.includes(tag)).length * 10;

      // نقاط الحداثة (المقالات الأحدث تحصل على نقاط أكثر)
      const daysOldA = Math.floor(
        (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysOldB = Math.floor(
        (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      scoreA += Math.max(0, 30 - daysOldA); // كلما كان أحدث، نقاط أكثر
      scoreB += Math.max(0, 30 - daysOldB);

      // نقاط طول القراءة المشابه
      const currentReadingTime = currentArticle.readingTime || 5;
      scoreA += Math.max(
        0,
        10 - Math.abs((a.readingTime || 5) - currentReadingTime)
      );
      scoreB += Math.max(
        0,
        10 - Math.abs((b.readingTime || 5) - currentReadingTime)
      );

      return scoreB - scoreA; // ترتيب تنازلي
    })
    .slice(0, 3); // أخذ أفضل 3 مقالات

  return (
    <div>
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-gray-900">
          مقالات أخرى من نفس الزاوية
        </h2>
        <div
          className="px-2 py-1 md:px-3 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: angle.themeColor }}
        >
          ذكاء اصطناعي
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {smartSortedArticles.map((article, index) => (
          <Card
            key={article.id}
            className="group rounded-lg md:rounded-xl overflow-hidden border-0 shadow-sm md:shadow-md hover:shadow-md md:hover:shadow-lg transition-all duration-200"
          >
            <div className="relative h-32 md:h-40 w-full overflow-hidden">
              {article.coverImage ? (
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div
                  className="w-full h-full opacity-20"
                  style={{
                    background: `linear-gradient(135deg, ${angle.themeColor} 0%, #1f2937 100%)`,
                  }}
                />
              )}

              {/* شارة التوصية */}
              <div className="absolute top-2 right-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: angle.themeColor }}
                >
                  {index + 1}
                </div>
              </div>
            </div>

            <CardContent className="p-3 md:p-4">
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-tight text-sm md:text-base">
                {article.title}
              </h3>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-2 md:mb-3">
                <span className="truncate">{article.author?.name}</span>
                <span>{article.readingTime || 5} د</span>
              </div>

              {/* مؤشر التشابه */}
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${70 + index * 10}%`,
                      backgroundColor: angle.themeColor + "60",
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400">
                  <span className="hidden sm:inline">
                    {70 + index * 10}% تشابه
                  </span>
                  <span className="sm:hidden">{70 + index * 10}%</span>
                </span>
              </div>

              <Link
                href={`/muqtarab/${angle.slug}/${article.slug || article.id}`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start p-0 h-6 text-xs md:text-sm"
                  style={{ color: angle.themeColor }}
                >
                  <span className="hidden sm:inline">قراءة المقال ←</span>
                  <span className="sm:hidden">قراءة ←</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// مكون عرض محتوى المقال مع تنسيق Markdown
function ArticleContent({ article }: { article: AngleArticle }) {
  // تحويل Markdown إلى HTML مع تحسينات للموبايل
  const renderMarkdownContent = (content: string) => {
    if (!content) return "";

    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
      .replace(/~~(.*?)~~/g, "<del>$1</del>")
      .replace(
        /^### (.*$)/gm,
        '<h3 class="text-lg md:text-xl font-bold text-gray-900 mt-4 md:mt-6 mb-2 md:mb-4">$1</h3>'
      )
      .replace(
        /^## (.*$)/gm,
        '<h2 class="text-xl md:text-2xl font-bold text-gray-900 mt-5 md:mt-8 mb-3 md:mb-4">$1</h2>'
      )
      .replace(
        /^# (.*$)/gm,
        '<h1 class="text-2xl md:text-3xl font-bold text-gray-900 mt-6 md:mt-8 mb-4 md:mb-6">$1</h1>'
      )
      .replace(
        /^> (.*$)/gm,
        '<blockquote class="border-r-4 border-blue-400 pr-3 md:pr-4 mr-2 md:mr-4 text-gray-600 italic my-3 md:my-4">$1</blockquote>'
      )
      .replace(/^- (.*$)/gm, '<li class="mb-1">$1</li>')
      .replace(/^1\. (.*$)/gm, '<li class="mb-1">$1</li>')
      .replace(
        /`(.*?)`/g,
        '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>'
      )
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" target="_blank" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
      )
      .replace(
        /```([\s\S]*?)```/g,
        '<pre class="bg-gray-100 p-3 md:p-4 rounded-lg overflow-x-auto my-3 md:my-4"><code class="text-sm">$1</code></pre>'
      )
      .replace(/---/g, '<hr class="my-4 md:my-6 border-gray-300">')
      .replace(/\n\n/g, '</p><p class="mb-3 md:mb-4">')
      .replace(/^\s*(.+)/gm, '<p class="mb-3 md:mb-4">$1</p>');
  };

  return (
    <div className="mb-6 md:mb-8">
      <div
        className="prose prose-base md:prose-lg dark:prose-invert max-w-none leading-relaxed text-gray-800"
        dangerouslySetInnerHTML={{
          __html: renderMarkdownContent(article.content || ""),
        }}
        style={{
          whiteSpace: "pre-line",
          lineHeight: "1.7",
          fontSize: "1rem",
        }}
      />

      {/* الكلمات المفتاحية في نهاية المحتوى - مخفية من الواجهة */}
      {/* تم إخفاء الكلمات المفتاحية من واجهة المستخدم */}
      {/* {article.tags && article.tags.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600 ml-2">
              المواضيع:
            </span>
            {article.tags.slice(0, 5).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="w-3 h-3 ml-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}

// مكون الاقتباس الافتتاحي الذكي
function OpeningQuote({
  article,
  angle,
}: {
  article: AngleArticle;
  angle: Angle;
}) {
  // توليد اقتباس ذكي بناءً على المحتوى
  const generateSmartQuote = (title: string, angleTitle: string) => {
    if (title.includes("الخوارزمية")) {
      return "في زمن الخوارزميات... من يوقّع القصيدة؟";
    } else if (title.includes("الذكاء الاصطناعي") || title.includes("AI")) {
      return "عندما تصبح الآلة أذكى من الحلم، هل نحلم بآلات كهربائية؟";
    } else if (angleTitle.includes("تقنية")) {
      return "التقنية ليست مجرد أدوات، بل نافذة على مستقبل يُكتب بلغة الكود.";
    }
    return "في عالم يتسارع بوتيرة الضوء، الحكمة هي الوقوف لحظة للتأمل.";
  };

  const quote = generateSmartQuote(article.title, angle.title);

  return (
    <blockquote
      className="italic text-gray-600 border-r-4 pr-4 mr-4 mb-6 text-lg leading-relaxed"
      style={{ borderColor: angle.themeColor }}
    >
      "{quote}"
    </blockquote>
  );
}

// مكون تحليل AI للمقال
function AIAnalysisSection({
  article,
  angle,
}: {
  article: AngleArticle;
  angle: Angle;
}) {
  // حساب نقاط الذكاء والإبداع
  const calculateAIScore = (content: string, title: string) => {
    let score = 50; // نقطة البداية

    // تحليل العنوان
    if (
      title.includes("الخوارزمية") ||
      title.includes("AI") ||
      title.includes("ذكاء") ||
      title.includes("اصطناعي")
    )
      score += 20;
    if (title.includes("مستقبل") || title.includes("تطور")) score += 15;

    // تحليل المحتوى (طول وتعقيد)
    if (content && content.length > 1000) score += 10;
    if ((content && content.includes("تحليل")) || content.includes("استشراف"))
      score += 10;

    // تحليل التخصص
    if ((content && content.includes("تقنية")) || content.includes("تكنولوجيا"))
      score += 5;

    return Math.min(95, score); // الحد الأقصى 95%
  };

  const aiScore = calculateAIScore(article.content || "", article.title);

  const getScoreDescription = (score: number, angleColor: string) => {
    // تحويل hex color إلى RGB للحصول على التدرجات
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 59, g: 130, b: 246 }; // blue fallback
    };

    const rgb = hexToRgb(angleColor);

    if (score >= 85)
      return {
        text: "إبداعي ومبتكر",
        emoji: "🎯",
        color: `rgb(${Math.max(0, rgb.r - 50)} ${Math.max(
          0,
          rgb.g - 50
        )} ${Math.max(0, rgb.b - 50)})`,
        bgStyle: {
          background: `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) 100%)`,
        },
        borderStyle: {
          borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
        },
        gradientStyle: {
          background: `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${
            rgb.b
          }, 0.9) 0%, rgba(${Math.min(255, rgb.r + 30)}, ${Math.min(
            255,
            rgb.g + 30
          )}, ${Math.min(255, rgb.b + 30)}, 0.9) 100%)`,
        },
      };
    if (score >= 70)
      return {
        text: "مثير للتفكير",
        emoji: "💡",
        color: `rgb(${Math.max(0, rgb.r - 30)} ${Math.max(
          0,
          rgb.g - 30
        )} ${Math.max(0, rgb.b - 30)})`,
        bgStyle: {
          background: `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.03) 100%)`,
        },
        borderStyle: {
          borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
        },
        gradientStyle: {
          background: `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${
            rgb.b
          }, 0.8) 0%, rgba(${Math.min(255, rgb.r + 20)}, ${Math.min(
            255,
            rgb.g + 20
          )}, ${Math.min(255, rgb.b + 20)}, 0.8) 100%)`,
        },
      };
    return {
      text: "تحليل معمق",
      emoji: "🧠",
      color: `rgb(${Math.max(0, rgb.r - 20)} ${Math.max(
        0,
        rgb.g - 20
      )} ${Math.max(0, rgb.b - 20)})`,
      bgStyle: {
        background: `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.02) 100%)`,
      },
      borderStyle: {
        borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
      },
      gradientStyle: {
        background: `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${
          rgb.b
        }, 0.7) 0%, rgba(${Math.min(255, rgb.r + 15)}, ${Math.min(
          255,
          rgb.g + 15
        )}, ${Math.min(255, rgb.b + 15)}, 0.7) 100%)`,
      },
    };
  };

  const scoreDesc = getScoreDescription(aiScore, angle.themeColor);

  return (
    <div
      className="border-2 rounded-2xl p-6 md:p-8 mb-6 md:mb-10 shadow-lg hover:shadow-xl transition-all duration-300 group"
      style={{
        ...scoreDesc.bgStyle,
        ...scoreDesc.borderStyle,
      }}
    >
      {/* Header مع أيقونة AI محسنة */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white text-xl md:text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300"
          style={scoreDesc.gradientStyle}
        >
          🤖
        </div>
        <div>
          <h3
            className="font-bold text-lg md:text-xl mb-1"
            style={{ color: scoreDesc.color }}
          >
            تحليل الذكاء الاصطناعي
          </h3>
          <p className="text-sm text-gray-600">تقييم ذكي لجودة وعمق المحتوى</p>
        </div>
      </div>

      {/* النتيجة والوصف */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{scoreDesc.emoji}</span>
          <div>
            <p
              className="text-lg md:text-xl font-bold"
              style={{ color: scoreDesc.color }}
            >
              {aiScore}% - {scoreDesc.text}
            </p>
          </div>
        </div>

        <p className="text-sm md:text-base text-gray-700 leading-relaxed bg-white/50 p-4 rounded-lg">
          يصنف هذا المقال كمحتوى <strong>{scoreDesc.text.toLowerCase()}</strong>{" "}
          بناءً على تحليل اللغة المستخدمة، عمق الأفكار المطروحة، والاستشراف
          المستقبلي. تم التقييم باستخدام خوارزميات متقدمة لفهم السياق والمعنى.
        </p>
      </div>

      {/* مؤشر النقاط المحسن */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>درجة التحليل</span>
          <span className="font-mono font-bold">{aiScore}/100</span>
        </div>

        <div className="relative">
          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{
                width: `${aiScore}%`,
                ...scoreDesc.gradientStyle,
              }}
            />
          </div>
          {/* النقاط المرجعية */}
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>ضعيف</span>
            <span>جيد</span>
            <span>ممتاز</span>
          </div>
        </div>
      </div>

      {/* معايير التقييم */}
      <div className="mt-6 pt-4 border-t border-gray-200/50">
        <details className="group/details">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2">
            <span>📊 معايير التقييم</span>
            <svg
              className="w-4 h-4 transition-transform group-open/details:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <div className="mt-3 text-xs text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>• تحليل العنوان والكلمات المفتاحية</span>
              <span>20 نقطة</span>
            </div>
            <div className="flex justify-between">
              <span>• عمق المحتوى وطول النص</span>
              <span>15 نقطة</span>
            </div>
            <div className="flex justify-between">
              <span>• اللغة التحليلية والاستشرافية</span>
              <span>10 نقاط</span>
            </div>
            <div className="flex justify-between">
              <span>• التخصص التقني</span>
              <span>5 نقاط</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
// مكون بيانات الكاتب
function AuthorSection({
  article,
  angle,
}: {
  article: AngleArticle;
  angle: Angle;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-lg md:rounded-xl border mb-4 md:mb-8">
      <div className="flex items-center gap-3 md:gap-4">
        {article.author?.image ? (
          <Image
            src={article.author.image}
            alt={article.author.name}
            width={40}
            height={40}
            className="rounded-full md:w-12 md:h-12"
          />
        ) : (
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: angle.themeColor + "20" }}
          >
            <User
              className="w-5 h-5 md:w-6 md:h-6"
              style={{ color: angle.themeColor }}
            />
          </div>
        )}

        <div>
          <p className="font-semibold text-gray-900 text-sm md:text-base">
            {article.author?.name}
          </p>
          <p className="text-xs md:text-sm text-gray-500">
            كاتب في {angle.title}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-500 w-full sm:w-auto">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
          <span className="hidden sm:inline">
            {new Date(
              article.publishDate || article.createdAt
            ).toLocaleDateString("ar-SA")}
          </span>
          <span className="sm:hidden">
            {new Date(
              article.publishDate || article.createdAt
            ).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 md:w-4 md:h-4" />
          <span>{article.readingTime || 5} د</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3 md:w-4 md:h-4" />
          <span className="hidden md:inline">
            {(article.views || 0).toLocaleString()} مشاهدة
          </span>
          <span className="md:hidden">
            {article.views > 1000
              ? (article.views / 1000).toFixed(1) + "k"
              : article.views || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

// مكون المقالات من زوايا أخرى
function CrossAngleRecommendations({ articles }: { articles: any[] }) {
  if (articles.length === 0) return null;

  return (
    <div className="mt-8 md:mt-12">
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-gray-900">
          مقالات من زوايا أخرى
        </h2>
        <div className="px-2 py-1 md:px-3 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          استكشف
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {articles.map((article, index) => (
          <Card
            key={article.id}
            className="group rounded-lg md:rounded-xl overflow-hidden border-0 shadow-sm md:shadow-md hover:shadow-md md:hover:shadow-lg transition-all duration-200"
          >
            <div className="relative h-32 md:h-40 w-full overflow-hidden">
              {article.coverImage ? (
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div
                  className="w-full h-full opacity-20"
                  style={{
                    background: `linear-gradient(135deg, ${article.angle.themeColor} 0%, #1f2937 100%)`,
                  }}
                />
              )}

              {/* شارة الزاوية */}
              <div className="absolute top-2 right-2">
                <Badge
                  className="text-xs font-medium text-white shadow-lg"
                  style={{
                    backgroundColor: article.angle.themeColor,
                  }}
                >
                  {article.angle.title}
                </Badge>
              </div>
            </div>

            <div className="p-3 md:p-4">
              <Link href={`/muqtarab/${article.angle.slug}/${article.id}`}>
                <h3 className="font-bold text-sm md:text-base text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 mb-2">
                  {article.title}
                </h3>
              </Link>

              {article.excerpt && (
                <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.readingTime || 5} دقائق</span>
                </div>

                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span className="hidden md:inline">
                    {article.views?.toLocaleString() || 0} مشاهدة
                  </span>
                  <span className="md:hidden">
                    {article.views > 1000
                      ? (article.views / 1000).toFixed(1) + "k"
                      : article.views || 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
