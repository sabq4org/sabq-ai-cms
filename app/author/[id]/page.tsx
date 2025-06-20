'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, FileText, Award, TrendingUp, Eye, Heart, MessageCircle, Clock, Twitter, Linkedin, Mail } from 'lucide-react';
import Header from '../../../components/Header';
import Footer from '@/components/Footer';
import './author-styles.css';

interface Author {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  avatar?: string;
  joinDate?: string;
  articlesCount?: number;
  viewsCount?: number;
  likesCount?: number;
  specialization?: string[];
  awards?: string[];
  social?: {
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
}

interface Article {
  id: string;
  title: string;
  summary?: string;
  category: string;
  date: string;
  image?: string;
  views?: number;
  likes?: number;
  comments?: number;
  readTime?: string;
}

export default function AuthorPage() {
  const params = useParams();
  const [author, setAuthor] = useState<Author | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'latest' | 'popular'>('latest');

  useEffect(() => {
    if (params?.id) {
      fetchAuthorData();
    }
  }, [params?.id]);

  const fetchAuthorData = async () => {
    try {
      const authorId = params?.id as string;
      
      // جلب بيانات المؤلف من API
      const response = await fetch(`/api/authors/${authorId}`);
      
      if (!response.ok) {
        throw new Error('Author not found');
      }
      
      const data = await response.json();
      
      setAuthor(data.author);
      setArticles(data.articles);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching author data:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="author-loading">
          <div className="loading-spinner"></div>
          <p>جاري تحميل بيانات المراسل...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!author) {
    return (
      <>
        <Header />
        <div className="author-error">
          <h1>عذراً، لم نتمكن من العثور على المراسل</h1>
          <Link href="/" className="back-link">العودة للرئيسية</Link>
        </div>
        <Footer />
      </>
    );
  }

  const sortedArticles = activeTab === 'popular' 
    ? [...articles].sort((a, b) => (b.views || 0) - (a.views || 0))
    : articles;

  return (
    <>
      <Header />
      <div className="author-page">
        {/* Header Section - تصميم مضغوط */}
        <div className="author-header">
          <div className="author-header-bg"></div>
          <div className="author-header-content">
            <div className="author-main-info">
              {/* صورة المؤلف */}
              <div className="author-avatar">
                {author.avatar ? (
                  <img 
                    src={author.avatar} 
                    alt={author.name}
                    className="avatar-image"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {author.name.charAt(0)}
                  </div>
                )}
              </div>
              
              {/* معلومات المؤلف */}
              <div className="author-info">
                <h1 className="author-name">{author.name}</h1>
                {author.title && <p className="author-title">{author.title}</p>}
                {author.bio && <p className="author-bio">{author.bio}</p>}
                
                {/* وسائل التواصل */}
                {author.social && (
                  <div className="author-social">
                    {author.social.twitter && (
                      <a href={author.social.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                        <Twitter className="social-icon" />
                      </a>
                    )}
                    {author.social.linkedin && (
                      <a href={author.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                        <Linkedin className="social-icon" />
                      </a>
                    )}
                    {author.social.email && (
                      <a href={`mailto:${author.social.email}`} className="social-link">
                        <Mail className="social-icon" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* الإحصائيات */}
            <div className="author-stats-section">
              <div className="author-stats">
                <div className="stat-item">
                  <FileText className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-value">{author.articlesCount}</span>
                    <span className="stat-label">مقال</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <Eye className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-value">{formatNumber(author.viewsCount || 0)}</span>
                    <span className="stat-label">مشاهدة</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <Heart className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-value">{formatNumber(author.likesCount || 0)}</span>
                    <span className="stat-label">إعجاب</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <Calendar className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-value">{new Date(author.joinDate || '').getFullYear()}</span>
                    <span className="stat-label">سنة الانضمام</span>
                  </div>
                </div>
              </div>

              {/* التخصصات والجوائز */}
              <div className="author-extras">
                {author.specialization && author.specialization.length > 0 && (
                  <div className="author-specializations">
                    <h3>التخصصات</h3>
                    <div className="specialization-tags">
                      {author.specialization.map((spec, index) => (
                        <span key={index} className="specialization-tag">{spec}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {author.awards && author.awards.length > 0 && (
                  <div className="author-awards">
                    <h3>
                      <Award className="section-icon" /> 
                      الجوائز والإنجازات
                    </h3>
                    <div className="awards-list">
                      {author.awards.map((award, index) => (
                        <div key={index} className="award-item">
                          <TrendingUp className="award-icon" />
                          <span>{award}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Articles Section */}
        <div className="author-articles">
          <div className="articles-header">
            <h2>المواد التحريرية</h2>
            <div className="articles-tabs">
              <button 
                className={`tab-button ${activeTab === 'latest' ? 'active' : ''}`}
                onClick={() => setActiveTab('latest')}
              >
                الأحدث
              </button>
              <button 
                className={`tab-button ${activeTab === 'popular' ? 'active' : ''}`}
                onClick={() => setActiveTab('popular')}
              >
                الأكثر قراءة
              </button>
            </div>
          </div>
          
          <div className="articles-grid">
            {sortedArticles.map((article) => (
              <Link href={`/article/${article.id}`} key={article.id} className="article-card">
                {article.image && (
                  <div className="article-image">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="article-img"
                    />
                    <span className="article-category">{article.category}</span>
                  </div>
                )}
                
                <div className="article-content">
                  <h3 className="article-title">{article.title}</h3>
                  {article.summary && (
                    <p className="article-summary">{article.summary}</p>
                  )}
                  
                  <div className="article-meta">
                    <div className="meta-item">
                      <Calendar className="meta-icon" />
                      <span>{formatDate(article.date)}</span>
                    </div>
                    
                    {article.readTime && (
                      <div className="meta-item">
                        <Clock className="meta-icon" />
                        <span>{article.readTime}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="article-stats">
                    {article.views && (
                      <div className="stat">
                        <Eye className="stat-icon" />
                        <span>{formatNumber(article.views)}</span>
                      </div>
                    )}
                    
                    {article.likes && (
                      <div className="stat">
                        <Heart className="stat-icon" />
                        <span>{formatNumber(article.likes)}</span>
                      </div>
                    )}
                    
                    {article.comments && (
                      <div className="stat">
                        <MessageCircle className="stat-icon" />
                        <span>{formatNumber(article.comments)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 