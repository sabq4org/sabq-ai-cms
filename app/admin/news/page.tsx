/**
 * صفحة الأخبار مع تصميم Manus UI
 * تطبيق نفس التصميم المطور مع الحفاظ على الوظائف
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/date-utils";
import { formatDashboardStat } from "@/lib/format-utils";
import {
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

// دالة تنسيق الأرقام
const formatNumber = (num: number): string => {
  return formatDashboardStat(num);
};

interface Article {
  id: string;
  title: string;
  status: "published" | "draft" | "archived";
  published_at?: string;
  author?: { name: string };
  author_name?: string;
  category?: { name: string; id: string };
  category_id?: string;
  created_at: string;
  views?: number;
  breaking?: boolean;
  image?: string;
  featured_image?: string;
  reactions?: { like?: number; share?: number };
  slug?: string;
  content_type?: string;
}

export default function AdminNewsPageManus() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("published");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // إحصائيات
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    archived: 0,
    deleted: 0,
    breaking: 0,
  });

  // جلب البيانات (محاكاة)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // محاكاة بيانات للعرض
      const mockArticles: Article[] = [
        {
          id: "1",
          title: "أخبار مهمة حول التطوير",
          status: "published",
          published_at: new Date().toISOString(),
          author_name: "محرر الأخبار",
          category: { name: "تقنية", id: "tech" },
          created_at: new Date().toISOString(),
          views: 1250,
          breaking: false
        },
        {
          id: "2", 
          title: "مسودة خبر جديد",
          status: "draft",
          author_name: "كاتب المحتوى",
          created_at: new Date().toISOString(),
          views: 0,
          breaking: false
        }
      ];
      
      setArticles(mockArticles);
      setStats({
        total: 25,
        published: 18,
        draft: 5,
        scheduled: 1,
        archived: 1,
        deleted: 0,
        breaking: 3
      });
      
      setLoading(false);
    };
    
    loadData();
  }, [filterStatus, selectedCategory]);

  return (
    <>
      {/* تحميل CSS Manus UI */}
      <link rel="stylesheet" href="/manus-ui.css" />
      
      <div style={{ padding: '0', background: 'hsl(var(--bg))', minHeight: '100vh' }}>
        
        {/* رسالة الترحيب بتصميم Manus UI */}
        <div className="card card-accent" style={{ 
          marginBottom: '20px',
          background: 'hsl(var(--bg))',
          border: '1px solid hsl(var(--accent) / 0.2)',
          borderLeftWidth: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'hsl(var(--accent) / 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText style={{ width: '24px', height: '24px', color: 'hsl(var(--accent))' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="card-title">📰 إدارة الأخبار والمقالات</div>
              <div className="card-subtitle">يمكنك إدارة جميع الأخبار والمقالات من هنا، بما في ذلك النشر والتحرير والأرشفة.</div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link href="/admin/news/smart-editor" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles style={{ width: '16px', height: '16px' }} />
                المحرر الذكي
              </Link>
              <Link href="/admin/news/unified" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus style={{ width: '16px', height: '16px' }} />
                خبر جديد
              </Link>
            </div>
          </div>
        </div>

        {/* الإحصائيات بتصميم Manus UI */}
        <section className="grid grid-4" style={{ marginBottom: '20px' }}>
          
          {/* بطاقة الأخبار المنشورة */}
          <div 
            className={`card card-success ${filterStatus === "published" ? "selected" : ""}`}
            onClick={() => setFilterStatus("published")}
            style={{ 
              cursor: 'pointer',
              background: filterStatus === "published" ? 'hsl(var(--accent-3))' : 'hsl(var(--bg-card))',
              color: filterStatus === "published" ? 'white' : 'hsl(var(--fg))',
              border: filterStatus === "published" ? '2px solid hsl(var(--accent-3))' : '1px solid hsl(var(--accent-3) / 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div className="text-sm" style={{ 
                  color: filterStatus === "published" ? 'rgba(255,255,255,0.8)' : 'hsl(var(--muted))',
                  marginBottom: '8px'
                }}>
                  الأخبار المنشورة
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="heading-2" style={{ 
                    color: filterStatus === "published" ? 'white' : 'hsl(var(--accent-3))',
                    marginBottom: '0',
                    fontSize: '24px'
                  }}>
                    {formatNumber(stats?.published || 0)}
                  </div>
                  <div className="chip" style={{
                    background: filterStatus === "published" ? 'rgba(255,255,255,0.2)' : 'hsl(var(--accent-3) / 0.1)',
                    color: filterStatus === "published" ? 'white' : 'hsl(var(--accent-3))',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    <CheckCircle style={{ width: '12px', height: '12px' }} />
                    نشط
                  </div>
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: filterStatus === "published" ? 'rgba(255,255,255,0.2)' : 'hsl(var(--accent-3) / 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle style={{ 
                  width: '24px', 
                  height: '24px', 
                  color: filterStatus === "published" ? 'white' : 'hsl(var(--accent-3))'
                }} />
              </div>
            </div>
          </div>

          {/* بطاقة المسودات */}
          <div 
            className={`card card-warning ${filterStatus === "draft" ? "selected" : ""}`}
            onClick={() => setFilterStatus("draft")}
            style={{ 
              cursor: 'pointer',
              background: filterStatus === "draft" ? 'hsl(var(--accent-4))' : 'hsl(var(--bg-card))',
              color: filterStatus === "draft" ? 'white' : 'hsl(var(--fg))',
              border: filterStatus === "draft" ? '2px solid hsl(var(--accent-4))' : '1px solid hsl(var(--accent-4) / 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div className="text-sm" style={{ 
                  color: filterStatus === "draft" ? 'rgba(255,255,255,0.8)' : 'hsl(var(--muted))',
                  marginBottom: '8px'
                }}>
                  المسودات
                </div>
                <div className="heading-2" style={{ 
                  color: filterStatus === "draft" ? 'white' : 'hsl(var(--accent-4))',
                  marginBottom: '0',
                  fontSize: '24px'
                }}>
                  {formatNumber(stats?.draft || 0)}
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: filterStatus === "draft" ? 'rgba(255,255,255,0.2)' : 'hsl(var(--accent-4) / 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Clock style={{ 
                  width: '24px', 
                  height: '24px', 
                  color: filterStatus === "draft" ? 'white' : 'hsl(var(--accent-4))'
                }} />
              </div>
            </div>
          </div>

          {/* بطاقة المجدولة */}
          <div 
            className={`card card-accent ${filterStatus === "scheduled" ? "selected" : ""}`}
            onClick={() => setFilterStatus("scheduled")}
            style={{ 
              cursor: 'pointer',
              background: filterStatus === "scheduled" ? 'hsl(var(--accent))' : 'hsl(var(--bg-card))',
              color: filterStatus === "scheduled" ? 'white' : 'hsl(var(--fg))',
              border: filterStatus === "scheduled" ? '2px solid hsl(var(--accent))' : '1px solid hsl(var(--accent) / 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div className="text-sm" style={{ 
                  color: filterStatus === "scheduled" ? 'rgba(255,255,255,0.8)' : 'hsl(var(--muted))',
                  marginBottom: '8px'
                }}>
                  مجدولة
                </div>
                <div className="heading-2" style={{ 
                  color: filterStatus === "scheduled" ? 'white' : 'hsl(var(--accent))',
                  marginBottom: '0',
                  fontSize: '24px'
                }}>
                  {formatNumber(stats?.scheduled || 0)}
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: filterStatus === "scheduled" ? 'rgba(255,255,255,0.2)' : 'hsl(var(--accent) / 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Clock style={{ 
                  width: '24px', 
                  height: '24px', 
                  color: filterStatus === "scheduled" ? 'white' : 'hsl(var(--accent))'
                }} />
              </div>
            </div>
          </div>

          {/* بطاقة الأرشيف */}
          <div 
            className={`card ${filterStatus === "archived" ? "selected" : ""}`}
            onClick={() => setFilterStatus("archived")}
            style={{ 
              cursor: 'pointer',
              background: filterStatus === "archived" ? 'hsl(var(--muted))' : 'hsl(var(--bg-card))',
              color: filterStatus === "archived" ? 'white' : 'hsl(var(--fg))',
              border: filterStatus === "archived" ? '2px solid hsl(var(--muted))' : '1px solid hsl(var(--line))'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div className="text-sm" style={{ 
                  color: filterStatus === "archived" ? 'rgba(255,255,255,0.8)' : 'hsl(var(--muted))',
                  marginBottom: '8px'
                }}>
                  الأرشيف
                </div>
                <div className="heading-2" style={{ 
                  color: filterStatus === "archived" ? 'white' : 'hsl(var(--muted))',
                  marginBottom: '0',
                  fontSize: '24px'
                }}>
                  {formatNumber(stats?.archived || 0)}
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: filterStatus === "archived" ? 'rgba(255,255,255,0.2)' : 'hsl(var(--muted) / 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PauseCircle style={{ 
                  width: '24px', 
                  height: '24px', 
                  color: filterStatus === "archived" ? 'white' : 'hsl(var(--muted))'
                }} />
              </div>
            </div>
          </div>

        </section>

        {/* شريط البحث والفلاتر بتصميم Manus UI */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <div className="card-title">🔍 البحث والفلترة</div>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <Input
                placeholder="البحث في الأخبار..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid hsl(var(--line))',
                  borderRadius: '12px',
                  background: 'hsl(var(--bg-card))',
                  color: 'hsl(var(--fg))'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter style={{ width: '16px', height: '16px' }} />
                تصفية
              </button>
              <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download style={{ width: '16px', height: '16px' }} />
                تصدير
              </button>
            </div>
          </div>
        </div>

        {/* جدول الأخبار بتصميم Manus UI */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 قائمة الأخبار</div>
            <div className="card-subtitle">عرض وإدارة جميع الأخبار والمقالات</div>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
              <div className="text-muted">جاري التحميل...</div>
            </div>
          ) : (
            <div className="divide-list">
              {articles.map((article, index) => (
                <div key={article.id} className="list-item" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  padding: '16px'
                }}>
                  <div style={{ minWidth: '40px', textAlign: 'center' }}>
                    <span className="text-sm text-muted">{index + 1}</span>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div className="heading-4" style={{ marginBottom: '4px' }}>
                      {article.title}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span className="chip" style={{
                        background: article.status === 'published' ? 'hsl(var(--accent-3) / 0.1)' : 
                                   article.status === 'draft' ? 'hsl(var(--accent-4) / 0.1)' : 'hsl(var(--line))',
                        color: article.status === 'published' ? 'hsl(var(--accent-3))' : 
                               article.status === 'draft' ? 'hsl(var(--accent-4))' : 'hsl(var(--muted))'
                      }}>
                        {article.status === 'published' ? '✅ منشور' :
                         article.status === 'draft' ? '📝 مسودة' : '📦 أرشيف'}
                      </span>
                      <span className="text-sm text-muted">
                        {article.author_name}
                      </span>
                      {article.views && (
                        <span className="text-sm text-muted">
                          👁️ {formatNumber(article.views)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-sm">
                      <Eye style={{ width: '16px', height: '16px' }} />
                    </button>
                    <button className="btn btn-sm">
                      <Edit style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
