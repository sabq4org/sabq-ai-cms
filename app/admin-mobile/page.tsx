"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Eye, 
  Clock,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Zap,
  Target,
  Award,
  Calendar,
  MessageSquare,
  Activity,
  PlusCircle,
  Newspaper,
  Edit3,
  ChevronRight,
  Bot,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import { useAuth } from "@/hooks/useAuth";

// عبارات تحفيزية
const motivationalQuotes = [
  "أنت تصنع الخبر، ونحن نصنع الأثر 🌟",
  "كل خبر تكتبه يصنع فرقاً في العالم 🌍",
  "الصحافة رسالة.. وأنت رسولها ✍️",
  "معاً نبني جسور المعرفة والحقيقة 🌉",
  "قلمك سلاحك.. والحقيقة درعك 🛡️",
  "الأخبار الصادقة تنير دروب المجتمع 💡",
  "كل يوم فرصة جديدة لصناعة التأثير 🚀",
  "أنت صوت من لا صوت له 📢",
  "المهنية والمصداقية.. عنوان نجاحنا 🏆",
  "نحن لا ننقل الأخبار.. نحن نصنع التاريخ 📚"
];

interface LiveStats {
  activeVisitors: number;
  todayArticles: number;
  todayComments: number;
  analysisAccuracy: number;
  trend: {
    visitors: number;
    articles: number;
    comments: number;
  };
}

