"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, Filter, TrendingUp, Tag, BarChart3, Edit, Trash2, 
  Eye, Settings, Sparkles, Target, Hash, Activity, Calendar,
  Zap, Users, Compass, Award, Lightbulb, RefreshCw, Download,
  Upload, Bell, Bookmark, Star, Globe, Layers
} from "lucide-react";

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
      const response = await fetch('/api/admin/tags');
      const data = await response.json();
      if (data.success) {
        setTags(data.data.tags);
      }
    } catch (error) {
      console.error('خطأ في تحميل الكلمات المفتاحية:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/tags/stats');
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

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-8 border border-blue-100">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>
        
        <div className="relative flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                <Hash className="text-white" size={32} />
              </div>
              نظام الكلمات المفتاحية المتقدم
            </h1>
            <p className="text-gray-600 text-lg mb-4">إدارة ذكية وشاملة للكلمات المفتاحية مع التحليلات والاقتراحات</p>
            
            {stats && (
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <Tag size={16} />
                  {stats.overview.total_tags} كلمة مفتاحية
                </span>
                <span className="flex items-center gap-2 text-green-600">
                  <Activity size={16} />
                  {stats.overview.active_tags} نشطة
                </span>
                <span className="flex items-center gap-2 text-blue-600">
                  <Globe size={16} />
                  {stats.overview.total_connections} اتصال
                </span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={refreshData}
              disabled={refreshing}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              تحديث
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Download size={20} />
              تصدير
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              إضافة كلمة مفتاحية
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Sparkles size={20} />
              اقتراحات ذكية
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Tag className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <span className="text-blue-600 text-sm font-medium bg-blue-100 px-2 py-1 rounded-full">
                  +{stats.recent_tags.length} هذا الشهر
                </span>
              </div>
            </div>
            <div>
              <p className="text-blue-600 text-sm font-medium">إجمالي الكلمات المفتاحية</p>
              <p className="text-3xl font-bold text-blue-900 mb-1">{stats.overview.total_tags}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-600">{stats.overview.active_tags} نشطة</span>
                <span className="text-blue-500">{stats.overview.inactive_tags} غير نشطة</span>
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <span className="text-green-600 text-sm font-medium bg-green-100 px-2 py-1 rounded-full">
                  {stats.performance_metrics.usage_efficiency}% كفاءة
                </span>
              </div>
            </div>
            <div>
              <p className="text-green-600 text-sm font-medium">الاستخدام النشط</p>
              <p className="text-3xl font-bold text-green-900 mb-1">{stats.overview.total_connections}</p>
              <p className="text-green-600 text-xs">ارتباط مع المقالات</p>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Award className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-yellow-600 text-sm font-medium">الأكثر شيوعاً</p>
              <p className="text-2xl font-bold text-yellow-900 truncate mb-1">
                {stats.most_used_tags[0]?.name || 'لا يوجد'}
              </p>
              <p className="text-yellow-600 text-xs">
                {stats.most_used_tags[0]?.articles_count || 0} مقال
              </p>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <span className="text-purple-600 text-sm font-medium bg-purple-100 px-2 py-1 rounded-full">
                  {stats.performance_metrics.tags_to_articles_ratio.toFixed(1)} متوسط
                </span>
              </div>
            </div>
            <div>
              <p className="text-purple-600 text-sm font-medium">الفعالية</p>
              <p className="text-3xl font-bold text-purple-900 mb-1">
                {stats.performance_metrics.active_percentage}%
              </p>
              <p className="text-purple-600 text-xs">
                من الكلمات المفتاحية نشطة
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="البحث في الكلمات المفتاحية، الوصف، أو الفئة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px] transition-all duration-200"
            >
              <option value="الكل">جميع الفئات</option>
              {availableCategories.map(category => (
                <option key={category || 'undefined'} value={category || 'undefined'}>{category}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px] transition-all duration-200"
            >
              <option value="usage">الأكثر استخداماً</option>
              <option value="name">الاسم أ-ي</option>
              <option value="recent">الأحدث</option>
            </select>
            
            <label className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="text-blue-600 rounded"
              />
              <span className="text-sm font-medium">النشطة فقط</span>
            </label>
          </div>
        </div>

        {/* Quick Stats and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Compass size={16} />
              {filteredTags.length} نتيجة
            </span>
            <span className="flex items-center gap-1">
              <Users size={16} />
              {filteredTags.reduce((sum, tag) => sum + tag.articles_count, 0)} ارتباط
            </span>
            <span className="flex items-center gap-1">
              <Zap size={16} />
              {filteredTags.filter(tag => tag.is_active).length} نشط
            </span>
          </div>
          
          <div className="flex gap-2">
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Filter size={16} />
            </button>
            <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <BarChart3 size={16} />
            </button>
            <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Tags List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Hash className="text-gray-600" />
              الكلمات المفتاحية ({filteredTags.length})
            </h2>
            <div className="flex gap-2">
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Layers size={16} />
              </button>
              <button className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                <Star size={16} />
              </button>
              <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                <Bookmark size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredTags.map((tag, index) => (
            <div key={tag.id} className="p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div
                      className="w-6 h-6 rounded-full shadow-md border-2 border-white group-hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: tag.color }}
                    ></div>
                    {tag.priority > 7 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Sparkles size={8} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {tag.name}
                      </h3>
                      <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                        /{tag.slug}
                      </span>
                      {index < 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Award size={12} className="mr-1" />
                          الأعلى
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                      {tag.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Layers size={12} className="mr-1" />
                          {tag.category}
                        </span>
                      )}
                      
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tag.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tag.is_active ? '●' : '○'} {tag.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                      
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        {new Date(tag.created_at).toLocaleDateString('ar-SA')}
                      </span>
                    </div>

                    {tag.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded mt-2">
                        {tag.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <p className="text-2xl font-bold text-gray-900">{tag.articles_count}</p>
                      {tag.usage_trend && (
                        <div className={`p-1 rounded ${
                          tag.usage_trend === 'up' ? 'text-green-600 bg-green-100' :
                          tag.usage_trend === 'down' ? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100'
                        }`}>
                          <TrendingUp size={16} className={
                            tag.usage_trend === 'down' ? 'rotate-180' : ''
                          } />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">مقال مرتبط</p>
                    
                    {/* شريط التقدم */}
                    <div className="w-16 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ 
                          width: `${Math.min((tag.articles_count / Math.max(...filteredTags.map(t => t.articles_count))) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={() => setSelectedTag(tag)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors transform hover:scale-110"
                      title="عرض التفاصيل"
                    >
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors transform hover:scale-110">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors transform hover:scale-110">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredTags.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <Lightbulb size={40} className="text-gray-400" />
            </div>
            <p className="text-xl font-medium mb-2">لا توجد كلمات مفتاحية</p>
            <p className="text-gray-600 mb-6">لم يتم العثور على كلمات مفتاحية تطابق معايير البحث</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors shadow-lg"
              >
                <Plus size={16} />
                إضافة أول كلمة مفتاحية
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors">
                <RefreshCw size={16} />
                إعادة تحميل
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="text-blue-600" />
          إجراءات سريعة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white hover:bg-blue-50 border border-blue-200 p-4 rounded-lg text-left transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Upload size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">استيراد كلمات مفتاحية</p>
                <p className="text-sm text-gray-600">من ملف CSV أو Excel</p>
              </div>
            </div>
          </button>
          
          <button className="bg-white hover:bg-green-50 border border-green-200 p-4 rounded-lg text-left transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Bell size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">تنبيهات الأداء</p>
                <p className="text-sm text-gray-600">تنبيهات الكلمات غير المستخدمة</p>
              </div>
            </div>
          </button>
          
          <button className="bg-white hover:bg-purple-50 border border-purple-200 p-4 rounded-lg text-left transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Sparkles size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">تحسين تلقائي</p>
                <p className="text-sm text-gray-600">اقتراحات ذكية لتحسين الأداء</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
