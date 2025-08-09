"use client";

import ArticleAudioPlayer from "@/components/muqtarab/ArticleAudioPlayer";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MuqtarabSimpleArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleSlug = params?.slug as string;

  const [article, setArticle] = useState<any>(null);
  const [corner, setCorner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);

  useEffect(() => {
    const fetchArticleData = async () => {
      if (!articleSlug) return;
      try {
        setLoading(true);

        // جلب بيانات المقال مباشرة بالـ slug
        const articleResponse = await fetch(
          `/api/muqtarab/articles/${articleSlug}`
        );
        if (!articleResponse.ok) {
          toast.error("المقال غير موجود");
          router.push("/muqtarab");
          return;
        }
        const articleData = await articleResponse.json();
        setArticle(articleData.article);
        setCorner(articleData.article.corner);

        // جلب المقالات ذات الصلة من نفس الزاوية
        if (articleData.article.corner?.id) {
          const relatedResponse = await fetch(
            `/api/muqtarab/angles/${articleData.article.corner.id}/articles?limit=4&published=true`
          );
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            setRelatedArticles(
              relatedData.articles.filter(
                (a: any) => a.id !== articleData.article.id
              )
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch article:", error);
        toast.error("حدث خطأ أثناء تحميل المقال");
      } finally {
        setLoading(false);
      }
    };
    fetchArticleData();
  }, [articleSlug, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المقال...</p>
        </div>
      </div>
    );
  }

  if (!article || !corner) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center bg-gray-50">
        <div>
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-900">
            المقال غير موجود
          </h1>
          <p className="text-gray-600 mb-6">
            عذراً، لم نتمكن من العثور على المقال المطلوب
          </p>
          <Link href="/muqtarab">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
              العودة إلى مُقترب
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* خيط التنقل المبسط */}
        <nav className="mb-6">
          <Link 
            href="/muqtarab" 
            className="text-blue-600 hover:underline flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} />
            العودة إلى مُقترب
          </Link>
        </nav>

        {/* رأس المقال */}
        <header className="mb-8">
          {/* شارة الزاوية */}
          <div className="mb-4">
            <Link
              href={`/muqtarab/corners/${corner.slug}`}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: corner.theme_color + "15",
                color: corner.theme_color,
                border: `1px solid ${corner.theme_color}30`,
              }}
            >
              <Sparkles className="w-3 h-3" />
              {corner.name}
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {article.excerpt}
            </p>
          )}

          {/* معلومات المقال */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 py-4 border-t border-b border-gray-200">
            <div className="flex items-center gap-2">
              <User size={14} />
              <span>
                {article.author?.name || corner.author?.name || "فريق التحرير"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>
                {new Date(
                  article.publishDate || article.createdAt
                ).toLocaleDateString("ar-SA")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>{article.readingTime || 5} دقائق قراءة</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={14} />
              <span>{article.views || 0} مشاهدة</span>
            </div>
          </div>
        </header>

        {/* صورة الغلاف */}
        {article.coverImage && (
          <div className="relative h-96 w-full rounded-xl overflow-hidden mb-8 shadow-sm">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* مشغل الصوت إذا كان متوفراً */}
        <div className="mb-8">
          <ArticleAudioPlayer
            articleId={article.id}
            title={article.title}
            content={article.content}
          />
        </div>

        {/* محتوى المقال */}
        <article 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* أسفل المقال */}
        <footer className="mb-12 pt-8 border-t">
          {/* التفاعلات */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-6 text-gray-500">
              <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                <Heart size={16} />
                <span>{article.likes || 0}</span>
              </button>
              <div className="flex items-center gap-2">
                <MessageCircle size={16} />
                <span>{article.comments || 0}</span>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Share2 size={16} />
              مشاركة
            </button>
          </div>

          {/* الكاتب */}
          {(article.author || corner.author) && (
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <User size={20} className="text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {article.author?.name ||
                      corner.author?.name ||
                      "فريق التحرير"}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {article.author?.bio ||
                      corner.description ||
                      "كاتب في فريق مُقترب"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </footer>

        {/* المقالات ذات الصلة */}
        {relatedArticles.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              مقالات أخرى في {corner.name}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedArticles.slice(0, 6).map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  href={`/muqtarab/${relatedArticle.slug}`}
                  className="group block bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors"
                >
                  {relatedArticle.coverImage && (
                    <div className="relative h-32 overflow-hidden">
                      <Image
                        src={relatedArticle.coverImage}
                        alt={relatedArticle.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                      {relatedArticle.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        <span>{relatedArticle.readingTime || 5} د</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={10} />
                        <span>{relatedArticle.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* زر العودة */}
        <div className="text-center pt-4 border-t">
          <Link
            href={`/muqtarab/corners/${corner.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={14} />
            العودة إلى {corner.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
