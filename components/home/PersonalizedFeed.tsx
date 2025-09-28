"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Heart, 
  Share2, 
  Bookmark, 
  Clock, 
  Eye, 
  TrendingUp,
  RefreshCw,
  Filter,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface FeedItem {
  id: string;
  type: "article" | "analysis" | "video" | "opinion";
  title: string;
  summary: string;
  content?: string;
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  category: string;
  tags: string[];
  publishedAt: Date;
  readTime: number;
  views: number;
  likes: number;
  shares: number;
  image?: string;
  url: string;
  relevanceScore: number;
  reasonForRecommendation: string;
  isBookmarked: boolean;
  isLiked: boolean;
  trending: boolean;
}

interface PersonalizedFeedProps {
  user?: {
    id: string;
    interests?: string[];
    readingHistory?: string[];
    followedTopics?: string[];
    followedAuthors?: string[];
  } | null;
}

export default function PersonalizedFeed({ user }: PersonalizedFeedProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // جلب المحتوى المخصص
  const fetchPersonalizedContent = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (pageNum === 1) setIsLoading(true);
    
    // محاكاة API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockFeedItems: FeedItem[] = [
      {
        id: `feed-${pageNum}-1`,
        type: "article",
        title: "مستقبل الذكاء الاصطناعي في التعليم السعودي",
        summary: "كيف تعيد تقنيات الذكاء الاصطناعي تشكيل منظومة التعليم في المملكة، مع التركيز على التعلم التكيفي والتقييم الذكي.",
        author: {
          name: "د. سارة الأحمد",
          avatar: "/images/authors/sarah-ahmed.jpg",
          verified: true
        },
        category: "تقنية",
        tags: ["ذكاء اصطناعي", "تعليم", "رؤية 2030"],
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        readTime: 6,
        views: 12400,
        likes: 340,
        shares: 89,
        image: "/images/articles/ai-education.jpg",
        url: "/articles/ai-future-education-saudi",
        relevanceScore: 0.95,
        reasonForRecommendation: "لأنك تتابع موضوع التقنية والتعليم",
        isBookmarked: false,
        isLiked: false,
        trending: true
      },
      {
        id: `feed-${pageNum}-2`,
        type: "analysis",
        title: "تحليل: تأثير ارتفاع أسعار النفط على الاقتصاد السعودي",
        summary: "تحليل معمق لتأثير الارتفاع الأخير في أسعار النفط على مختلف القطاعات الاقتصادية في المملكة وتوقعات الخبراء.",
        author: {
          name: "محمد الراشد",
          avatar: "/images/authors/mohammed-rashid.jpg",
          verified: true
        },
        category: "اقتصاد",
        tags: ["نفط", "اقتصاد", "تحليل"],
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        readTime: 8,
        views: 18900,
        likes: 520,
        shares: 156,
        image: "/images/articles/oil-economy.jpg",
        url: "/analysis/oil-prices-saudi-economy",
        relevanceScore: 0.88,
        reasonForRecommendation: "بناءً على قراءاتك السابقة في الاقتصاد",
        isBookmarked: true,
        isLiked: true,
        trending: false
      },
      {
        id: `feed-${pageNum}-3`,
        type: "video",
        title: "فيديو: جولة في مشاريع نيوم الجديدة",
        summary: "جولة حصرية داخل أحدث مشاريع نيوم مع المهندسين والمطورين، واستعراض للتقنيات المبتكرة المستخدمة.",
        author: {
          name: "فريق سبق المرئي",
          avatar: "/images/authors/sabq-video.jpg",
          verified: true
        },
        category: "استثمار",
        tags: ["نيوم", "مشاريع", "استثمار"],
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        readTime: 12,
        views: 45600,
        likes: 1200,
        shares: 340,
        image: "/images/videos/neom-projects.jpg",
        url: "/videos/neom-new-projects-tour",
        relevanceScore: 0.82,
        reasonForRecommendation: "محتوى شائع في منطقتك",
        isBookmarked: false,
        isLiked: false,
        trending: true
      },
      {
        id: `feed-${pageNum}-4`,
        type: "opinion",
        title: "رأي: كيف نحافظ على الهوية الثقافية في عصر العولمة؟",
        summary: "مقال رأي يناقش التحديات والفرص في الحفاظ على الهوية الثقافية السعودية مع الانفتاح على العالم.",
        author: {
          name: "أ. فاطمة الزهراني",
          avatar: "/images/authors/fatima-zahrani.jpg",
          verified: true
        },
        category: "ثقافة",
        tags: ["ثقافة", "هوية", "عولمة"],
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        readTime: 5,
        views: 8900,
        likes: 230,
        shares: 67,
        image: "/images/articles/cultural-identity.jpg",
        url: "/opinion/cultural-identity-globalization",
        relevanceScore: 0.75,
        reasonForRecommendation: "موضوع جديد قد يهمك",
        isBookmarked: false,
        isLiked: false,
        trending: false
      }
    ];

    const newItems = reset ? mockFeedItems : [...feedItems, ...mockFeedItems];
    setFeedItems(newItems);
    setHasMore(pageNum < 3); // محاكاة وجود 3 صفحات فقط
    setIsLoading(false);
  }, [feedItems]);

  // تحميل المحتوى الأولي
  useEffect(() => {
    fetchPersonalizedContent(1, true);
  }, [user]);

  // تحميل المزيد
  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPersonalizedContent(nextPage);
    }
  };

  // تفاعل مع المحتوى
  const handleLike = (itemId: string) => {
    setFeedItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              isLiked: !item.isLiked,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1
            }
          : item
      )
    );
  };

  const handleBookmark = (itemId: string) => {
    setFeedItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, isBookmarked: !item.isBookmarked }
          : item
      )
    );
  };

  const handleShare = (item: FeedItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.summary,
        url: item.url,
      });
    } else {
      // نسخ الرابط
      navigator.clipboard.writeText(window.location.origin + item.url);
    }
    
    // تحديث عدد المشاركات
    setFeedItems(items => 
      items.map(i => 
        i.id === item.id 
          ? { ...i, shares: i.shares + 1 }
          : i
      )
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return "🎥";
      case "analysis":
        return "📊";
      case "opinion":
        return "💭";
      default:
        return "📰";
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}م`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}ك`;
    }
    return views.toString();
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "منذ دقائق";
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* رأس القسم */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Sparkles className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            من أجلك
          </h2>
          {user && (
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
              مخصص لاهتماماتك
            </span>
          )}
        </div>

        {/* فلاتر */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع المحتويات</option>
            <option value="article">مقالات</option>
            <option value="analysis">تحليلات</option>
            <option value="video">فيديوهات</option>
            <option value="opinion">آراء</option>
          </select>
          
          <button
            onClick={() => fetchPersonalizedContent(1, true)}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 disabled:opacity-50"
            aria-label="تحديث المحتوى"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* المحتوى */}
      <div className="space-y-6">
        <AnimatePresence>
          {feedItems
            .filter(item => selectedFilter === "all" || item.type === selectedFilter)
            .map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* رأس المقال */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    {item.author.avatar ? (
                      <Image
                        src={item.author.avatar}
                        alt={item.author.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {item.author.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.author.name}
                        </span>
                        {item.author.verified && (
                          <span className="text-blue-500">✓</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                        <span>{formatTimeAgo(item.publishedAt)}</span>
                        <span>•</span>
                        <span>{item.readTime} دقائق</span>
                        <span>•</span>
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="text-lg">{getTypeIcon(item.type)}</span>
                    {item.trending && (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>

                {/* سبب التوصية */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-r-4 border-blue-500">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-blue-700 dark:text-blue-300">
                    <Sparkles className="h-4 w-4" />
                    <span>{item.reasonForRecommendation}</span>
                  </div>
                </div>

                {/* المحتوى الرئيسي */}
                <Link href={item.url} className="block group">
                  <div className="flex space-x-4 rtl:space-x-reverse">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                        {item.summary}
                      </p>
                      
                      {/* التاجات */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* الصورة */}
                    {item.image && (
                      <div className="flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={150}
                          height={100}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>
                </Link>

                {/* الإحصائيات والتفاعل */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-6 rtl:space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Eye className="h-4 w-4" />
                      <span>{formatViews(item.views)}</span>
                    </div>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Heart className="h-4 w-4" />
                      <span>{item.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Share2 className="h-4 w-4" />
                      <span>{item.shares}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        item.isLiked
                          ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                          : "text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      }`}
                      aria-label="إعجاب"
                    >
                      <Heart className={`h-4 w-4 ${item.isLiked ? "fill-current" : ""}`} />
                    </button>
                    
                    <button
                      onClick={() => handleBookmark(item.id)}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        item.isBookmarked
                          ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                      aria-label="حفظ"
                    >
                      <Bookmark className={`h-4 w-4 ${item.isBookmarked ? "fill-current" : ""}`} />
                    </button>
                    
                    <button
                      onClick={() => handleShare(item)}
                      className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors duration-200"
                      aria-label="مشاركة"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>

        {/* زر تحميل المزيد */}
        {hasMore && (
          <div className="text-center py-8">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse mx-auto"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>جاري التحميل...</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>تحميل المزيد</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
