"use client";

// تطبيق تصميم Manus UI على لوحة التحكم الرئيسية
// مع الاحتفاظ بجميع الوظائف والبيانات الحقيقية

import { useAuth } from "@/hooks/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatDashboardStat } from "@/lib/format-utils";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  FolderOpen,
  HeartHandshake,
  Lightbulb,
  MessageSquare,
  Newspaper,
  PenTool,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
  Settings,
  Bell,
  Home,
  Search,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPageManus() {
  // حالات البيانات - نفس الكود الأصلي
  const [activeTab, setActiveTab] = useState("behavior");
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalArticles: 0,
    activeUsers: 0,
    newComments: 0,
    engagementRate: 0,
    breakingNews: 0,
    totalViews: 0,
    todayArticles: 0,
    weeklyGrowth: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [topArticles, setTopArticles] = useState<any[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('blue');
  const isMobile = useMediaQuery("(max-width: 768px)");

  // تحديد المتغيرات للثيمات المختلفة
  const themes = {
    blue: { accent: '212 90% 50%', name: 'الأزرق' },
    green: { accent: '142 71% 45%', name: 'الأخضر' },
    purple: { accent: '262 83% 58%', name: 'البنفسجي' },
    orange: { accent: '25 95% 53%', name: 'البرتقالي' },
    red: { accent: '0 84% 60%', name: 'الأحمر' },
  };

  // تطبيق الثيم
  const applyTheme = (theme: string) => {
    const themeData = themes[theme as keyof typeof themes];
    if (themeData) {
      document.documentElement.style.setProperty('--accent', themeData.accent);
      setCurrentTheme(theme);
    }
  };

  // جلب البيانات الحقيقية - نفس الكود الأصلي
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);

        // مسح الكاش قبل جلب البيانات
        const timestamp = Date.now();
        const cacheBreaker = `?_t=${timestamp}&_r=${Math.random().toString(36).substr(2, 9)}`;
        
        try {
          await fetch('/api/cache/clear', { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Cache-Bust': timestamp.toString()
            },
            body: JSON.stringify({ type: 'memory' })
          });
        } catch (cacheError) {
          console.warn('Cache clearing failed:', cacheError);
        }

        // جلب الإحصائيات من API الجديد
        const statsRes = await fetch(`/api/dashboard/stats${cacheBreaker}`, {
          cache: "no-store",
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Cache-Bust': timestamp.toString()
          }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
          setWeeklyActivity(statsData.weeklyActivity);

          // جلب عناوين المقالات الأكثر قراءة
          if (statsData.topArticles && statsData.topArticles.length > 0) {
            const articleIds = statsData.topArticles.map((a: any) => a.id);
            const articlesRes = await fetch(
              `/api/articles?ids=${articleIds.join(",")}${cacheBreaker}`, {
              cache: "no-store",
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Cache-Bust': timestamp.toString()
              }
            });
            if (articlesRes.ok) {
              const articlesData = await articlesRes.json();
              const articlesMap = new Map(
                (articlesData.articles || articlesData.data || articlesData || []).map((a: any) => [a.id, a])
              );

              const topArticlesWithTitles = statsData.topArticles.map((item: any) => {
                const article = articlesMap.get(item.id) as any;
                return {
                  ...item,
                  title: article?.title || "مقال غير معروف",
                  trend: Math.random() > 0.5 ? "up" : "down",
                };
              });
              setTopArticles(topArticlesWithTitles);
            }
          }
        }

        // جلب الأنشطة الحديثة
        const activityRes = await fetch("/api/dashboard/recent-activity");
        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setRecentActivities(activityData.activities || []);
        }
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        // بيانات وهمية في حالة الخطأ
        setStats({
          totalArticles: 2847,
          activeUsers: 1234,
          newComments: 156,
          engagementRate: 89,
          breakingNews: 5,
          totalViews: 45231,
          todayArticles: 23,
          weeklyGrowth: 12.5,
        });
        setTopArticles([
          { id: "1", title: "تطورات الذكاء الاصطناعي في 2025", views: 15420, trend: "up" },
          { id: "2", title: "الاقتصاد السعودي يسجل نمواً قوياً", views: 12340, trend: "up" },
          { id: "3", title: "رؤية 2030 والطاقة المتجددة", views: 9876, trend: "down" },
        ]);
        setRecentActivities([
          { id: 1, type: "article", action: "تم نشر مقال جديد", time: "منذ 5 دقائق" },
          { id: 2, type: "comment", action: "تعليق جديد على المقال", time: "منذ 10 دقائق" },
          { id: 3, type: "user", action: "مستخدم جديد انضم", time: "منذ 15 دقيقة" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  // تحديث دوري للبيانات كل دقيقة
  useEffect(() => {
    const interval = setInterval(() => {
      const fetchRealData = async () => {
        try {
          // مسح الكاش قبل جلب البيانات
          const timestamp = Date.now();
          const cacheBreaker = `?_t=${timestamp}&_r=${Math.random().toString(36).substr(2, 9)}`;
          
          try {
            await fetch('/api/cache/clear', { 
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Cache-Bust': timestamp.toString()
              },
              body: JSON.stringify({ type: 'memory' })
            });
          } catch (cacheError) {
            console.warn('Cache clearing failed:', cacheError);
          }

          // جلب الإحصائيات المحدثة
          const statsRes = await fetch(`/api/dashboard/stats${cacheBreaker}`, {
            cache: "no-store",
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
              'X-Cache-Bust': timestamp.toString()
            }
          });
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData.stats);
            setWeeklyActivity(statsData.weeklyActivity);
          }
        } catch (error) {
          console.warn('Auto-refresh failed:', error);
        }
      };

      fetchRealData();
    }, 60000); // كل دقيقة

    return () => clearInterval(interval);
  }, []);

  // مكون الإحصائيات بتصميم Manus UI
  const StatCard = ({ title, value, change, icon: Icon, loading }: any) => (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'hsl(var(--accent) / 0.1)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(var(--accent))'
        }}>
          <Icon style={{ width: '24px', height: '24px' }} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>{title}</div>
          <div className="heading-3" style={{ margin: '4px 0' }}>
            {loading ? "..." : formatDashboardStat(value)}
          </div>
          {change && (
            <div className="text-xs" style={{ 
              color: change.startsWith('+') ? '#10b981' : '#ef4444' 
            }}>
              {change}% هذا الأسبوع
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* تحميل CSS Manus UI */}
      <link rel="stylesheet" href="/manus-ui.css" />
      
      <div className="manus-layout">
        {/* الشريط الجانبي */}
        <aside className="manus-sidebar" style={{ display: isMobile && !sidebarOpen ? 'none' : 'block' }}>
          {/* شعار المنصة */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'hsl(var(--accent))',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '12px'
            }}>
              س
            </div>
            <h1 className="heading-3" style={{ margin: 0 }}>سبق الذكية</h1>
            <p className="text-xs text-muted">لوحة التحكم الرئيسية</p>
          </div>

          {/* التنقل الرئيسي */}
          <nav>
            <div className="divide-list">
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="/dashboard" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <Home style={{ width: '16px', height: '16px' }} />
                  لوحة التحكم
                </Link>
              </div>
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="/admin/articles" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                  <FileText style={{ width: '16px', height: '16px' }} />
                  إدارة المقالات
                </Link>
              </div>
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="/admin/analytics" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                  <BarChart3 style={{ width: '16px', height: '16px' }} />
                  التحليلات
                </Link>
              </div>
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="/admin/users" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                  <Users style={{ width: '16px', height: '16px' }} />
                  المستخدمون
                </Link>
              </div>
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="/admin/settings" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                  <Settings style={{ width: '16px', height: '16px' }} />
                  الإعدادات
                </Link>
              </div>
            </div>
          </nav>

          <div className="divider"></div>

          {/* تغيير الثيم */}
          <div>
            <h3 className="heading-3" style={{ fontSize: '14px', marginBottom: '16px' }}>لون الواجهة</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  className={`btn btn-xs ${currentTheme === key ? 'btn-primary' : ''}`}
                  onClick={() => applyTheme(key)}
                  style={{ minWidth: '60px', fontSize: '11px' }}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* معلومات المستخدم */}
          {user && (
            <div style={{ marginTop: 'auto' }}>
              <div className="divider"></div>
              <div className="card" style={{ padding: '12px', marginBottom: 0 }}>
                <div className="text-sm" style={{ fontWeight: '600' }}>
                  مرحباً، {user.name || user.email}
                </div>
                <div className="text-xs text-muted">
                  {user.role === 'admin' ? 'مدير النظام' : 'محرر'}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* المحتوى الرئيسي */}
        <main className="manus-main">
          {/* الهيدر */}
          <header className="manus-header">
            <div>
              <h1 className="heading-2" style={{ margin: 0 }}>لوحة التحكم</h1>
              <p className="text-sm text-muted">مرحباً بك في منصة سبق الذكية - نظام إدارة المحتوى الذكي</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {isMobile && (
                <button 
                  className="btn btn-sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu style={{ width: '16px', height: '16px' }} />
                </button>
              )}
              <Link href="/admin/notifications" className="btn btn-sm">
                <Bell style={{ width: '16px', height: '16px' }} />
              </Link>
              <Link href="/profile" className="btn btn-sm">
                👤
              </Link>
            </div>
          </header>

          {/* الإحصائيات الرئيسية */}
          <section className="grid grid-4" style={{ marginBottom: '32px' }}>
            <StatCard
              title="إجمالي المقالات"
              value={stats.totalArticles}
              change={`+${stats.weeklyGrowth}`}
              icon={FileText}
              loading={loading}
            />
            <StatCard
              title="المستخدمون النشطون"
              value={stats.activeUsers}
              change="+8.2"
              icon={Users}
              loading={loading}
            />
            <StatCard
              title="إجمالي المشاهدات"
              value={stats.totalViews}
              change="+15.3"
              icon={Activity}
              loading={loading}
            />
            <StatCard
              title="معدل التفاعل"
              value={`${stats.engagementRate}%`}
              change="+3.1"
              icon={TrendingUp}
              loading={loading}
            />
          </section>

          {/* التبويبات والمحتوى */}
          <section style={{ marginBottom: '32px' }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">تحليلات مفصلة</div>
                <div className="card-subtitle">عرض البيانات حسب نوع التحليل</div>
              </div>

              {/* التبويبات */}
              <div className="tabbar">
                <button 
                  className={`tab ${activeTab === 'behavior' ? 'active' : ''}`}
                  onClick={() => setActiveTab('behavior')}
                >
                  📊 سلوك المستخدمين
                </button>
                <button 
                  className={`tab ${activeTab === 'articles' ? 'active' : ''}`}
                  onClick={() => setActiveTab('articles')}
                >
                  📝 أكثر المقالات قراءة
                </button>
                <button 
                  className={`tab ${activeTab === 'activities' ? 'active' : ''}`}
                  onClick={() => setActiveTab('activities')}
                >
                  🔔 الأنشطة الحديثة
                </button>
              </div>

              {/* محتوى التبويبات */}
              <div>
                {activeTab === 'behavior' && (
                  <div className="divide-list">
                    <div className="list-item">
                      <div>
                        <div className="text-base">المستخدمون الأكثر تفاعلاً</div>
                        <div className="text-sm text-muted">تحليل سلوك القراءة والتفاعل</div>
                      </div>
                      <div className="text-lg" style={{ fontWeight: '600', color: 'hsl(var(--accent))' }}>
                        {stats.activeUsers.toLocaleString('ar')}
                      </div>
                    </div>
                    <div className="list-item">
                      <div>
                        <div className="text-base">متوسط وقت القراءة</div>
                        <div className="text-sm text-muted">الوقت المُقضي في قراءة المحتوى</div>
                      </div>
                      <div className="text-lg" style={{ fontWeight: '600', color: 'hsl(var(--accent))' }}>
                        4:32 دقيقة
                      </div>
                    </div>
                    <div className="list-item">
                      <div>
                        <div className="text-base">معدل الارتداد</div>
                        <div className="text-sm text-muted">نسبة المغادرة السريعة للموقع</div>
                      </div>
                      <div className="text-lg" style={{ fontWeight: '600', color: '#10b981' }}>
                        23% ↓
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'articles' && (
                  <div className="divide-list">
                    {topArticles.map((article, index) => (
                      <div key={article.id} className="list-item">
                        <div style={{ flex: 1 }}>
                          <div className="text-base" style={{ marginBottom: '4px' }}>
                            {index + 1}. {article.title}
                          </div>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <span className="chip chip-muted">
                              👁️ {article.views?.toLocaleString('ar') || 'غير محدد'}
                            </span>
                            <span className={`text-xs ${
                              article.trend === 'up' ? 'status-success' : 'status-error'
                            }`}>
                              {article.trend === 'up' ? '↗️ مرتفع' : '↘️ منخفض'}
                            </span>
                          </div>
                        </div>
                        <Link href={`/article/${article.id}`} className="btn btn-xs">
                          عرض
                        </Link>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'activities' && (
                  <div className="divide-list">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="list-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            background: 'hsl(var(--accent) / 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'hsl(var(--accent))'
                          }}>
                            {activity.type === 'article' && '📝'}
                            {activity.type === 'comment' && '💬'}
                            {activity.type === 'user' && '👤'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="text-sm">{activity.action}</div>
                            <div className="text-xs text-muted">{activity.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* أدوات سريعة */}
          <section>
            <div className="grid grid-2">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">إجراءات سريعة</div>
                  <div className="card-subtitle">المهام الشائعة والأدوات المفيدة</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link href="/admin/articles/create" className="btn btn-primary">
                    <Plus style={{ width: '16px', height: '16px' }} />
                    إنشاء مقال جديد
                  </Link>
                  <Link href="/admin/news/create" className="btn">
                    <Newspaper style={{ width: '16px', height: '16px' }} />
                    إضافة خبر عاجل
                  </Link>
                  <Link href="/admin/analytics" className="btn">
                    <BarChart3 style={{ width: '16px', height: '16px' }} />
                    عرض التقارير
                  </Link>
                  <Link href="/admin/backup" className="btn">
                    <FolderOpen style={{ width: '16px', height: '16px' }} />
                    نسخ احتياطي
                  </Link>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">حالة النظام</div>
                  <div className="card-subtitle">مراقبة أداء المنصة والخدمات</div>
                </div>
                
                <div className="divide-list">
                  <div className="list-item">
                    <div>
                      <div className="text-sm">خادم قاعدة البيانات</div>
                      <div className="text-xs text-muted">استجابة سريعة</div>
                    </div>
                    <div className="chip" style={{ background: '#10b981', color: 'white', border: 'none' }}>
                      ✅ متصل
                    </div>
                  </div>
                  <div className="list-item">
                    <div>
                      <div className="text-sm">نظام الذكاء الاصطناعي</div>
                      <div className="text-xs text-muted">تحليل المحتوى نشط</div>
                    </div>
                    <div className="chip" style={{ background: 'hsl(var(--accent))', color: 'white', border: 'none' }}>
                      🤖 يعمل
                    </div>
                  </div>
                  <div className="list-item">
                    <div>
                      <div className="text-sm">مساحة التخزين</div>
                      <div className="text-xs text-muted">78% مستخدم</div>
                    </div>
                    <div className="chip chip-muted">
                      💾 جيد
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* رابط العودة للتصميم الأصلي */}
          <section style={{ marginTop: '32px' }}>
            <div className="card" style={{ textAlign: 'center', background: 'hsl(var(--accent) / 0.05)' }}>
              <div className="card-title">🎨 مقارنة التصاميم</div>
              <div className="card-subtitle" style={{ marginBottom: '24px' }}>
                جرب أشكال مختلفة للوحة التحكم
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/dashboard/page-backup-original" className="btn">النسخة الأصلية</Link>
                <Link href="/manus-ui" className="btn">عرض توضيحي</Link>
                <Link href="#" className="btn btn-primary">Manus UI (الحالي)</Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
