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
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

interface StatData {
  todayArticles: number;
  todayViews: number;
  activeUsers: number;
  publishRate: number;
  weeklyGrowth: number;
  topCategory: string;
}

interface QuickAction {
  title: string;
  icon: React.ElementType;
  href: string;
  color: string;
  count?: number;
}

export default function AdminMobileDashboard() {
  const [stats, setStats] = useState<StatData>({
    todayArticles: 156,
    todayViews: 23456,
    activeUsers: 892,
    publishRate: 87,
    weeklyGrowth: 12.5,
    topCategory: "أخبار محلية"
  });

  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب البيانات
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // جلب الإحصائيات
      const statsRes = await fetch("/api/stats/summary");
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(prev => ({
          ...prev,
          todayArticles: data.todayArticles || prev.todayArticles,
          todayViews: data.totalViews || prev.todayViews
        }));
      }

      // جلب آخر الأخبار
      const articlesRes = await fetch("/api/admin/news?limit=5&status=published");
      if (articlesRes.ok) {
        const data = await articlesRes.json();
        setRecentArticles(data.items || data.articles || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    { title: "خبر جديد", icon: FileText, href: "/admin/news/unified", color: "#3B82F6" },
    { title: "الأخبار", icon: BarChart3, href: "/admin-mobile/news", color: "#8B5CF6", count: stats.todayArticles },
    { title: "المقالات", icon: Users, href: "/admin-mobile/articles", color: "#10B981" },
    { title: "التحليلات", icon: TrendingUp, href: "/admin-mobile/analytics", color: "#F59E0B" },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="mobile-dashboard" style={{ padding: "16px" }}>
      {/* رسالة الترحيب */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="welcome-section"
        style={{
          background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))",
          color: "white",
          padding: "20px",
          borderRadius: "16px",
          marginBottom: "20px"
        }}
      >
        <h1 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
          مرحباً بك في لوحة التحكم 👋
        </h1>
        <p style={{ fontSize: "14px", opacity: 0.9 }}>
          إليك نظرة سريعة على أداء اليوم
        </p>
      </motion.div>

      {/* الإحصائيات الرئيسية - سلايدر */}
      <div style={{ marginBottom: "24px", marginLeft: "-16px", marginRight: "-16px" }}>
        <Swiper
          modules={[FreeMode, Pagination]}
          spaceBetween={12}
          slidesPerView={1.2}
          freeMode={true}
          pagination={{ clickable: true }}
          style={{ padding: "0 16px" }}
        >
          <SwiperSlide>
            <StatCard
              title="أخبار اليوم"
              value={stats.todayArticles}
              icon={FileText}
              trend={+8}
              color="#3B82F6"
            />
          </SwiperSlide>
          <SwiperSlide>
            <StatCard
              title="المشاهدات"
              value={formatNumber(stats.todayViews)}
              icon={Eye}
              trend={+12.5}
              color="#10B981"
            />
          </SwiperSlide>
          <SwiperSlide>
            <StatCard
              title="المستخدمون النشطون"
              value={stats.activeUsers}
              icon={Users}
              trend={-2.3}
              color="#8B5CF6"
            />
          </SwiperSlide>
          <SwiperSlide>
            <StatCard
              title="معدل النشر"
              value={`${stats.publishRate}%`}
              icon={Target}
              trend={+5}
              color="#F59E0B"
            />
          </SwiperSlide>
        </Swiper>
      </div>

      {/* الإجراءات السريعة */}
      <section style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "hsl(var(--fg))" }}>
          إجراءات سريعة
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              style={{ textDecoration: "none" }}
            >
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="quick-action-card"
                style={{
                  background: "hsl(var(--bg-card))",
                  border: "1px solid hsl(var(--line))",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "100px",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <div style={{
                  width: "48px",
                  height: "48px",
                  background: `${action.color}20`,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "8px"
                }}>
                  <action.icon size={24} color={action.color} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "hsl(var(--fg))" }}>
                  {action.title}
                </span>
                {action.count && (
                  <span style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: action.color,
                    color: "white",
                    fontSize: "11px",
                    fontWeight: "600",
                    padding: "2px 8px",
                    borderRadius: "12px"
                  }}>
                    {action.count}
                  </span>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* آخر الأخبار */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "hsl(var(--fg))" }}>
            آخر الأخبار المنشورة
          </h2>
          <Link href="/admin-mobile/news" style={{ fontSize: "14px", color: "hsl(var(--accent))", textDecoration: "none" }}>
            عرض الكل
          </Link>
        </div>

        {loading ? (
          <div className="loading-spinner" />
        ) : recentArticles.length === 0 ? (
          <div className="empty-state" style={{
            textAlign: "center",
            padding: "40px 20px",
            background: "hsl(var(--bg-card))",
            borderRadius: "12px",
            border: "1px solid hsl(var(--line))"
          }}>
            <FileText size={48} style={{ color: "hsl(var(--muted))", marginBottom: "12px" }} />
            <p style={{ color: "hsl(var(--muted))", marginBottom: "16px" }}>لا توجد أخبار منشورة اليوم</p>
            <Link href="/admin/news/unified" className="btn-mobile" style={{
              background: "hsl(var(--accent))",
              color: "white",
              display: "inline-flex"
            }}>
              إنشاء أول خبر
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>

      {/* مخطط الأداء الأسبوعي */}
      <section style={{ marginTop: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "hsl(var(--fg))" }}>
          الأداء الأسبوعي
        </h2>
        <div className="performance-chart" style={{
          background: "hsl(var(--bg-card))",
          border: "1px solid hsl(var(--line))",
          borderRadius: "12px",
          padding: "16px",
          height: "200px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-around"
        }}>
          {[65, 80, 45, 90, 75, 88, 95].map((height, index) => (
            <div
              key={index}
              style={{
                width: "30px",
                height: `${height}%`,
                background: index === 6 ? "hsl(var(--accent))" : "hsl(var(--accent) / 0.3)",
                borderRadius: "4px 4px 0 0",
                transition: "all 0.3s ease"
              }}
            />
          ))}
        </div>
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: "8px",
          fontSize: "11px",
          color: "hsl(var(--muted))"
        }}>
          {["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"].map((day) => (
            <span key={day}>{day.slice(0, 1)}</span>
          ))}
        </div>
      </section>
    </div>
  );
}

