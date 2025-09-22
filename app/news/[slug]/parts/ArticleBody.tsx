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
  skipProcessing?: boolean;
};

export default function ArticleBody({ html, article, hiddenImageUrls = [], skipProcessing = false }: Props) {
  const content = useMemo(() => {
    if (skipProcessing) {
      return html || "";
    }
    let c = html || "";
    // إزالة أي سكربتات مضمنة في المحتوى لحماية الأداء
    try {
      c = c.replace(/<script[\s\S]*?<\/script>/gi, "");
    } catch {}

    // تحويل روابط YouTube إلى تضمين + ضمان إظهار iframes بشكل صحيح
    try {
      const getYouTubeId = (url: string): string | null => {
        try {
          const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
          return m?.[1] || null;
        } catch {
          return null;
        }
      };

      // 1) تحويل <a href="youtube|youtu.be"> إلى iframe مضمّن
      const ytAnchorRe = /<a[^>]+href=["'](https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^"']+)["'][^>]*>.*?<\/a>/gi;
      c = c.replace(ytAnchorRe, (_m, url: string) => {
        const id = getYouTubeId(url);
        if (!id) return _m;
        const src = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
        return `<div class="my-6 rounded-2xl overflow-hidden shadow"><iframe src="${src}" style="width:100%;aspect-ratio:16/9;max-width:100%;" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      });

      // 2) ضمان أن أي iframe (بما فيها YouTube) يأخذ عرض كامل ونسبة 16:9 ويُحمّل بكسلنة
      // أ) إضافة style افتراضي إذا لم يوجد
      c = c.replace(/<iframe(?![^>]*\bstyle=)/gi, '<iframe style="width:100%;aspect-ratio:16/9;max-width:100%;"');
      // ب) إضافة loading و allow و allowfullscreen إن لم تكن موجودة
      c = c.replace(/<iframe([^>]*)>/gi, (match: string, attrs: string) => {
        let tag = match;
        if (!/\bloading=/.test(tag)) tag = tag.replace('<iframe', '<iframe loading="lazy"');
        if (!/\ballow=/.test(tag)) tag = tag.replace('<iframe', '<iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"');
        if (!/\ballowfullscreen\b/i.test(tag)) tag = tag.replace(/<iframe([^>]*)>/i, '<iframe$1 allowfullscreen>');
        return tag;
      });
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
    // تحويل صور المحتوى: Cloudinary f_auto,q_auto:eco,w_1200 للصور الكبيرة، وإضافة lazy
    try {
      // إضافة loading="lazy" لكل img بلا loading
      c = c.replace(/<img(?![^>]*\bloading=)[^>]*>/gi, (tag) => {
        return tag.replace(/<img/i, '<img loading="lazy" decoding="async"');
      });
      // حقن تحويل Cloudinary بسيط إذا لم توجد تحويلات
      c = c.replace(/<img([^>]+)src=["']([^"']+)["']([^>]*)>/gi, (m, pre, src, post) => {
        try {
          if (!src.includes('res.cloudinary.com') || !src.includes('/upload/')) return m;
          if(/\/upload\/(c_|w_|f_|q_|g_)/.test(src)) return m;
          const parts = src.split('/upload/');
          if (parts.length !== 2) return m;
          const tx = 'f_auto,q_auto:eco,w_1200';
          const newSrc = `${parts[0]}/upload/${tx}/${parts[1]}`;
          return `<img${pre}src="${newSrc}"${post}>`;
        } catch { return m; }
      });
    } catch {}
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


