/**
 * صفحة إدارة القراء والمستخدمين المسجلين
 */

"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Activity,
  Ban,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Edit,
  Eye,
  Heart,
  Mail,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  ArrowUpRight,
  User,
  Shield,
  Star,
  Filter,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";

// مكون بطاقة إحصائية
const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: { value: number; label: string };
}) => {
  return (
    <div className="card" style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'hsl(var(--accent) / 0.1)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(var(--accent))'
        }}>
          <Icon style={{ width: '24px', height: '24px' }} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>{title}</div>
          <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
            {value}
          </div>
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpRight style={{ 
                width: '14px', 
                height: '14px',
                color: '#10b981'
              }} />
              <span className="text-xs" style={{ color: '#10b981' }}>
                {trend.value}%
              </span>
              <span className="text-xs text-muted">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface Reader {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "active" | "inactive" | "banned";
  email_verified: boolean;
  created_at: string;
  last_login?: string;
  stats: {
    articles_read: number;
    comments: number;
    likes: number;
    bookmarks: number;
  };
  subscription?: {
    type: "free" | "premium" | "vip";
    expires_at?: string;
  };
}

export default function ReadersManagementPage() {
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReaders, setTotalReaders] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;

  // جلب بيانات القراء
  const fetchReaders = async () => {
    try {
      const response = await fetch(
        `/api/users/readers?page=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(searchTerm)}&status=${statusFilter || 'all'}&verified=${verifiedFilter || 'all'}&subscription=${subscriptionFilter || 'all'}`,
        { cache: 'no-store', credentials: 'include' }
      );

      if (!response.ok) throw new Error("فشل في جلب البيانات");

      const data = await response.json();
      setReaders(data.readers || []);
      setTotalPages(data.totalPages || 1);
      setTotalReaders(data.total || 0);
    } catch (error) {
      console.error("خطأ في جلب القراء:", error);
      toast.error("فشل في جلب بيانات القراء");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReaders();
  }, [currentPage, statusFilter, verifiedFilter, subscriptionFilter]);

  // البحث مع تأخير
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentPage === 1) {
        fetchReaders();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // حساب الإحصائيات
  const stats = {
    total: totalReaders,
    active: readers.filter((r) => r.status === "active").length,
    verified: readers.filter((r) => r.email_verified).length,
    premium: readers.filter((r) => r.subscription?.type === "premium").length,
    recentlyActive: readers.filter((r) => {
      if (!r.last_login) return false;
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return new Date(r.last_login) > threeDaysAgo;
    }).length,
  };

  // معالجات الإجراءات
  const handleBanReader = async (id: string) => {
    if (!confirm("هل أنت متأكد من حظر هذا القارئ؟")) return;

    try {
      const response = await fetch(`/api/users/${id}/ban`, { 
        method: "POST",
        credentials: 'include'
      });
      if (!response.ok) throw new Error("فشل في حظر القارئ");

      toast.success("تم حظر القارئ بنجاح");
      fetchReaders();
    } catch (error) {
      toast.error("فشل في حظر القارئ");
    }
  };

  const handleActivateReader = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}/activate`, {
        method: "POST",
        credentials: 'include'
      });
      if (!response.ok) throw new Error("فشل في تفعيل القارئ");

      toast.success("تم تفعيل القارئ بنجاح");
      fetchReaders();
    } catch (error) {
      toast.error("فشل في تفعيل القارئ");
    }
  };

  const handleDeleteReader = async (id: string) => {
    if (
      !confirm(
        "هل أنت متأكد من حذف هذا القارئ؟ هذا الإجراء لا يمكن التراجع عنه."
      )
    )
      return;

    try {
      const response = await fetch(`/api/users/${id}`, { 
        method: "DELETE",
        credentials: 'include'
      });
      if (!response.ok) throw new Error("فشل في حذف القارئ");

      toast.success("تم حذف القارئ بنجاح");
      fetchReaders();
    } catch (error) {
      toast.error("فشل في حذف القارئ");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReaders();
  };

  const exportReaders = () => {
    // تصدير البيانات كـ CSV
    const csvContent = [
      ["الاسم", "البريد الإلكتروني", "الحالة", "تاريخ التسجيل", "آخر دخول"],
      ...readers.map((r) => [
        r.name,
        r.email,
        r.status,
        format(new Date(r.created_at), "yyyy-MM-dd"),
        r.last_login
          ? format(new Date(r.last_login), "yyyy-MM-dd")
          : "لم يسجل دخول",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `readers_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'chip-success',
      inactive: 'chip-warning',
      banned: 'chip-danger'
    };

    const labels = {
      active: 'نشط',
      inactive: 'غير نشط',
      banned: 'محظور'
    };

    return (
      <span className={`chip chip-sm ${badges[status as keyof typeof badges] || 'chip-outline'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getSubscriptionBadge = (type?: string) => {
    if (!type) return (
      <span className="chip chip-sm chip-outline">مجاني</span>
    );

    const badges = {
      premium: 'chip-info',
      vip: 'chip-warning'
    };

    const labels = {
      premium: 'مميز',
      vip: 'VIP',
      free: 'مجاني'
    };

    return (
      <span className={`chip chip-sm ${badges[type as keyof typeof badges] || 'chip-outline'}`}>
        {labels[type as keyof typeof labels] || type}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ 
            width: '48px', 
            height: '48px', 
            border: '3px solid hsl(var(--line))',
            borderTopColor: 'hsl(var(--accent))',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p className="text-muted">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(var(--bg))', padding: '0', width: '100%' }} dir="rtl">
      <div style={{ width: '100%' }}>
        {/* رسالة الترحيب */}
        <div className="card card-accent" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 className="heading-2" style={{ marginBottom: '4px' }}>
                  إدارة القراء والمستخدمين
                </h1>
                <p className="text-muted" style={{ fontSize: '14px' }}>
                  إدارة المستخدمين المسجلين والتحكم في صلاحياتهم
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          <StatCard
            title="إجمالي القراء"
            value={stats.total.toLocaleString('ar-SA')}
            icon={Users}
            trend={{ value: 12, label: "هذا الشهر" }}
          />
          <StatCard
            title="نشطون"
            value={stats.active.toLocaleString('ar-SA')}
            icon={UserCheck}
          />
          <StatCard
            title="موثقون"
            value={stats.verified.toLocaleString('ar-SA')}
            icon={CheckCircle}
          />
          <StatCard
            title="مشتركون"
            value={stats.premium.toLocaleString('ar-SA')}
            icon={Star}
          />
          <StatCard
            title="نشطون مؤخراً"
            value={stats.recentlyActive.toLocaleString('ar-SA')}
            icon={Activity}
          />
        </div>

        {/* شريط الأدوات */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              {/* البحث */}
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{ 
                    position: 'absolute', 
                    right: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'hsl(var(--muted))',
                    width: '20px',
                    height: '20px'
                  }} />
                  <input
                    type="text"
                    placeholder="البحث بالاسم أو البريد الإلكتروني..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input"
                    style={{ width: '100%', paddingRight: '40px' }}
                  />
                </div>
              </div>

              {/* الفلاتر */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                  style={{ width: '140px' }}
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="banned">محظور</option>
                </select>

                <select
                  value={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.value)}
                  className="input"
                  style={{ width: '140px' }}
                >
                  <option value="all">الكل</option>
                  <option value="verified">موثق</option>
                  <option value="unverified">غير موثق</option>
                </select>

                <select
                  value={subscriptionFilter}
                  onChange={(e) => setSubscriptionFilter(e.target.value)}
                  className="input"
                  style={{ width: '140px' }}
                >
                  <option value="all">جميع الاشتراكات</option>
                  <option value="free">مجاني</option>
                  <option value="premium">مميز</option>
                  <option value="vip">VIP</option>
                </select>
              </div>

              {/* الأزرار */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-ghost"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  style={{ padding: '8px' }}
                >
                  <RefreshCw
                    style={{ width: '16px', height: '16px' }}
                    className={refreshing ? "animate-spin" : ""}
                  />
                </button>
                <button className="btn btn-outline" onClick={exportReaders}>
                  <Download style={{ width: '16px', height: '16px' }} />
                  تصدير
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* جدول القراء */}
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(var(--line))' }}>
                  <th className="text-xs text-muted" style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>
                    القارئ
                  </th>
                  <th className="text-xs text-muted" style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>
                    الحالة
                  </th>
                  <th className="text-xs text-muted" style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>
                    الإحصائيات
                  </th>
                  <th className="text-xs text-muted" style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>
                    الاشتراك
                  </th>
                  <th className="text-xs text-muted" style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>
                    التواريخ
                  </th>
                  <th className="text-xs text-muted" style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {readers.map((reader) => (
                  <tr 
                    key={reader.id} 
                    style={{ 
                      borderBottom: '1px solid hsl(var(--line))',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--muted) / 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: reader.avatar ? 'transparent' : 'hsl(var(--accent) / 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          marginLeft: '12px'
                        }}>
                          {reader.avatar ? (
                            <img src={reader.avatar} alt={reader.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ color: 'hsl(var(--accent))', fontWeight: '600' }}>
                              {reader.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm" style={{ fontWeight: '600', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {reader.name}
                            {reader.email_verified && (
                              <CheckCircle style={{ width: '14px', height: '14px', color: 'hsl(var(--info))' }} />
                            )}
                          </div>
                          <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail style={{ width: '12px', height: '12px' }} />
                            {reader.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {getStatusBadge(reader.status)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <BookOpen style={{ width: '14px', height: '14px', color: 'hsl(var(--muted))' }} />
                          <span className="text-sm">{reader.stats.articles_read}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MessageSquare style={{ width: '14px', height: '14px', color: 'hsl(var(--muted))' }} />
                          <span className="text-sm">{reader.stats.comments}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Heart style={{ width: '14px', height: '14px', color: 'hsl(var(--muted))' }} />
                          <span className="text-sm">{reader.stats.likes}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {getSubscriptionBadge(reader.subscription?.type)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar style={{ width: '12px', height: '12px' }} />
                          انضم: {format(new Date(reader.created_at), "dd MMM yyyy", { locale: ar })}
                        </div>
                        {reader.last_login && (
                          <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock style={{ width: '12px', height: '12px' }} />
                            آخر دخول: {format(new Date(reader.last_login), "dd MMM yyyy", { locale: ar })}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ position: 'relative' }}>
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => setShowActionMenu(showActionMenu === reader.id ? null : reader.id)}
                        >
                          <MoreHorizontal style={{ width: '16px', height: '16px' }} />
                        </button>
                        
                        {showActionMenu === reader.id && (
                          <div className="card" style={{
                            position: 'absolute',
                            left: '0',
                            top: '100%',
                            marginTop: '4px',
                            minWidth: '180px',
                            zIndex: '1000',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}>
                            <div style={{ padding: '8px' }}>
                              <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '4px' }}>
                                <Eye style={{ width: '14px', height: '14px', marginLeft: '8px' }} />
                                عرض التفاصيل
                              </button>
                              <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '4px' }}>
                                <Edit style={{ width: '14px', height: '14px', marginLeft: '8px' }} />
                                تعديل
                              </button>
                              <div style={{ height: '1px', background: 'hsl(var(--line))', margin: '8px 0' }}></div>
                              {reader.status === "active" ? (
                                <button
                                  onClick={() => {
                                    handleBanReader(reader.id);
                                    setShowActionMenu(null);
                                  }}
                                  className="btn btn-ghost btn-sm"
                                  style={{ width: '100%', justifyContent: 'flex-start', color: 'hsl(var(--danger))' }}
                                >
                                  <Ban style={{ width: '14px', height: '14px', marginLeft: '8px' }} />
                                  حظر القارئ
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    handleActivateReader(reader.id);
                                    setShowActionMenu(null);
                                  }}
                                  className="btn btn-ghost btn-sm"
                                  style={{ width: '100%', justifyContent: 'flex-start', color: 'hsl(var(--success))' }}
                                >
                                  <UserCheck style={{ width: '14px', height: '14px', marginLeft: '8px' }} />
                                  تفعيل القارئ
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  handleDeleteReader(reader.id);
                                  setShowActionMenu(null);
                                }}
                                className="btn btn-ghost btn-sm"
                                style={{ width: '100%', justifyContent: 'flex-start', color: 'hsl(var(--danger))' }}
                              >
                                <Trash2 style={{ width: '14px', height: '14px', marginLeft: '8px' }} />
                                حذف نهائياً
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* التصفح */}
          {totalPages > 1 && (
            <div style={{ padding: '20px', borderTop: '1px solid hsl(var(--line))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="text-sm text-muted">
                  عرض {(currentPage - 1) * ITEMS_PER_PAGE + 1} إلى{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalReaders)} من{" "}
                  {totalReaders} قارئ
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronRight style={{ width: '14px', height: '14px' }} />
                  </button>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          className={`btn btn-sm ${currentPage === page ? '' : 'btn-outline'}`}
                          style={currentPage === page ? { background: 'hsl(var(--accent))', color: 'white' } : {}}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronLeft style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* إغلاق القائمة عند النقر خارجها */}
      {showActionMenu && (
        <div
          style={{
            position: 'fixed',
            inset: '0',
            zIndex: '999'
          }}
          onClick={() => setShowActionMenu(null)}
        />
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
