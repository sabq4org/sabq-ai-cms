"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Folder,
  FolderOpen,
  FileText,
  Target,
  ArrowUpRight,
  Hash,
  Calendar,
  Download,
  ChevronRight,
  Sparkles,
  Tag,
  X,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  description: string;
  articleCount: number;
  createdAt: string;
  status: "active" | "inactive";
  color: string;
}

// سيتم جلب التصنيفات فعليًا من /api/categories

// أدوات مساعدة للألوان
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const sanitized = hex?.replace(/^#/, "");
  if (!sanitized || !/^([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(sanitized)) return null;
  const full = sanitized.length === 3
    ? sanitized.split("").map((c) => c + c).join("")
    : sanitized;
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#ffffff";
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.6 ? "#111827" : "#ffffff"; // أسود داكن أو أبيض
}

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; category: Category | null }>({ 
    open: false, 
    category: null 
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/categories", { 
        cache: "no-store",
        credentials: "include"
      });
      
      if (!res.ok) throw new Error("HTTP " + res.status);
      
      const data = await res.json();
      const raw = data.categories || data.data || [];
      
      const mapped: Category[] = raw.map((c: any) => ({
        id: String(c.id),
        name: c.name_ar || c.name || "",
        description: c.description || "",
        articleCount: Number(c.articles_count ?? c.articleCount ?? 0),
        createdAt: c.created_at || c.createdAt || new Date().toISOString(),
        status: c.is_active === false ? "inactive" : "active",
        color: c.color || c?.metadata?.color_hex || "#3B82F6",
      }));
      
      setCategories(mapped);
    } catch (e) {
      console.error("Error fetching categories:", e);
      setError("تعذر جلب التصنيفات");
      toast.error("حدث خطأ في جلب التصنيفات");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
    return num.toString();
  };

  const getCategoryStats = () => {
    const totalCategories = categories.length;
    const activeCategories = categories.filter(
      (cat) => cat.status === "active"
    ).length;
    const totalArticles = categories.reduce(
      (sum, cat) => sum + cat.articleCount,
      0
    );
    const averageArticles = Math.round(totalArticles / totalCategories);

    return {
      total: totalCategories,
      active: activeCategories,
      totalArticles,
      average: averageArticles,
    };
  };

  const stats = getCategoryStats();

  const handleEditCategory = (category: Category) => {
    window.location.href = `/admin/categories/edit/${category.id}`;
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const updatedCategories = categories.filter(cat => cat.id !== categoryId);
        setCategories(updatedCategories);
        toast.success("تم حذف التصنيف بنجاح");
        setDeleteModal({ open: false, category: null });
      } else {
        toast.error("فشل حذف التصنيف");
      }
    } catch (error) {
      console.error("خطأ في حذف التصنيف:", error);
      toast.error("حدث خطأ أثناء حذف التصنيف");
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsCards = [
    {
      title: "إجمالي الفئات",
      value: stats.total.toString(),
      icon: Folder,
      change: "+2",
      changeType: "increase" as const,
      color: "blue",
    },
    {
      title: "الفئات النشطة",
      value: stats.active.toString(),
      icon: FolderOpen,
      change: "+1",
      changeType: "increase" as const,
      color: "green",
    },
    {
      title: "إجمالي المقالات",
      value: formatDashboardStat(stats.totalArticles),
      icon: FileText,
      change: "+12%",
      changeType: "increase" as const,
      color: "purple",
    },
    {
      title: "متوسط المقالات",
      value: stats.average.toString(),
      icon: Target,
      change: "+5%",
      changeType: "increase" as const,
      color: "orange",
    },
  ];

  return (
    <>
      <style jsx>{`
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid hsl(var(--line));
          border-top-color: hsl(var(--accent));
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .card:hover {
          border-color: hsl(var(--accent) / 0.3);
        }
        
        .btn-ghost:hover {
          background: hsl(var(--accent) / 0.1);
        }
        
        .btn-ghost:active {
          transform: scale(0.95);
        }
        
        input.input {
          transition: all 0.2s ease;
        }
        
        input.input:focus {
          border-color: hsl(var(--accent));
          box-shadow: 0 0 0 3px hsl(var(--accent) / 0.1);
        }
      `}</style>
      
      <div style={{ background: "hsl(var(--bg))", minHeight: "100vh" }}>
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
        {loading && (
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <div className="loading-spinner" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "hsl(var(--muted))" }}>جاري تحميل التصنيفات...</p>
          </div>
        )}
        {!loading && (
          <>
            {/* رسالة الترحيب */}
            <div className="card card-accent" style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "start", gap: "20px" }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Tag style={{ width: "32px", height: "32px", color: "white" }} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <h1 className="heading-1" style={{ marginBottom: "8px" }}>إدارة التصنيفات</h1>
                  <p className="text-lg text-muted" style={{ marginBottom: "16px" }}>
                    تنظيم وإدارة فئات المحتوى بطريقة احترافية ومنظمة
                  </p>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <span className="chip" style={{ 
                      background: "hsl(var(--success) / 0.1)", 
                      color: "hsl(var(--success))",
                      border: "1px solid hsl(var(--success) / 0.2)"
                    }}>
                      <Folder style={{ width: "14px", height: "14px" }} />
                      {stats.active} فئة نشطة
                    </span>
                    <span className="chip" style={{ 
                      background: "hsl(var(--info) / 0.1)", 
                      color: "hsl(var(--info))",
                      border: "1px solid hsl(var(--info) / 0.2)"
                    }}>
                      <FileText style={{ width: "14px", height: "14px" }} />
                      {formatNumber(stats.totalArticles)} مقال
                    </span>
                  </div>
                </div>
                
                <div style={{ textAlign: "left" }}>
                  <div className="text-sm text-muted" style={{ marginBottom: "4px" }}>آخر تحديث</div>
                  <div className="heading-3" style={{ color: "hsl(var(--accent))" }}>
                    {new Date().toLocaleTimeString("ar-SA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* الإحصائيات */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 className="heading-2" style={{ marginBottom: "4px" }}>إحصائيات التصنيفات</h2>
                  <p className="text-muted">نظرة سريعة على أداء التصنيفات</p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button className="btn btn-outline" onClick={() => setFilterOpen(!filterOpen)}>
                    <Filter style={{ width: "16px", height: "16px" }} />
                    تصفية
                  </button>
                  <Link href="/admin/categories/new" className="btn btn-primary">
                    <Plus style={{ width: "16px", height: "16px" }} />
                    إضافة فئة
                  </Link>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                {[
                  {
                    title: "إجمالي الفئات",
                    value: stats.total,
                    icon: Folder,
                    change: "+2",
                    color: "#3B82F6",
                    bgColor: "#3B82F6"
                  },
                  {
                    title: "الفئات النشطة",
                    value: stats.active,
                    icon: FolderOpen,
                    change: "+1",
                    color: "#10B981",
                    bgColor: "#10B981"
                  },
                  {
                    title: "إجمالي المقالات",
                    value: formatNumber(stats.totalArticles),
                    icon: FileText,
                    change: "+12%",
                    color: "#8B5CF6",
                    bgColor: "#8B5CF6"
                  },
                  {
                    title: "متوسط المقالات",
                    value: stats.average,
                    icon: Target,
                    change: "+5%",
                    color: "#F59E0B",
                    bgColor: "#F59E0B"
                  }
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="card" style={{ padding: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ flex: 1 }}>
                          <p className="text-sm text-muted" style={{ marginBottom: "8px" }}>
                            {stat.title}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div className="heading-2" style={{ color: stat.color }}>
                              {stat.value}
                            </div>
                            <span className="chip" style={{
                              background: `${stat.bgColor}20`,
                              color: stat.color,
                              border: `1px solid ${stat.bgColor}30`,
                              fontSize: "12px",
                              padding: "4px 8px"
                            }}>
                              <ArrowUpRight style={{ width: "12px", height: "12px" }} />
                              {stat.change}
                            </span>
                          </div>
                        </div>
                        <div style={{
                          width: "56px",
                          height: "56px",
                          background: `${stat.bgColor}15`,
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <Icon style={{ width: "28px", height: "28px", color: stat.color }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* شريط البحث والفلتر */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 className="heading-2" style={{ marginBottom: "4px" }}>قائمة التصنيفات</h2>
                  <p className="text-muted">جميع التصنيفات المتاحة في النظام</p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button className="btn btn-outline">
                    <Download style={{ width: "16px", height: "16px" }} />
                    تصدير
                  </button>
                </div>
              </div>

              {/* شريط البحث */}
              <div style={{ marginBottom: "20px", position: "relative" }}>
                <Search style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "20px",
                  height: "20px",
                  color: "hsl(var(--muted))"
                }} />
                <input
                  type="text"
                  placeholder="البحث في التصنيفات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input"
                  style={{
                    width: "100%",
                    paddingRight: "48px",
                    fontSize: "16px"
                  }}
                />
              </div>
            </div>

            {/* قائمة التصنيفات */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
              {filteredCategories.map((category) => (
                <div 
                  key={category.id} 
                  className="card" 
                  style={{ 
                    padding: "24px", 
                    transition: "all 0.2s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "";
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      <div style={{
                        width: "48px",
                        height: "48px",
                        background: category.color,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid hsl(var(--line))"
                      }}>
                        <Hash style={{ 
                          width: "24px", 
                          height: "24px", 
                          color: getContrastColor(category.color) 
                        }} />
                      </div>
                      <div>
                        <h3 className="heading-3" style={{ marginBottom: "4px" }}>{category.name}</h3>
                        <span className={`chip ${category.status === "active" ? "chip-success" : "chip-warning"}`}>
                          {category.status === "active" ? "نشط" : "غير نشط"}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => handleEditCategory(category)}
                        className="btn btn-sm btn-ghost"
                        title="تعديل التصنيف"
                      >
                        <Edit style={{ width: "16px", height: "16px" }} />
                      </button>
                      <button 
                        onClick={() => setDeleteModal({ open: true, category })}
                        className="btn btn-sm btn-ghost"
                        style={{ color: "hsl(var(--danger))" }}
                        title="حذف التصنيف"
                      >
                        <Trash2 style={{ width: "16px", height: "16px" }} />
                      </button>
                    </div>
                  </div>

                  <p className="text-muted" style={{ marginBottom: "16px", minHeight: "44px" }}>
                    {category.description || "لا يوجد وصف"}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <FileText style={{ width: "14px", height: "14px", color: "hsl(var(--muted))" }} />
                        <span className="text-sm text-muted">
                          {formatNumber(category.articleCount)} مقال
                        </span>
                      </div>
                      {category.createdAt && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Calendar style={{ width: "14px", height: "14px", color: "hsl(var(--muted))" }} />
                          <span className="text-sm text-muted">
                            {new Date(category.createdAt).toLocaleDateString("ar-SA")}
                          </span>
                        </div>
                      )}
                    </div>
                    <Link 
                      href={`/admin/categories/${category.id}`}
                      className="btn btn-sm btn-ghost"
                    >
                      <Eye style={{ width: "16px", height: "16px" }} />
                      عرض
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* رسالة إرشادية */}
            {filteredCategories.length === 0 && (
              <div className="card" style={{ padding: "48px", textAlign: "center", marginTop: "32px" }}>
                <AlertCircle style={{ width: "48px", height: "48px", color: "hsl(var(--muted))", margin: "0 auto 16px" }} />
                <h3 className="heading-3" style={{ marginBottom: "8px" }}>لا توجد تصنيفات</h3>
                <p className="text-muted" style={{ marginBottom: "24px" }}>
                  {searchTerm ? "لا توجد نتائج تطابق البحث" : "لم يتم إنشاء أي تصنيفات بعد"}
                </p>
                {!searchTerm && (
                  <Link href="/admin/categories/new" className="btn btn-primary">
                    <Plus style={{ width: "16px", height: "16px" }} />
                    إنشاء أول تصنيف
                  </Link>
                )}
              </div>
            )}

            {/* رسالة النجاح */}
            {categories.length > 0 && (
              <div className="card" style={{ 
                marginTop: "32px",
                background: "linear-gradient(135deg, hsl(var(--success) / 0.05), hsl(var(--success) / 0.1))",
                border: "1px solid hsl(var(--success) / 0.2)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "24px" }}>
                  <div style={{
                    width: "56px",
                    height: "56px",
                    background: "hsl(var(--success) / 0.15)",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Sparkles style={{ width: "28px", height: "28px", color: "hsl(var(--success))" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 className="heading-3" style={{ marginBottom: "4px" }}>تنظيم ممتاز للمحتوى!</h3>
                    <p className="text-muted">التصنيفات منظمة بشكل جيد مع توزيع متوازن للمقالات</p>
                  </div>
                  <span className="chip chip-success">
                    منظم بكفاءة
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* نافذة تأكيد الحذف */}
        {deleteModal.open && deleteModal.category && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}>
            <div className="card" style={{
              maxWidth: "480px",
              width: "100%",
              padding: "32px",
              position: "relative"
            }}>
              <button
                onClick={() => setDeleteModal({ open: false, category: null })}
                className="btn btn-sm btn-ghost"
                style={{ position: "absolute", top: "16px", left: "16px" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>

              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  background: "hsl(var(--danger) / 0.1)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px"
                }}>
                  <Trash2 style={{ width: "32px", height: "32px", color: "hsl(var(--danger))" }} />
                </div>

                <h3 className="heading-2" style={{ marginBottom: "12px" }}>حذف التصنيف</h3>
                <p className="text-muted" style={{ marginBottom: "24px" }}>
                  هل أنت متأكد من حذف تصنيف "{deleteModal.category.name}"؟ 
                  <br />
                  سيتم نقل جميع المقالات ({deleteModal.category.articleCount} مقال) إلى "غير مصنف"
                </p>

                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  <button
                    onClick={() => setDeleteModal({ open: false, category: null })}
                    className="btn btn-outline"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(deleteModal.category!.id)}
                    className="btn"
                    style={{ background: "hsl(var(--danger))", color: "white" }}
                  >
                    <Trash2 style={{ width: "16px", height: "16px" }} />
                    تأكيد الحذف
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}


