"use client";
import { useMemo } from "react";
import { Calendar, Clock, BookOpen, Eye } from "lucide-react";

type Props = {
  html: string;
  article: { 
    id: string; 
    title: string; 
    author?: { name: string | null } | null; 
    published_at?: Date | null; 
    readMinutes?: number | null;
    views?: number;
  };
  hiddenImageUrls?: string[];
};

export default function ArticleBody({ html, article, hiddenImageUrls = [] }: Props) {
  const content = useMemo(() => {
    let c = html || "";
    // إزالة أي سكربتات مضمنة في المحتوى لحماية الأداء
    try {
      c = c.replace(/<script[\s\S]*?<\/script>/gi, "");
    } catch {}
    if (hiddenImageUrls && hiddenImageUrls.length > 0) {
      const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const removeOnce = (str: string, re: RegExp): string => {
        let replaced = false;
        return str.replace(re, (m) => {
          if (replaced) return m;
          replaced = true;
          return "";
        });
      };

      // لا نحتاج أكثر من أول 10 صور للهيرو
      for (let i = 0; i < Math.min(hiddenImageUrls.length, 10); i++) {
        const url = hiddenImageUrls[i];
        if (!url) continue;

        try {
          if (url.startsWith("data:")) {
            // إزالة أول صورة data:image فقط لتجنب regex ضخم
            const dataRe = /<img[^>]+src=["']data:[^"']+["'][^>]*>/i;
            c = removeOnce(c, dataRe);
          } else {
            // مطابقة بجزء قصير من نهاية الرابط لمنع تضخّم RegExp
            const clean = url.split("?")[0].split("#")[0];
            const tail = clean.slice(-80); // مقطع قصير كافٍ للتمييز
            const key = escapeRegExp(tail);
            const re = new RegExp(`<img[^>]+src=["'][^"']*${key}[^"']*["'][^>]*>`, "i");
            c = removeOnce(c, re);
          }
        } catch {
          // فشل إنشاء regex (نادرًا) – نتجاهل بدون كسر الصفحة
        }
      }
    }
    return c;
  }, [html, hiddenImageUrls]);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <article className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-img:rounded-xl prose-headings:font-bold prose-p:leading-relaxed prose-p:text-[18px] prose-li:text-[18px] [--tw-prose-bullets:theme(colors.neutral.500)]">
      {/* محتوى HTML القادم من الخادم */}
      <div
        className="[&_.article-album_img]:rounded-xl [&_.article-album_figure]:overflow-hidden [&_.article-album_figure]:rounded-xl"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}


