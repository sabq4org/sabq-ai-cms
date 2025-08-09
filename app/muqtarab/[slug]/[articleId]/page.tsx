"use client";

import ArticleAudioPlayer from "@/components/muqtarab/ArticleAudioPlayer";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MuqtarabArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string; // corner slug
  const articleId = params?.articleId as string;

  const [article, setArticle] = useState<any>(null);
  const [corner, setCorner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);

  useEffect(() => {
    const fetchArticleData = async () => {
      if (!slug || !articleId) return;
      try {
        setLoading(true);

        // جلب بيانات الزاوية أولاً
        const cornerResponse = await fetch(
          `/api/muqtarab/angles/by-slug/${slug}`
        );
        if (!cornerResponse.ok) {
          toast.error("الزاوية غير موجودة");
          router.push("/muqtarab");
          return;
        }
        const cornerData = await cornerResponse.json();
        setCorner(cornerData.angle);

        // جلب بيانات المقال
        const articleResponse = await fetch(
          `/api/muqtarab/angles/${cornerData.angle.id}/articles/${articleId}`
        );
        if (!articleResponse.ok) {
          toast.error("المقال غير موجود");
          router.push(`/muqtarab/corners/${slug}`);
          return;
        }
        const articleData = await articleResponse.json();
        setArticle(articleData.article);

        // جلب المقالات ذات الصلة
        const relatedResponse = await fetch(
          `/api/muqtarab/angles/${cornerData.angle.id}/articles?limit=4`
        );
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedArticles(
            relatedData.articles.filter((a: any) => a.id !== articleId)
          );
        }
      } catch (error) {
        console.error("Failed to fetch article:", error);
        toast.error("حدث خطأ أثناء تحميل المقال");
      } finally {
        setLoading(false);
      }
    };
    fetchArticleData();
  }, [slug, articleId, router]);

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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* خيط التنقل */}
        <nav className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link
              href="/muqtarab"
              className="hover:text-blue-600 transition-colors"
            >
              مُقترب
            </Link>
            <span>•</span>
            <Link
              href={`/muqtarab/corners/${corner.slug}`}
              className="hover:text-blue-600 transition-colors"
            >
              {corner.title}
            </Link>
            <span>•</span>
            <span className="text-gray-400">المقال</span>
          </div>
        </nav>

        {/* رأس المقال */}
        <header className="mb-8">
          {/* شارة الزاوية */}
          <div className="mb-4">
            <Link
              href={`/muqtarab/corners/${corner.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                backgroundColor: corner.themeColor + "20",
                color: corner.themeColor,
                border: `1px solid ${corner.themeColor}30`,
              }}
            >
              <Sparkles className="w-4 h-4" />
              {corner.title}
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
              <User size={16} />
              <span>
                {article.author?.name || corner.author?.name || "فريق التحرير"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>
                {new Date(
                  article.publishDate || article.createdAt
                ).toLocaleDateString("ar-SA")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{article.readingTime || 5} دقائق قراءة</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>{article.views || 0} مشاهدة</span>
            </div>
          </div>
        </header>

        {/* صورة الغلاف */}
        {article.coverImage && (
          <div className="relative h-96 w-full rounded-xl overflow-hidden mb-8 shadow-lg">
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

        {/* قسم تحليل الذكاء الاصطناعي المتطور */}
        <AIAnalysisSection article={article} corner={corner} />

        {/* محتوى المقال */}
        <article className="prose prose-lg max-w-none mb-12">
          <div
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* أسفل المقال */}
        <footer className="mb-12">
          {/* التفاعلات */}
          <div className="flex justify-between items-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-6 text-gray-500">
              <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                <Heart size={18} />
                <span>{article.likes || 0}</span>
              </button>
              <div className="flex items-center gap-2">
                <MessageCircle size={18} />
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
            <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={24} className="text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
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
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              مقالات أخرى في {corner.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedArticles.slice(0, 4).map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  href={`/muqtarab/${corner.slug}/${relatedArticle.id}`}
                  className="group block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {relatedArticle.coverImage && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={relatedArticle.coverImage}
                        alt={relatedArticle.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {relatedArticle.title}
                    </h3>
                    {relatedArticle.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {relatedArticle.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{relatedArticle.readingTime || 5} د</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={12} />
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
        <div className="text-center">
          <Link
            href={`/muqtarab/corners/${corner.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            العودة إلى {corner.title}
          </Link>
        </div>
      </div>
    </div>
  );
}

// مكون تحليل الذكاء الاصطناعي المتطور مع الألوان الديناميكية
function AIAnalysisSection({ article, corner }: { article: any; corner: any }) {
  // حساب درجة تحليل الذكاء الاصطناعي
  const calculateAIScore = (content: string, title: string): number => {
    if (!content || !title) return 60;

    const factors = {
      length: Math.min(content.length / 50, 20),
      complexity: (content.match(/[،؛:.!?]/g) || []).length * 0.5,
      titleRelevance: title.length > 10 ? 15 : 10,
      structure: (content.match(/\n\n/g) || []).length * 2,
      keywordsAI:
        (content.match(/ذكاء|تقنية|AI|تحليل|ابتكار/g) || []).length * 3,
    };

    const total = Object.values(factors).reduce((sum, val) => sum + val, 0);
    return Math.min(Math.round(total), 95);
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

  const scoreDesc = getScoreDescription(aiScore, corner.themeColor);

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
          <p className="text-gray-600 text-sm">تقييم ذكي للمحتوى والأسلوب</p>
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

        {/* التفاصيل التحليلية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <Target
              className="w-5 h-5 mx-auto mb-1"
              style={{ color: scoreDesc.color }}
            />
            <div className="text-sm font-medium text-gray-700">دقة المحتوى</div>
            <div
              className="text-lg font-bold"
              style={{ color: scoreDesc.color }}
            >
              {Math.round(aiScore * 0.9)}%
            </div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <Brain
              className="w-5 h-5 mx-auto mb-1"
              style={{ color: scoreDesc.color }}
            />
            <div className="text-sm font-medium text-gray-700">عمق التحليل</div>
            <div
              className="text-lg font-bold"
              style={{ color: scoreDesc.color }}
            >
              {Math.round(aiScore * 0.95)}%
            </div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <TrendingUp
              className="w-5 h-5 mx-auto mb-1"
              style={{ color: scoreDesc.color }}
            />
            <div className="text-sm font-medium text-gray-700">
              القيمة المضافة
            </div>
            <div
              className="text-lg font-bold"
              style={{ color: scoreDesc.color }}
            >
              {Math.round(aiScore * 1.05)}%
            </div>
          </div>
        </div>

        {/* شريط التقدم المحسن */}
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
          <div
            className="absolute -top-8 left-0 text-xs text-gray-500 transform transition-all duration-1000"
            style={{
              left: `${Math.max(5, Math.min(95, aiScore))}%`,
              transform: "translateX(-50%)",
            }}
          >
            {aiScore}%
          </div>
        </div>
      </div>

      {/* التوصيات الذكية */}
      <div className="bg-white/40 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: scoreDesc.color }} />
          توصيات التحسين
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          {aiScore < 70 && <li>• إضافة المزيد من التفاصيل والأمثلة العملية</li>}
          {aiScore < 85 && <li>• تحسين البنية والتنظيم العام للمحتوى</li>}
          <li>• الاستفادة من البيانات والإحصائيات الحديثة</li>
          {aiScore >= 85 && <li>• المحتوى يحقق معايير الجودة العالية! 🎉</li>}
        </ul>
      </div>
    </div>
  );
}
