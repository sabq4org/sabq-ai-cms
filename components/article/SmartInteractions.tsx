"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Bookmark, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  Smile, 
  Frown, 
  Meh,
  BarChart2,
  X,
  ChevronDown,
  ChevronUp,
  Send
} from "lucide-react";
import Image from "next/image";

interface SmartInteractionsProps {
  articleId: string;
  commentsCount: number;
  likesCount: number;
  sharesCount: number;
  bookmarksCount: number;
  sentimentAnalysis?: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    isVerified: boolean;
  };
  content: string;
  timestamp: Date;
  likes: number;
  replies: number;
  sentiment: "positive" | "neutral" | "negative";
  isLiked: boolean;
}

export default function SmartInteractions({
  articleId,
  commentsCount,
  likesCount,
  sharesCount,
  bookmarksCount,
  sentimentAnalysis = { positive: 65, neutral: 25, negative: 10 }
}: SmartInteractionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(likesCount);
  const [localBookmarksCount, setLocalBookmarksCount] = useState(bookmarksCount);
  const [showComments, setShowComments] = useState(false);
  const [showSentiment, setShowSentiment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commentFilter, setCommentFilter] = useState<"all" | "positive" | "neutral" | "negative">("all");

  // محاكاة جلب التعليقات
  useEffect(() => {
    if (showComments && comments.length === 0) {
      setIsLoading(true);
      
      // محاكاة API call
      setTimeout(() => {
        const mockComments: Comment[] = [
          {
            id: "1",
            author: {
              name: "أحمد محمد",
              avatar: "/images/avatars/user1.jpg",
              isVerified: true
            },
            content: "مقال رائع ومفيد جداً، استفدت منه كثيراً وأتمنى المزيد من المقالات المشابهة.",
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            likes: 24,
            replies: 3,
            sentiment: "positive",
            isLiked: false
          },
          {
            id: "2",
            author: {
              name: "سارة العتيبي",
              avatar: "/images/avatars/user2.jpg",
              isVerified: false
            },
            content: "أعتقد أن المقال يحتاج إلى مزيد من التفاصيل والأمثلة العملية ليكون أكثر فائدة.",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            likes: 7,
            replies: 1,
            sentiment: "neutral",
            isLiked: false
          },
          {
            id: "3",
            author: {
              name: "خالد الشمري",
              isVerified: false
            },
            content: "المعلومات المذكورة في المقال غير دقيقة وتحتاج إلى مراجعة، هناك العديد من النقاط المغلوطة.",
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
            likes: 3,
            replies: 5,
            sentiment: "negative",
            isLiked: false
          },
          {
            id: "4",
            author: {
              name: "نورة السعيد",
              avatar: "/images/avatars/user4.jpg",
              isVerified: true
            },
            content: "شكراً للكاتب على هذا الطرح المميز، استفدت كثيراً من وجهات النظر المطروحة.",
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
            likes: 18,
            replies: 0,
            sentiment: "positive",
            isLiked: false
          },
          {
            id: "5",
            author: {
              name: "فهد العنزي",
              isVerified: false
            },
            content: "المقال يقدم معلومات مفيدة لكن بعض النقاط تحتاج إلى توضيح أكثر.",
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
            likes: 9,
            replies: 2,
            sentiment: "neutral",
            isLiked: false
          }
        ];
        
        setComments(mockComments);
        setIsLoading(false);
      }, 1500);
    }
  }, [showComments, comments.length]);

  // التفاعل مع المقال
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLocalLikesCount(isLiked ? localLikesCount - 1 : localLikesCount + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    setLocalBookmarksCount(isBookmarked ? localBookmarksCount - 1 : localBookmarksCount + 1);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href
      });
    } else {
      // نسخ الرابط
      navigator.clipboard.writeText(window.location.href);
      alert("تم نسخ الرابط");
    }
  };

  // التفاعل مع التعليقات
  const handleCommentLike = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ));
  };

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    
    const newComment: Comment = {
      id: `new-${Date.now()}`,
      author: {
        name: "أنت",
        isVerified: false
      },
      content: commentInput,
      timestamp: new Date(),
      likes: 0,
      replies: 0,
      sentiment: "neutral", // سيتم تحليله لاحقاً
      isLiked: false
    };
    
    setComments([newComment, ...comments]);
    setCommentInput("");
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Smile className="h-4 w-4 text-green-500" />;
      case "negative":
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "negative":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "الآن";
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  const filteredComments = commentFilter === "all" 
    ? comments 
    : comments.filter(comment => comment.sentiment === commentFilter);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
      {/* شريط التفاعلات */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 rtl:space-x-reverse">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 rtl:space-x-reverse text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <MessageSquare className="h-5 w-5" />
            <span>{commentsCount}</span>
          </button>
          
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 rtl:space-x-reverse transition-colors duration-200 ${
              isLiked 
                ? "text-red-500" 
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            <span>{localLikesCount}</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 rtl:space-x-reverse text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <Share2 className="h-5 w-5" />
            <span>{sharesCount}</span>
          </button>
          
          <button
            onClick={handleBookmark}
            className={`flex items-center space-x-2 rtl:space-x-reverse transition-colors duration-200 ${
              isBookmarked 
                ? "text-blue-500" 
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
            <span>{localBookmarksCount}</span>
          </button>
        </div>
        
        <button
          onClick={() => setShowSentiment(!showSentiment)}
          className="flex items-center space-x-2 rtl:space-x-reverse text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
        >
          <BarChart2 className="h-5 w-5" />
          <span>تحليل المشاعر</span>
          {showSentiment ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* تحليل المشاعر */}
      <AnimatePresence>
        {showSentiment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
          >
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              تحليل مشاعر القراء
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Smile className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">إيجابي</span>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{sentimentAnalysis.positive}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${sentimentAnalysis.positive}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Meh className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">محايد</span>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{sentimentAnalysis.neutral}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${sentimentAnalysis.neutral}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Frown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">سلبي</span>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{sentimentAnalysis.negative}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${sentimentAnalysis.negative}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              تم تحليل {commentsCount} تعليق باستخدام الذكاء الاصطناعي
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* قسم التعليقات */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              التعليقات ({commentsCount})
            </h3>
            
            {/* إضافة تعليق جديد */}
            <div className="mb-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddComment();
                }}
                className="space-y-3"
              >
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="أضف تعليقك..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                ></textarea>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    التعليقات تخضع للمراجعة قبل النشر
                  </div>
                  <button
                    type="submit"
                    disabled={!commentInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <Send className="h-4 w-4" />
                    <span>إرسال</span>
                  </button>
                </div>
              </form>
            </div>
            
            {/* فلتر التعليقات */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                فلترة:
              </span>
              <button
                onClick={() => setCommentFilter("all")}
                className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
                  commentFilter === "all"
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setCommentFilter("positive")}
                className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 flex items-center space-x-1 rtl:space-x-reverse ${
                  commentFilter === "positive"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Smile className="h-3 w-3" />
                <span>إيجابي</span>
              </button>
              <button
                onClick={() => setCommentFilter("neutral")}
                className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 flex items-center space-x-1 rtl:space-x-reverse ${
                  commentFilter === "neutral"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Meh className="h-3 w-3" />
                <span>محايد</span>
              </button>
              <button
                onClick={() => setCommentFilter("negative")}
                className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 flex items-center space-x-1 rtl:space-x-reverse ${
                  commentFilter === "negative"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Frown className="h-3 w-3" />
                <span>سلبي</span>
              </button>
            </div>
            
            {/* قائمة التعليقات */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredComments.length > 0 ? (
              <div className="space-y-6">
                {filteredComments.map((comment) => (
                  <div key={comment.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                      <div className="flex-shrink-0">
                        {comment.author.avatar ? (
                          <Image
                            src={comment.author.avatar}
                            alt={comment.author.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              {comment.author.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {comment.author.name}
                            </h4>
                            {comment.author.isVerified && (
                              <span className="text-blue-500">✓</span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(comment.timestamp)}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getSentimentColor(comment.sentiment)}`}>
                            {getSentimentIcon(comment.sentiment)}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          {comment.content}
                        </p>
                        
                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                          <button
                            onClick={() => handleCommentLike(comment.id)}
                            className={`flex items-center space-x-1 rtl:space-x-reverse text-xs ${
                              comment.isLiked
                                ? "text-blue-500"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            } transition-colors duration-200`}
                          >
                            <ThumbsUp className={`h-3 w-3 ${comment.isLiked ? "fill-current" : ""}`} />
                            <span>{comment.likes}</span>
                          </button>
                          
                          <button
                            className="flex items-center space-x-1 rtl:space-x-reverse text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>رد ({comment.replies})</span>
                          </button>
                          
                          <button
                            className="flex items-center space-x-1 rtl:space-x-reverse text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            <span>إبلاغ</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  لا توجد تعليقات {commentFilter !== "all" ? "بهذا التصنيف" : ""} حالياً
                </p>
              </div>
            )}
            
            {/* زر عرض المزيد */}
            {filteredComments.length > 0 && filteredComments.length < commentsCount && (
              <div className="text-center mt-6">
                <button
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 text-sm font-medium"
                >
                  عرض المزيد من التعليقات
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
