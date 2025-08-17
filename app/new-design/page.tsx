'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  SmartRecommendations, 
  SmartDoses, 
  ModernWordCloud, 
  InteractiveAnalytics,
  AudioContentPlayer 
} from './components/SmartComponents';
import { 
  BookOpenIcon, 
  ClockIcon, 
  HeartIcon, 
  ShareIcon, 
  EyeIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  SparklesIcon,
  NewspaperIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  TagIcon,
  UserIcon,
  CalendarIcon,
  PlayIcon,
  ArrowLeftIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon 
} from '@heroicons/react/24/solid';

// استيراد الأنواع الموجودة
interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category_name?: string;
  author_name?: string;
  featured_image?: string;
  published_at: string;
  views: number;
  likes: number;
  reading_time?: number;
  article_type?: string;
  breaking?: boolean;
  featured?: boolean;
  tags?: string[];
  ai_summary?: string;
  audio_summary_url?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  articles_count?: number;
}

// مكون الهيدر العلوي
const ModernHeader: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <link rel="stylesheet" href="/modern-design-system.css" />
      <header className="modern-card" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: 0,
        borderBottom: '1px solid var(--border-light)',
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
      }}>
        <div className="container-main" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: 'var(--space-md) var(--space-lg)',
          height: '70px'
        }}>
          {/* الشعار */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover))',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'var(--font-weight-bold)'
            }}>
              س
            </div>
            <div>
              <h1 style={{ 
                fontSize: 'var(--text-xl)', 
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--text-primary)',
                margin: 0
              }}>
                سبق الذكية
              </h1>
              <p style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--text-secondary)',
                margin: 0
              }}>
                منصة الأخبار الذكية
              </p>
            </div>
          </div>

          {/* التنقل الرئيسي - مخفي في الجوال */}
          <nav style={{ display: 'flex', gap: 'var(--space-lg)' }} className={isMobile ? 'mobile-nav-hidden' : ''}>
            <Link href="#" className="btn-ghost">الرئيسية</Link>
            <Link href="#" className="btn-ghost">أحدث الأخبار</Link>
            <Link href="#" className="btn-ghost">التحليلات</Link>
            <Link href="#" className="btn-ghost">مقالات الرأي</Link>
            <Link href="#" className="btn-ghost">الأقسام</Link>
          </nav>

          {/* قائمة الجوال */}
          {isMobile && (
            <button 
              className="btn-ghost desktop-only"
              style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)' }}
            >
              <Bars3Icon style={{ width: '20px', height: '20px' }} />
            </button>
          )}

          {/* الأدوات والإعدادات */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <button 
              className="btn-ghost"
              style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)' }}
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <MagnifyingGlassIcon style={{ width: '20px', height: '20px' }} />
            </button>
            <button 
              className="btn-ghost"
              style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)' }}
            >
              <BellIcon style={{ width: '20px', height: '20px' }} />
            </button>
            <button 
              className="btn-ghost"
              style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)' }}
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? 
                <SunIcon style={{ width: '20px', height: '20px' }} /> : 
                <MoonIcon style={{ width: '20px', height: '20px' }} />
              }
            </button>
            <button className="btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>
              <UserCircleIcon style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>

        {/* شريط البحث المتوسع */}
        {searchOpen && (
          <div style={{
            borderTop: '1px solid var(--border-light)',
            padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--background-white)'
          }}>
            <input
              type="text"
              placeholder="البحث في الأخبار والمقالات..."
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                border: '2px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-base)',
                outline: 'none',
                transition: 'var(--transition-fast)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-blue)';
                e.target.style.boxShadow = '0 0 0 3px var(--primary-blue-light)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-light)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        )}
      </header>
    </>
  );
};

