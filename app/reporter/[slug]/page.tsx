"use client";

import FooterOfficial from "@/components/Footer";
import CloudImage from "@/components/ui/CloudImage";
import { formatDateGregorian } from "@/lib/date-utils";
import {
  formatDashboardStat,
  formatLikesCount,
  formatViewsCount,
} from "@/lib/format-utils";
import { cn, getArticleLink } from "@/lib/utils";
import "@/styles/reporter-avatar-enhanced.css";
import "@/styles/reporter-mobile-fix.css";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Award,
  Brain,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Flame,
  Globe,
  Hash,
  Heart,
  Lightbulb,
  LineChart,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Radar,
  Share2,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Twitter,
  User,
  Users,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Reporter {
  id: string;
  user_id: string;
  full_name: string;
  slug: string;
  title: string;
  bio: string;
  avatar_url: string;
  is_verified: boolean;
  verification_badge: string;
  specializations: string[];
  coverage_areas: string[];
  languages: string[];
  twitter_url?: string;
  linkedin_url?: string;
  website_url?: string;
  email_public?: string;
  total_articles: number;
  total_views: number;
  total_likes: number;
  total_shares: number;
  avg_reading_time: number;
  engagement_rate: number;
  writing_style: any;
  popular_topics: string[];
  publication_pattern: any;
  reader_demographics: any;
  is_active: boolean;
  show_stats: boolean;
  show_contact: boolean;
  created_at: string;
  updated_at: string;
}

interface Stats {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  avgReadingTime: number;
  engagementRate: number;
  thisMonthArticles: number;
  thisYearArticles: number;
  mostViewedArticle?: {
    id: string;
    title: string;
    views: number;
  };
  recentActivity: string;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  image_url: string;
  featured_image?: string; // إضافة featured_image
  published_at: string;
  category_name: string;
  category_icon: string;
  views: number;
  likes: number;
  reading_time: number;
  slug: string;
}

// AI Insights Interfaces
interface AIPerformanceScore {
  overall: number;
  quality: number;
  engagement: number;
  consistency: number;
  impact: number;
  trend: "rising" | "stable" | "declining";
}

interface PredictiveAnalytics {
  nextMonthViews: number;
  growthRate: number;
  peakHours: string[];
  bestTopics: string[];
  audienceGrowth: number;
}

interface SentimentAnalysis {
  positive: number;
  neutral: number;
  negative: number;
  trending: "positive" | "neutral" | "negative";
}

interface TrendingRadar {
  topic: string;
  relevance: number;
  growth: number;
  competition: "low" | "medium" | "high";
}

// مساعد وظائف للتحقق والشارات
function getVerificationIcon(badge: string) {
  switch (badge) {
    case "expert":
      return <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />;
    case "senior":
      return <Award className="w-3 h-3 text-orange-400 fill-orange-400" />;
    default:
      return <CheckCircle2 className="w-3 h-3 text-green-400 fill-green-400" />;
  }
}

function getVerificationText(badge: string) {
  switch (badge) {
    case "expert":
      return "خبير";
    case "senior":
      return "محرر أول";
    default:
      return "معتمد";
  }
}

