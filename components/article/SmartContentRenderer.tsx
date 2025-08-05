"use client";

import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useEffect, useRef, useState } from "react";
import SmartQuoteCard from "./SmartQuoteCard";

interface SmartContentRendererProps {
  content: string;
  smartQuotes?: Array<{
    id: string;
    text: string;
    context?: string;
    importance_score: number;
    emotional_impact: "high" | "medium" | "low";
    quote_type:
      | "key_insight"
      | "call_to_action"
      | "expert_opinion"
      | "data_point"
      | "conclusion";
    position_in_article: number;
  }>;
  articleTitle: string;
  authorName?: string;
  className?: string;
}

interface ProcessedContent {
  type: "text" | "quote" | "image" | "video";
  content: string;
  quote?: any;
  position: number;
}

export default function SmartContentRenderer({
  content,
  smartQuotes = [],
  articleTitle,
  authorName,
  className = "",
}: SmartContentRendererProps) {
  const { darkMode } = useDarkModeContext();
  const [processedContent, setProcessedContent] = useState<ProcessedContent[]>(
    []
  );
  const [readingProgress, setReadingProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Process content and insert quotes at appropriate positions
  useEffect(() => {
    const processContentWithQuotes = () => {
      // Split content into paragraphs
      const paragraphs = content
        .split(/\n\s*\n/)
        .filter((p) => p.trim())
        .map((p) => p.trim());

      const processed: ProcessedContent[] = [];
      let currentPosition = 0;

      paragraphs.forEach((paragraph, index) => {
        const paragraphPosition = ((index + 1) / paragraphs.length) * 100;

        // Add the paragraph
        processed.push({
          type: "text",
          content: paragraph,
          position: paragraphPosition,
        });

        // Check if any quotes should be inserted after this paragraph
        const quotesToInsert = smartQuotes.filter((quote) => {
          const quotePosition = quote.position_in_article;
          const prevPosition =
            index > 0 ? (index / paragraphs.length) * 100 : 0;
          return (
            quotePosition > prevPosition && quotePosition <= paragraphPosition
          );
        });

        // Insert quotes
        quotesToInsert.forEach((quote) => {
          processed.push({
            type: "quote",
            content: "",
            quote: quote,
            position: quote.position_in_article,
          });
        });
      });

      setProcessedContent(processed);
    };

    if (content) {
      processContentWithQuotes();
    }
  }, [content, smartQuotes]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how much of the content is visible
      const visibleTop = Math.max(0, -rect.top);
      const visibleBottom = Math.min(rect.height, windowHeight - rect.top);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      const progress = (visibleHeight / rect.height) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderParagraph = (text: string, index: number) => {
    // Handle different types of content blocks
    if (
      text.startsWith("<h1>") ||
      text.startsWith("<h2>") ||
      text.startsWith("<h3>")
    ) {
      return (
        <div
          key={index}
          className={`
            text-2xl sm:text-3xl font-bold mb-6 mt-8
            ${darkMode ? "text-white" : "text-gray-900"}
          `}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }

    if (text.startsWith("<img")) {
      return (
        <div key={index} className="my-8">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <div dangerouslySetInnerHTML={{ __html: text }} />
          </div>
        </div>
      );
    }

    if (text.startsWith("<blockquote>")) {
      return (
        <blockquote
          key={index}
          className={`
            my-6 p-6 border-r-4 border-blue-400 rounded-lg
            ${
              darkMode
                ? "bg-gray-800 text-gray-200"
                : "bg-blue-50 text-gray-700"
            }
            italic text-lg leading-relaxed
          `}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }

    // Regular paragraph
    return (
      <p
        key={index}
        className={`
          text-lg leading-relaxed mb-6 arabic-content-paragraph
          ${darkMode ? "text-gray-200" : "text-gray-800"}
        `}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Reading Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div
          className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className={`
          max-w-4xl mx-auto prose prose-lg
          ${darkMode ? "prose-invert" : ""}
          prose-headings:font-bold
          prose-p:text-lg prose-p:leading-relaxed
          prose-img:rounded-2xl prose-img:shadow-lg
          prose-blockquote:border-r-4 prose-blockquote:border-blue-400
          prose-blockquote:bg-blue-50 prose-blockquote:dark:bg-gray-800
          prose-a:text-blue-600 prose-a:dark:text-blue-400
          prose-strong:text-gray-900 prose-strong:dark:text-white
        `}
      >
        {processedContent.map((item, index) => {
          if (item.type === "quote" && item.quote) {
            return (
              <SmartQuoteCard
                key={`quote-${item.quote.id}`}
                quote={item.quote}
                articleTitle={articleTitle}
                authorName={authorName}
              />
            );
          }

          if (item.type === "text") {
            return renderParagraph(item.content, index);
          }

          return null;
        })}
      </div>

      {/* Floating Reading Stats */}
      <div
        className={`
        fixed bottom-6 right-6 p-4 rounded-2xl shadow-lg backdrop-blur-md
        ${
          darkMode
            ? "bg-gray-800/80 border border-gray-600"
            : "bg-white/80 border border-gray-200"
        }
        transition-all duration-300 hover:scale-105
      `}
      >
        <div className="text-center">
          <div
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {Math.round(readingProgress)}%
          </div>
          <div
            className={`text-xs ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            تقدم القراءة
          </div>
          <div className="mt-2 w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Typography Styles */}
      <style jsx global>{`
        .arabic-content-paragraph {
          text-align: right !important;
          direction: rtl !important;
        }

        .arabic-content-paragraph * {
          text-align: right !important;
          direction: rtl !important;
        }

        .prose p {
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }

        .prose h1,
        .prose h2,
        .prose h3 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .prose blockquote {
          margin: 2rem 0;
          padding: 1.5rem;
          border-radius: 0.75rem;
          position: relative;
        }

        .prose blockquote::before {
          content: '"';
          position: absolute;
          top: -0.5rem;
          right: 1rem;
          font-size: 3rem;
          opacity: 0.3;
          line-height: 1;
        }

        .prose img {
          margin: 2rem auto;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .prose ul,
        .prose ol {
          margin: 1.5rem 0;
          padding-right: 1.5rem;
        }

        .prose li {
          margin-bottom: 0.5rem;
          line-height: 1.7;
        }

        .prose strong {
          font-weight: 700;
        }

        .prose em {
          font-style: italic;
          opacity: 0.9;
        }

        .prose code {
          background: rgba(0, 0, 0, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
        }

        ${darkMode
          ? `
          .prose code {
            background: rgba(255,255,255,0.1);
          }

          .prose blockquote {
            background: rgba(55, 65, 81, 0.5);
          }
        `
          : `
          .prose blockquote {
            background: rgba(239, 246, 255, 0.5);
          }
        `}
      `}</style>
    </div>
  );
}