// مكون بطاقة الإحصائية
function StatCard({ title, value, icon: Icon, trend, color }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: number;
  color: string;
}) {
  const isPositive = trend > 0;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: "hsl(var(--bg-card))",
        border: "1px solid hsl(var(--line))",
        borderRadius: "16px",
        padding: "20px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          background: `${color}20`,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Icon size={20} color={color} />
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "12px",
          color: isPositive ? "#10B981" : "#EF4444"
        }}>
          {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px", color: "hsl(var(--fg))" }}>
        {value}
      </div>
      <div style={{ fontSize: "13px", color: "hsl(var(--muted))" }}>
        {title}
      </div>
      
      {/* خلفية زخرفية */}
      <div style={{
        position: "absolute",
        bottom: "-20px",
        right: "-20px",
        width: "80px",
        height: "80px",
        background: `${color}10`,
        borderRadius: "50%"
      }} />
    </motion.div>
  );
}

// مكون بطاقة المقال
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
    <Link href={`/news/${article.slug || article.id}`} style={{ textDecoration: "none" }}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="article-mini-card"
        style={{
          display: "flex",
          gap: "12px",
          padding: "12px",
          background: "hsl(var(--bg-card))",
          border: "1px solid hsl(var(--line))",
          borderRadius: "8px",
          alignItems: "center"
        }}
      >
        {article.thumbnail_url && (
          <img
            src={article.thumbnail_url}
            alt={article.title}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "6px",
              objectFit: "cover"
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: "14px",
            fontWeight: "500",
            color: "hsl(var(--fg))",
            marginBottom: "4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}>
            {article.title}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "hsl(var(--muted))" }}>
            <Clock size={12} />
            <span>{timeAgo(article.published_at || article.created_at)}</span>
            {article.views && (
              <>
                <span>•</span>
                <Eye size={12} />
                <span>{formatNumber(article.views)}</span>
              </>
            )}
          </div>
        </div>
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
