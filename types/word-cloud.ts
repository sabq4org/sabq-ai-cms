/**
 * أنواع البيانات لمكون Word Cloud
 * Types for Word Cloud Component
 */

export type Trend = "up" | "down" | "flat" | null;

export interface WordItem {
  id: string;        // slug أو uuid
  text: string;      // "غزة", "إسرائيل", "السعودية"...
  weight: number;    // 1..100 (يُطبّع داخلياً)
  colorKey?: string; // مفتاح لتلوين دلالي (دول/اقتصاد/سياسة...)
  trend?: Trend;     // up/down/flat
  href?: string;     // رابط عند النقر (بحث/وسم)
  count?: number;    // عدد التكرار الفعلي (للعرض)
}

export interface WordCloudProps {
  words: WordItem[];
  onSelect?: (word: WordItem) => void;
  loading?: boolean;
  error?: string | null;
  maxWords?: number;
  showTrends?: boolean;
  enableTooltip?: boolean;
  className?: string;
}

export interface WordCloudConfig {
  mobile: {
    minFontSize: number;
    maxFontSize: number;
  };
  tablet: {
    minFontSize: number;
    maxFontSize: number;
  };
  desktop: {
    minFontSize: number;
    maxFontSize: number;
  };
}

export type ColorCategory = 'politics' | 'conflict' | 'economy' | 'geo' | 'sports' | 'tech' | 'misc';

export interface WordAnalytics {
  wordId: string;
  clickedAt: string;
  userAgent?: string;
  source: 'word-cloud' | 'search' | 'direct';
}