const ReporterProfilePage: React.FC = () => {
  const params = useParams();
  const slug = params?.slug as string;

  const [reporter, setReporter] = useState<Reporter | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("recent");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFullBio, setShowFullBio] = useState(false);

  // AI States
  const [aiScore, setAiScore] = useState<AIPerformanceScore>({
    overall: 92,
    quality: 88,
    engagement: 95,
    consistency: 90,
    impact: 94,
    trend: "rising",
  });

  const [predictiveAnalytics, setPredictiveAnalytics] =
    useState<PredictiveAnalytics>({
      nextMonthViews: 125000,
      growthRate: 23.5,
      peakHours: ["9:00 AM", "2:00 PM", "8:00 PM"],
      bestTopics: ["الاقتصاد", "التقنية", "الرياضة"],
      audienceGrowth: 15.8,
    });

  const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysis>(
    {
      positive: 78,
      neutral: 18,
      negative: 4,
      trending: "positive",
    }
  );

  const [trendingTopics, setTrendingTopics] = useState<TrendingRadar[]>([
    {
      topic: "الذكاء الاصطناعي",
      relevance: 95,
      growth: 45,
      competition: "high",
    },
    {
      topic: "الطاقة المتجددة",
      relevance: 88,
      growth: 32,
      competition: "medium",
    },
    {
      topic: "الرياضة السعودية",
      relevance: 92,
      growth: 28,
      competition: "low",
    },
    {
      topic: "الاقتصاد الرقمي",
      relevance: 85,
      growth: 38,
      competition: "medium",
    },
  ]);

  // جلب بيانات المراسل
  useEffect(() => {
    if (slug) {
      fetchReporterData();
    }
  }, [slug]);

  const fetchReporterData = async () => {
    try {
      setLoading(true);

      // جلب بيانات المراسل
      const reporterResponse = await fetch(`/api/reporters/${slug}`);
      if (!reporterResponse.ok) {
        throw new Error("المراسل غير موجود");
      }
      const reporterData = await reporterResponse.json();
      setReporter(reporterData.data); // تغيير من reporterData.reporter إلى reporterData.data

      // جلب الإحصائيات
      const statsResponse = await fetch(`/api/reporters/${slug}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // جلب المقالات
      fetchArticles();
    } catch (error: any) {
      console.error("خطأ في جلب بيانات المراسل:", error);
      toast.error("حدث خطأ في تحميل بيانات المراسل");
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async (
    search = "",
    category = "all",
    tab = "recent"
  ) => {
    try {
      setArticlesLoading(true);
      const params = new URLSearchParams({
        search,
        category,
        sort: tab === "popular" ? "views" : "date",
        limit: "20",
      });

      const response = await fetch(`/api/reporters/${slug}/articles?${params}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
      }
    } catch (error) {
      console.error("خطأ في جلب المقالات:", error);
    } finally {
      setArticlesLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchArticles(searchTerm, categoryFilter, tab);
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    fetchArticles(search, categoryFilter, activeTab);
  };

  // مكون AI Performance Score
  const AIScoreComponent = () => (
    <div
      className={cn(
        "rounded-3xl p-6 shadow-xl border backdrop-blur-sm transition-all duration-500",
        darkMode
          ? "bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-blue-900/20 border-purple-700/30"
          : "bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-purple-200"
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-3 rounded-2xl",
              darkMode ? "bg-purple-800/30" : "bg-purple-100"
            )}
          >
            <BrainCircuit className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3
              className={cn(
                "text-xl font-bold",
                darkMode ? "text-white" : "text-gray-900"
              )}
            >
              AI Performance Score
            </h3>
            <p
              className={cn(
                "text-sm",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              تقييم الأداء بالذكاء الاصطناعي
            </p>
          </div>
        </div>

        <div className="text-center">
          <div
            className={cn(
              "text-4xl font-bold mb-1",
              aiScore.trend === "rising"
                ? "text-green-500"
                : aiScore.trend === "declining"
                ? "text-red-500"
                : "text-blue-500"
            )}
          >
            {aiScore.overall}
          </div>
          <div className="flex items-center gap-1">
            {aiScore.trend === "rising" ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : aiScore.trend === "declining" ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : (
              <Activity className="w-4 h-4 text-blue-500" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              {aiScore.trend === "rising"
                ? "صاعد"
                : aiScore.trend === "declining"
                ? "هابط"
                : "مستقر"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "جودة المحتوى",
            value: aiScore.quality,
            icon: Star,
            color: "yellow",
          },
          {
            label: "التفاعل",
            value: aiScore.engagement,
            icon: Heart,
            color: "red",
          },
          {
            label: "الاستمرارية",
            value: aiScore.consistency,
            icon: Clock,
            color: "blue",
          },
          {
            label: "التأثير",
            value: aiScore.impact,
            icon: Flame,
            color: "orange",
          },
        ].map((metric, idx) => (
          <div
            key={idx}
            className={cn(
              "p-4 rounded-2xl border transition-all hover:scale-105",
              darkMode
                ? "bg-slate-800/50 border-slate-700 hover:bg-slate-800/70"
                : "bg-white/80 border-gray-200 hover:bg-white"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`w-5 h-5 text-${metric.color}-500`} />
              <span
                className={cn(
                  "text-2xl font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}
              >
                {metric.value}
              </span>
            </div>
            <div
              className={cn(
                "text-xs font-medium",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              {metric.label}
            </div>
            <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-400 transition-all duration-700`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // مكون Predictive Analytics
  const PredictiveAnalyticsComponent = () => (
    <div
      className={cn(
        "rounded-3xl p-6 shadow-xl border backdrop-blur-sm",
        darkMode
          ? "bg-gradient-to-br from-emerald-900/20 via-teal-900/20 to-cyan-900/20 border-emerald-700/30"
          : "bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-emerald-200"
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className={cn(
            "p-3 rounded-2xl",
            darkMode ? "bg-emerald-800/30" : "bg-emerald-100"
          )}
        >
          <LineChart className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h3
            className={cn(
              "text-xl font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}
          >
            التحليلات التنبؤية
          </h3>
          <p
            className={cn(
              "text-sm",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            توقعات مدعومة بالذكاء الاصطناعي
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div
          className={cn(
            "p-4 rounded-2xl",
            darkMode ? "bg-slate-800/50" : "bg-white/80"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={cn(
                "text-sm font-medium",
                darkMode ? "text-gray-300" : "text-gray-700"
              )}
            >
              المشاهدات المتوقعة الشهر القادم
            </span>
            <span className="text-2xl font-bold text-emerald-500">
              {predictiveAnalytics.nextMonthViews.toLocaleString("ar-SA")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-500">
              +{predictiveAnalytics.growthRate}%
            </span>
          </div>
        </div>

        <div
          className={cn(
            "p-4 rounded-2xl",
            darkMode ? "bg-slate-800/50" : "bg-white/80"
          )}
        >
          <h4
            className={cn(
              "text-sm font-medium mb-3",
              darkMode ? "text-gray-300" : "text-gray-700"
            )}
          >
            أفضل أوقات النشر
          </h4>
          <div className="flex flex-wrap gap-2">
            {predictiveAnalytics.peakHours.map((hour, idx) => (
              <span
                key={idx}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  darkMode
                    ? "bg-emerald-800/30 text-emerald-300 border border-emerald-700/50"
                    : "bg-emerald-100 text-emerald-700"
                )}
              >
                {hour}
              </span>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "p-4 rounded-2xl",
            darkMode ? "bg-slate-800/50" : "bg-white/80"
          )}
        >
          <h4
            className={cn(
              "text-sm font-medium mb-3",
              darkMode ? "text-gray-300" : "text-gray-700"
            )}
          >
            المواضيع الموصى بها
          </h4>
          <div className="space-y-2">
            {predictiveAnalytics.bestTopics.map((topic, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  {topic}
                </span>
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-xs font-medium text-orange-500">
                    رائج
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // مكون Sentiment Analysis
  const SentimentAnalysisComponent = () => (
    <div
      className={cn(
        "rounded-3xl p-6 shadow-xl border backdrop-blur-sm",
        darkMode
          ? "bg-gradient-to-br from-rose-900/20 via-pink-900/20 to-purple-900/20 border-rose-700/30"
          : "bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 border-rose-200"
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className={cn(
            "p-3 rounded-2xl",
            darkMode ? "bg-rose-800/30" : "bg-rose-100"
          )}
        >
          <MessageSquare className="w-6 h-6 text-rose-600" />
        </div>
        <div>
          <h3
            className={cn(
              "text-xl font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}
          >
            تحليل المشاعر
          </h3>
          <p
            className={cn(
              "text-sm",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            تحليل ردود فعل القراء بالذكاء الاصطناعي
          </p>
        </div>
      </div>

      <div className="relative h-40 mb-4">
        {/* Circular Progress Rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="60"
              strokeWidth="8"
              fill="none"
              className="stroke-gray-200 dark:stroke-gray-700"
            />
            <circle
              cx="64"
              cy="64"
              r="60"
              strokeWidth="8"
              fill="none"
              className="stroke-green-500 transition-all duration-700"
              strokeDasharray={`${sentimentAnalysis.positive * 3.77} 377`}
              strokeDashoffset="0"
            />
          </svg>
          <div className="absolute text-center">
            <div className="text-3xl font-bold text-green-500">
              {sentimentAnalysis.positive}%
            </div>
            <div
              className={cn(
                "text-xs",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              إيجابي
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div
          className={cn(
            "text-center p-3 rounded-xl",
            darkMode ? "bg-slate-800/50" : "bg-white/80"
          )}
        >
          <div className="text-xl font-bold text-green-500">
            {sentimentAnalysis.positive}%
          </div>
          <div
            className={cn(
              "text-xs",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            إيجابي
          </div>
        </div>
        <div
          className={cn(
            "text-center p-3 rounded-xl",
            darkMode ? "bg-slate-800/50" : "bg-white/80"
          )}
        >
          <div className="text-xl font-bold text-blue-500">
            {sentimentAnalysis.neutral}%
          </div>
          <div
            className={cn(
              "text-xs",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            محايد
          </div>
        </div>
        <div
          className={cn(
            "text-center p-3 rounded-xl",
            darkMode ? "bg-slate-800/50" : "bg-white/80"
          )}
        >
          <div className="text-xl font-bold text-red-500">
            {sentimentAnalysis.negative}%
          </div>
          <div
            className={cn(
              "text-xs",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            سلبي
          </div>
        </div>
      </div>
    </div>
  );

  // مكون Trending Topics Radar
  const TrendingTopicsRadarComponent = () => (
    <div
      className={cn(
        "rounded-3xl p-6 shadow-xl border backdrop-blur-sm",
        darkMode
          ? "bg-gradient-to-br from-orange-900/20 via-amber-900/20 to-yellow-900/20 border-orange-700/30"
          : "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-orange-200"
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className={cn(
            "p-3 rounded-2xl",
            darkMode ? "bg-orange-800/30" : "bg-orange-100"
          )}
        >
          <Radar className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3
            className={cn(
              "text-xl font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}
          >
            رادار المواضيع الرائجة
          </h3>
          <p
            className={cn(
              "text-sm",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            اكتشف الفرص المستقبلية
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {trendingTopics.map((topic, idx) => (
          <div
            key={idx}
            className={cn(
              "p-4 rounded-2xl border transition-all hover:scale-[1.02]",
              darkMode
                ? "bg-slate-800/50 border-slate-700 hover:bg-slate-800/70"
                : "bg-white/80 border-gray-200 hover:bg-white"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    topic.competition === "high"
                      ? "bg-red-500"
                      : topic.competition === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  )}
                />
                <h4
                  className={cn(
                    "font-semibold",
                    darkMode ? "text-white" : "text-gray-900"
                  )}
                >
                  {topic.topic}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">
                  +{topic.growth}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div
                  className={cn(
                    "text-xs mb-1",
                    darkMode ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  الصلة
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                    style={{ width: `${topic.relevance}%` }}
                  />
                </div>
              </div>
              <div>
                <div
                  className={cn(
                    "text-xs mb-1",
                    darkMode ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  المنافسة:{" "}
                  {topic.competition === "high"
                    ? "عالية"
                    : topic.competition === "medium"
                    ? "متوسطة"
                    : "منخفضة"}
                </div>
                <div
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium text-center",
                    topic.competition === "high"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      : topic.competition === "medium"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  )}
                >
                  {topic.competition === "high"
                    ? "🔴"
                    : topic.competition === "medium"
                    ? "🟡"
                    : "🟢"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // مكون AI Recommendations
  const AIRecommendationsComponent = () => (
    <div
      className={cn(
        "rounded-3xl p-6 shadow-xl border backdrop-blur-sm",
        darkMode
          ? "bg-gradient-to-br from-indigo-900/20 via-blue-900/20 to-purple-900/20 border-indigo-700/30"
          : "bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 border-indigo-200"
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className={cn(
            "p-3 rounded-2xl",
            darkMode ? "bg-indigo-800/30" : "bg-indigo-100"
          )}
        >
          <Lightbulb className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h3
            className={cn(
              "text-xl font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}
          >
            توصيات ذكية
          </h3>
          <p
            className={cn(
              "text-sm",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            اقتراحات مخصصة بناءً على الأداء
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          {
            icon: Wand2,
            title: "حسّن وقت النشر",
            description: "انشر في الساعة 9:00 صباحاً للوصول لأكبر جمهور",
            impact: "+35% مشاهدات",
            priority: "high",
          },
          {
            icon: Hash,
            title: "استخدم هاشتاقات رائجة",
            description: "#الذكاء_الاصطناعي و #رؤية_2030 يحققان تفاعلاً عالياً",
            impact: "+28% تفاعل",
            priority: "medium",
          },
          {
            icon: Target,
            title: "ركز على المحتوى المتخصص",
            description: "مقالاتك عن التقنية تحقق نتائج أفضل بـ 45%",
            impact: "+45% قراءة",
            priority: "high",
          },
          {
            icon: Users,
            title: "تفاعل مع القراء",
            description: "الرد على التعليقات يزيد الولاء بنسبة 60%",
            impact: "+60% ولاء",
            priority: "medium",
          },
        ].map((rec, idx) => (
          <div
            key={idx}
            className={cn(
              "p-4 rounded-2xl border transition-all hover:scale-[1.02]",
              darkMode
                ? "bg-slate-800/50 border-slate-700 hover:bg-slate-800/70"
                : "bg-white/80 border-gray-200 hover:bg-white"
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "p-2 rounded-xl flex-shrink-0",
                  rec.priority === "high"
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-blue-100 dark:bg-blue-900/30"
                )}
              >
                <rec.icon
                  className={cn(
                    "w-5 h-5",
                    rec.priority === "high" ? "text-red-600" : "text-blue-600"
                  )}
                />
              </div>
              <div className="flex-1">
                <h4
                  className={cn(
                    "font-semibold mb-1",
                    darkMode ? "text-white" : "text-gray-900"
                  )}
                >
                  {rec.title}
                </h4>
                <p
                  className={cn(
                    "text-sm mb-2",
                    darkMode ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  {rec.description}
                </p>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-green-500" />
                  <span className="text-xs font-medium text-green-500">
                    {rec.impact}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // مكون الكلمات المفتاحية الذكية
  const SmartTagsSection = ({
    slug,
    darkMode,
  }: {
    slug: string;
    darkMode: boolean;
  }) => {
    const [smartTags, setSmartTags] = useState<
      { term: string; count: number }[]
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchSmartTags = async () => {
        try {
          const response = await fetch(`/api/reporters/${slug}/smart-tags`);
          const data = await response.json();

          if (data.success) {
            setSmartTags(data.tags || []);
          } else {
            console.log("لا توجد كلمات مفتاحية");
          }
        } catch (error) {
          console.error("خطأ في جلب الكلمات المفتاحية:", error);
        } finally {
          setLoading(false);
        }
      };

      if (slug) {
        fetchSmartTags();
      }
    }, [slug]);

    if (loading) {
      return (
        <section className="mb-10">
          <div
            className={`rounded-2xl shadow-sm border p-6 ${
              darkMode
                ? "bg-slate-800 border-slate-600/50"
                : "bg-gray-100 border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain
                className={`w-5 h-5 ${
                  darkMode ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <h2
                className={`text-lg font-semibold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                كلمات مفتاحية ذكية
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium animate-pulse ${
                    darkMode
                      ? "bg-slate-700 text-slate-300"
                      : "bg-gray-300 text-gray-300"
                  }`}
                >
                  تحميل...
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (smartTags.length === 0) {
      return null; // إخفاء القسم إذا لم توجد كلمات مفتاحية
    }

    return (
      <section className="mb-10">
        <div
          className={`rounded-2xl shadow-sm border p-6 ${
            darkMode
              ? "bg-slate-800 border-slate-600/50"
              : "bg-gray-100 border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain
              className={`w-5 h-5 ${
                darkMode ? "text-blue-400" : "text-blue-600"
              }`}
            />
            <h2
              className={`text-lg font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              كلمات مفتاحية ذكية
            </h2>
            <span
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              من مقالات المراسل
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {smartTags.map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                  darkMode
                    ? "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
                title={`استُخدمت ${tag.count} مرة`}
              >
                {tag.term}
                <span
                  className={`ml-1 text-xs ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {tag.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // مكون AI Activity Timeline
  const AIActivityTimelineComponent = () => (
    <div
      className={cn(
        "rounded-3xl p-6 shadow-xl border backdrop-blur-sm",
        darkMode
          ? "bg-gradient-to-br from-cyan-900/20 via-teal-900/20 to-green-900/20 border-cyan-700/30"
          : "bg-gradient-to-br from-cyan-50 via-teal-50 to-green-50 border-cyan-200"
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className={cn(
            "p-3 rounded-2xl",
            darkMode ? "bg-cyan-800/30" : "bg-cyan-100"
          )}
        >
          <Activity className="w-6 h-6 text-cyan-600" />
        </div>
        <div>
          <h3
            className={cn(
              "text-xl font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}
          >
            خط زمني ذكي للنشاط
          </h3>
          <p
            className={cn(
              "text-sm",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            تحليل AI لأنماط النشاط
          </p>
        </div>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div
          className={cn(
            "absolute right-5 top-0 bottom-0 w-0.5",
            darkMode ? "bg-cyan-700/30" : "bg-cyan-300"
          )}
        />

        <div className="space-y-6">
          {[
            {
              time: "اليوم - 9:30 ص",
              title: "مقال رائج 🔥",
              desc: "حقق 15,000 مشاهدة في أول ساعة",
              type: "success",
              icon: TrendingUp,
            },
            {
              time: "أمس - 2:15 م",
              title: "تفاعل قياسي",
              desc: "2,500 إعجاب و 890 مشاركة",
              type: "engagement",
              icon: Heart,
            },
            {
              time: "قبل يومين",
              title: "إنجاز جديد 🏆",
              desc: "تجاوز مليون مشاهدة إجمالية",
              type: "milestone",
              icon: Trophy,
            },
            {
              time: "هذا الأسبوع",
              title: "توصية AI",
              desc: "كتابة عن الذكاء الاصطناعي تحقق +45% قراءة",
              type: "ai",
              icon: Brain,
            },
          ].map((event, idx) => (
            <div key={idx} className="relative flex gap-4 group">
              {/* Timeline Node */}
              <div
                className={cn(
                  "absolute right-2.5 w-5 h-5 rounded-full ring-4 transition-all group-hover:scale-125",
                  event.type === "success"
                    ? "bg-green-500 ring-green-200 dark:ring-green-800"
                    : event.type === "engagement"
                    ? "bg-red-500 ring-red-200 dark:ring-red-800"
                    : event.type === "milestone"
                    ? "bg-purple-500 ring-purple-200 dark:ring-purple-800"
                    : "bg-blue-500 ring-blue-200 dark:ring-blue-800"
                )}
              />

              <div
                className={cn(
                  "flex-1 mr-10 p-4 rounded-2xl border transition-all hover:scale-[1.02]",
                  darkMode
                    ? "bg-slate-800/50 border-slate-700 hover:bg-slate-800/70"
                    : "bg-white/80 border-gray-200 hover:bg-white"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}
                  >
                    {event.time}
                  </span>
                  <event.icon
                    className={cn(
                      "w-4 h-4",
                      event.type === "success"
                        ? "text-green-500"
                        : event.type === "engagement"
                        ? "text-red-500"
                        : event.type === "milestone"
                        ? "text-purple-500"
                        : "text-blue-500"
                    )}
                  />
                </div>
                <h4
                  className={cn(
                    "font-semibold mb-1",
                    darkMode ? "text-white" : "text-gray-900"
                  )}
                >
                  {event.title}
                </h4>
                <p
                  className={cn(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  {event.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          darkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div
              className={`rounded-3xl p-8 mb-8 ${
                darkMode ? "bg-gray-800/50" : "bg-white/80"
              } backdrop-blur-sm`}
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-1/3"></div>
                  <div className="h-6 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-1/4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!reporter) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
        }`}
      >
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h2
            className={`text-3xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            المراسل غير موجود
          </h2>
          <p
            className={`text-xl mb-8 ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            لم نتمكن من العثور على هذا المراسل
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* المحتوى الرئيسي مع مسافة علوية كافية */}
      <main className="pt-16 md:pt-20 pb-0">
        {/* Container محسن للعرض */}
        <div className="mx-auto px-4 md:px-6 max-w-7xl">
          {/* Hero Card - بارز */}
          <section className="py-10 bg-transparent">
            <div
              className={`rounded-2xl shadow-lg border p-8 ${
                darkMode
                  ? "bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600/50"
                  : "bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200"
              }`}
            >
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 reporter-hero-mobile">
                {/* صورة شخصية دائرية محسّنة للمحمول */}
                <div className="relative">
                  <div className="reporter-avatar-container reporter-avatar-container-enhanced rounded-full overflow-hidden reporter-avatar-ring reporter-avatar-shadow">
                    {reporter.avatar_url ? (
                      <div className="reporter-avatar-inner">
                        <CloudImage
                          src={reporter.avatar_url}
                          alt={reporter.full_name}
                          width={160}
                          height={160}
                          className="reporter-avatar-image reporter-avatar-smart-crop reporter-avatar-enhance"
                          fallbackType="author"
                          priority={true}
                          sizes="(max-width: 640px) 100px, (max-width: 768px) 110px, (max-width: 1024px) 128px, 160px"
                        />
                      </div>
                    ) : (
                      // استخدام تدرج مع الأحرف الأولى كـ fallback محسن
                      <div className="reporter-avatar-fallback w-full h-full">
                        <span>
                          {reporter.full_name
                            .split(" ")
                            .map((word) => word.charAt(0))
                            .slice(0, 2)
                            .join("")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* شارات أسفل الصورة بدلاً من التراكب */}
                  <div className="mt-3 flex items-center justify-center lg:justify-start gap-2">
                    {reporter.is_verified && (
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full shadow-md ${
                          darkMode
                            ? "bg-emerald-600 border border-emerald-500/50"
                            : "bg-emerald-500 border border-emerald-400/50"
                        }`}
                      >
                        {getVerificationIcon(reporter.verification_badge)}
                        <span className="text-white font-bold text-xs">
                          {getVerificationText(reporter.verification_badge)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full shadow-md ${
                        darkMode
                          ? "bg-slate-700 border border-slate-600"
                          : "bg-gray-100 border border-gray-300"
                      }`}
                    >
                      <BrainCircuit className={`w-3 h-3 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                      <span className={`${darkMode ? 'text-slate-200' : 'text-gray-800'} font-bold text-xs`}>
                        AI 2.0
                      </span>
                    </div>
                  </div>
                </div>

                {/* معلومات أساسية محسّنة للمحمول */}
                <div className="flex-1 text-center lg:text-right reporter-info-mobile">
                  <h1
                    className={`text-2xl md:text-3xl font-medium tracking-tight leading-snug mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {reporter.full_name}
                  </h1>
                  {reporter.title && (
                    <p
                      className={`text-base md:text-lg font-medium tracking-tight mb-3 ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      {reporter.title}
                    </p>
                  )}

                  {/* إحصائيات سريعة */}
                  {stats && (
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <FileText
                          className={`w-4 h-4 ${
                            darkMode ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {formatDashboardStat(stats.totalArticles)} مقال
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye
                          className={`w-4 h-4 ${
                            darkMode ? "text-green-400" : "text-green-600"
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {formatViewsCount(stats.totalViews)} مشاهدة
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart
                          className={`w-4 h-4 ${
                            darkMode ? "text-red-400" : "text-red-600"
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {formatLikesCount(stats.totalLikes)} إعجاب
                        </span>
                      </div>
                    </div>
                  )}

                  {/* أزرار التفاعل - محسنة للجوال */}
                  <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
                    {/* زر تواصل مع المراسل */}
                    {reporter.email_public && (
                      <a
                        href={`mailto:${reporter.email_public}`}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full font-medium transition-all hover:scale-105 border ${
                          darkMode
                            ? "border-slate-600 text-slate-200 hover:bg-slate-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">تواصل مع المراسل</span>
                      </a>
                    )}

                    {/* زر مشاركة البروفايل */}
                    <button
                      onClick={async () => {
                        const shareData = {
                          title: `${reporter.full_name} - مراسل في صحيفة سبق`,
                          text: `تعرف على ${reporter.full_name} ${
                            reporter.title ? "- " + reporter.title : ""
                          }`,
                          url: window.location.href,
                        };

                        if (navigator.share) {
                          try {
                            await navigator.share(shareData);
                          } catch (error) {
                            console.log("تم إلغاء المشاركة");
                          }
                        } else {
                          // fallback للمتصفحات التي لا تدعم Web Share API
                          await navigator.clipboard.writeText(
                            window.location.href
                          );
                          toast.success("تم نسخ الرابط");
                        }
                      }}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full font-medium transition-all hover:scale-105 border ${
                        darkMode
                          ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">مشاركة البروفايل</span>
                    </button>
                  </div>
                </div>

                {/* AI Performance Gauge - مخفي في الجوال */}
                <div className="hidden xl:block">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        strokeWidth="8"
                        fill="none"
                        className="stroke-gray-200 dark:stroke-gray-700"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        strokeWidth="8"
                        fill="none"
                        className="stroke-gradient transition-all duration-1000"
                        strokeDasharray={`${aiScore.overall * 3.52} 352`}
                        strokeLinecap="round"
                        style={{
                          stroke: `url(#gradient-${aiScore.overall})`,
                          filter:
                            "drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))",
                        }}
                      />
                      <defs>
                        <linearGradient
                          id={`gradient-${aiScore.overall}`}
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="50%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {aiScore.overall}
                      </div>
                      <div
                        className={cn(
                          "text-xs font-medium",
                          darkMode ? "text-gray-400" : "text-gray-600"
                        )}
                      >
                        AI Score
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* نبذة تحريرية */}
          {reporter.bio && (
            <section className="mb-10">
              <div
                className={`rounded-2xl shadow-sm border p-6 ${
                  darkMode
                    ? "bg-slate-800 border-slate-600/50"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <User
                    className={`w-5 h-5 ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                  <h2
                    className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    نبذة تحريرية
                  </h2>
                </div>
                <div
                  className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  <p className="line-clamp-2 leading-relaxed">{reporter.bio}</p>
                  <button
                    className={`mt-2 text-sm font-medium hover:underline ${
                      darkMode
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-blue-600 hover:text-blue-500"
                    }`}
                  >
                    عرض المزيد
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* إحصائيات سريعة في بطاقات منفصلة */}
          {stats && (
            <section className="mb-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {/* عدد المقالات */}
                <div
                  className={`rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow ${
                    darkMode
                      ? "bg-slate-800 border-slate-600/50"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      المقالات
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {formatDashboardStat(stats.totalArticles)}
                  </div>
                  <div
                    className={`text-xs ${
                      darkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {stats.thisMonthArticles} هذا الشهر
                  </div>
                </div>

                {/* عدد المشاهدات */}
                <div
                  className={`rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow ${
                    darkMode
                      ? "bg-slate-800 border-slate-600/50"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-green-600" />
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      المشاهدات
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {formatViewsCount(stats.totalViews)}
                  </div>
                  <div
                    className={`text-xs ${
                      darkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    إجمالي القراءات
                  </div>
                </div>

                {/* التفاعل */}
                <div
                  className={`rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow ${
                    darkMode
                      ? "bg-slate-800 border-slate-600/50"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      التفاعل
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {stats.totalLikes + stats.totalShares}
                  </div>
                  <div
                    className={`text-xs ${
                      darkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    إعجابات ومشاركات
                  </div>
                </div>

                {/* متوسط الأداء */}
                <div
                  className={`rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow ${
                    darkMode
                      ? "bg-slate-800 border-slate-600/50"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      الأداء
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {Math.round(stats.engagementRate)}%
                  </div>
                  <div
                    className={`text-xs ${
                      darkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    معدل التفاعل
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* AI Insights Section - جديد */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  "p-3 rounded-2xl",
                  darkMode ? "bg-purple-800/30" : "bg-purple-100"
                )}
              >
                <BrainCircuit className="w-6 h-6 text-purple-600" />
              </div>
              <h2
                className={cn(
                  "text-2xl font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}
              >
                رؤى الذكاء الاصطناعي
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <AIScoreComponent />
              <PredictiveAnalyticsComponent />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SentimentAnalysisComponent />
              <TrendingTopicsRadarComponent />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <AIRecommendationsComponent />
              <AIActivityTimelineComponent />
            </div>
          </section>

          {/* كلمات مفتاحية ذكية - من المقالات الحقيقية */}
          <SmartTagsSection slug={slug} darkMode={darkMode} />

          {/* تبويب المحتوى المنشور */}
          <section className="mb-12">
            <div
              className={`rounded-2xl shadow-md border ${
                darkMode
                  ? "bg-slate-800 border-slate-600/50"
                  : "bg-white border-slate-200"
              }`}
            >
              {/* Tabs Header */}
              <div className="border-b border-gray-200 dark:border-slate-600">
                <div className="flex flex-wrap">
                  {[
                    { id: "recent", label: "الأحدث", icon: Clock },
                    { id: "popular", label: "الأكثر قراءة", icon: Eye },
                    {
                      id: "trending",
                      label: "الأكثر تفاعلاً",
                      icon: TrendingUp,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? `border-blue-600 ${
                              darkMode ? "text-blue-400" : "text-blue-600"
                            }`
                          : `border-transparent ${
                              darkMode
                                ? "text-gray-400 hover:text-gray-300"
                                : "text-gray-600 hover:text-gray-700"
                            }`
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Articles Content */}
              <div className="p-2 sm:p-4">
                {articles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {articles.map((article) => (
                      <Link
                        key={article.id}
                        href={getArticleLink(article)}
                        className={`block p-4 rounded-xl border transition-all hover:shadow-md ${
                          darkMode
                            ? "bg-slate-700 border-slate-600 hover:bg-slate-600/50"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* صورة مصغرة */}
                          <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <CloudImage
                              src={article.featured_image || article.image_url}
                              alt={article.title}
                              width={80}
                              height={64}
                              className="w-full h-full object-cover"
                              fallbackType="article"
                            />
                          </div>

                          {/* محتوى */}
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-semibold line-clamp-2 mb-2 ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {article.title}
                            </h3>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {formatDateGregorian(article.published_at)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>
                                  {article.views > 1000
                                    ? `${(article.views / 1000).toFixed(1)}ك`
                                    : article.views}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{article.reading_time} د</span>
                              </div>
                            </div>
                          </div>

                          {/* إزالة زر اقرأ */}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText
                      className={`w-12 h-12 mx-auto mb-3 ${
                        darkMode ? "text-gray-600" : "text-gray-400"
                      }`}
                    />
                    <h3
                      className={`text-lg font-medium mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      لا توجد مقالات
                    </h3>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      لم يقم هذا المراسل بنشر أي مقالات بعد
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
          {/* معلومات إضافية */}
          <section className="mb-16">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* التخصصات */}
              {reporter.specializations &&
                reporter.specializations.length > 0 && (
                  <div
                    className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
                      darkMode
                        ? "bg-slate-800 border-slate-600/50"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <h3
                      className={`text-lg font-semibold mb-3 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      التخصصات
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {reporter.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* نطاق التغطية */}
              {reporter.coverage_areas &&
                reporter.coverage_areas.length > 0 && (
                  <div
                    className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
                      darkMode
                        ? "bg-slate-800 border-slate-600/50"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <h3
                      className={`text-lg font-semibold mb-3 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      نطاق التغطية
                    </h3>
                    <div className="space-y-2">
                      {reporter.coverage_areas.map((area, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span
                            className={`text-sm ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {area}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* روابط التواصل */}
              {(reporter.twitter_url ||
                reporter.linkedin_url ||
                reporter.website_url ||
                reporter.email_public) && (
                <div
                  className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
                    darkMode
                      ? "bg-slate-800 border-slate-600/50"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-3 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    تواصل
                  </h3>
                  <div className="space-y-3">
                    {reporter.twitter_url && (
                      <a
                        href={reporter.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                        <span className="text-sm font-medium">تويتر</span>
                        <ExternalLink className="w-3 h-3 mr-auto" />
                      </a>
                    )}

                    {reporter.linkedin_url && (
                      <a
                        href={reporter.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span className="text-sm font-medium">لينكد إن</span>
                        <ExternalLink className="w-3 h-3 mr-auto" />
                      </a>
                    )}

                    {reporter.website_url && (
                      <a
                        href={reporter.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          الموقع الشخصي
                        </span>
                        <ExternalLink className="w-3 h-3 mr-auto" />
                      </a>
                    )}

                    {reporter.email_public && (
                      <a
                        href={`mailto:${reporter.email_public}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          البريد الإلكتروني
                        </span>
                        <ExternalLink className="w-3 h-3 mr-auto" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer الرسمي */}
        <FooterOfficial />
      </main>
    </div>
  );
};

export default ReporterProfilePage;
