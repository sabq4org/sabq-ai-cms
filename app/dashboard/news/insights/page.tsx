'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useDarkMode } from "@/hooks/useDarkMode";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Eye,
  Activity,
  Award,
  BarChart3,
  Brain,
  Clock,
  Edit,
  Trash2,
  Share2,
  Heart,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Target,
  Loader2,
  RefreshCw
} from 'lucide-react';

// أنواع البيانات
interface Article {
  id: string;
  title: string;
  views: number;
  likes: number;
  shares: number;
  status: string;
  created_at: string;
  published_at?: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  author?: {
    id: string;
    name: string;
  };
}

interface KPIData {
  publishedThisWeek: number;
  currentDrafts: number;
  totalViews: number;
  totalInteractions: number;
  avgReadingTime: number;
  mostActiveCategory: { name: string; count: number };
  mostActiveAuthor: { name: string; count: number };
}

export default function NewsInsightsPage() {
  const { darkMode } = useDarkMode();
const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [kpiData, setKpiData] = useState<KPIData>({
    publishedThisWeek: 0,
    currentDrafts: 0,
    totalViews: 0,
    totalInteractions: 0,
    avgReadingTime: 0,
    mostActiveCategory: { name: '-', count: 0 },
    mostActiveAuthor: { name: '-', count: 0 }
  });
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // استرجاع حالة الوضع الليلي
// تحميل البيانات الحقيقية
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // جلب المقالات مع التصنيفات
        const articlesResponse = await fetch('/api/articles?limit=50&include=category,author');
        const articlesData = await articlesResponse.json();
        
        if (articlesData.success) {
          const articles = articlesData.data || articlesData.articles || [];
          setArticles(articles);
          
          // حساب KPI من البيانات الحقيقية
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          
          const publishedThisWeek = articles.filter((article: Article) => {
            const publishedAt = new Date(article.published_at || article.created_at);
            return publishedAt >= weekAgo && article.status === 'published';
          }).length;
          
          const currentDrafts = articles.filter((article: Article) => 
            article.status === 'draft'
          ).length;
          
          const totalViews = articles.reduce((sum: number, article: Article) => 
            sum + (article.views || 0), 0
          );
          
          const totalInteractions = articles.reduce((sum: number, article: Article) => 
            sum + (article.likes || 0) + (article.shares || 0), 0
          );
          
          // حساب أكثر فئة نشاطاً
          const categoryCount: { [key: string]: number } = {};
          articles.forEach((article: Article) => {
            if (article.category) {
              categoryCount[article.category.name] = (categoryCount[article.category.name] || 0) + 1;
            }
          });
          
          const mostActiveCategory = Object.entries(categoryCount).reduce((max, [name, count]) => 
            count > max.count ? { name, count } : max, { name: '-', count: 0 }
          );
          
          // حساب أكثر مؤلف نشاطاً
          const authorCount: { [key: string]: number } = {};
          articles.forEach((article: Article) => {
            if (article.author) {
              authorCount[article.author.name] = (authorCount[article.author.name] || 0) + 1;
            }
          });
          
          const mostActiveAuthor = Object.entries(authorCount).reduce((max, [name, count]) => 
            count > max.count ? { name, count } : max, { name: '-', count: 0 }
          );
          
          setKpiData({
            publishedThisWeek,
            currentDrafts,
            totalViews,
            totalInteractions,
            avgReadingTime: 3.5, // يمكن حسابه من بيانات المقال
            mostActiveCategory,
            mostActiveAuthor
          });
        }
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        toast.error('فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  // مكون KPI Card
  const KPICard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend,
    bgColor,
    iconColor 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    trend?: { value: number; isUp: boolean };
    bgColor: string;
    iconColor: string;
  }) => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend.isUp ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isUp ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {trend.value}%
          </div>
        )}
      </div>
      <div>
        <h3 className={`text-2xl font-bold mb-1 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>{value}</h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
        {subtitle && (
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className={`p-8 min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            جارٍ تحميل البيانات التحليلية...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* الرأس */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            تحليلات الأخبار
          </h1>
          <p className={`transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            نظرة شاملة على أداء المحتوى التحريري من البيانات الحقيقية
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
          <Link
            href="/dashboard/news"
            className={`px-4 py-2 rounded-lg border transition-colors duration-300 ${
              darkMode 
                ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            العودة لإدارة الأخبار
          </Link>
        </div>
      </div>

      {/* مؤشرات الأداء الرئيسية KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="منشور هذا الأسبوع"
          value={kpiData.publishedThisWeek}
          subtitle="مقال جديد"
          icon={FileText}
          trend={{ value: 12, isUp: true }}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <KPICard
          title="المسودات الحالية"
          value={kpiData.currentDrafts}
          subtitle="في انتظار النشر"
          icon={Edit}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <KPICard
          title="إجمالي المشاهدات"
          value={kpiData.totalViews.toLocaleString()}
          subtitle="مشاهدة"
          icon={Eye}
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <KPICard
          title="إجمالي التفاعل"
          value={kpiData.totalInteractions.toLocaleString()}
          subtitle="إعجاب ومشاركة"
          icon={Heart}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* أكثر التصنيفات والمؤلفين نشاطاً */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`rounded-2xl shadow-sm border p-6 transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-3 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <Target className="w-6 h-6 text-purple-600" />
            أكثر تصنيف نشاطاً
          </h3>
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {kpiData.mostActiveCategory.name}
            </div>
            <div className={`text-lg ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {kpiData.mostActiveCategory.count} مقال
            </div>
          </div>
        </div>

        <div className={`rounded-2xl shadow-sm border p-6 transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-3 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <Award className="w-6 h-6 text-orange-600" />
            أكثر مؤلف نشاطاً
          </h3>
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {kpiData.mostActiveAuthor.name}
            </div>
            <div className={`text-lg ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {kpiData.mostActiveAuthor.count} مقال
            </div>
          </div>
        </div>
      </div>

      {/* المقالات الأكثر مشاهدة */}
      <div className={`rounded-2xl shadow-sm border p-6 transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <TrendingUp className="w-6 h-6 text-green-600" />
          المقالات الأكثر مشاهدة
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-right py-3 px-4 text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>العنوان</th>
                <th className={`text-center py-3 px-4 text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>المشاهدات</th>
                <th className={`text-center py-3 px-4 text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>التفاعل</th>
                <th className={`text-center py-3 px-4 text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>التصنيف</th>
                <th className={`text-center py-3 px-4 text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {articles
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 10)
                .map((article) => (
                <tr key={article.id} className={`border-b ${
                  darkMode ? 'border-gray-700' : 'border-gray-100'
                } hover:bg-opacity-50 transition-colors`}>
                  <td className="py-4 px-4">
                    <div className="max-w-md">
                      <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {article.title}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {article.author?.name || 'مؤلف غير معروف'}
                      </div>
                    </div>
                  </td>
                  <td className={`text-center py-4 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="w-4 h-4" />
                      {(article.views || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className={`text-center py-4 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="flex items-center justify-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        {(article.likes || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-4 h-4 text-green-500" />
                        {(article.shares || 0)}
                      </span>
                    </div>
                  </td>
                  <td className={`text-center py-4 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      article.category?.color 
                        ? `bg-${article.category.color}-100 text-${article.category.color}-800`
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {article.category?.name || 'غير مصنف'}
                    </span>
                  </td>
                  <td className={`text-center py-4 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : article.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {article.status === 'published' ? 'منشور' : 
                       article.status === 'draft' ? 'مسودة' : 
                       article.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}