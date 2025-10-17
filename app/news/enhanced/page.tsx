"use client";

import { useState } from "react";
import EnhancedArticlesList from "@/components/articles/EnhancedArticlesList";
import { EnhancedButton } from "@/components/ui/EnhancedButton";
import { EnhancedCard } from "@/components/ui/EnhancedCard";
import { Grid, List, Filter, TrendingUp, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";

/**
 * صفحة الأخبار المحسّنة
 * 
 * تستخدم جميع المكونات المحسّنة:
 * - EnhancedArticlesList
 * - EnhancedButton
 * - EnhancedCard
 * - نظام الألوان الموحد
 * - تأثيرات حركية سلسة
 */
export default function EnhancedNewsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "trending" | "recent" | "featured">("all");

  const filters = [
    { id: "all", label: "الكل", icon: Grid },
    { id: "trending", label: "الأكثر قراءة", icon: TrendingUp },
    { id: "recent", label: "الأحدث", icon: Clock },
    { id: "featured", label: "المميزة", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* العنوان والوصف */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-brand-primary dark:text-white mb-3">
            الأخبار
          </h1>
          <p className="text-lg text-brand-fgMuted dark:text-gray-400">
            آخر الأخبار والمستجدات من مصادر موثوقة
          </p>
        </motion.div>

        {/* شريط الفلاتر والإعدادات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <EnhancedCard variant="flat" padding="md" className="mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              {/* الفلاتر */}
              <div className="flex flex-wrap items-center gap-2">
                {filters.map((f, index) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <EnhancedButton
                        variant={filter === f.id ? "accent" : "ghost"}
                        size="sm"
                        onClick={() => setFilter(f.id as any)}
                        leftIcon={<Icon className="w-4 h-4" />}
                      >
                        {f.label}
                      </EnhancedButton>
                    </motion.div>
                  );
                })}
              </div>

              {/* أزرار العرض */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-brand-fgMuted dark:text-gray-400 ml-2">
                  العرض:
                </span>
                <EnhancedButton
                  variant={viewMode === "grid" ? "primary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  aria-label="عرض شبكي"
                >
                  <Grid className="w-4 h-4" />
                </EnhancedButton>
                <EnhancedButton
                  variant={viewMode === "list" ? "primary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  aria-label="عرض قائمة"
                >
                  <List className="w-4 h-4" />
                </EnhancedButton>
              </div>
            </div>
          </EnhancedCard>
        </motion.div>

        {/* قائمة الأخبار */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <EnhancedArticlesList
            variant={viewMode === "list" ? "compact" : "default"}
            showActions={true}
            showLoadMore={true}
            limit={12}
          />
        </motion.div>
      </div>
    </div>
  );
}

