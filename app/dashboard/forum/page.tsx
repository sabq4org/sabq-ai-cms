'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Settings, 
  Users, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Pin, 
  Lock, 
  Unlock,
  Eye,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search
} from "lucide-react";
import { toast } from 'react-hot-toast';

interface ForumStats {
  totalTopics: number;
  totalReplies: number;
  totalMembers: number;
  activeTopics: number;
  pinnedTopics: number;
  lockedTopics: number;
  todayTopics: number;
  todayReplies: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  topicsCount: number;
  isActive: boolean;
  displayOrder: number;
}

interface RecentTopic {
  id: string;
  title: string;
  author: string;
  category: string;
  categoryColor: string;
  replies: number;
  views: number;
  createdAt: string;
  isPinned: boolean;
  isLocked: boolean;
  status: 'active' | 'pending' | 'deleted';
}

export default function ForumAdminPage() {
  const darkMode = theme === 'dark';
  
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'topics' | 'settings'>('overview');
  const [stats, setStats] = useState<ForumStats>({
    totalTopics: 0,
    totalReplies: 0,
    totalMembers: 0,
    activeTopics: 0,
    pinnedTopics: 0,
    lockedTopics: 0,
    todayTopics: 0,
    todayReplies: 0
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentTopics, setRecentTopics] = useState<RecentTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name_ar: '',
    name_en: '',
    slug: '',
    description: '',
    color: '#3B82F6'
  });

  // جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // جلب الإحصائيات الحقيقية
        const statsResponse = await fetch('/api/forum/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setStats(statsData.stats);
          }
        }

        // جلب الفئات
        const categoriesResponse = await fetch('/api/forum/categories?include_inactive=true');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);
        }

        // جلب المواضيع الأخيرة
        const topicsResponse = await fetch('/api/forum/topics?limit=10');
        if (topicsResponse.ok) {
          const topicsData = await topicsResponse.json();
          setRecentTopics(topicsData.topics?.map((topic: any) => ({
            id: topic.id,
            title: topic.title,
            author: topic.author.name,
            category: topic.category.name,
            categoryColor: topic.category.color,
            replies: topic.replies,
            views: topic.views,
            createdAt: topic.created_at,
            isPinned: topic.is_pinned,
            isLocked: topic.is_locked,
            status: 'active'
          })) || []);
        }
      } catch (error) {
        console.error('Error fetching forum admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // تبديل حالة تثبيت الموضوع
  const togglePinTopic = async (topicId: string, isPinned: boolean) => {
    try {
      const response = await fetch(`/api/forum/topics/${topicId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_pinned: !isPinned
        }),
      });

      if (response.ok) {
        toast.success(isPinned ? 'تم إلغاء تثبيت الموضوع' : 'تم تثبيت الموضوع');
        
        // تحديث القائمة المحلية
        setRecentTopics(prev => prev.map(topic => 
          topic.id === topicId 
            ? { ...topic, isPinned: !isPinned }
            : topic
        ));
      } else {
        const error = await response.json();
        toast.error(`خطأ: ${error.error}`);
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('حدث خطأ في تحديث حالة التثبيت');
    }
  };

  // تبديل حالة قفل الموضوع
  const toggleLockTopic = async (topicId: string, isLocked: boolean) => {
    try {
      const response = await fetch(`/api/forum/topics/${topicId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_locked: !isLocked
        }),
      });

      if (response.ok) {
        toast.success(isLocked ? 'تم فتح الموضوع' : 'تم إغلاق الموضوع');
        
        // تحديث القائمة المحلية
        setRecentTopics(prev => prev.map(topic => 
          topic.id === topicId 
            ? { ...topic, isLocked: !isLocked }
            : topic
        ));
      } else {
        const error = await response.json();
        toast.error(`خطأ: ${error.error}`);
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
      toast.error('حدث خطأ في تحديث حالة القفل');
    }
  };

  // حذف موضوع
  const deleteTopic = async (topicId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموضوع؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/forum/topics/${topicId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('تم حذف الموضوع بنجاح');
        
        // إزالة من القائمة المحلية
        setRecentTopics(prev => prev.filter(topic => topic.id !== topicId));
      } else {
        const error = await response.json();
        toast.error(`خطأ: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast.error('حدث خطأ في حذف الموضوع');
    }
  };

  // تعديل موضوع
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });

  const startEditTopic = (topic: RecentTopic) => {
    setEditingTopic(topic.id);
    setEditForm({ title: topic.title, content: '' }); // نحتاج لجلب المحتوى من API
  };

  const saveEditTopic = async (topicId: string) => {
    try {
      const response = await fetch(`/api/forum/topics/${topicId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editForm.title,
          content: editForm.content
        }),
      });

      if (response.ok) {
        toast.success('تم تحديث الموضوع بنجاح');
        
        // تحديث القائمة المحلية
        setRecentTopics(prev => prev.map(topic => 
          topic.id === topicId 
            ? { ...topic, title: editForm.title }
            : topic
        ));
        
        setEditingTopic(null);
        setEditForm({ title: '', content: '' });
      } else {
        const error = await response.json();
        toast.error(`خطأ: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating topic:', error);
      toast.error('حدث خطأ في تحديث الموضوع');
    }
  };

  // حذف فئة
  const deleteCategory = async (categoryId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/forum/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('تم حذف الفئة بنجاح');
        
        // إعادة جلب الفئات
        const categoriesResponse = await fetch('/api/forum/categories?include_inactive=true');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);
        }
      } else {
        const error = await response.json();
        toast.error(`خطأ: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('حدث خطأ في حذف الفئة');
    }
  };

  // تعديل فئة
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryForm, setEditCategoryForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  const startEditCategory = (category: Category) => {
    setEditingCategory(category.id);
    setEditCategoryForm({
      name: category.name,
      description: category.description || '',
      color: category.color
    });
  };

  const saveEditCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/forum/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editCategoryForm),
      });

      if (response.ok) {
        toast.success('تم تحديث الفئة بنجاح');
        
        // إعادة جلب الفئات
        const categoriesResponse = await fetch('/api/forum/categories?include_inactive=true');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);
        }
        
        setEditingCategory(null);
      } else {
        const error = await response.json();
        toast.error(`خطأ: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('حدث خطأ في تحديث الفئة');
    }
  };

  // إنشاء فئة جديدة
  const createCategory = async () => {
    try {
      const response = await fetch('/api/forum/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Category created:', result);
        
        // إعادة جلب الفئات
        const categoriesResponse = await fetch('/api/forum/categories?include_inactive=true');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);
        }
        
        // إعادة تعيين النموذج
        setNewCategory({
          name_ar: '',
          name_en: '',
          slug: '',
          description: '',
          color: '#3B82F6'
        });
        setShowCategoryModal(false);
      } else {
        const error = await response.json();
        alert(`خطأ في إنشاء الفئة: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('حدث خطأ في إنشاء الفئة');
    }
  };

  // حفظ إعدادات المنتدى
  const saveSettings = async (newSettings: any) => {
    try {
      const response = await fetch('/api/forum/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: newSettings }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Settings saved:', result);
        setSettings(newSettings);
        setShowSettingsModal(false);
        alert('تم حفظ الإعدادات بنجاح');
      } else {
        const error = await response.json();
        alert(`خطأ في حفظ الإعدادات: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('حدث خطأ في حفظ الإعدادات');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className={`h-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded w-1/4`}></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-32 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              darkMode ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-gradient-to-br from-blue-500 to-blue-600'
            } shadow-lg`}>
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              إدارة المنتدى
            </h1>
          </div>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            إدارة المواضيع والفئات وإعدادات المنتدى
          </p>
        </div>

        {/* تبويبات التنقل */}
        <div className="mb-8">
          <div className="flex space-x-1 space-x-reverse">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
              { id: 'categories', label: 'الفئات', icon: Settings },
              { id: 'topics', label: 'المواضيع', icon: MessageSquare },
              { id: 'settings', label: 'الإعدادات', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : darkMode
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* محتوى التبويبات */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>إجمالي المواضيع</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.totalTopics.toLocaleString()}
                      </p>
                    </div>
                    <MessageCircle className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    +{stats.todayTopics} اليوم
                  </p>
                </CardContent>
              </Card>

              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>إجمالي الردود</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.totalReplies.toLocaleString()}
                      </p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    +{stats.todayReplies} اليوم
                  </p>
                </CardContent>
              </Card>

              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>الأعضاء</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.totalMembers.toLocaleString()}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-500" />
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                    عضو مسجل
                  </p>
                </CardContent>
              </Card>

              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>مواضيع نشطة</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.activeTopics.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-500" />
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                    من {stats.totalTopics}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* إحصائيات إضافية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    حالة المواضيع
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>مثبتة</span>
                    <span className="font-bold text-orange-600">{stats.pinnedTopics}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>مغلقة</span>
                    <span className="font-bold text-red-600">{stats.lockedTopics}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>عادية</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.totalTopics - stats.pinnedTopics - stats.lockedTopics}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    الفئات النشطة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.slice(0, 4).map((category) => (
                      <div key={category.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {category.name}
                          </span>
                        </div>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {category.topicsCount}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    إجراءات سريعة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Plus className="w-4 h-4 ml-2" />
                    إنشاء فئة جديدة
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Settings className="w-4 h-4 ml-2" />
                    إعدادات المنتدى
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <BarChart3 className="w-4 h-4 ml-2" />
                    تقارير مفصلة
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* المواضيع الأخيرة */}
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  المواضيع الأخيرة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTopics.slice(0, 8).map((topic) => (
                    <div key={topic.id} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {topic.isPinned && <Pin className="w-3 h-3 text-orange-500" />}
                          {topic.isLocked && <Lock className="w-3 h-3 text-red-500" />}
                          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {topic.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            بواسطة {topic.author}
                          </span>
                          <div 
                            className="inline-flex items-center px-2 py-0.5 text-xs text-white rounded"
                            style={{ backgroundColor: topic.categoryColor }}
                          >
                            {topic.category}
                          </div>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {topic.replies} رد
                          </span>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {topic.views} مشاهدة
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePinTopic(topic.id, topic.isPinned)}
                          className={topic.isPinned ? 'text-orange-500' : ''}
                        >
                          <Pin className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLockTopic(topic.id, topic.isLocked)}
                          className={topic.isLocked ? 'text-red-500' : ''}
                        >
                          {topic.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => startEditTopic(topic)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteTopic(topic.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                إدارة الفئات
              </h2>
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => setShowCategoryModal(true)}
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة فئة جديدة
              </Button>
            </div>

            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-6 h-6 rounded-lg" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <div>
                          <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {category.name}
                          </h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {category.description || 'لا يوجد وصف'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {category.topicsCount}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>موضوع</p>
                        </div>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? 'نشطة' : 'غير نشطة'}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => startEditCategory(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                إدارة المواضيع
              </h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="البحث في المواضيع..." 
                    className={`pr-10 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>

            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentTopics.map((topic) => (
                    <div key={topic.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {topic.isPinned && <Pin className="w-4 h-4 text-orange-500" />}
                          {topic.isLocked && <Lock className="w-4 h-4 text-red-500" />}
                          <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {topic.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            بواسطة {topic.author}
                          </span>
                          <div 
                            className="inline-flex items-center px-2 py-0.5 text-xs text-white rounded"
                            style={{ backgroundColor: topic.categoryColor }}
                          >
                            {topic.category}
                          </div>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {topic.replies} رد
                          </span>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {topic.views} مشاهدة
                          </span>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(topic.createdAt).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              calendar: 'gregory',
                              numberingSystem: 'latn'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePinTopic(topic.id, topic.isPinned)}
                          className={topic.isPinned ? 'text-orange-500' : ''}
                        >
                          <Pin className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLockTopic(topic.id, topic.isLocked)}
                          className={topic.isLocked ? 'text-red-500' : ''}
                        >
                          {topic.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(`/forum/topic/${topic.id}`, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => startEditTopic(topic)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteTopic(topic.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                إعدادات المنتدى
              </h2>
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => setShowSettingsModal(true)}
              >
                <Settings className="w-4 h-4 ml-2" />
                تعديل الإعدادات
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>الإعدادات العامة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      اسم المنتدى
                    </label>
                    <Input 
                      defaultValue={settings.forum_name || "منتدى سبق"} 
                      className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      وصف المنتدى
                    </label>
                    <Textarea 
                      defaultValue={settings.forum_description || "مجتمع النقاش والحوار"}
                      className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <Button 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => saveSettings(settings)}
                  >
                    حفظ التغييرات
                  </Button>
                </CardContent>
              </Card>

              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>إعدادات المشاركة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>السماح للضيوف بالقراءة</span>
                    <input 
                      type="checkbox" 
                      defaultChecked={settings.allow_guest_read !== false}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>مراجعة المواضيع الجديدة</span>
                    <input 
                      type="checkbox" 
                      defaultChecked={settings.require_moderation === true}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>السماح بتعديل المشاركات</span>
                    <input 
                      type="checkbox" 
                      defaultChecked={settings.allow_edit_posts !== false}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <Button 
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => saveSettings(settings)}
                  >
                    حفظ التغييرات
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* نافذة إنشاء فئة جديدة */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              إنشاء فئة جديدة
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  اسم الفئة (عربي)
                </label>
                <Input 
                  value={newCategory.name_ar}
                  onChange={(e) => setNewCategory({...newCategory, name_ar: e.target.value})}
                  className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="أدخل اسم الفئة"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  اسم الفئة (إنجليزي)
                </label>
                <Input 
                  value={newCategory.name_en}
                  onChange={(e) => setNewCategory({...newCategory, name_en: e.target.value})}
                  className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  رابط الفئة
                </label>
                <Input 
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
                  className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="category-slug"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  وصف الفئة
                </label>
                <Textarea 
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="وصف مختصر للفئة"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  لون الفئة
                </label>
                <Input 
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                  className="w-full h-10"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={createCategory}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                إنشاء الفئة
              </Button>
              <Button 
                onClick={() => setShowCategoryModal(false)}
                variant="outline"
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تعديل الإعدادات */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              تعديل إعدادات المنتدى
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    اسم المنتدى
                  </label>
                  <Input 
                    defaultValue={settings.forum_name || "منتدى سبق"}
                    className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    الحد الأقصى للمواضيع يومياً
                  </label>
                  <Input 
                    type="number"
                    defaultValue={settings.max_topics_per_day || 10}
                    className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  وصف المنتدى
                </label>
                <Textarea 
                  defaultValue={settings.forum_description || "مجتمع النقاش والحوار"}
                  className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>السماح للضيوف بالقراءة</span>
                  <input 
                    type="checkbox" 
                    defaultChecked={settings.allow_guest_read !== false}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>مراجعة المواضيع الجديدة</span>
                  <input 
                    type="checkbox" 
                    defaultChecked={settings.require_moderation === true}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>السماح بتعديل المشاركات</span>
                  <input 
                    type="checkbox" 
                    defaultChecked={settings.allow_edit_posts !== false}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>تفعيل نظام السمعة</span>
                  <input 
                    type="checkbox" 
                    defaultChecked={settings.enable_reputation !== false}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>تفعيل الأوسمة</span>
                  <input 
                    type="checkbox" 
                    defaultChecked={settings.enable_badges !== false}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={() => saveSettings(settings)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                حفظ الإعدادات
              </Button>
              <Button 
                onClick={() => setShowSettingsModal(false)}
                variant="outline"
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تعديل الموضوع */}
      {editingTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              تعديل الموضوع
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  عنوان الموضوع
                </label>
                <Input 
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  محتوى الموضوع
                </label>
                <Textarea 
                  value={editForm.content}
                  onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                  className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} min-h-[200px]`}
                  placeholder="أدخل محتوى الموضوع..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={() => saveEditTopic(editingTopic)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                حفظ التغييرات
              </Button>
              <Button 
                onClick={() => {
                  setEditingTopic(null);
                  setEditForm({ title: '', content: '' });
                }}
                variant="outline"
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تعديل الفئة */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              تعديل الفئة
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  اسم الفئة
                </label>
                <Input 
                  value={editCategoryForm.name}
                  onChange={(e) => setEditCategoryForm({...editCategoryForm, name: e.target.value})}
                  className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  وصف الفئة
                </label>
                <Textarea 
                  value={editCategoryForm.description}
                  onChange={(e) => setEditCategoryForm({...editCategoryForm, description: e.target.value})}
                  className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  لون الفئة
                </label>
                <Input 
                  type="color"
                  value={editCategoryForm.color}
                  onChange={(e) => setEditCategoryForm({...editCategoryForm, color: e.target.value})}
                  className="w-full h-10"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={() => saveEditCategory(editingCategory)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                حفظ التغييرات
              </Button>
              <Button 
                onClick={() => {
                  setEditingCategory(null);
                  setEditCategoryForm({ name: '', description: '', color: '#3B82F6' });
                }}
                variant="outline"
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}