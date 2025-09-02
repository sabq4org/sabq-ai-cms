"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import DeepAnalysisCard from "./DeepAnalysisCard";
import { useDarkMode } from "@/hooks/useDarkMode";

interface AnalysisData {
  id: string;
  title: string;
  slug?: string;
  summary?: string;
  categories?: string[];
  tags?: string[];
  authorName?: string;
  sourceType?: string;
  analysisType?: string;
  readingTime?: number;
  views?: number;
  likes?: number;
  qualityScore?: number;
  status?: string;
  createdAt?: string;
  publishedAt?: string;
  featuredImage?: string;
}

interface DeepAnalysisHorizontalScrollProps {
  analyses: AnalysisData[];
  title?: string;
}

export default function DeepAnalysisHorizontalScroll({
  analyses,
  title = "التحليلات العميقة",
}: DeepAnalysisHorizontalScrollProps) {
  const { darkMode } = useDarkMode();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollTo = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // عرض البطاقة تقريباً
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
      {/* العنوان */}
      {title && (
        <h2
          className={`text-2xl font-bold mb-6 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h2>
      )}

      {/* حاوية التمرير الأفقي */}
      <div className="relative group">
        {/* زر التمرير الأيسر */}
        {showLeftButton && (
          <button
            onClick={() => scrollTo("left")}
            className={`
              absolute right-0 top-1/2 -translate-y-1/2 z-10
              p-3 rounded-full shadow-lg backdrop-blur-sm
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
              ${
                darkMode
                  ? "bg-gray-800/90 hover:bg-gray-700 text-white"
                  : "bg-white/90 hover:bg-gray-100 text-gray-800"
              }
              lg:hidden
            `}
            aria-label="السابق"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* زر التمرير الأيمن */}
        {showRightButton && (
          <button
            onClick={() => scrollTo("right")}
            className={`
              absolute left-0 top-1/2 -translate-y-1/2 z-10
              p-3 rounded-full shadow-lg backdrop-blur-sm
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
              ${
                darkMode
                  ? "bg-gray-800/90 hover:bg-gray-700 text-white"
                  : "bg-white/90 hover:bg-gray-100 text-gray-800"
              }
              lg:hidden
            `}
            aria-label="التالي"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* البطاقات */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`
            flex gap-4 overflow-x-auto scrollbar-hide pb-4
            snap-x snap-mandatory
            lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:gap-6 lg:overflow-visible
          `}
        >
          {analyses.map((analysis, index) => (
            <div
              key={analysis.id}
              className="flex-shrink-0 w-80 snap-center lg:w-auto"
            >
              <DeepAnalysisCard analysis={analysis} viewMode="grid" />
            </div>
          ))}
        </div>
      </div>

      {/* مؤشرات التمرير للموبايل */}
      <div className="flex justify-center gap-2 mt-4 lg:hidden">
        {analyses.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (scrollContainerRef.current) {
                const cardWidth = 320;
                scrollContainerRef.current.scrollTo({
                  left: index * (cardWidth + 16), // 16px gap
                  behavior: "smooth",
                });
              }
            }}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${
                darkMode
                  ? "bg-gray-600 hover:bg-gray-500"
                  : "bg-gray-300 hover:bg-gray-400"
              }
            `}
            aria-label={`الذهاب إلى البطاقة ${index + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
