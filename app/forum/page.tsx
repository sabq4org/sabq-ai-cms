'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, MessageSquare, ThumbsUp, Eye, Search, Plus, TrendingUp, MessageCircle, Users, Award, HelpCircle, Lightbulb, Hash, Clock, Pin, Bug, Megaphone } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import "./forum.css";

// مكون للوصول الآمن إلى theme context
function useTheme() {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // محاولة قراءة الثيم من localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // التحقق من system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }

    // الاستماع لتغييرات الثيم
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    };

    window.addEventListener('storage', handleThemeChange);
    return () => window.removeEventListener('storage', handleThemeChange);
  }, []);

  return { theme: theme as 'light' | 'dark', mounted };
}

// مكون إحصائيات المنتدى
function ForumStats({ darkMode }: { darkMode: boolean }) {
  const [stats, setStats] = useState({
    topics: 0,
    replies: 0,
    members: 0,
    activeMembers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // جلب إحصائيات حقيقية من قاعدة البيانات
        const promises = [
          fetch('/api/forum/topics?limit=1').then(r => r.json()), // للحصول على العدد الإجمالي
          fetch('/api/forum/replies?topic_id=dummy&limit=1').catch(() => ({ pagination: { total: 0 } })), // تجريبي
        ];

        const [topicsData] = await Promise.all(promises);
        
        setStats({
          topics: topicsData.pagination?.total || 0,
          replies: 0, // سيتم حسابه لاحقاً
          members: 0, // سيتم حسابه لاحقاً
          activeMembers: 0 // سيتم حسابه لاحقاً
        });
      } catch (error) {
        console.error('Error fetching forum stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-md`}>
        <CardHeader className="pb-4">
          <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>إحصائيات المنتدى</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center justify-between">
              <div className={`h-4 w-20 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded animate-pulse`}></div>
              <div className={`h-4 w-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded animate-pulse`}></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-md`}>
      <CardHeader className="pb-4">
        <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>إحصائيات المنتدى</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>المواضيع</span>
          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`} dir="ltr">{stats.topics.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>الردود</span>
          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`} dir="ltr">{stats.replies.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>الأعضاء</span>
          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`} dir="ltr">{stats.members.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>الأعضاء النشطون</span>
          <span className="font-bold text-green-600" dir="ltr">{stats.activeMembers.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// مكون أفضل الأعضاء
function TopMembers({ darkMode }: { darkMode: boolean }) {
  const [topMembers, setTopMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopMembers = async () => {
      try {
        setLoading(true);
        // TODO: إنشاء API للحصول على أفضل الأعضاء من جدول forum_reputation
        // حالياً سنستخدم placeholder
        setTopMembers([]);
      } catch (error) {
        console.error('Error fetching top members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMembers();
  }, []);

  if (loading) {
    return (
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-md`}>
        <CardHeader className="pb-4">
          <CardTitle className={`text-lg flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Award className="w-5 h-5 text-yellow-500" />
            أفضل الأعضاء
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded animate-pulse`}></div>
              <div className={`w-8 h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full animate-pulse`}></div>
              <div className={`h-4 flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded animate-pulse`}></div>
              <div className={`h-4 w-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded animate-pulse`}></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-md`}>
      <CardHeader className="pb-4">
        <CardTitle className={`text-lg flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <Award className="w-5 h-5 text-yellow-500" />
          أفضل الأعضاء
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topMembers.length > 0 ? (
          topMembers.map((user, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className={`text-2xl font-bold w-8 ${
                index === 0 ? 'text-yellow-500' :
                index === 1 ? 'text-gray-400' :
                'text-orange-600'
              }`}>{index + 1}</span>
              <Avatar className="w-8 h-8">
                <AvatarFallback className={`text-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}>
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <span className={`flex-1 text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {user.name}
              </span>
              <span className="text-sm font-bold text-yellow-600" dir="ltr">{user.points}</span>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>لا توجد بيانات متاحة حالياً</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// تعريف أنواع البيانات
interface Topic {
  id: string;
  title: string;
  content: string;
  views: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_featured: boolean;
  created_at: string;
  last_reply_at: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  replies: number;
  likes: number;
  lastReply: string;
}
export default function SabqForum() {
  const [searchQuery, setSearchQuery] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([
    { id: 'all', name: 'جميع المواضيع', icon: Hash, color: 'bg-gray-500' }
  ]);
  
  const { theme, mounted } = useTheme();
  const darkMode = theme === 'dark';
  
  // جلب المواضيع من API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        console.log('Fetching topics with category:', selectedCategory);
        const response = await fetch(`/api/forum/topics?${params}`);
        const data = await response.json();
        if (data.topics) {
          setTopics(data.topics);
        } else {
          setTopics([]);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [selectedCategory]);
  
  // جلب الفئات من API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/forum/categories');
        const data = await response.json();
        if (data.categories) {
          // ربط الأيقونات بناءً على slug الفئة
          const iconMap: { [key: string]: React.ComponentType<any> } = {
            'general': MessageCircle,
            'requests': Lightbulb,
            'bugs': Bug,
            'help': HelpCircle,
            'announcements': Megaphone
          };
          
          const allCategories = [
            { id: 'all', name: 'جميع المواضيع', icon: Hash, color: '#6B7280', slug: 'all' },
            ...data.categories.map((cat: any) => ({
              id: cat.slug,
              name: cat.name,
              icon: iconMap[cat.slug] || MessageCircle,
              color: cat.color || '#3B82F6',
              slug: cat.slug
            }))
          ];
          setCategories(allCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);
  
  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900"></div>;
  }
  return (
  <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} dir="rtl">
      {/* الهيدر الرسمي للصحيفة */}
      {/* رأس صفحة المنتدى */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* العنوان */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  darkMode ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                } shadow-lg`}>
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>منتدى سبق</h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>مجتمع النقاش والحوار</p>
                </div>
              </div>
            </div>
            {/* أدوات البحث والإجراءات */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  placeholder="ابحث في المواضيع..." 
                  className={`pr-10 w-full ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300'
                  }`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim().length > 1) {
                      window.location.href = `/forum/search?q=${encodeURIComponent(searchQuery.trim())}`;
                    }
                  }}
                />
              </div>
              <Button variant="ghost" size="icon" className={`shrink-0 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}>
                <Bell className="w-5 h-5" />
              </Button>
              <Link href="/forum/new-topic">
                <Button className="shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md">
                  <Plus className="w-5 h-5 ml-2" />
                  موضوع جديد
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* الشريط الجانبي - الفئات والإحصائيات */}
          <div className="lg:col-span-1 space-y-6">
            {/* الفئات */}
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-md`}>
              <CardHeader className="pb-4">
                <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>الفئات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 relative overflow-hidden group ${
                        isSelected
                          ? darkMode 
                            ? 'bg-gray-700/50' 
                            : 'bg-gray-50'
                          : darkMode 
                            ? 'hover:bg-gray-700/30' 
                            : 'hover:bg-gray-50/50'
                      }`}
                      style={{
                        borderLeft: `4px solid ${category.color}`,
                        backgroundColor: isSelected 
                          ? `${category.color}10` 
                          : undefined
                      }}
                    >
                      {/* شريط لوني متحرك عند التحديد */}
                      {isSelected && (
                        <div 
                          className="absolute inset-y-0 left-0 w-1 transition-all duration-300"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      
                      {/* دائرة اللون */}
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-110"
                        style={{ backgroundColor: category.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      {/* اسم الفئة */}
                      <span className={`flex-1 text-right font-medium transition-colors duration-200 ${
                        isSelected 
                          ? darkMode ? 'text-white' : 'text-gray-900'
                          : darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {category.name}
                      </span>
                      
                      {/* مؤشر عدد المواضيع (يمكن إضافته لاحقاً) */}
                      {category.id !== 'all' && (
                        <span 
                          className={`text-xs px-2 py-0.5 rounded-full transition-all duration-200 ${
                            isSelected
                              ? 'text-white'
                              : darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                          style={{
                            backgroundColor: isSelected ? category.color : undefined,
                            color: isSelected ? 'white' : undefined
                          }}
                        >
                          {/* عدد المواضيع سيضاف لاحقاً */}
                        </span>
                      )}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
            {/* إحصائيات المنتدى */}
            <ForumStats darkMode={darkMode} />
            {/* أفضل الأعضاء */}
            <TopMembers darkMode={darkMode} />
          </div>
          {/* قائمة المواضيع */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {categories.find(c => c.id === selectedCategory)?.name || 'جميع المواضيع'}
              </h2>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>محدث منذ دقيقة</span>
              </div>
            </div>
            {loading ? (
              // عرض التحميل
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className={`animate-pulse ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full`}></div>
                        <div className="flex-1 space-y-3">
                          <div className={`h-5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4`}></div>
                          <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2`}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : topics.length > 0 ? (
              <div className="space-y-4">
                {topics.map((topic) => (
                  <Link key={topic.id} href={`/forum/topic/${topic.id}`}>
                    <Card className={`hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                      darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {/* صورة المؤلف */}
                          <Avatar className="w-12 h-12 shrink-0">
                            <AvatarFallback className={`font-bold ${
                              darkMode ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                            }`}>
                              {topic.author.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          {/* محتوى الموضوع */}
                          <div className="flex-1 min-w-0">
                            {/* العنوان والفئة */}
                            <div className="flex items-start gap-3 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {topic.is_pinned && (
                                    <Pin className="w-4 h-4 text-orange-500" />
                                  )}
                                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {topic.title}
                                  </h3>
                                </div>
                                <span 
                                  className="inline-flex items-center text-white text-xs px-2 py-0.5 rounded-full font-medium"
                                  style={{ backgroundColor: topic.category.color }}
                                >
                                  {topic.category.name}
                                </span>
                              </div>
                            </div>
                            {/* معلومات المؤلف والوقت */}
                            <div className={`flex items-center gap-2 text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <span className="font-medium">{topic.author.name}</span>
                              <span>•</span>
                              <Clock className="w-3 h-3" />
                              <span>{topic.lastReply}</span>
                            </div>
                            {/* الإحصائيات */}
                            <div className="flex items-center gap-6 text-sm">
                              <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <MessageSquare className="w-4 h-4" />
                                <span className="font-medium" dir="ltr">{topic.replies}</span>
                                <span>رد</span>
                              </div>
                              <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <Eye className="w-4 h-4" />
                                <span className="font-medium" dir="ltr">{topic.views}</span>
                                <span>مشاهدة</span>
                              </div>
                              <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <ThumbsUp className="w-4 h-4" />
                                <span className="font-medium" dir="ltr">{topic.likes}</span>
                                <span>إعجاب</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardContent className="p-12 text-center">
                  <MessageCircle className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-lg`}>لا توجد مواضيع في هذه الفئة</p>
                  <Link href="/forum/new-topic">
                    <Button className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                      <Plus className="w-4 h-4 ml-2" />
                      ابدأ أول موضوع
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}