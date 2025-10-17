/**
 * 🎨 Hero Section محسّن للصفحة الرئيسية
 * مع background ديناميكي وتأثيرات محسّنة
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface HeroSectionProps {
  className?: string;
  variant?: "default" | "compact" | "full";
}

export default function EnhancedHeroSection({ 
  className = "", 
  variant = "default" 
}: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("صديقنا");

  useEffect(() => {
    setMounted(true);
    // محاولة الحصول على اسم المستخدم من localStorage
    const stored = localStorage.getItem("userName");
    if (stored) {
      setUserName(stored.split(" ")[0]);
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100 },
    },
  };

  if (!mounted) return null;

  const isArabic = /[\u0600-\u06FF]/.test(userName);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Background بـ Gradient ديناميكي */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
          animate={{
            x: [0, 50, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute bottom-0 left-0 w-72 h-72 bg-green-200 dark:bg-green-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
          animate={{
            x: [0, -50, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <motion.div variants={itemVariants} className="mb-8 text-center lg:text-right">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              أهلاً بعودتك
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              {isArabic ? `أهلاً ${userName}` : `Welcome, ${userName}`}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
              استكشف أحدث الأخبار والمقالات المختارة خصيصاً لاهتماماتك
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: "مقالات اليوم", value: "12+" },
              { label: "آخر تحديث", value: "الآن" },
              { label: "مفضلاتك", value: "8" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-200 dark:border-slate-700"
              >
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              href="/for-you"
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <span>اكتشف المقترح لك</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <Link
              href="/categories"
              className="inline-flex items-center justify-center px-8 py-3 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-900 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-all transform hover:scale-105 active:scale-95"
            >
              <span>تصفح الفئات</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m0-6l7-7 7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
    </motion.div>
  );
}
