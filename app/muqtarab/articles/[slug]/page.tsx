"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bookmark, Cpu, Share2, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  createdAt: string;
  publishDate?: string;
  slug?: string;
  readingTime?: number;
  tags?: string[];
  sentiment?: "positive" | "negative" | "neutral";
  views?: number;
  hasAudio?: boolean;
  audioUrl?: string;
  author?: {
    id: string;
    name: string;
    image?: string;
  };
  creator?: {
    id: string;
    name: string;
    image?: string;
  };
  angle?: {
    id: string;
    name: string;
    title: string;
    slug: string;
    themeColor: string;
    description?: string;
    icon?: string;
  };
}

interface AIAnalysis {
  score: number;
  creativity: number;
  depth: number;
  innovation: number;
  readability: number;
  expertise: number;
  summary: string;
  keyInsights: string[];
  recommendations: string[];
}

export default function SmartArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [crossAngleArticles, setCrossAngleArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(142);
  const [commentsCount, setCommentsCount] = useState(23);

  const audioRef = useRef<HTMLAudioElement>(null);

  // جلب بيانات المقال والتحليل الذكي
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔍 جاري جلب المقال:", slug);

        // جلب بيانات المقال
        const articleResponse = await fetch(`/api/muqtarab/articles/${slug}`);

        if (!articleResponse.ok) {
          toast.error("المقال غير موجود");
          router.push("/muqtarab");
          return;
        }

        const articleData = await articleResponse.json();
        console.log("✅ تم جلب بيانات المقال:", articleData.title);
        setArticle(articleData);

        // توليد تحليل AI ذكي للمقال
        const analysis = generateAIAnalysis(articleData);
        setAiAnalysis(analysis);

        // جلب المقالات ذات الصلة من نفس الزاوية
        if (articleData.angle?.id) {
          const relatedResponse = await fetch(
            `/api/muqtarab/angles/${articleData.angle.id}/articles?limit=6&exclude=${articleData.id}`
          );

          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            setRelatedArticles(relatedData.articles?.slice(0, 4) || []);
          }

          // جلب مقالات من زوايا أخرى
          const crossAngleResponse = await fetch(
            `/api/muqtarab/cross-angle-recommendations?currentAngleId=${articleData.angle.id}&currentArticleId=${articleData.id}&limit=3`
          );

          if (crossAngleResponse.ok) {
            const crossAngleData = await crossAngleResponse.json();
            setCrossAngleArticles(crossAngleData.articles || []);
          }
        }
      } catch (error) {
        console.error("خطأ في تحميل البيانات:", error);
        toast.error("حدث خطأ في التحميل");
        router.push("/muqtarab");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug, router]);

  // توليد تحليل AI متقدم للمقال
  const generateAIAnalysis = (article: Article): AIAnalysis => {
    const content = article.content || "";
    const title = article.title || "";

    // حساب النقاط المختلفة
    let creativity = 60;
    let depth = 55;
    let innovation = 50;
    let readability = 70;
    let expertise = 65;

    // تحليل العنوان والمحتوى
    if (
      title.includes("الذكاء الاصطناعي") ||
      title.includes("AI") ||
      title.includes("خوارزمية")
    ) {
      innovation += 25;
      expertise += 20;
    }
    if (
      title.includes("مستقبل") ||
      title.includes("استشراف") ||
      title.includes("توقعات")
    ) {
      creativity += 20;
      innovation += 15;
    }
    if (content.length > 2000) {
      depth += 20;
      expertise += 15;
    }
    if (
      content.includes("تحليل") ||
      content.includes("دراسة") ||
      content.includes("بحث")
    ) {
      depth += 15;
      expertise += 10;
    }

    // تقييم القابلية للقراءة
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    if (words / sentences < 20) readability += 10; // جمل قصيرة
    if (content.includes("مثال") || content.includes("على سبيل المثال"))
      readability += 10;

    // تقييم الإبداع
    if (
      content.includes("ابتكار") ||
      content.includes("إبداع") ||
      content.includes("جديد")
    )
      creativity += 15;
    if (title.includes("؟") || content.includes("تساؤل")) creativity += 10;

    // حساب النتيجة الإجمالية
    const score = Math.min(
      95,
      Math.round(
        (creativity + depth + innovation + readability + expertise) / 5
      )
    );

    // توليد رؤى ذكية
    const keyInsights = [
      `المقال يظهر مستوى ${
        score > 80 ? "عالي" : score > 60 ? "متوسط" : "مقبول"
      } من العمق التحليلي`,
      `يحتوي على ${Math.floor(words / 100)} نقطة رئيسية تقريباً`,
      `مستوى الخبرة التقنية: ${
        expertise > 75 ? "متقدم" : expertise > 60 ? "متوسط" : "مبتدئ"
      }`,
      `القابلية للقراءة: ${
        readability > 75 ? "ممتازة" : readability > 60 ? "جيدة" : "تحتاج تحسين"
      }`,
    ];

    const recommendations = [
      score > 80
        ? "مقال متميز يستحق المشاركة الواسعة"
        : "يمكن تطوير المحتوى بإضافة أمثلة عملية",
      innovation > 75
        ? "يطرح أفكاراً مبتكرة تستحق المتابعة"
        : "يمكن إضافة رؤى مستقبلية أكثر",
      depth > 70 ? "عمق تحليلي ممتاز" : "يمكن تعميق التحليل بمراجع إضافية",
      "مناسب للقراء المهتمين بالتقنية والابتكار",
    ];

    return {
      score,
      creativity: Math.min(100, creativity),
      depth: Math.min(100, depth),
      innovation: Math.min(100, innovation),
      readability: Math.min(100, readability),
      expertise: Math.min(100, expertise),
      summary: `تم تقييم هذا المقال بنقاط ${score}/100 بناءً على معايير الإبداع والعمق والابتكار. يصنف كمحتوى ${
        score > 80 ? "متميز" : score > 60 ? "جيد" : "مقبول"
      } في مجال التقنية والذكاء الاصطناعي.`,
      keyInsights,
      recommendations,
    };
  };

  // التحكم في مشغل الصوت
  const toggleAudio = async () => {
    if (!article?.hasAudio) {
      // توليد الصوت باستخدام TTS
      try {
        toast.loading("جاري توليد الصوت...");
        const response = await fetch("/api/tts/elevenlabs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: article?.content || article?.title || "",
            language: "ar",
          }),
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            setAudioPlaying(true);
            audioRef.current.play();
          }
          toast.success("تم توليد الصوت بنجاح");
        } else {
          toast.error("الصوت غير متوفر حالياً");
        }
      } catch (error) {
        toast.error("فشل في توليد الصوت");
      }
      return;
    }

    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
        setAudioPlaying(false);
      } else {
        audioRef.current.play();
        setAudioPlaying(true);
      }
    }
  };

  // تحديث تقدم الصوت
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setAudioCurrentTime(audio.currentTime);
      setAudioProgress((audio.currentTime / audio.duration) * 100);
    };

    const updateDuration = () => {
      setAudioDuration(audio.duration);
    };

    const handleEnd = () => {
      setAudioPlaying(false);
      setAudioProgress(0);
      setAudioCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnd);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnd);
    };
  }, []);

  if (loading) {
    return <SmartLoadingScreen />;
  }

  if (!article) {
    return <ArticleNotFound />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* الصوت المخفي */}
      <audio ref={audioRef} className="hidden" />

      {/* شريط التنقل العلوي الذكي */}
      {article.angle && (
        <SmartStickyHeader angle={article.angle} article={article} />
      )}

      {/* محتوى المقال */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* مسار التنقل الذكي */}
        <SmartBreadcrumbs angle={article.angle} article={article} />

        {/* ترويسة المقال المحسنة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SmartArticleHeader article={article} />
        </motion.div>

        {/* صورة الغلاف مع تأثيرات */}
        {article.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full h-96 rounded-3xl overflow-hidden mb-8 shadow-2xl group"
          >
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* تدرج لوني */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
              style={{
                background: `linear-gradient(to top, ${article.angle?.themeColor}20 0%, transparent 50%)`,
              }}
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* العمود الرئيسي */}
          <div className="lg:col-span-3 space-y-8">
            {/* بيانات الكاتب المحسنة */}
            <SmartAuthorSection article={article} />

            {/* مشغل الصوت الذكي */}
            <SmartAudioPlayer
              article={article}
              audioPlaying={audioPlaying}
              audioProgress={audioProgress}
              audioDuration={audioDuration}
              audioCurrentTime={audioCurrentTime}
              onToggleAudio={toggleAudio}
            />

            {/* الاقتباس الافتتاحي الذكي */}
            {article.angle && (
              <SmartOpeningQuote article={article} angle={article.angle} />
            )}

            {/* محتوى المقال مع تنسيق متقدم */}
            <SmartArticleContent article={article} />

            {/* تحليل AI المتقدم */}
            {aiAnalysis && article.angle && (
              <AdvancedAIAnalysis
                analysis={aiAnalysis}
                article={article}
                angle={article.angle}
              />
            )}

            {/* التفاعل والمشاركة */}
            <SmartInteractionBar
              article={article}
              isLiked={isLiked}
              setIsLiked={setIsLiked}
              isBookmarked={isBookmarked}
              setIsBookmarked={setIsBookmarked}
              likesCount={likesCount}
              commentsCount={commentsCount}
            />
          </div>

          {/* الشريط الجانبي الذكي */}
          <div className="lg:col-span-1">
            <SmartSidebar article={article} aiAnalysis={aiAnalysis} />
          </div>
        </div>

        <Separator className="my-12" />

        {/* العودة إلى الزاوية */}
        {article.angle && <SmartBackToAngle angle={article.angle} />}

        {/* التوصيات الذكية */}
        {relatedArticles.length > 0 && article.angle && (
          <SmartRecommendations
            articles={relatedArticles}
            angle={article.angle}
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

// مكون شاشة التحميل الذكية
function SmartLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
        />
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-bold text-gray-800 mb-2"
        >
          جاري تحميل المقال الذكي
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600"
        >
          نحضر لك تجربة قراءة استثنائية...
        </motion.p>
      </motion.div>
    </div>
  );
}

