'use client';

import React, { useState, useEffect } from 'react';
import { 
  SparklesIcon,
  ChartBarIcon,
  TagIcon,
  ClockIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  BoltIcon,
  UserIcon,
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  PlayIcon,
  PauseIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// مكون التوصيات الذكية المحدث
export const SmartRecommendations: React.FC<{ currentArticleId?: string }> = ({ currentArticleId }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاكاة جلب التوصيات الذكية
    setTimeout(() => {
      setRecommendations([
        {
          id: '1',
          title: 'تحليل عميق: مستقبل الطاقة المتجددة في المنطقة',
          confidence: 94,
          reason: 'يتماشى مع اهتماماتك في البيئة والتكنولوجيا',
          category: 'تحليل',
          readTime: 8,
          type: 'analysis'
        },
        {
          id: '2', 
          title: 'رأي: التحول الرقمي وأثره على المجتمع',
          confidence: 87,
          reason: 'مقالات مماثلة قرأتها مؤخراً',
          category: 'رأي',
          readTime: 12,
          type: 'opinion'
        },
        {
          id: '3',
          title: 'اختراقات علمية جديدة في مجال الذكاء الاصطناعي',
          confidence: 91,
          reason: 'موضوع رائج في قطاع اهتمامك',
          category: 'علوم',
          readTime: 15,
          type: 'research'
        }
      ]);
      setLoading(false);
    }, 800);
  }, [currentArticleId]);

  if (loading) {
    return (
      <div className="modern-card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
        <div className="loading" style={{ margin: '0 auto var(--space-md)' }}></div>
        <p className="text-secondary">جاري تحضير التوصيات الذكية...</p>
      </div>
    );
  }

  return (
    <div className="modern-card" style={{ padding: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <SparklesIcon style={{ width: '28px', height: '28px', color: 'var(--primary-blue)' }} />
        <div>
          <h3 className="heading-card">محتوى مخصص لك بذكاء</h3>
          <p className="text-secondary">مختار بناءً على تفضيلاتك وسلوك القراءة</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {recommendations.map((rec, index) => (
          <div 
            key={rec.id}
            className="interactive"
            style={{
              padding: 'var(--space-lg)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--background-white)',
              position: 'relative',
              animationDelay: `${index * 0.1}s`
            }}
          >
            {/* مؤشر الثقة */}
            <div style={{
              position: 'absolute',
              top: 'var(--space-md)',
              left: 'var(--space-md)',
              background: `linear-gradient(90deg, var(--primary-blue), var(--primary-blue-hover))`,
              color: 'white',
              padding: 'var(--space-xs) var(--space-sm)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-bold)'
            }}>
              {rec.confidence}% مطابق
            </div>

            {/* نوع المحتوى */}
            <div style={{ marginBottom: 'var(--space-sm)' }}>
              <span className={`badge-${rec.type === 'analysis' ? 'primary' : 'secondary'}`}>
                {rec.type === 'analysis' && '🧠'}
                {rec.type === 'opinion' && '✍️'}
                {rec.type === 'research' && '🔬'}
                {rec.category}
              </span>
            </div>

            {/* العنوان */}
            <h4 style={{ 
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              marginBottom: 'var(--space-sm)',
              color: 'var(--text-primary)'
            }}>
              {rec.title}
            </h4>

            {/* السبب */}
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-md)'
            }}>
              💡 {rec.reason}
            </p>

            {/* معلومات إضافية */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              paddingTop: 'var(--space-sm)',
              borderTop: '1px solid var(--border-light)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                  <ClockIcon style={{ width: '14px', height: '14px', color: 'var(--text-secondary)' }} />
                  <span className="text-caption">{rec.readTime} دقيقة</span>
                </div>
              </div>
              
              <button className="btn-primary" style={{ 
                padding: 'var(--space-xs) var(--space-md)',
                fontSize: 'var(--text-sm)'
              }}>
                قراءة الآن
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// مكون الجرعات الذكية المحدث
export const SmartDoses: React.FC = () => {
  const [doses, setDoses] = useState<any[]>([]);
  const [currentDose, setCurrentDose] = useState(0);

  useEffect(() => {
    setDoses([
      {
        id: 1,
        period: 'الصباح',
        title: 'جرعة الصباح الإخبارية',
        description: 'أهم الأحداث التي حصلت بين عشية وضحاها',
        icon: '🌅',
        color: '#FF9500',
        articles: 5,
        readTime: 8,
        summary: 'أخبار متنوعة تشمل السياسة والاقتصاد والتكنولوجيا'
      },
      {
        id: 2,
        period: 'الظهيرة', 
        title: 'تحديث منتصف اليوم',
        description: 'آخر التطورات والأخبار العاجلة',
        icon: '☀️',
        color: '#007AFF',
        articles: 3,
        readTime: 5,
        summary: 'تركيز على الأخبار الاقتصادية وأسواق المال'
      },
      {
        id: 3,
        period: 'المساء',
        title: 'ملخص المساء',
        description: 'أهم ما حدث اليوم مع تحليلات عميقة',
        icon: '🌙',
        color: '#5856D6',
        articles: 7,
        readTime: 12,
        summary: 'تحليلات عميقة ومقالات رأي حول أحداث اليوم'
      }
    ]);
  }, []);

  return (
    <div className="modern-card" style={{ padding: 'var(--space-xl)', overflow: 'hidden' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 'var(--space-xl)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <BoltIcon style={{ width: '28px', height: '28px', color: 'var(--primary-blue)' }} />
          <div>
            <h3 className="heading-card">الجرعات الذكية</h3>
            <p className="text-secondary">محتوى مركز حسب أوقات اليوم</p>
          </div>
        </div>

        {/* مؤشرات التبديل */}
        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
          {doses.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentDose(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentDose ? 'var(--primary-blue)' : 'var(--border-light)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            />
          ))}
        </div>
      </div>

      {/* الجرعة الحالية */}
      {doses[currentDose] && (
        <div className="fade-in" style={{
          background: `linear-gradient(135deg, ${doses[currentDose].color}15, transparent)`,
          padding: 'var(--space-xl)',
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${doses[currentDose].color}30`,
          position: 'relative'
        }}>
          <div style={{
            fontSize: '3rem',
            position: 'absolute',
            top: 'var(--space-lg)',
            left: 'var(--space-lg)',
            opacity: 0.7
          }}>
            {doses[currentDose].icon}
          </div>

          <div style={{ paddingRight: 'var(--space-3xl)' }}>
            <div className="badge-secondary" style={{ marginBottom: 'var(--space-md)' }}>
              {doses[currentDose].period}
            </div>
            
            <h4 style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: doses[currentDose].color,
              marginBottom: 'var(--space-sm)'
            }}>
              {doses[currentDose].title}
            </h4>

            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-lg)',
              lineHeight: 'var(--line-height-relaxed)'
            }}>
              {doses[currentDose].description}
            </p>

            <p className="text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
              {doses[currentDose].summary}
            </p>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-lg)',
              marginBottom: 'var(--space-lg)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                <DocumentTextIcon style={{ width: '16px', height: '16px', color: doses[currentDose].color }} />
                <span className="text-caption">{doses[currentDose].articles} مقالات</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                <ClockIcon style={{ width: '16px', height: '16px', color: doses[currentDose].color }} />
                <span className="text-caption">{doses[currentDose].readTime} دقيقة</span>
              </div>
            </div>

            <button className="btn-primary" style={{
              background: doses[currentDose].color,
              borderColor: doses[currentDose].color
            }}>
              <PlayIcon style={{ width: '18px', height: '18px' }} />
              ابدأ الجرعة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// مكون كلاود الكلمات المفتاحية
export const ModernWordCloud: React.FC<{ maxKeywords?: number }> = ({ maxKeywords = 20 }) => {
  const [keywords, setKeywords] = useState<any[]>([]);
  
  useEffect(() => {
    setKeywords([
      { text: 'الذكاء الاصطناعي', size: 24, color: '#007AFF', frequency: 89 },
      { text: 'التكنولوجيا', size: 20, color: '#34C759', frequency: 76 },
      { text: 'الاقتصاد', size: 18, color: '#FF9500', frequency: 65 },
      { text: 'الطاقة المتجددة', size: 16, color: '#5856D6', frequency: 54 },
      { text: 'الابتكار', size: 15, color: '#FF3B30', frequency: 48 },
      { text: 'الاستدامة', size: 14, color: '#30D158', frequency: 42 },
      { text: 'الرقمنة', size: 13, color: '#007AFF', frequency: 38 },
      { text: 'الأمن السيبراني', size: 12, color: '#FF6B35', frequency: 35 },
      { text: 'البلوك تشين', size: 11, color: '#5856D6', frequency: 32 },
      { text: 'إنترنت الأشياء', size: 10, color: '#34C759', frequency: 28 }
    ]);
  }, []);

  return (
    <div className="modern-card" style={{ padding: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <TagIcon style={{ width: '28px', height: '28px', color: 'var(--primary-blue)' }} />
        <div>
          <h3 className="heading-card">الكلمات الرائجة</h3>
          <p className="text-secondary">أهم المواضيع المطروحة حالياً</p>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-md)',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        padding: 'var(--space-lg)'
      }}>
        {keywords.slice(0, maxKeywords).map((keyword, index) => (
          <button
            key={index}
            className="interactive"
            style={{
              background: 'transparent',
              border: `2px solid ${keyword.color}30`,
              borderRadius: 'var(--radius-full)',
              padding: 'var(--space-sm) var(--space-lg)',
              fontSize: `${keyword.size}px`,
              fontWeight: 'var(--font-weight-semibold)',
              color: keyword.color,
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              animationDelay: `${index * 0.05}s`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${keyword.color}15`;
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.borderColor = keyword.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = `${keyword.color}30`;
            }}
          >
            {keyword.text}
            <span style={{ 
              fontSize: '10px', 
              opacity: 0.7,
              marginRight: 'var(--space-xs)'
            }}>
              {keyword.frequency}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// مكون الإحصائيات التفاعلية
export const InteractiveAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const mockStats = {
      today: {
        readers: 12540,
        articles: 23,
        engagement: 89,
        trending: 'الذكاء الاصطناعي'
      },
      week: {
        readers: 78320,
        articles: 156,
        engagement: 92,
        trending: 'التكنولوجيا المالية'
      },
      month: {
        readers: 340150,
        articles: 678,
        engagement: 87,
        trending: 'الطاقة المتجددة'
      }
    };
    setStats(mockStats[period]);
  }, [period]);

  return (
    <div className="modern-card" style={{ padding: 'var(--space-xl)' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 'var(--space-xl)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <ChartBarIcon style={{ width: '28px', height: '28px', color: 'var(--primary-blue)' }} />
          <div>
            <h3 className="heading-card">تحليلات تفاعلية</h3>
            <p className="text-secondary">إحصائيات المنصة المباشرة</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
          {['today', 'week', 'month'].map((p) => (
            <button
              key={p}
              className={period === p ? "btn-primary" : "btn-secondary"}
              onClick={() => setPeriod(p as any)}
              style={{ padding: 'var(--space-xs) var(--space-md)', fontSize: 'var(--text-xs)' }}
            >
              {p === 'today' && 'اليوم'}
              {p === 'week' && 'الأسبوع'}
              {p === 'month' && 'الشهر'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-lg)' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary-blue-light), transparent)',
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}>
          <UserIcon style={{ width: '32px', height: '32px', color: 'var(--primary-blue)', margin: '0 auto var(--space-sm)' }} />
          <div className="heading-card" style={{ color: 'var(--primary-blue)' }}>
            {stats.readers?.toLocaleString('en-US')}
          </div>
          <div className="text-secondary">قارئ نشط</div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #34C75915, transparent)',
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}>
          <ChartBarIcon style={{ width: '32px', height: '32px', color: '#34C759', margin: '0 auto var(--space-sm)' }} />
          <div className="heading-card" style={{ color: '#34C759' }}>
            {stats.engagement}%
          </div>
          <div className="text-secondary">معدل التفاعل</div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #FF950015, transparent)',
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          gridColumn: 'span 2'
        }}>
          <SparklesIcon style={{ width: '32px', height: '32px', color: '#FF9500', margin: '0 auto var(--space-sm)' }} />
          <div className="heading-card" style={{ color: '#FF9500' }}>
            {stats.trending}
          </div>
          <div className="text-secondary">الموضوع الأكثر رواجاً</div>
        </div>
      </div>
    </div>
  );
};

// مكون المحتوى الصوتي المتقدم
export const AudioContentPlayer: React.FC<{ 
  title: string; 
  audioUrl: string; 
  duration?: number;
}> = ({ title, audioUrl, duration = 0 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  return (
    <div className="modern-card" style={{ padding: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <button
          className="btn-primary"
          onClick={() => setIsPlaying(!isPlaying)}
          style={{ 
            width: '50px', 
            height: '50px',
            borderRadius: 'var(--radius-full)',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isPlaying ? 
            <PauseIcon style={{ width: '20px', height: '20px' }} /> :
            <PlayIcon style={{ width: '20px', height: '20px' }} />
          }
        </button>

        <div style={{ flex: 1 }}>
          <h4 style={{ 
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--space-xs)'
          }}>
            {title}
          </h4>
          
          <div style={{
            height: '4px',
            background: 'var(--border-light)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            marginBottom: 'var(--space-xs)'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--primary-blue)',
              borderRadius: 'var(--radius-full)',
              transition: 'var(--transition-fast)'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-caption">2:34</span>
            <span className="text-caption">{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
