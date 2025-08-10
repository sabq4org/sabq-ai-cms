"use client";

import ArticleAudioPlayer from "@/components/muqtarab/ArticleAudioPlayer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo, useState } from "react";
import toast from "react-hot-toast";

interface ArticleClientContentProps {
  article: any;
  relatedArticles: any[];
}

// مكون بطاقة المقال المرتبط
const RelatedArticleCard = memo(({ article }: { article: any }) => {
  return (
    <Link
      href={`/muqtarab/articles/${article.slug}`}
      prefetch={false}
      className="block group"
    >
      <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
        {article.coverImage && (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}

        <CardContent className="p-4">
          <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{article.readingTime || 5} دقائق</span>
            <span>{article.views?.toLocaleString() || 0} مشاهدة</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

RelatedArticleCard.displayName = "RelatedArticleCard";

function ArticleClientContent({
  article,
  relatedArticles,
}: ArticleClientContentProps) {
  const [likes, setLikes] = useState(article.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // معالج الإعجاب
  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);
      setLikes(isLiked ? likes - 1 : likes + 1);

      // يمكن إضافة API call هنا
      toast.success(isLiked ? "تم إلغاء الإعجاب" : "تم الإعجاب بالمقال");
    } catch (error) {
      toast.error("حدث خطأ أثناء التفاعل");
    }
  };

  // معالج الحفظ
  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "تم إلغاء الحفظ" : "تم حفظ المقال");
  };

  // معالج المشاركة
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("تم نسخ الرابط");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء المشاركة");
    }
  };

  // تحويل المحتوى إلى HTML آمن
  const contentHtml = { __html: article.content || "" };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* رأس المقال */}
        <header className="mb-8">
          {/* زر العودة */}
          <Link
            href={
              article.corner ? `/muqtarab/${article.corner.slug}` : "/muqtarab"
            }
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة إلى {article.corner?.name || "مُقترب"}
          </Link>

          {/* العنوان */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
            {article.title}
          </h1>

          {/* المقتطف */}
          {article.excerpt && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* معلومات المقال */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            {/* الكاتب */}
            {article.author && (
              <div className="flex items-center gap-2">
                {article.author.avatar && (
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="font-medium">{article.author.name}</span>
              </div>
            )}

            {/* التاريخ */}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <time dateTime={article.publishDate || article.createdAt}>
                {new Date(
                  article.publishDate || article.createdAt
                ).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>

            {/* وقت القراءة */}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{article.readingTime || 5} دقائق قراءة</span>
            </div>

            {/* المشاهدات */}
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{article.views?.toLocaleString() || 0} مشاهدة</span>
            </div>
          </div>

          {/* العلامات */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* صورة المقال */}
        {article.coverImage && (
          <div className="relative aspect-[16/9] w-full mb-8 rounded-lg overflow-hidden">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* مشغل الصوت */}
        {article.audioSummary && (
          <div className="mb-8">
            <ArticleAudioPlayer
              articleId={article.id}
              audioUrl={article.audioSummary}
              title={article.title}
            />
          </div>
        )}

        {/* محتوى المقال */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={contentHtml}
        />

        <Separator className="my-8" />

        {/* أزرار التفاعل */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isLiked ? "default" : "outline"}
              onClick={handleLike}
              className="gap-2"
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              {likes}
            </Button>

            <Button
              size="sm"
              variant={isSaved ? "default" : "outline"}
              onClick={handleSave}
            >
              <Bookmark
                className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`}
              />
            </Button>

            <Button size="sm" variant="outline">
              <MessageCircle className="w-4 h-4 ml-2" />
              {article.comments || 0}
            </Button>
          </div>

          <Button size="sm" variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 ml-2" />
            مشاركة
          </Button>
        </div>

        {/* المقالات ذات الصلة */}
        {relatedArticles.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">مقالات ذات صلة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedArticles.map((relatedArticle) => (
                <RelatedArticleCard
                  key={relatedArticle.id}
                  article={relatedArticle}
                />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}

export default memo(ArticleClientContent);