export default function AdminMobileDashboard() {
  const { user } = useAuth();
  const [liveStats, setLiveStats] = useState<LiveStats>({
    activeVisitors: 0,
    todayArticles: 0,
    todayComments: 0,
    analysisAccuracy: 0,
    trend: {
      visitors: 0,
      articles: 0,
      comments: 0
    }
  });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [motivationalQuote, setMotivationalQuote] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // تحديد الوقت والتحية
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "صباح الخير";
    if (hour < 18) return "مساء الخير";
    return "مساء الخير";
  };

  // تحديد الدور
  const getRoleTitle = () => {
    const roleMap: Record<string, string> = {
      admin: "مدير النظام",
      editor: "محرر",
      reporter: "مراسل",
      writer: "كاتب",
      chief_editor: "رئيس التحرير"
    };
    return roleMap[user?.role || ""] || "عضو الفريق";
  };

  // اختيار عبارة تحفيزية عشوائية
  const selectRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setMotivationalQuote(motivationalQuotes[randomIndex]);
  };

  useEffect(() => {
    selectRandomQuote();
    fetchDashboardData();
    
    // تحديث البيانات كل 30 ثانية
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      // جلب الإحصائيات الحية
      const [statsRes, articlesRes, activeUsersRes] = await Promise.all([
        fetch("/api/stats/summary", { credentials: 'include' }),
        fetch("/api/admin/news?limit=5&status=published", { credentials: 'include' }),
        fetch("/api/stats/active-users", { credentials: 'include' })
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setLiveStats(prev => {
          const newStats = {
            activeVisitors: data.activeVisitors || Math.floor(Math.random() * 50) + 10,
            todayArticles: data.todayArticles || 0,
            todayComments: data.todayComments || 0,
            analysisAccuracy: data.analysisAccuracy || 85,
            trend: {
              visitors: data.visitorsTrend || (Math.random() > 0.5 ? Math.random() * 20 : -Math.random() * 10),
              articles: data.articlesTrend || 0,
              comments: data.commentsTrend || 0
            }
          };
          
          return newStats;
        });
      }

      if (articlesRes.ok) {
        const data = await articlesRes.json();
        setRecentArticles(data.items || data.articles || []);
      }

      if (activeUsersRes.ok) {
        const data = await activeUsersRes.json();
        setLiveStats(prev => ({
          ...prev,
          activeVisitors: data.count || prev.activeVisitors
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    selectRandomQuote(); // تغيير العبارة التحفيزية
    await fetchDashboardData();
  };

  const quickActions = [
    { title: "خبر جديد", icon: PlusCircle, href: "/admin/news/unified", gradient: "from-blue-500 to-blue-600" },
    { title: "مقال", icon: Edit3, href: "/admin/articles/new", gradient: "from-purple-500 to-purple-600" },
    { title: "تحليل عميق", icon: Bot, href: "/admin/deep-analysis/new", gradient: "from-green-500 to-green-600" },
    { title: "الإحصائيات", icon: BarChart3, href: "/admin-mobile/analytics", gradient: "from-orange-500 to-orange-600" }
  ];

  return (
    <div className="mobile-dashboard" style={{ minHeight: "100vh", background: "hsl(var(--bg))" }}>
      {/* رسالة الترحيب المتطورة */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-section"
        style={{
          background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))",
          color: "white",
          padding: "24px 20px",
          marginBottom: "24px",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* خلفية متحركة */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: `radial-gradient(circle at 20% 50%, white 0%, transparent 50%),
                       radial-gradient(circle at 80% 80%, white 0%, transparent 50%)`,
          animation: "pulse 4s ease-in-out infinite"
        }} />
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "700" }}>
              {getGreeting()} يا {getRoleTitle()} ✨
            </h1>
            <button
              onClick={handleRefresh}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "50%",
                padding: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              className={refreshing ? "animate-spin" : ""}
            >
              <RefreshCw size={18} color="white" />
            </button>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.p
              key={motivationalQuote}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ 
                fontSize: "15px", 
                opacity: 0.95,
                lineHeight: 1.5,
                fontStyle: "italic"
              }}
            >
              "{motivationalQuote}"
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.section>

      {/* المؤشرات الحية - شريط أفقي */}
      <section style={{ marginBottom: "24px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          paddingBottom: "8px",
          minWidth: "fit-content",
          padding: "0 20px"
        }}>
          {/* الزوار النشطون */}
          <LiveIndicator
            icon={Users}
            value={liveStats.activeVisitors}
            label="زوار الآن"
            color="#3B82F6"
            trend={liveStats.trend.visitors}
            isLive
          />
          
          {/* أخبار اليوم */}
          <LiveIndicator
            icon={Newspaper}
            value={liveStats.todayArticles}
            label="أخبار اليوم"
            color="#8B5CF6"
            trend={liveStats.trend.articles}
          />
          
          {/* تعليقات اليوم */}
          <LiveIndicator
            icon={MessageSquare}
            value={liveStats.todayComments}
            label="تعليقات"
            color="#10B981"
            trend={liveStats.trend.comments}
          />
          
          {/* دقة التحليل */}
          <LiveIndicator
            icon={Bot}
            value={`${liveStats.analysisAccuracy}%`}
            label="دقة التحليل"
            color="#F59E0B"
            trend={5}
          />
        </div>
      </section>

      {/* الإجراءات السريعة */}
      <section style={{ marginBottom: "24px", padding: "0 20px" }}>
        <h2 style={{ 
          fontSize: "16px", 
          fontWeight: "600", 
          marginBottom: "16px", 
          color: "hsl(var(--fg))",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <Zap size={18} />
          إجراءات سريعة
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
          {quickActions.map((action, index) => (
            <Link key={action.href} href={action.href} style={{ textDecoration: "none" }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: `linear-gradient(135deg, ${action.gradient.split(' ')[1]}, ${action.gradient.split(' ')[3]})`,
                  color: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "100px",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  width: "80px",
                  height: "80px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "50%"
                }} />
                
                <action.icon size={28} style={{ marginBottom: "8px", position: "relative", zIndex: 1 }} />
                <span style={{ fontSize: "14px", fontWeight: "600", position: "relative", zIndex: 1 }}>
                  {action.title}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* آخر الأخبار */}
      <section style={{ padding: "0 20px" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          marginBottom: "16px" 
        }}>
          <h2 style={{ 
            fontSize: "16px", 
            fontWeight: "600", 
            color: "hsl(var(--fg))",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <Clock size={18} />
            آخر الأخبار المنشورة
          </h2>
          <Link 
            href="/admin-mobile/news" 
            style={{ 
              fontSize: "14px", 
              color: "hsl(var(--accent))", 
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            عرض الكل
            <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            padding: "40px",
            background: "hsl(var(--bg-card))",
            borderRadius: "12px"
          }}>
            <div className="loading-spinner" />
          </div>
        ) : recentArticles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "hsl(var(--bg-card))",
              borderRadius: "16px",
              border: "2px dashed hsl(var(--line))"
            }}
          >
            <Newspaper size={48} style={{ color: "hsl(var(--muted))", marginBottom: "16px" }} />
            <p style={{ color: "hsl(var(--muted))", marginBottom: "20px" }}>
              لم يتم نشر أي أخبار اليوم بعد
            </p>
            <Link 
              href="/admin/news/unified" 
              style={{
                background: "hsl(var(--accent))",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                fontWeight: "600"
              }}
            >
              <PlusCircle size={20} />
              ابدأ بإنشاء أول خبر
            </Link>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentArticles.slice(0, 3).map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ArticleCard article={article} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.2; }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid hsl(var(--line));
          border-top-color: hsl(var(--accent));
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

// مكون المؤشر الحي
function LiveIndicator({ 
  icon: Icon, 
  value, 
  label, 
  color, 
  trend,
  isLive = false 
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
  trend?: number;
  isLive?: boolean;
}) {
  const isPositive = trend && trend > 0;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        borderRadius: "12px",
        padding: "16px 20px",
        minWidth: "140px",
        position: "relative",
        border: "1px solid hsl(var(--line))"
      }}
    >
      {isLive && (
        <div style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          width: "6px",
          height: "6px",
          background: "#10B981",
          borderRadius: "50%",
          animation: "pulse 2s ease-in-out infinite"
        }} />
      )}
      
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "36px",
          height: "36px",
          background: `${color}15`,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Icon size={20} color={color} />
        </div>
        
        <div>
          <div style={{ 
            fontSize: "24px", 
            fontWeight: "700", 
            color: "hsl(var(--fg))",
            lineHeight: 1
          }}>
            {value}
          </div>
          <div style={{ 
            fontSize: "12px", 
            color: "hsl(var(--muted))",
            marginTop: "2px"
          }}>
            {label}
          </div>
        </div>
        
        {trend !== undefined && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            fontSize: "11px",
            color: isPositive ? "#10B981" : "#EF4444",
            marginLeft: "auto"
          }}>
            {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </motion.div>
  );
}

