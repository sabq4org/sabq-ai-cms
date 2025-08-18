"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, Search, Filter, TrendingUp, Tag, BarChart3, Edit, Trash2, 
  Eye, Settings, Sparkles, Target, Hash, Activity, Calendar,
  Zap, Users, Compass, Award, Lightbulb, RefreshCw, Download,
  Upload, Bell, Bookmark, Star, Globe, Layers, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { toast } from "react-hot-toast";

interface TagData {
  id: string;
  name: string;
  slug: string;
  color: string;
  category: string | null;
  description: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  articles_count: number;
  usage_trend?: 'up' | 'down' | 'stable';
}

interface TagStats {
  overview: {
    total_tags: number;
    active_tags: number;
    inactive_tags: number;
    total_connections: number;
    average_tags_per_article: number;
    unused_tags_count: number;
  };
  most_used_tags: TagData[];
  recent_tags: TagData[];
  categories_distribution: Array<{ category: string; count: number }>;
  performance_metrics: {
    tags_to_articles_ratio: number;
    active_percentage: number;
    usage_efficiency: number;
  };
}

export default function TagsManagement() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [stats, setStats] = useState<TagStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'recent'>('usage');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // تحميل البيانات
  useEffect(() => {
    loadTags();
    loadStats();
  }, []);

  const loadTags = async () => {
    try {
      const response = await fetch('/api/admin/tags', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setTags(data.data.tags);
      }
    } catch (error) {
      console.error('خطأ في تحميل الكلمات المفتاحية:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/tags/stats', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('خطأ في تحميل الإحصائيات:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([loadTags(), loadStats()]);
    setRefreshing(false);
    toast.success('تم تحديث البيانات');
  };

  // فلترة وترتيب الكلمات المفتاحية
  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tag.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tag.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "الكل" || tag.category === selectedCategory;
    const matchesActive = !showActiveOnly || tag.is_active;
    return matchesSearch && matchesCategory && matchesActive;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'usage':
        return b.articles_count - a.articles_count;
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  // الحصول على الفئات المتاحة
  const availableCategories = Array.from(new Set(tags.map(tag => tag.category).filter(Boolean)));

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
    return num.toString();
  };

  if (loading) {
    return (
      <div style={{ 
        background: 'hsl(var(--bg))', 
        minHeight: '100vh',
        padding: '0',
        width: '100%'
      }}>
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'hsl(var(--muted))' }}>جاري تحميل الكلمات المفتاحية...</p>
        </div>
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
        `}</style>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
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
      
      <div style={{ background: 'hsl(var(--bg))', minHeight: '100vh', width: '100%' }}>
        <div style={{ padding: '0', width: '100%' }}>
          {/* رسالة الترحيب */}
          <div className="card card-accent" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Hash style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
            
              <div style={{ flex: 1 }}>
                <h1 className="heading-1" style={{ marginBottom: '8px' }}>نظام الكلمات المفتاحية المتقدم</h1>
                <p className="text-lg text-muted" style={{ marginBottom: '16px' }}>
                  إدارة ذكية وشاملة للكلمات المفتاحية مع التحليلات والاقتراحات
                </p>
            {stats && (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span className="chip" style={{ 
                      background: 'hsl(var(--success) / 0.1)', 
                      color: 'hsl(var(--success))',
                      border: '1px solid hsl(var(--success) / 0.2)'
                    }}>
                      <Tag style={{ width: '14px', height: '14px' }} />
                  {stats.overview.total_tags} كلمة مفتاحية
                </span>
                    <span className="chip" style={{ 
                      background: 'hsl(var(--info) / 0.1)', 
                      color: 'hsl(var(--info))',
                      border: '1px solid hsl(var(--info) / 0.2)'
                    }}>
                      <Activity style={{ width: '14px', height: '14px' }} />
                  {stats.overview.active_tags} نشطة
                </span>
                    <span className="chip" style={{ 
                      background: 'hsl(var(--warning) / 0.1)', 
                      color: 'hsl(var(--warning))',
                      border: '1px solid hsl(var(--warning) / 0.2)'
                    }}>
                      <Globe style={{ width: '14px', height: '14px' }} />
                      {formatNumber(stats.overview.total_connections)} ارتباط
                </span>
              </div>
            )}
          </div>
          
              <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={refreshData}
              disabled={refreshing}
                  className="btn btn-outline"
                  style={{ minWidth: '120px' }}
            >
                  <RefreshCw style={{ width: '16px', height: '16px', animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              تحديث
            </button>
                <Link 
                  href="/admin/tags/new"
                  className="btn"
                  style={{ 
                    backgroundColor: 'hsl(var(--accent))',
                    color: 'white',
                    textDecoration: 'none'
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  إضافة وسم
                </Link>
              </div>
            </div>
          </div>

          {/* الإحصائيات */}
          {stats && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 className="heading-2" style={{ marginBottom: '4px' }}>إحصائيات الوسوم</h2>
                  <p className="text-muted">نظرة سريعة على أداء الكلمات المفتاحية</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-outline">
                    <Download style={{ width: '16px', height: '16px' }} />
              تصدير
            </button>
                  <button className="btn btn-outline">
                    <Upload style={{ width: '16px', height: '16px' }} />
                    استيراد
            </button>
                  <button className="btn" style={{ backgroundColor: 'hsl(var(--accent))', color: 'white' }}>
                    <Sparkles style={{ width: '16px', height: '16px' }} />
              اقتراحات ذكية
            </button>
          </div>
        </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* بطاقة إجمالي الوسوم */}
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
                      <Tag style={{ width: '24px', height: '24px' }} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>إجمالي الوسوم</div>
                      <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                        {formatNumber(stats.overview.total_tags)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowUpRight style={{ 
                          width: '14px', 
                          height: '14px',
                          color: '#10b981'
                        }} />
                        <span className="text-xs" style={{ color: '#10b981' }}>
                          +{stats.recent_tags.length}
                        </span>
                        <span className="text-xs text-muted">هذا الشهر</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* بطاقة الوسوم النشطة */}
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
                      <Activity style={{ width: '24px', height: '24px' }} />
      </div>

                    <div style={{ flex: 1 }}>
                      <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>الوسوم النشطة</div>
                      <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                        {formatNumber(stats.overview.active_tags)}
              </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="text-xs text-muted">
                          {stats.performance_metrics.active_percentage}% من الإجمالي
                </span>
              </div>
            </div>
                  </div>
                </div>

                {/* بطاقة الارتباطات */}
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
                      <Globe style={{ width: '24px', height: '24px' }} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>الارتباطات</div>
                      <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                        {formatNumber(stats.overview.total_connections)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp style={{ 
                          width: '14px', 
                          height: '14px',
                          color: '#10b981'
                        }} />
                        <span className="text-xs" style={{ color: '#10b981' }}>
                          {stats.performance_metrics.usage_efficiency}%
                        </span>
                        <span className="text-xs text-muted">كفاءة</span>
                      </div>
              </div>
            </div>
          </div>
          
                {/* بطاقة الأكثر استخداماً */}
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
                      <Award style={{ width: '24px', height: '24px' }} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>الأكثر استخداماً</div>
                      <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                        {stats.most_used_tags[0]?.name || 'لا يوجد'}
              </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="text-xs text-muted">
                          {stats.most_used_tags[0]?.articles_count || 0} مقال
                </span>
              </div>
            </div>
            </div>
          </div>
              </div>
            </div>
          )}

          {/* شريط البحث والفلتر */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
                <h2 className="heading-2" style={{ marginBottom: '4px' }}>قائمة الوسوم</h2>
                <p className="text-muted">جميع الكلمات المفتاحية المتاحة في النظام</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span className="text-sm text-muted">
                  {filteredTags.length} نتيجة
                </span>
              </div>
            </div>

            {/* شريط البحث */}
            <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                  <Search style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    color: 'hsl(var(--muted))'
                  }} />
            <input
              type="text"
                    placeholder="البحث في الوسوم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                    className="input"
                    style={{
                      width: '100%',
                      paddingRight: '48px',
                      fontSize: '16px'
                    }}
            />
          </div>
          
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input"
                  style={{ minWidth: '150px' }}
            >
              <option value="الكل">جميع الفئات</option>
              {availableCategories.map(category => (
                <option key={category || 'undefined'} value={category || 'undefined'}>{category}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
                  className="input"
                  style={{ minWidth: '150px' }}
            >
              <option value="usage">الأكثر استخداماً</option>
              <option value="name">الاسم أ-ي</option>
              <option value="recent">الأحدث</option>
            </select>
            
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  cursor: 'pointer'
                }}>
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
              />
                  <span className="text-sm">النشطة فقط</span>
            </label>

                <button className="btn btn-outline">
                  <Filter style={{ width: '16px', height: '16px' }} />
                  فلاتر متقدمة
            </button>
          </div>
        </div>
      </div>

          {/* قائمة الوسوم */}
          {filteredTags.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {filteredTags.map((tag, index) => (
                <div 
                  key={tag.id} 
                  className="card" 
                  style={{ 
                    padding: '24px', 
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                      <div style={{ position: 'relative' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: tag.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <Hash style={{ width: '20px', height: '20px', color: 'white' }} />
                        </div>
                    {tag.priority > 7 && (
                          <div style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            width: '16px',
                            height: '16px',
                            background: '#f59e0b',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid white'
                          }}>
                            <Sparkles style={{ width: '8px', height: '8px', color: 'white' }} />
                      </div>
                    )}
                  </div>
                      <div style={{ flex: 1 }}>
                        <h3 className="heading-3" style={{ marginBottom: '4px' }}>{tag.name}</h3>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className="text-sm text-muted">/{tag.slug}</span>
                          <span className={`chip ${tag.is_active ? 'chip-success' : 'chip-muted'}`}>
                            {tag.is_active ? 'نشط' : 'غير نشط'}
                          </span>
                          {tag.category && (
                            <span className="chip chip-info" style={{ fontSize: '11px' }}>
                              {tag.category}
                      </span>
                          )}
                      {index < 3 && (
                            <span className="chip chip-warning">
                              <Award style={{ width: '12px', height: '12px' }} />
                          الأعلى
                        </span>
                      )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setSelectedTag(tag)}
                        className="btn btn-sm btn-ghost"
                        title="عرض التفاصيل"
                      >
                        <Eye style={{ width: '16px', height: '16px' }} />
                      </button>
                      <Link 
                        href={`/admin/tags/${tag.id}/edit`}
                        className="btn btn-sm btn-ghost"
                        title="تعديل"
                      >
                        <Edit style={{ width: '16px', height: '16px' }} />
                      </Link>
                      <button 
                        className="btn btn-sm btn-ghost"
                        style={{ color: 'hsl(var(--danger))' }}
                        title="حذف"
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                    </div>

                    {tag.description && (
                    <p className="text-sm text-muted" style={{ marginBottom: '16px', lineHeight: '1.6' }}>
                        {tag.description}
                      </p>
                    )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div className="heading-3" style={{ color: 'hsl(var(--accent))' }}>
                          {formatNumber(tag.articles_count)}
                  </div>
                        <div className="text-xs text-muted">مقال</div>
                </div>
                      {tag.usage_trend && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          background: tag.usage_trend === 'up' ? 'hsl(var(--success) / 0.1)' :
                                     tag.usage_trend === 'down' ? 'hsl(var(--danger) / 0.1)' : 
                                     'hsl(var(--muted) / 0.1)'
                        }}>
                          <TrendingUp style={{ 
                            width: '14px', 
                            height: '14px',
                            color: tag.usage_trend === 'up' ? 'hsl(var(--success))' :
                                   tag.usage_trend === 'down' ? 'hsl(var(--danger))' : 
                                   'hsl(var(--muted))',
                            transform: tag.usage_trend === 'down' ? 'rotate(180deg)' : 'none'
                          }} />
                          <span className="text-xs" style={{
                            color: tag.usage_trend === 'up' ? 'hsl(var(--success))' :
                                   tag.usage_trend === 'down' ? 'hsl(var(--danger))' : 
                                   'hsl(var(--muted))'
                          }}>
                            {tag.usage_trend === 'up' ? 'صاعد' :
                             tag.usage_trend === 'down' ? 'هابط' : 'ثابت'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar style={{ width: '14px', height: '14px', color: 'hsl(var(--muted))' }} />
                      <span className="text-sm text-muted">
                        {new Date(tag.created_at).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                  
                  {/* شريط التقدم */}
                  <div style={{ 
                    width: '100%', 
                    height: '4px', 
                    background: 'hsl(var(--line))', 
                    borderRadius: '2px', 
                    marginTop: '16px',
                    overflow: 'hidden'
                  }}>
                    <div 
                      style={{ 
                        height: '100%',
                        background: 'linear-gradient(to right, hsl(var(--accent)), hsl(var(--accent-hover)))',
                        transition: 'width 0.5s ease',
                        width: `${Math.min((tag.articles_count / Math.max(...filteredTags.map(t => t.articles_count))) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '64px', textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                background: 'hsl(var(--muted) / 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Lightbulb style={{ width: '40px', height: '40px', color: 'hsl(var(--muted))' }} />
        </div>
              <h3 className="heading-2" style={{ marginBottom: '12px' }}>لا توجد كلمات مفتاحية</h3>
              <p className="text-muted" style={{ marginBottom: '24px' }}>
                لم يتم العثور على كلمات مفتاحية تطابق معايير البحث
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Link 
                  href="/admin/tags/new"
                  className="btn"
                  style={{ 
                    backgroundColor: 'hsl(var(--accent))',
                    color: 'white',
                    textDecoration: 'none'
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  إضافة أول كلمة مفتاحية
                </Link>
              <button 
                  onClick={refreshData}
                  className="btn btn-outline"
                >
                  <RefreshCw style={{ width: '16px', height: '16px' }} />
                إعادة تحميل
              </button>
            </div>
          </div>
        )}

          {/* إجراءات سريعة */}
          <div className="card" style={{ marginTop: '32px', padding: '32px', background: 'hsl(var(--bg-card))' }}>
            <h3 className="heading-2" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap style={{ color: 'hsl(var(--accent))' }} />
          إجراءات سريعة
        </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <button className="card" style={{ 
                padding: '20px',
                textAlign: 'right',
                border: '1px solid hsl(var(--line))',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'hsl(var(--accent) / 0.5)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'hsl(var(--line))';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'hsl(var(--info) / 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Upload style={{ width: '20px', height: '20px', color: 'hsl(var(--info))' }} />
              </div>
              <div>
                    <p className="heading-3" style={{ marginBottom: '4px' }}>استيراد كلمات مفتاحية</p>
                    <p className="text-sm text-muted">من ملف CSV أو Excel</p>
              </div>
            </div>
          </button>
          
              <button className="card" style={{ 
                padding: '20px',
                textAlign: 'right',
                border: '1px solid hsl(var(--line))',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'hsl(var(--success) / 0.5)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'hsl(var(--line))';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'hsl(var(--success) / 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Bell style={{ width: '20px', height: '20px', color: 'hsl(var(--success))' }} />
              </div>
              <div>
                    <p className="heading-3" style={{ marginBottom: '4px' }}>تنبيهات الأداء</p>
                    <p className="text-sm text-muted">تنبيهات الكلمات غير المستخدمة</p>
              </div>
            </div>
          </button>
          
              <button className="card" style={{ 
                padding: '20px',
                textAlign: 'right',
                border: '1px solid hsl(var(--line))',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'hsl(var(--accent) / 0.5)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'hsl(var(--line))';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'hsl(var(--accent) / 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Sparkles style={{ width: '20px', height: '20px', color: 'hsl(var(--accent))' }} />
              </div>
              <div>
                    <p className="heading-3" style={{ marginBottom: '4px' }}>تحسين تلقائي</p>
                    <p className="text-sm text-muted">اقتراحات ذكية لتحسين الأداء</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
      </div>
    </>
  );
}