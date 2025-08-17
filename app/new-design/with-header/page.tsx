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
} from '../components/SmartComponents';
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

// نسخة الواجهة الأساسية مع هيدر بسيط
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

// هيدر أساسي ومبسط
const BasicHeader: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <link rel="stylesheet" href="/modern-design-system.css" />
      <header style={{
        background: 'var(--background-white)',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: 'var(--shadow-soft)'
      }}>
        <div className="container-main" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: 'var(--space-lg)',
          height: '80px'
        }}>
          {/* الشعار البسيط */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'var(--primary-blue)',
              borderRadius: 'var(--radius-lg)',
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
                fontSize: 'var(--text-2xl)', 
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--text-primary)',
                margin: 0
              }}>
                سبق الذكية
              </h1>
            </div>
          </div>

          {/* التنقل البسيط */}
          <nav className="desktop-only" style={{ display: 'flex', gap: 'var(--space-xl)' }}>
            <Link href="#" style={{ 
              color: 'var(--primary-blue)', 
              textDecoration: 'none',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--text-base)'
            }}>
              الرئيسية
            </Link>
            <Link href="#" className="btn-ghost">أحدث الأخبار</Link>
            <Link href="#" className="btn-ghost">التحليلات</Link>
            <Link href="#" className="btn-ghost">مقالات الرأي</Link>
          </nav>

          {/* الأدوات */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <button 
              className="btn-ghost"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <MagnifyingGlassIcon style={{ width: '24px', height: '24px' }} />
            </button>
            <button className="btn-primary">
              تسجيل الدخول
            </button>
          </div>
        </div>

        {/* شريط البحث */}
        {searchOpen && (
          <div style={{
            borderTop: '1px solid var(--border-light)',
            padding: 'var(--space-lg)',
            background: 'var(--background-main)'
          }}>
            <input
              type="text"
              placeholder="ابحث في الأخبار والمقالات..."
              style={{
                width: '100%',
                padding: 'var(--space-md) var(--space-lg)',
                border: '2px solid var(--border-light)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-base)',
                outline: 'none',
                textAlign: 'center'
              }}
            />
          </div>
        )}
      </header>
    </>
  );
};

// باقي مكونات البطاقات (نسخ نفس الكود)
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
            <div style={{
              position: 'absolute',
              top: 'var(--space-sm)',
              right: 'var(--space-sm)',
              background: '#FF3B30',
              color: 'white',
              padding: 'var(--space-xs) var(--space-sm)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-bold)'
            }}>
              🔥 عاجل
            </div>
          )}
        </div>
      )}

      <div style={{ 
        padding: 'var(--space-lg)', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        gap: 'var(--space-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
          {article.category_name && (
            <span style={{
              background: 'var(--primary-blue-light)',
              color: 'var(--primary-blue)',
              padding: 'var(--space-xs) var(--space-sm)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-semibold)'
            }}>
              {article.category_name}
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <ClockIcon style={{ width: '14px', height: '14px', color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {new Date(article.published_at).toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>

        <h3 style={{ 
          fontSize: size === 'large' ? 'var(--text-2xl)' : size === 'medium' ? 'var(--text-xl)' : 'var(--text-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text-primary)',
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

        {size !== 'small' && article.excerpt && (
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {article.excerpt}
          </p>
        )}

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
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  {article.views.toLocaleString('ar')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                <HeartIcon style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  {article.likes.toLocaleString('ar')}
                </span>
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

// الصفحة الرئيسية مع الهيدر الأساسي
export default function WithHeaderPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
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
        }
      ]);

      setCategories([
        { id: 'all', name: 'الكل', articles_count: 2847 },
        { id: 'tech', name: 'تكنولوجيا', articles_count: 456 },
        { id: 'economy', name: 'اقتصاد', articles_count: 623 },
        { id: 'sports', name: 'رياضة', articles_count: 389 }
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
          <div style={{
            width: '40px', 
            height: '40px', 
            border: '3px solid var(--border-light)',
            borderTop: '3px solid var(--primary-blue)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto var(--space-lg)'
          }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>جاري تحميل المحتوى...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--background-main)', minHeight: '100vh' }}>
      {/* الهيدر الأساسي */}
      <BasicHeader />

      {/* المحتوى الرئيسي */}
      <main>
        {/* قسم ترويجي مبسط */}
        <section className="container-main" style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover))',
            borderRadius: 'var(--radius-xl)',
            color: 'white',
            padding: 'var(--space-3xl)',
            textAlign: 'center'
          }}>
            <h1 style={{ 
              fontSize: 'var(--text-4xl)', 
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: 'var(--space-lg)'
            }}>
              مرحباً بك في سبق الذكية
            </h1>
            <p style={{ 
              fontSize: 'var(--text-lg)', 
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              منصتك الإعلامية المدعومة بالذكاء الاصطناعي
            </p>
          </div>
        </section>

        {/* المقالات الرئيسية */}
        <section className="container-main" style={{ marginBottom: 'var(--space-3xl)' }}>
          <h2 style={{ 
            fontSize: 'var(--text-3xl)', 
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--space-2xl)',
            textAlign: 'center',
            color: 'var(--text-primary)'
          }}>
            أحدث الأخبار
          </h2>
          
          <div className="grid-3" style={{ gap: 'var(--space-xl)' }}>
            {articles.map((article) => (
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

        {/* المكونات الذكية */}
        <section className="container-main" style={{ marginBottom: 'var(--space-3xl)' }}>
          <div className="grid-2" style={{ gap: 'var(--space-xl)' }}>
            <SmartDoses />
            <SmartRecommendations />
          </div>
        </section>

        {/* روابط للمقارنة */}
        <section className="container-main" style={{ marginBottom: 'var(--space-3xl)' }}>
          <div className="modern-card" style={{ 
            padding: 'var(--space-2xl)',
            textAlign: 'center',
            background: 'linear-gradient(135deg, var(--background-white), var(--primary-blue-light))'
          }}>
            <h3 style={{ 
              fontSize: 'var(--text-2xl)', 
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: 'var(--space-lg)',
              color: 'var(--text-primary)'
            }}>
              🎨 قارن التصاميم المختلفة
            </h3>
            
            <div style={{ 
              display: 'flex', 
              gap: 'var(--space-lg)', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link href="/new-design" className="btn-secondary">
                التصميم الأصلي (بدون هيدر)
              </Link>
              <Link href="/new-design/header-demo" className="btn-primary">
                تجربة أنواع الهيدرات
              </Link>
              <Link href="#" className="btn-ghost">
                العودة للموقع الأصلي
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