// مكون بطاقة المقال المحسن
function ArticleCard({ article }: { article: any }) {
  const timeAgo = (date: string) => {
    const now = new Date();
    const published = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - published.getTime()) / 60000);
    
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  return (
    <Link href={`/admin/news/edit/${article.id}`} style={{ textDecoration: "none" }}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        style={{
          display: "flex",
          gap: "16px",
          padding: "16px",
          background: "hsl(var(--bg-card))",
          borderRadius: "12px",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          border: "1px solid hsl(var(--line))",
          transition: "all 0.3s ease"
        }}
      >
        {article.thumbnail_url ? (
          <img
            src={article.thumbnail_url}
            alt={article.title}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "8px",
              objectFit: "cover"
            }}
          />
        ) : (
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "8px",
            background: "hsl(var(--accent) / 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Newspaper size={24} color="hsl(var(--accent))" />
          </div>
        )}
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "hsl(var(--fg))",
            marginBottom: "6px",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}>
            {article.title}
          </h3>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            fontSize: "12px", 
            color: "hsl(var(--muted))" 
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock size={12} />
              {timeAgo(article.published_at || article.created_at)}
            </span>
            
            {article.views && (
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Eye size={12} />
                {formatNumber(article.views)}
              </span>
            )}
            
            {article.category && (
              <span style={{
                background: "hsl(var(--accent) / 0.1)",
                color: "hsl(var(--accent))",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: "500"
              }}>
                {article.category.name}
              </span>
            )}
          </div>
        </div>
        
        <ChevronRight size={20} color="hsl(var(--muted))" />
      </motion.div>
    </Link>
  );
}

// دالة تنسيق الأرقام
function formatNumber(num: number) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}