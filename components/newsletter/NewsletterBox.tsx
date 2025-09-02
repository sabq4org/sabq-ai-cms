/**
 * مكون صندوق الاشتراك في النشرة البريدية المدمج
 * للعرض في أجزاء مختلفة من الموقع
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle, Mail, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface NewsletterBoxProps {
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  showFeatures?: boolean;
  className?: string;
}

export default function NewsletterBox({
  title = "النشرة البريدية الذكية",
  description = "أخبار مخصصة بالذكاء الاصطناعي",
  size = "md",
  showFeatures = false,
  className = "",
}: NewsletterBoxProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

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

  const sizeClasses = {
    sm: {
      card: "p-4",
      title: "text-lg",
      description: "text-sm",
      input: "h-9 text-sm",
      button: "h-9 px-3 text-sm",
    },
    md: {
      card: "p-6",
      title: "text-xl",
      description: "text-base",
      input: "h-10",
      button: "h-10 px-4",
    },
    lg: {
      card: "p-8",
      title: "text-2xl",
      description: "text-lg",
      input: "h-12 text-lg",
      button: "h-12 px-6",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <Card
      className={cn(
        "border-0 shadow-lg transition-all duration-300 hover:shadow-xl",
        darkMode
          ? "bg-slate-800 border-slate-700"
          : "bg-gradient-to-br from-white to-blue-50 border-gray-200",
        className
      )}
    >
      <CardHeader className={cn("text-center", currentSize.card)}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div
            className={cn(
              "bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center",
              size === "sm"
                ? "w-8 h-8"
                : size === "md"
                ? "w-10 h-10"
                : "w-12 h-12"
            )}
          >
            <Mail
              className={cn(
                "text-white",
                size === "sm"
                  ? "w-4 h-4"
                  : size === "md"
                  ? "w-5 h-5"
                  : "w-6 h-6"
              )}
            />
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs">
            <Sparkles className="w-3 h-3" />
            <span>AI</span>
          </div>
        </div>

        <CardTitle
          className={cn(
            "mb-2",
            currentSize.title,
            darkMode ? "text-white" : "text-gray-900"
          )}
        >
          {title}
        </CardTitle>

        <p
          className={cn(
            "leading-relaxed",
            currentSize.description,
            darkMode ? "text-gray-300" : "text-gray-600"
          )}
        >
          {description}
        </p>
      </CardHeader>

      <CardContent className={currentSize.card}>
        <form onSubmit={handleSubscription} className="space-y-3">
          <div
            className={cn(
              "flex gap-2",
              size === "lg" ? "flex-col sm:flex-row" : ""
            )}
          >
            <Input
              type="email"
              placeholder="بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "flex-1 text-center",
                currentSize.input,
                "bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              )}
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              disabled={isSubmitting || !email}
              className={cn(
                "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex-shrink-0",
                currentSize.button
              )}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send
                    className={cn(
                      "ml-1",
                      size === "sm" ? "w-3 h-3" : "w-4 h-4"
                    )}
                  />
                  {size === "sm" ? "اشترك" : "اشترك الآن"}
                </>
              )}
            </Button>
          </div>

          {showFeatures && (
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>مجاني</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>ذكي</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>يومي</span>
              </div>
            </div>
          )}
        </form>

        {subscriptionStatus === "success" && (
          <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <div>
              <p className="font-medium">تم الاشتراك بنجاح!</p>
              {size !== "sm" && (
                <p className="text-xs opacity-90 mt-0.5">
                  تحقق من بريدك الإلكتروني
                </p>
              )}
            </div>
          </div>
        )}

        {subscriptionStatus === "error" && (
          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-sm text-center">
            حدث خطأ. يرجى المحاولة مرة أخرى
          </div>
        )}

        {size !== "sm" && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Link href="/newsletter">
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-xs"
              >
                تفاصيل النشرة البريدية
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
