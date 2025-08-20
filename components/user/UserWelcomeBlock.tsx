'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserInterests } from '@/hooks/useUserInterests';
import { Sparkles, Award, Brain, Target } from 'lucide-react';

const greetings = [
  "أهلاً وسهلاً",
  "مرحباً بك",
  "تشرفنا بزيارتك",
  "سعداء بوجودك معنا",
  "أهلاً بعودتك"
];

const motivationalQuotes = [
  { text: "المعرفة قوة، والقراءة نافذتك على العالم", emoji: "📚" },
  { text: "كل يوم جديد فرصة لاكتشاف قصص ملهمة", emoji: "🌟" },
  { text: "ابقَ على اطلاع، كن جزءاً من الحدث", emoji: "🎯" },
  { text: "معاً نصنع مجتمعاً واعياً ومطلعاً", emoji: "🤝" },
  { text: "قراءتك اليوم تصنع رؤيتك للغد", emoji: "🔮" },
  { text: "الأخبار الموثوقة بداية القرار الصائب", emoji: "💡" },
  { text: "كن أول من يعرف، وأول من يفهم", emoji: "🚀" },
  { text: "رحلتك في عالم المعرفة تبدأ من هنا", emoji: "🗺️" }
];

export default function UserWelcomeBlock() {
  const { user } = useAuth();
  const { getInterestNames, hasInterests, loading: interestsLoading } = useUserInterests();
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [currentGreeting, setCurrentGreeting] = useState(greetings[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // تحديث الوقت كل دقيقة
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // اختيار تحية واقتباس عشوائي
    setCurrentGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
    setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

    return () => clearInterval(timer);
  }, []);

  // تحديد التحية بناءً على وقت اليوم
  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "صباح الخير";
    if (hour < 18) return "مساء الخير";
    return "مساء الخير";
  };

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return currentTime.toLocaleDateString('ar-SA', options);
  };

  // كشف النسخة الخفيفة (موبايل)
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  useEffect(() => {
    const handle = () => {
      try {
        const w = window.innerWidth;
        const touch = 'ontouchstart' in window || (navigator as any).maxTouchPoints > 0;
        setIsMobile(w < 768 || (touch && w < 1024));
      } catch {
        setIsMobile(false);
      }
    };
    handle();
    window.addEventListener('resize', handle, { passive: true } as any);
    return () => window.removeEventListener('resize', handle as any);
  }, []);

  return (
    <div 
      className="welcome-block"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--accent) / 0.1) 0%, hsl(var(--accent) / 0.05) 100%)',
        border: '1px solid hsl(var(--accent) / 0.2)',
        borderRadius: isMobile ? '12px' : '16px',
        padding: isMobile ? '16px' : '24px',
        marginBottom: isMobile ? '28px' : '36px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* تأثير بصري خلفي */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '300px',
        height: '300px',
        background: `radial-gradient(circle, hsl(var(--accent) / 0.15) 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* الترحيب فقط (تم نقل شريط التاريخ/الولاء لخارج البلوك) */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{
            fontSize: isMobile ? '22px' : '28px',
            fontWeight: 700,
            color: 'hsl(var(--fg))',
            marginBottom: isMobile ? '6px' : '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {getTimeBasedGreeting()}{user ? ` يا ${user.name}` : ''}
            <span style={{ fontSize: '24px' }}>👋</span>
          </h2>
        </div>

        {/* الاقتباس التحفيزي */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '10px' : '12px',
          padding: isMobile ? '12px' : '16px',
          background: 'hsl(var(--bg) / 0.8)',
          borderRadius: isMobile ? '10px' : '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            width: isMobile ? '36px' : '40px',
            height: isMobile ? '36px' : '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            background: 'hsl(var(--accent) / 0.1)',
            borderRadius: isMobile ? '8px' : '10px'
          }}>
            {currentQuote.emoji}
          </div>
          
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: isMobile ? '14px' : '16px',
              color: 'hsl(var(--fg))',
              fontWeight: '500',
              margin: 0,
              lineHeight: '1.6'
            }}>
              {currentQuote.text}
            </p>
            <p style={{
              fontSize: isMobile ? '11px' : '12px',
              color: 'hsl(var(--muted))',
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Sparkles style={{ width: '12px', height: '12px' }} />
              حكمة اليوم
            </p>
          </div>
        </div>

        {/* معلومات AI المخصصة أو دعوة للتسجيل */}
        {user ? (
          <div style={{
            marginTop: isMobile ? '12px' : '16px',
            display: 'flex',
            gap: isMobile ? '10px' : '12px',
            fontSize: isMobile ? '12px' : '13px',
            color: 'hsl(var(--muted))',
            flexWrap: 'wrap'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Brain style={{ width: '14px', height: '14px', color: '#7C3AED' }} />
              اهتماماتك: <strong style={{ color: hasInterests ? 'hsl(var(--fg))' : '#7C3AED' }}>
                {interestsLoading ? 'جاري التحميل...' : (
                  hasInterests ? getInterestNames() : (
                    <a 
                      href="/profile" 
                      style={{ 
                        color: '#7C3AED', 
                        textDecoration: 'underline',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      حدد اهتماماتك الآن
                    </a>
                  )
                )}
              </strong>
            </span>
            <span style={{ color: 'hsl(var(--line))' }}>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Target style={{ width: '14px', height: '14px', color: '#7C3AED' }} />
              دقة التوصيات: <strong style={{ color: 'hsl(var(--fg))' }}>92%</strong>
            </span>
          </div>
        ) : (
          // عرض رسالة للمستخدمين غير مسجلين الدخول
          <div style={{
            marginTop: '16px',
            fontSize: '12px',
            color: 'hsl(var(--muted))',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Sparkles style={{ width: '12px', height: '12px', color: '#7C3AED' }} />
            للحصول على محتوى مخصص حسب اهتماماتك{' '}
            <a 
              href="/login" 
              style={{ 
                color: 'hsl(var(--accent))', 
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              سجل دخولك
            </a>
            {' '}أو{' '}
            <a 
              href="/register" 
              style={{ 
                color: 'hsl(var(--accent))', 
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              أنشئ حساباً جديداً
            </a>
          </div>
        )}


      </div>
    </div>
  );
}
