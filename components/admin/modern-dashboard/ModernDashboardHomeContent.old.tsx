/**
 * محتوى لوحة التحكم الحديثة - مع تحسين العرض
 * Modern Dashboard Content - With Improved Layout
 */

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from "@/contexts/EnhancedAuthContextWithSSR";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Bell,
  Eye,
  FileText,
  MessageSquare,
  Settings,
  Users,
  Plus,
  Menu,
  X,
} from "lucide-react";

export default function ModernDashboardHomeContent() {
  const { user } = useAuth();
  const isAdmin = !!(user && (user.is_admin || user.role === 'admin' || user.role === 'super_admin' || user.role === 'system_admin'));
  const [currentTheme, setCurrentTheme] = useState('blue');
  const [activeTab, setActiveTab] = useState('overview');
  
  // عبارات محفزة بروح AI
  const aiMotivationalMessages = [
    "🚀 معاً نبني مستقبل الذكاء الاصطناعي في الإعلام",
    "⚡ نحول الأفكار إلى محتوى ذكي ومؤثر", 
    "🎯 كل مقال قصة، وكل قصة تغيير",
    "💡 الإبداع يلتقي بالذكاء الاصطناعي هنا",
    "🌟 نصنع المحتوى الذي يشكل المستقبل",
    "🔮 نرى ما لا يراه الآخرون في البيانات",
    "🎨 نحول الأرقام إلى قصص ملهمة"
  ];
  
  const [currentMessage, setCurrentMessage] = useState(() => 
    aiMotivationalMessages[Math.floor(Math.random() * aiMotivationalMessages.length)]
  );

  // ثيمات الألوان
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

  // بيانات الإحصائيات
  const statsData = [
    {
      title: "إجمالي الزوار",
      value: "45.2k",
      icon: Users,
      change: 12.5,
      changeType: "increase" as const,
    },
    {
      title: "مشاهدات الصفحة", 
      value: "128.4k",
      icon: Eye,
      change: 8.2,
      changeType: "increase" as const,
    },
    {
      title: "المقالات",
      value: "1,247",
      icon: FileText,
      change: -2.1,
      changeType: "decrease" as const,
    },
    {
      title: "التعليقات",
      value: "896",
      icon: MessageSquare,
      change: 15.3,
      changeType: "increase" as const,
    },
  ];

  // الأنشطة الحديثة
  const recentActivities = [
    {
      title: "تم نشر مقال جديد",
      time: "5 دقائق",
      type: "article",
      icon: FileText,
    },
    {
      title: "تعليق جديد على مقال",
      time: "12 دقيقة", 
      type: "comment",
      icon: MessageSquare,
    },
    { 
      title: "مستخدم جديد انضم", 
      time: "30 دقيقة", 
      type: "user", 
      icon: Users 
    },
    { 
      title: "تحديث في النظام", 
      time: "1 ساعة", 
      type: "system", 
      icon: Activity 
    },
  ];

  // حالة الأنظمة الذكية
  const aiSystemsStatus = [
    { name: "تحليل المشاعر", status: "active", accuracy: 94.2, color: "green" },
    { name: "التوصيات الذكية", status: "active", accuracy: 91.8, color: "green" },
    { name: "البحث الذكي", status: "active", accuracy: 96.1, color: "green" },
    {
      name: "تصنيف المحتوى",
      status: "maintenance", 
      accuracy: 88.5,
      color: "yellow",
    },
  ];

  // مكون بطاقة الإحصائيات
  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    changeType 
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    change?: number;
    changeType?: 'increase' | 'decrease';
  }) => {
    const ChangeIcon = changeType === 'increase' ? ArrowUpRight : ArrowDownRight;
    
    return (
      <div className="card">
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ChangeIcon style={{ 
                width: '14px', 
                height: '14px',
                color: changeType === 'increase' ? '#10b981' : '#ef4444'
              }} />
              <span className="text-xs" style={{ 
                color: changeType === 'increase' ? '#10b981' : '#ef4444' 
              }}>
                {Math.abs(change || 0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* رسالة الترحيب AI */}
      <div className="card card-accent" style={{ 
        textAlign: 'center',
        background: 'hsl(var(--bg))',
        border: '1px solid hsl(var(--accent) / 0.2)',
        padding: '24px',
        borderLeftWidth: '4px'
      }}>
        <div style={{ fontSize: '28px', marginBottom: '12px' }}>🤖</div>
        <div className="card-title" style={{ fontSize: '20px', marginBottom: '8px', lineHeight: '1.2' }}>
          مرحباً يا {user?.name || 'مستخدم'} 
        </div>
        <div className="card-subtitle" style={{ 
          marginBottom: '20px', 
          fontSize: '14px', 
          color: 'hsl(var(--accent))',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onClick={() => {
          const newMessage = aiMotivationalMessages[Math.floor(Math.random() * aiMotivationalMessages.length)];
          setCurrentMessage(newMessage);
        }}
        title="اضغط للحصول على رسالة جديدة"
        >
          {isAdmin ? currentMessage : 'وضع عرض محدود للمستخدمين غير الإداريين'}
        </div>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              className={`btn btn-sm ${currentTheme === key ? 'btn-primary' : ''}`}
              onClick={() => applyTheme(key)}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="stats-grid grid grid-4" style={{ gap: '16px' }}>
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* التبويبات */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📊 تحليلات مفصلة</div>
          <div className="card-subtitle">عرض البيانات حسب نوع التحليل</div>
        </div>

        {/* التبويبات */}
        <div className="tabbar">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📈 نظرة عامة
          </button>
          <button 
            className={`tab ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            🔔 الأنشطة الحديثة  
          </button>
          <button 
            className={`tab ${activeTab === 'ai-systems' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-systems')}
          >
            🤖 الأنظمة الذكية
          </button>
        </div>

        {/* محتوى التبويبات */}
        <div>
          {activeTab === 'overview' && (
            <div className="divide-list">
              <div className="list-item">
                <div>
                  <div className="text-base">📊 متوسط الزيارات اليومية</div>
                  <div className="text-sm text-muted">عدد الزوار الفريدين يومياً</div>
                </div>
                <div className="text-lg" style={{ fontWeight: '600', color: 'hsl(var(--accent))' }}>
                  12,450
                </div>
              </div>
              <div className="list-item">
                <div>
                  <div className="text-base">⏱️ متوسط وقت القراءة</div>
                  <div className="text-sm text-muted">الوقت المُقضي في قراءة المحتوى</div>
                </div>
                <div className="text-lg" style={{ fontWeight: '600', color: 'hsl(var(--accent))' }}>
                  4:32 دقيقة
                </div>
              </div>
              <div className="list-item">
                <div>
                  <div className="text-base">📈 معدل النمو الشهري</div>
                  <div className="text-sm text-muted">نمو المنصة والمحتوى</div>
                </div>
                <div className="text-lg" style={{ fontWeight: '600', color: '#10b981' }}>
                  +18.5%
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="divide-list">
              {recentActivities.map((activity, index) => (
                <div key={index} className="list-item">
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
                      <activity.icon style={{ width: '16px', height: '16px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="text-sm">{activity.title}</div>
                      <div className="text-xs text-muted">منذ {activity.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ai-systems' && (
            <div className="divide-list">
              {aiSystemsStatus.map((system, index) => (
                <div key={index} className="list-item">
                  <div>
                    <div className="text-base">{system.name}</div>
                    <div className="text-sm text-muted">دقة النظام: {system.accuracy}%</div>
                  </div>
                  <div className={`chip ${
                    system.status === 'active' ? '' : 'chip-muted'
                  }`} style={{
                    background: system.status === 'active' ? '#10b981' : '#f59e0b',
                    color: 'white',
                    border: 'none'
                  }}>
                    {system.status === 'active' ? '✅ نشط' : '⚠️ صيانة'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* أدوات الإدارة السريعة */}
      <div className="grid grid-2" style={{ gap: '16px' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">⚡ إجراءات سريعة</div>
            <div className="card-subtitle">المهام الإدارية الشائعة</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/admin/articles/create" className="btn btn-primary">
              <Plus style={{ width: '16px', height: '16px' }} />
              إنشاء مقال جديد
            </Link>
            <Link href="/admin/news/create" className="btn">
              📰 إضافة خبر عاجل
            </Link>
            <Link href="/admin/analytics" className="btn">
              <BarChart3 style={{ width: '16px', height: '16px' }} />
              تقارير مفصلة
            </Link>
            <Link href="/admin/users" className="btn">
              <Users style={{ width: '16px', height: '16px' }} />
              إدارة المستخدمين
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">🎯 حالة النظام</div>
            <div className="card-subtitle">مراقبة الأداء والخدمات</div>
          </div>
          
          <div className="divide-list">
            <div className="list-item">
              <div>
                <div className="text-sm">خادم قاعدة البيانات</div>
                <div className="text-xs text-muted">استجابة ممتازة</div>
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
                <div className="text-xs text-muted">78% مستخدم من 500GB</div>
              </div>
              <div className="chip chip-muted">
                💾 جيد
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