// مكون بطاقة المقال المحدثة
const ModernArticleCard: React.FC<{ 
  article: Article; 
  size?: 'small' | 'medium' | 'large';
  showImage?: boolean;
  showStats?: boolean;
}> = ({ article, size = 'medium', showImage = true, showStats = true }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const cardStyle = {
    small: { minHeight: '120px' },
    medium: { minHeight: '200px' },
    large: { minHeight: '300px' }
  };

  const imageStyle = {
    small: { height: '80px' },
    medium: { height: '140px' },
    large: { height: '200px' }
  };

  return (
    <article className="modern-card interactive" style={{ ...cardStyle[size], display: 'flex', flexDirection: 'column' }}>
      {/* الصورة المميزة */}
      {showImage && article.featured_image && (
        <div style={{
          ...imageStyle[size],
          background: `linear-gradient(135deg, var(--primary-blue-light), rgba(0, 122, 255, 0.05))`,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: size === 'large' ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-md) var(--radius-md) 0 0'
        }}>
          <Image 
            src={article.featured_image} 
            alt={article.title}
            fill
            style={{ objectFit: 'cover' }}
            className="fade-in"
          />
          {article.breaking && (
            <div className="badge-primary" style={{
              position: 'absolute',
              top: 'var(--space-sm)',
              right: 'var(--space-sm)',
              background: '#FF3B30',
              color: 'white',
              animation: 'pulse 1.5s infinite'
            }}>
              🔥 عاجل
            </div>
          )}
          {article.audio_summary_url && (
            <button
              className="btn-primary"
              style={{
                position: 'absolute',
                bottom: 'var(--space-sm)',
                left: 'var(--space-sm)',
                padding: 'var(--space-xs) var(--space-sm)',
                fontSize: 'var(--text-xs)'
              }}
            >
              <PlayIcon style={{ width: '14px', height: '14px' }} />
              استماع
            </button>
          )}
        </div>
      )}

      {/* محتوى البطاقة */}
      <div style={{ 
        padding: 'var(--space-lg)', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        gap: 'var(--space-md)'
      }}>
        {/* التصنيف والوقت */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
          {article.category_name && (
            <span className="badge-primary" style={{ fontSize: 'var(--text-xs)' }}>
              <TagIcon style={{ width: '12px', height: '12px' }} />
              {article.category_name}
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <ClockIcon style={{ width: '14px', height: '14px', color: 'var(--text-secondary)' }} />
            <span className="text-caption">
              {new Date(article.published_at).toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>

        {/* العنوان */}
        <h3 className="heading-card" style={{ 
          fontSize: size === 'large' ? 'var(--text-2xl)' : size === 'medium' ? 'var(--text-xl)' : 'var(--text-lg)',
          lineHeight: 'var(--line-height-tight)',
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: size === 'small' ? 2 : 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          <Link href={`/article/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {article.title}
          </Link>
        </h3>

        {/* الملخص */}
        {size !== 'small' && article.excerpt && (
          <p className="text-secondary" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {article.excerpt}
          </p>
        )}

        {/* الكاتب */}
        {article.author_name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <UserIcon style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
            <span className="text-secondary">{article.author_name}</span>
            {article.reading_time && (
              <span className="text-caption">• {article.reading_time} دقيقة</span>
            )}
          </div>
        )}

        {/* الإحصائيات والإجراءات */}
        {showStats && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            paddingTop: 'var(--space-sm)',
            borderTop: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                <EyeIcon style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
                <span className="text-caption">{article.views.toLocaleString('ar')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                <HeartIcon style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
                <span className="text-caption">{article.likes.toLocaleString('ar')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button
                className="btn-ghost"
                style={{ padding: 'var(--space-xs)' }}
                onClick={() => setLiked(!liked)}
              >
                {liked ? 
                  <HeartSolidIcon style={{ width: '18px', height: '18px', color: '#FF3B30' }} /> :
                  <HeartIcon style={{ width: '18px', height: '18px' }} />
                }
              </button>
              <button
                className="btn-ghost"
                style={{ padding: 'var(--space-xs)' }}
                onClick={() => setSaved(!saved)}
              >
                {saved ? 
                  <BookmarkSolidIcon style={{ width: '18px', height: '18px', color: 'var(--primary-blue)' }} /> :
                  <BookOpenIcon style={{ width: '18px', height: '18px' }} />
                }
              </button>
              <button className="btn-ghost" style={{ padding: 'var(--space-xs)' }}>
                <ShareIcon style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

// مكون قسم الإحصائيات السريعة
const ModernStatsBar: React.FC = () => {
  const stats = [
    { label: 'المقالات', value: '2,847', icon: DocumentTextIcon, color: '#007AFF' },
    { label: 'القراء', value: '45.2K', icon: UserIcon, color: '#34C759' },
    { label: 'التفاعلات', value: '128K', icon: HeartIcon, color: '#FF3B30' },
    { label: 'المشاركات', value: '67K', icon: ShareIcon, color: '#FF9500' }
  ];

  return (
    <div className="modern-card" style={{ 
      padding: 'var(--space-xl)',
      background: 'linear-gradient(135deg, var(--background-white), var(--primary-blue-light))'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', gap: 'var(--space-lg)' }}>
        {stats.map((stat, index) => (
          <div key={index} className="fade-in" style={{
            textAlign: 'center',
            animationDelay: `${index * 0.1}s`
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: `linear-gradient(135deg, ${stat.color}, ${stat.color}20)`,
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-sm)',
              color: stat.color
            }}>
              <stat.icon style={{ width: '24px', height: '24px' }} />
            </div>
            <div className="heading-card" style={{ color: stat.color, fontSize: 'var(--text-2xl)' }}>
              {stat.value}
            </div>
            <div className="text-secondary">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// الصفحة الرئيسية الجديدة
export default function ModernDesignPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMobile, setIsMobile] = useState(false);

  // كشف الجهاز المحمول
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // بيانات تجريبية للعرض
  useEffect(() => {
    // محاكاة جلب البيانات
    setTimeout(() => {
      setArticles([
        {
          id: '1',
          title: 'تطورات جديدة في الذكاء الاصطناعي تغير مستقبل التكنولوجيا',
          slug: 'ai-developments-2025',
          excerpt: 'خبراء التكنولوجيا يكشفون عن اختراقات جديدة في مجال الذكاء الاصطناعي قد تغير من طريقة تفاعلنا مع التكنولوجيا.',
          category_name: 'تكنولوجيا',
          author_name: 'أحمد محمد',
          featured_image: '/api/placeholder/400/250',
          published_at: new Date().toISOString(),
          views: 15420,
          likes: 342,
          reading_time: 8,
          article_type: 'analysis',
          breaking: true,
          featured: true,
          audio_summary_url: '/audio/summary-1.mp3'
        },
        {
          id: '2',
          title: 'الاقتصاد السعودي يسجل نمواً قوياً في الربع الأول من 2025',
          slug: 'saudi-economy-growth-2025',
          excerpt: 'البيانات الرسمية تظهر تحسناً ملحوظاً في المؤشرات الاقتصادية مع نمو متسارع في القطاعات غير النفطية.',
          category_name: 'اقتصاد',
          author_name: 'فاطمة الزهراني',
          featured_image: '/api/placeholder/400/250',
          published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          views: 8750,
          likes: 156,
          reading_time: 12,
          article_type: 'news',
          featured: true
        },
        {
          id: '3',
          title: 'رؤية 2030: إنجازات استثنائية في مجال الطاقة المتجددة',
          slug: 'vision-2030-renewable-energy',
          excerpt: 'المملكة تحقق قفزة كبيرة في مشاريع الطاقة المتجددة مع افتتاح أكبر محطة للطاقة الشمسية في المنطقة.',
          category_name: 'بيئة',
          author_name: 'سالم العتيبي',
          featured_image: '/api/placeholder/400/250',
          published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          views: 12340,
          likes: 289,
          reading_time: 6,
          article_type: 'opinion'
        },
        {
          id: '4',
          title: 'كأس العالم 2034: استعدادات مكثفة لاستضافة البطولة',
          slug: 'world-cup-2034-preparations',
          excerpt: 'اللجنة المنظمة تكشف عن خطط طموحة لجعل كأس العالم 2034 حدثاً استثنائياً يليق بتطلعات المملكة.',
          category_name: 'رياضة',
          author_name: 'محمد الشهري',
          featured_image: '/api/placeholder/400/250',
          published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          views: 18900,
          likes: 445,
          reading_time: 10,
          article_type: 'news'
        },
        {
          id: '5',
          title: 'اختراقات علمية: علماء سعوديون يطورون علاجاً جديداً للسرطان',
          slug: 'saudi-scientists-cancer-treatment',
          excerpt: 'فريق بحثي من جامعة الملك عبدالله يتوصل إلى اكتشاف مهم قد يغير مسار علاج السرطان على مستوى العالم.',
          category_name: 'علوم',
          author_name: 'د. نورا القحطاني',
          featured_image: '/api/placeholder/400/250',
          published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          views: 9650,
          likes: 378,
          reading_time: 15,
          article_type: 'analysis',
          breaking: false,
          featured: true
        },
        {
          id: '6',
          title: 'السياحة السعودية تشهد نمواً متسارعاً مع مشاريع جديدة',
          slug: 'saudi-tourism-growth-2025',
          excerpt: 'إحصائيات جديدة تظهر ارتفاعاً كبيراً في أعداد السياح مع افتتاح وجهات سياحية مبتكرة.',
          category_name: 'سياحة',
          author_name: 'ريم الدوسري',
          featured_image: '/api/placeholder/400/250',
          published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          views: 5280,
          likes: 124,
          reading_time: 7,
          article_type: 'news'
        }
      ]);

      setCategories([
        { id: 'all', name: 'الكل', articles_count: 2847 },
        { id: 'tech', name: 'تكنولوجيا', articles_count: 456 },
        { id: 'economy', name: 'اقتصاد', articles_count: 623 },
        { id: 'sports', name: 'رياضة', articles_count: 389 },
        { id: 'science', name: 'علوم', articles_count: 234 },
        { id: 'tourism', name: 'سياحة', articles_count: 187 }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--background-main)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading" style={{ width: '40px', height: '40px', margin: '0 auto var(--space-lg)' }}></div>
          <p className="text-secondary">جاري تحميل المحتوى...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--background-main)', minHeight: '100vh' }}>
      {/* الهيدر */}
      <ModernHeader />

      {/* المحتوى الرئيسي */}
      <main style={{ paddingTop: '90px' }}>
        {/* القسم الترويجي */}
        <section className="container-main fade-in" style={{ marginBottom: 'var(--space-3xl)' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover))',
            borderRadius: 'var(--radius-xl)',
            color: 'white',
            padding: 'var(--space-3xl) var(--space-xl)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              left: '-50px',
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              opacity: 0.5
            }}></div>
            <SparklesIcon style={{ 
              width: '80px', 
              height: '80px', 
              margin: '0 auto var(--space-lg)',
              opacity: 0.9 
            }} />
            <h1 className="heading-main" style={{ color: 'white', fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-lg)' }}>
              مرحباً بك في سبق الذكية
            </h1>
            <p style={{ 
              fontSize: 'var(--text-lg)', 
              maxWidth: '600px', 
              margin: '0 auto var(--space-xl)',
              opacity: 0.9,
              lineHeight: 'var(--line-height-relaxed)'
            }}>
              منصتك الإعلامية المدعومة بالذكاء الاصطناعي لأحدث الأخبار والتحليلات من المملكة والعالم
            </p>
            <button className="btn-secondary" style={{
              background: 'white',
              color: 'var(--primary-blue)',
              border: 'none',
              padding: 'var(--space-md) var(--space-2xl)',
              fontSize: 'var(--text-lg)'
            }}>
              <ChartBarIcon style={{ width: '24px', height: '24px' }} />
              استكشف المحتوى الذكي
            </button>
          </div>
        </section>

        {/* شريط الإحصائيات */}
        <section className="container-main" style={{ marginBottom: 'var(--space-3xl)' }}>
          <ModernStatsBar />
        </section>

        {/* تصفية الأقسام */}
        <section className="container-main" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-md)', 
            flexWrap: 'wrap',
            justifyContent: 'center' 
          }}>
            {categories.map((category) => (
              <button
                key={category.id}
                className={selectedCategory === category.id ? "btn-primary" : "btn-secondary"}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  transition: 'var(--transition-fast)'
                }}
              >
                {category.name}
                <span className="badge-secondary" style={{
                  background: selectedCategory === category.id ? 'rgba(255,255,255,0.2)' : 'var(--background-overlay)',
                  color: selectedCategory === category.id ? 'white' : 'var(--text-secondary)',
                  fontSize: '11px'
                }}>
                  {category.articles_count}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* المقال الرئيسي المميز - تخطيط متجاوب */}
        <section className="container-main mobile-space-reduced" style={{ marginBottom: 'var(--space-3xl)' }}>
          {isMobile ? (
            // تخطيط الجوال - عمودي
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <ModernArticleCard 
                article={articles[0]} 
                size="large" 
                showImage={true}
                showStats={true}
              />
              <div className="grid-2" style={{ gap: 'var(--space-md)' }}>
                <ModernArticleCard 
                  article={articles[1]} 
                  size="small" 
                  showImage={true}
                  showStats={false}
                />
                <ModernArticleCard 
                  article={articles[2]} 
                  size="small" 
                  showImage={true}
                  showStats={false}
                />
              </div>
            </div>
          ) : (
            // تخطيط الديسكتوب - شبكة
            <div className="grid-3" style={{ gap: 'var(--space-xl)' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <ModernArticleCard 
                  article={articles[0]} 
                  size="large" 
                  showImage={true}
                  showStats={true}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <ModernArticleCard 
                  article={articles[1]} 
                  size="small" 
                  showImage={true}
                  showStats={false}
                />
                <ModernArticleCard 
                  article={articles[2]} 
                  size="small" 
                  showImage={true}
                  showStats={false}
                />
              </div>
            </div>
          )}
        </section>

        {/* قسم الأخبار الأحدث */}
        <section className="container-main" style={{ marginBottom: 'var(--space-3xl)' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 'var(--space-2xl)'
          }}>
            <h2 className="heading-section" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <NewspaperIcon style={{ width: '32px', height: '32px', color: 'var(--primary-blue)' }} />
              أحدث الأخبار
            </h2>
            <Link href="#" className="btn-ghost">
              عرض المزيد <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
            </Link>
          </div>

          <div className="grid-3">
            {articles.slice(3).map((article) => (
              <ModernArticleCard 
                key={article.id}
                article={article} 
                size="medium" 
                showImage={true}
                showStats={true}
              />
            ))}
          </div>
        </section>

        {/* قسم المكونات الذكية - متجاوب */}
        <section className="container-main mobile-space-reduced" style={{ marginBottom: 'var(--space-3xl)' }}>
          <div className={isMobile ? '' : 'grid-2'} style={{ alignItems: 'start', gap: 'var(--space-lg)' }}>
            {/* الجرعات الذكية */}
            <div style={{ marginBottom: isMobile ? 'var(--space-lg)' : 0 }}>
              <SmartDoses />
            </div>
            
            {/* التوصيات الذكية */}
            <SmartRecommendations />
          </div>
        </section>

        {/* قسم التحليلات والكلمات المفتاحية - متجاوب */}
        <section className="container-main mobile-space-reduced" style={{ marginBottom: 'var(--space-3xl)' }}>
          <div className={isMobile ? '' : 'grid-2'} style={{ alignItems: 'start', gap: 'var(--space-lg)' }}>
            {/* الإحصائيات التفاعلية */}
            <div style={{ marginBottom: isMobile ? 'var(--space-lg)' : 0 }}>
              <InteractiveAnalytics />
            </div>
            
            {/* كلاود الكلمات */}
            <ModernWordCloud maxKeywords={isMobile ? 10 : 15} />
          </div>
        </section>

        {/* قسم المحتوى الصوتي المتقدم */}
        <section className="container-main" style={{ marginBottom: 'var(--space-3xl)' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 'var(--space-2xl)'
          }}>
            <h2 className="heading-section" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <MicrophoneIcon style={{ width: '32px', height: '32px', color: 'var(--primary-blue)' }} />
              المحتوى الصوتي
            </h2>
            <Link href="#" className="btn-ghost">
              عرض جميع التسجيلات <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
            </Link>
          </div>

          <div className="grid-2" style={{ gap: 'var(--space-lg)' }}>
            <AudioContentPlayer 
              title="ملخص صوتي: تطورات الذكاء الاصطناعي في 2025"
              audioUrl="/audio/ai-summary.mp3"
              duration={485}
            />
            <AudioContentPlayer 
              title="بودكاست: مستقبل الطاقة المتجددة في المنطقة"
              audioUrl="/audio/renewable-energy.mp3" 
              duration={720}
            />
          </div>
        </section>

        {/* التذييل */}
        <footer className="modern-card" style={{
          margin: 'var(--space-3xl) 0 0',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          padding: 'var(--space-3xl)'
        }}>
          <div className="container-main">
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover))',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'var(--font-weight-bold)',
                margin: '0 auto var(--space-lg)'
              }}>
                س
              </div>
              <h4 className="heading-section" style={{ marginBottom: 'var(--space-sm)' }}>
                سبق الذكية
              </h4>
              <p className="text-secondary" style={{ marginBottom: 'var(--space-xl)' }}>
                منصة الأخبار والمحتوى الذكي • مدعومة بالذكاء الاصطناعي
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 'var(--space-lg)',
                paddingTop: 'var(--space-xl)',
                borderTop: '1px solid var(--border-light)'
              }}>
                <Link href="#" className="btn-ghost">عن المنصة</Link>
                <Link href="#" className="btn-ghost">اتصل بنا</Link>
                <Link href="#" className="btn-ghost">سياسة الخصوصية</Link>
                <Link href="#" className="btn-ghost">شروط الاستخدام</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
