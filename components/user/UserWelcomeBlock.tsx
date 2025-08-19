'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Award, Brain, Target, TrendingUp } from 'lucide-react';

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

  return (
    <div 
      className="welcome-block"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--accent) / 0.1) 0%, hsl(var(--accent) / 0.05) 100%)',
        border: '1px solid hsl(var(--accent) / 0.2)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
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
        {/* الترحيب والتاريخ */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'hsl(var(--fg))',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {getTimeBasedGreeting()}{user ? ` يا ${user.name}` : ''}
            <span style={{ fontSize: '24px' }}>👋</span>
          </h2>
          
          <p style={{
            fontSize: '14px',
            color: 'hsl(var(--muted))',
            marginBottom: '12px'
          }}>
            {formatDate()}
          </p>
        </div>

        {/* الاقتباس التحفيزي */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          background: 'hsl(var(--bg) / 0.8)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            background: 'hsl(var(--accent) / 0.1)',
            borderRadius: '10px'
          }}>
            {currentQuote.emoji}
          </div>
          
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: '16px',
              color: 'hsl(var(--fg))',
              fontWeight: '500',
              margin: 0,
              lineHeight: '1.6'
            }}>
              {currentQuote.text}
            </p>
            <p style={{
              fontSize: '12px',
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

        {/* نقاط الولاء ومعلومات AI */}
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(221, 214, 254, 0.1) 0%, rgba(221, 214, 254, 0.05) 100%)',
          borderRadius: '12px',
          border: '1px solid hsl(var(--line) / 0.5)'
        }}>
          {/* نقاط الولاء */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                borderRadius: '8px',
                color: 'white'
              }}>
                <Award style={{ width: '20px', height: '20px' }} />
              </div>
              <div>
                <p style={{
                  fontSize: '14px',
                  color: 'hsl(var(--muted))',
                  margin: 0
                }}>
                  نقاط الولاء
                </p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'hsl(var(--fg))',
                  margin: 0
                }}>
                  1,250 نقطة
                </p>
              </div>
            </div>
            
            <div style={{
              padding: '6px 12px',
              background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#4C1D95'
            }}>
              مستوى ذهبي
            </div>
          </div>

          {/* معلومات AI من الملف الشخصي */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            {/* اهتمامات مخصصة */}
            <div style={{
              padding: '12px',
              background: 'hsl(var(--bg) / 0.8)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Brain style={{ width: '18px', height: '18px', color: '#7C3AED' }} />
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '12px',
                  color: 'hsl(var(--muted))',
                  margin: 0
                }}>
                  اهتماماتك المحددة
                </p>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'hsl(var(--fg))',
                  margin: '2px 0 0 0'
                }}>
                  التقنية، الاقتصاد، الرياضة
                </p>
              </div>
            </div>

            {/* دقة التوصيات */}
            <div style={{
              padding: '12px',
              background: 'hsl(var(--bg) / 0.8)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Target style={{ width: '18px', height: '18px', color: '#7C3AED' }} />
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '12px',
                  color: 'hsl(var(--muted))',
                  margin: 0
                }}>
                  دقة التوصيات
                </p>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'hsl(var(--fg))',
                  margin: '2px 0 0 0'
                }}>
                  92% توافق
                </p>
              </div>
            </div>

            {/* نشاط القراءة */}
            <div style={{
              padding: '12px',
              background: 'hsl(var(--bg) / 0.8)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <TrendingUp style={{ width: '18px', height: '18px', color: '#7C3AED' }} />
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '12px',
                  color: 'hsl(var(--muted))',
                  margin: 0
                }}>
                  نشاط القراءة
                </p>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'hsl(var(--fg))',
                  margin: '2px 0 0 0'
                }}>
                  45 دقيقة يومياً
                </p>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