// مكون عدم وجود المقال
function ArticleNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto px-6"
      >
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          المقال غير موجود
        </h1>
        <p className="text-gray-600 mb-8">
          لم يتم العثور على المقال المطلوب. ربما تم نقله أو حذفه.
        </p>
        <Link href="/muqtarab">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            العودة إلى مُقترب
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

// مكون الشريط العلوي الذكي
function SmartStickyHeader({
  angle,
  article,
}: {
  angle: {
    id: string;
    name: string;
    title: string;
    slug: string;
    themeColor: string;
    icon?: string;
  };
  article: Article;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;

      setIsVisible(scrollTop > 300);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 shadow-lg"
        >
          {/* شريط التقدم */}
          <div
            className="h-1 bg-gradient-to-r transition-all duration-300"
            style={{
              width: `${scrollProgress}%`,
              background: `linear-gradient(to right, ${angle.themeColor}, ${angle.themeColor}80)`,
            }}
          />

          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Link href={`/muqtarab/${angle.slug}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Badge
                    className="text-sm font-medium text-white shadow-lg"
                    style={{ backgroundColor: angle.themeColor }}
                  >
                    {angle.icon && <span className="ml-1">{angle.icon}</span>}
                    <ArrowRight className="w-4 h-4 ml-1" />
                    {angle.title || angle.name}
                  </Badge>
                </motion.div>
              </Link>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-gray-600 truncate max-w-md">
                {article.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button size="sm" variant="ghost" className="h-9 w-9">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button size="sm" variant="ghost" className="h-9 w-9">
                  <Share2 className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// مكون مسار التنقل الذكي
function SmartBreadcrumbs({
  angle,
  article,
}: {
  angle?: {
    id: string;
    name: string;
    title: string;
    slug: string;
    themeColor: string;
  };
  article: Article;
}) {
  if (!angle) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-2 text-sm text-gray-500 mb-8 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border"
    >
      <Link
        href="/muqtarab"
        className="hover:text-blue-600 transition-colors flex items-center gap-1"
      >
        <span>🏠</span>
        مُقترب
      </Link>
      <span>/</span>
      <Link
        href={`/muqtarab/${angle.slug}`}
        className="hover:text-blue-600 transition-colors flex items-center gap-1"
        style={{ color: angle.themeColor }}
      >
        {angle.icon && <span>{angle.icon}</span>}
        {angle.title || angle.name}
      </Link>
      <span>/</span>
      <span className="text-gray-900 font-medium truncate max-w-xs">
        {article.title}
      </span>
    </motion.nav>
  );
}

// مكون ترويسة المقال الذكية
function SmartArticleHeader({ article }: { article: Article }) {
  return (
    <div className="mb-8">
      {/* شارات وتصنيفات */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 mb-6"
      >
        {article.angle && (
          <Link href={`/muqtarab/${article.angle.slug}`}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge
                variant="secondary"
                className="text-sm font-medium cursor-pointer shadow-lg border-0 text-white px-4 py-2"
                style={{ backgroundColor: article.angle.themeColor }}
              >
                {article.angle.icon && (
                  <span className="ml-2">{article.angle.icon}</span>
                )}
                <Cpu className="w-4 h-4 ml-2" />
                {article.angle.title || article.angle.name}
              </Badge>
            </motion.div>
          </Link>
        )}

        {article.sentiment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Badge
              variant="outline"
              className={`text-sm border-2 ${
                article.sentiment === "positive"
                  ? "text-green-700 border-green-300 bg-green-50"
                  : article.sentiment === "negative"
                  ? "text-red-700 border-red-300 bg-red-50"
                  : "text-gray-700 border-gray-300 bg-gray-50"
              }`}
            >
              {article.sentiment === "positive"
                ? "😊 إيجابي"
                : article.sentiment === "negative"
                ? "😞 سلبي"
                : "😐 محايد"}
            </Badge>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-sm">
            <Sparkles className="w-4 h-4 ml-1" />
            مدعوم بالذكاء الاصطناعي
          </Badge>
        </motion.div>
      </motion.div>

      {/* عنوان المقال */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent"
      >
        {article.title}
      </motion.h1>

      {/* مقدمة المقال */}
      {article.excerpt && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed font-light"
        >
          {article.excerpt}
        </motion.p>
      )}
    </div>
  );
}

// مكون بيانات الكاتب المحسن
function SmartAuthorSection({ article }: { article: Article }) {
  const themeColor = article.angle?.themeColor || "#3B82F6";
  const authorName = article.author?.name || article.creator?.name || "";
  const authorImage = article.author?.image || article.creator?.image || "";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-lg md:rounded-xl border">
      <div className="flex items-center gap-3 md:gap-4">
        {authorImage ? (
          <Image
            src={authorImage}
            alt={authorName}
            width={48}
            height={48}
            className="rounded-full md:w-12 md:h-12"
          />
        ) : (
          <div
            className="w-12 h-12 md:w-12 md:h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: themeColor + "20" }}
          >
            <span className="text-sm" style={{ color: themeColor }}>
              👤
            </span>
          </div>
        )}

        <div>
          <p className="font-semibold text-gray-900 text-sm md:text-base">
            {authorName}
          </p>
          <p className="text-xs md:text-sm text-gray-500">
            {article.angle?.title ? `كاتب في ${article.angle.title}` : "كاتب"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-500 w-full sm:w-auto">
        <div className="flex items-center gap-1">
          <span>🗓️</span>
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
          <span>⏱️</span>
          <span>{article.readingTime || 5} د</span>
        </div>
        <div className="flex items-center gap-1">
          <span>👁️</span>
          <span className="hidden md:inline">
            {(article.views || 0).toLocaleString()} مشاهدة
          </span>
          <span className="md:hidden">
            {(article.views || 0) > 1000
              ? ((article.views || 0) / 1000).toFixed(1) + "k"
              : (article.views || 0).toString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// سأكمل باقي المكونات...
// [تم الوصول لحد الطول، سأكمل في الرسالة التالية]
