/**
 * مكون توقيع النشرة البريدية مع أحدث المقالات
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Mail,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: {
    name: string;
    slug: string;
    icon?: string;
  };
  author: {
    name: string;
  };
  published_at: string;
  views: number;
  likes: number;
  reading_time?: number;
  featured_image?: string;
}

interface NewsletterSignupProps {
  showLatestArticles?: boolean;
  compact?: boolean;
  className?: string;
}

export default function NewsletterSignup({
  showLatestArticles = true,
  compact = false,
  className = "",
}: NewsletterSignupProps) {
  const { darkMode } = useDarkModeContext();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);

  // جلب أحدث المقالات للعرض
  useEffect(() => {
    if (showLatestArticles) {
      fetchLatestArticles();
    }
  }, [showLatestArticles]);

  const fetchLatestArticles = async () => {
    try {
      setLoadingArticles(true);
      const response = await fetch("/api/articles?limit=3&sort=latest");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.articles) {
          setLatestArticles(data.articles);
        }
      }
    } catch (error) {
      console.error("خطأ في جلب المقالات:", error);
    } finally {
      setLoadingArticles(false);
    }
  };

  const handleSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/email/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          preferences: {
            categories: ["news", "technology", "economy"],
            frequency: "daily",
          },
        }),
      });

      if (response.ok) {
        setSubscriptionStatus("success");
        setEmail("");
      } else {
        setSubscriptionStatus("error");
      }
    } catch (error) {
      console.error("خطأ في الاشتراك:", error);
      setSubscriptionStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ar-SA", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return "";
    }
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  if (compact) {
    return (
      <Card
        className={cn(
          "border-0 shadow-xl",
          darkMode ? "bg-slate-800" : "bg-gradient-to-br from-white to-blue-50",
          className
        )}
      >
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <CardTitle
            className={cn(
              "text-xl mb-2",
              darkMode ? "text-white" : "text-gray-900"
            )}
          >
            النشرة البريدية الذكية
          </CardTitle>
          <p
            className={cn(
              "text-sm",
              darkMode ? "text-gray-300" : "text-gray-600"
            )}
          >
            أخبار مخصصة بالذكاء الاصطناعي
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubscription} className="space-y-3">
            <Input
              type="email"
              placeholder="بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-center"
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 ml-2" />
                  اشترك الآن
                </>
              )}
            </Button>
          </form>

          {subscriptionStatus === "success" && (
            <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-xs text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              تم الاشتراك بنجاح!
            </div>
          )}

          {subscriptionStatus === "error" && (
            <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-xs text-center">
              حدث خطأ. يرجى المحاولة مرة أخرى
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* النموذج الرئيسي */}
      <Card
        className={cn(
          "border-0 shadow-xl",
          darkMode ? "bg-slate-800" : "bg-gradient-to-br from-white to-blue-50"
        )}
      >
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm">
              <Sparkles className="w-3 h-3" />
              ذكي
            </div>
          </div>

          <CardTitle
            className={cn(
              "text-2xl mb-3",
              darkMode ? "text-white" : "text-gray-900"
            )}
          >
            احصل على النشرة البريدية الذكية
          </CardTitle>

          <p
            className={cn(
              "text-lg leading-relaxed",
              darkMode ? "text-gray-300" : "text-gray-600"
            )}
          >
            أخبار مخصصة حسب اهتماماتك بتقنية الذكاء الاصطناعي
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubscription} className="space-y-4">
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12 text-lg"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !email}
                className="px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5 ml-2" />
                    اشترك
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>مجاني</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>بدون رسائل مزعجة</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>إلغاء في أي وقت</span>
              </div>
            </div>
          </form>

          {subscriptionStatus === "success" && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">تم الاشتراك بنجاح!</p>
                <p className="text-xs opacity-90">
                  تحقق من بريدك الإلكتروني لتأكيد الاشتراك
                </p>
              </div>
            </div>
          )}

          {subscriptionStatus === "error" && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-sm">
              حدث خطأ في الاشتراك. يرجى المحاولة مرة أخرى
            </div>
          )}
        </CardContent>
      </Card>

      {/* أحدث المقالات */}
      {showLatestArticles && (
        <Card
          className={cn(
            "border-0 shadow-lg",
            darkMode ? "bg-slate-800/50" : "bg-white/80"
          )}
        >
          <CardHeader>
            <CardTitle
              className={cn(
                "text-lg flex items-center gap-2",
                darkMode ? "text-white" : "text-gray-900"
              )}
            >
              <TrendingUp className="w-5 h-5 text-blue-600" />
              أحدث المقالات
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loadingArticles ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {latestArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/news/${article.id}`}
                    className="block group"
                  >
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      {article.featured_image && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={article.featured_image}
                            alt={article.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4
                          className={cn(
                            "font-medium text-sm leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2",
                            darkMode ? "text-white" : "text-gray-900"
                          )}
                        >
                          {article.title}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          {article.category && (
                            <Badge
                              variant="secondary"
                              className="text-xs px-2 py-0.5"
                            >
                              {article.category.icon} {article.category.name}
                            </Badge>
                          )}

                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(article.published_at)}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {article.reading_time ||
                                calculateReadingTime(
                                  article.excerpt || ""
                                )}{" "}
                              د
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{article.views}</span>
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link href="/newsletter">
                <Button variant="outline" className="w-full gap-2">
                  <BookOpen className="w-4 h-4" />
                  اعرف المزيد عن النشرة البريدية
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
