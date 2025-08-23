"use client";

import { NewsCopilotButton } from "@/components/ai/NewsCopilotButton";
import { UIUtils } from "@/lib/ai/classifier-utils";
import { formatDateShort } from "@/lib/date-utils";
import { SmartBlock } from "@/types/smart-block";
import {
  Activity,
  Clock,
  Compass,
  Lightbulb,
  Star,
  Target,
  TrendingUp,
  Volume2,
} from "lucide-react";
import React from "react";
import { AlHilalWorldCupBlock } from "./AlHilalWorldCupBlock";
import { CardGridBlock } from "./CardGridBlock";
import { CarouselBlock } from "./CarouselBlock";
import { HeroSliderBlock } from "./HeroSliderBlock";

interface SmartBlockRendererProps {
  block: SmartBlock;
  articles?: any[];
  darkMode?: boolean;
}

export default function SmartBlockRenderer({
  block,
  articles = [],
  darkMode = false,
}: SmartBlockRendererProps) {
  // تحديد الأيقونة والألوان بناءً على نوع البلوك
  const getBlockStyle = (type: string) => {
    // إزالة الألوان وجعل جميع البلوكات بلا لون (شفاف/أبيض)
    return {
      icon: <Star className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />,
      bgColor: "bg-transparent",
      textColor: darkMode ? "text-gray-300" : "text-gray-700",
      lightBg: "bg-transparent",
    };
  };

  const style = getBlockStyle(block.type);

  // التصميم الافتراضي الموحد مع دعم الألوان المخصصة
  // ضمان الخلفية البيضاء كديفولت
  const customStyle = block.theme
    ? {
        backgroundColor: "#ffffff", // خلفية بيضاء ثابتة كديفولت
        color: block.theme.textColor || (darkMode ? "#f3f4f6" : "#1f2937"),
        borderColor: block.theme.primaryColor
          ? `${block.theme.primaryColor}20`
          : darkMode
          ? "#4b5563"
          : "#e5e7eb",
      }
    : {
        backgroundColor: "#ffffff", // خلفية بيضاء ثابتة كديفولت حتى بدون ثيم
      };

  // معالجة البلوكات المخصصة
  if (block.type === "custom") {
    if (block.name === "الهلال في بطولة العالم") {
      return <AlHilalWorldCupBlock articles={articles} />;
    }
    // يمكن إضافة بلوكات مخصصة أخرى هنا
  }

  // معالجة خاصة لبلوك يوم القهوة العالمي
  if (block.name === "يوم القهوة العالمي") {
    return <CardGridBlock block={block as any} articles={articles} />;
  }

  // معالجة خاصة لبلوك صيف عسير
  if (block.name === "صيف عسير" || block.displayType === "hero-slider") {
    return <HeroSliderBlock block={block as any} articles={articles} />;
  }

  // التصميم الافتراضي الموحد
  return (
    <div
      className={`rounded-3xl p-6 shadow-xl dark:shadow-gray-900/50 border transition-all duration-300 hover:shadow-2xl ${
        darkMode ? "border-gray-700" : "border-gray-200"
      }`}
      style={customStyle}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              darkMode 
                ? 'bg-transparent border-gray-600' 
                : 'bg-transparent border-gray-300'
            }`}
          >
            {React.cloneElement(style.icon, {
              className: `w-5 h-5`,
              style: { color: block.theme ? block.theme.primaryColor : "" },
            })}
          </div>
          <div>
            <h2
              className={`text-lg font-bold`}
              style={{ color: customStyle.color }}
            >
              {block.name}
            </h2>
            {block.settings?.subtitle && (
              <p
                className={`text-sm`}
                style={{ color: `${customStyle.color}B3` }} // 70% opacity
              >
                {block.settings.subtitle}
              </p>
            )}
          </div>
        </div>
        {articles.length > 0 && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              darkMode 
                ? 'bg-transparent border-gray-600 text-gray-300' 
                : 'bg-transparent border-gray-300 text-gray-600'
            }`}
          >
            {articles.length} {articles.length === 1 ? "مقال" : "مقالات"}
          </span>
        )}
      </div>

      {/* محتوى البلوك حسب النوع */}
      <div className="block-content">{renderBlockContent()}</div>
    </div>
  );

  function renderBlockContent() {
    // للبلوكات الموجودة حالياً
    if (block.type === "carousel" || block.displayType === "carousel") {
      return <CarouselBlock block={block as any} articles={articles} />;
    }

    if (
      block.type === "grid" ||
      block.displayType === "cards" ||
      block.displayType === "grid"
    ) {
      return <CardGridBlock block={block as any} articles={articles} />;
    }

    // البلوك الافتراضي - عرض قائمة بسيطة
    if (articles.length === 0) {
      return (
        <div
          className={`text-center py-8 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>لا توجد مقالات متاحة حالياً</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {articles
          .slice(0, block.articlesCount || 5)
          .map((article: any, index: number) => {
            const categoryName =
              article.category_name || article.category || "عام";
            const categoryColor = UIUtils.getCategoryColor(categoryName);
            const viewsForDisplay = article.views ?? article.views_count ?? 0;
            const published =
              article.publishedAt || article.published_at || article.created_at;

            return (
              <div
                key={article.id || index}
                className={`p-4 rounded-2xl border cursor-pointer ${
                  darkMode
                    ? "bg-gray-700/50 border-gray-600"
                    : "bg-gray-50 border-gray-100"
                } border-b-4`}
                style={{ borderBottomColor: categoryColor as string }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2`}
                    style={{ backgroundColor: categoryColor as string }}
                  ></div>
                  <div className="flex-1">
                    <h4
                      className={`text-sm font-medium leading-relaxed mb-2 ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs">
                      {published && (
                        <span
                          className={
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          <Clock className="inline-block w-3 h-3 mr-1 align-middle" />
                          {formatDateShort(published)}
                        </span>
                      )}
                      {viewsForDisplay !== undefined && (
                        <span
                          className={
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          {viewsForDisplay} مشاهدة
                        </span>
                      )}
                    </div>
                    <NewsCopilotButton
                      articleId={article.id}
                      articleTitle={article.title}
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    );
  }
}
