"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  Clock, 
  Eye, 
  TrendingUp,
  BarChart2,
  BookOpen,
  Video,
  Podcast,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ContentItem {
  id: string;
  title: string;
  summary: string;
  type: "article" | "analysis" | "video" | "podcast" | "gallery";
  category: string;
  image?: string;
  url: string;
  readTime?: number;
  views: number;
  relevanceScore: number;
  trending: boolean;
  publishedAt: Date;
}

interface NextKnowledgeJourneyProps {
  articleId: string;
  articleTitle: string;
  articleCategory: string;
  articleTags?: string[];
}

export default function NextKnowledgeJourney({
  articleId,
  articleTitle,
  articleCategory,
  articleTags = []
}: NextKnowledgeJourneyProps) {
  const [recommendations, setRecommendations] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // محاكاة جلب التوصيات
  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      
      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockRecommendations: ContentItem[] = [
        {
          id: "rec-1",
          title: `تحليل معمق: مستقبل ${articleCategory} في المملكة`,
          summary: `دراسة تحليلية شاملة لمستقبل ${articleCategory} في المملكة العربية السعودية في ضوء رؤية 2030 والتطورات العالمية.`,
          type: "analysis",
          category: articleCategory,
          image: "/images/recommendations/analysis.jpg",
          url: `/analysis/${articleCategory.toLowerCase()}-future`,
          readTime: 8,
          views: 12500,
          relevanceScore: 0.95,
          trending: true,
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: "rec-2",
          title: `فيديو: خبراء يناقشون أحدث تطورات ${articleCategory}`,
          summary: `حلقة نقاش مع نخبة من الخبراء والمختصين حول أحدث التطورات والاتجاهات في مجال ${articleCategory}.`,
          type: "video",
          category: "فيديو",
          image: "/images/recommendations/video.jpg",
          url: `/videos/${articleCategory.toLowerCase()}-experts`,
          readTime: 15,
          views: 8700,
          relevanceScore: 0.88,
          trending: false,
          publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          id: "rec-3",
          title: `${articleTags[0] || articleCategory}: الفرص والتحديات`,
          summary: `نظرة شاملة على الفرص والتحديات التي تواجه ${articleTags[0] || articleCategory} في ظل المتغيرات الاقتصادية والتقنية الحالية.`,
          type: "article",
          category: articleCategory,
          image: "/images/recommendations/article.jpg",
          url: `/articles/${(articleTags[0] || articleCategory).toLowerCase()}-opportunities`,
          readTime: 5,
          views: 9300,
          relevanceScore: 0.82,
          trending: false,
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          id: "rec-4",
          title: `بودكاست: حوار مع مسؤول في قطاع ${articleCategory}`,
          summary: `حوار صوتي مع أحد المسؤولين البارزين في قطاع ${articleCategory} يتناول الخطط المستقبلية والتحديات الراهنة.`,
          type: "podcast",
          category: "بودكاست",
          image: "/images/recommendations/podcast.jpg",
          url: `/podcasts/${articleCategory.toLowerCase()}-interview`,
          readTime: 25,
          views: 5600,
          relevanceScore: 0.78,
          trending: false,
          publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
          id: "rec-5",
          title: `معرض صور: أبرز مشاريع ${articleCategory} في المملكة`,
          summary: `مجموعة من الصور الحصرية لأبرز المشاريع والإنجازات في مجال ${articleCategory} بالمملكة العربية السعودية.`,
          type: "gallery",
          category: "صور",
          image: "/images/recommendations/gallery.jpg",
          url: `/galleries/${articleCategory.toLowerCase()}-projects`,
          readTime: 3,
          views: 7200,
          relevanceScore: 0.75,
          trending: true,
          publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        }
      ];
      
      setRecommendations(mockRecommendations);
      setIsLoading(false);
    };
    
    fetchRecommendations();
  }, [articleCategory, articleTags]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "analysis":
        return <BarChart2 className="h-4 w-4 text-purple-500" />;
      case "video":
        return <Video className="h-4 w-4 text-red-500" />;
      case "podcast":
        return <Podcast className="h-4 w-4 text-green-500" />;
      case "gallery":
        return <ImageIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-blue-500" />;
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
    const diffInDays = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 1) return "اليوم";
    if (diffInDays === 1) return "أمس";
    if (diffInDays < 30) return `منذ ${diffInDays} يوم`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `منذ ${diffInMonths} شهر`;
  };

  return (
    <section className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            رحلتك المعرفية التالية
          </h2>
        </div>
        <Link
          href={`/topics/${articleCategory.toLowerCase()}`}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 flex items-center space-x-1 rtl:space-x-reverse text-sm font-medium"
        >
          <span>المزيد عن {articleCategory}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.url} className="block group">
                <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                  {/* الصورة */}
                  <div className="relative h-48 overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {getTypeIcon(item.type)}
                      </div>
                    )}
                    
                    {/* نوع المحتوى */}
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 rounded-full px-3 py-1 flex items-center space-x-1 rtl:space-x-reverse">
                      {getTypeIcon(item.type)}
                      <span className="text-xs font-medium text-gray-800 dark:text-white">
                        {item.type === "analysis" ? "تحليل" : 
                         item.type === "video" ? "فيديو" : 
                         item.type === "podcast" ? "بودكاست" : 
                         item.type === "gallery" ? "معرض صور" : "مقال"}
                      </span>
                    </div>
                    
                    {/* مؤشر الصلة */}
                    <div className="absolute bottom-3 left-3">
                      <div className="bg-blue-600/90 text-white text-xs rounded-full px-2 py-1 flex items-center space-x-1 rtl:space-x-reverse">
                        <Sparkles className="h-3 w-3" />
                        <span>صلة {Math.round(item.relevanceScore * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* المحتوى */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {item.summary}
                    </p>
                    
                    {/* معلومات إضافية */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        {item.readTime && (
                          <div className="flex items-center space-x-1 rtl:space-x-reverse">
                            <Clock className="h-3 w-3" />
                            <span>{item.readTime} دقيقة</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Eye className="h-3 w-3" />
                          <span>{formatViews(item.views)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {item.trending && (
                          <TrendingUp className="h-3 w-3 text-red-500" />
                        )}
                        <span>{formatTimeAgo(item.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
