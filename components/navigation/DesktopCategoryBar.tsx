"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type Category = {
  id: string;
  name?: string;
  name_ar?: string;
  slug: string;
  order?: number | null;
};

export default function DesktopCategoryBar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const pathname = usePathname();

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        const list: Category[] = data?.categories || data || [];
        if (!canceled) setCategories(list);
      } catch {
        if (!canceled) setCategories([]);
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);

  const sorted = useMemo(() => {
    const list = Array.isArray(categories) ? [...categories] : [];
    // ترتيب حسب الحقل order إن وُجد، وإلا حسب الاسم العربي/الإنجليزي
    return list.sort((a, b) => {
      const ao = typeof a.order === "number" ? a.order! : Number.MAX_SAFE_INTEGER;
      const bo = typeof b.order === "number" ? b.order! : Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      const an = (a.name_ar || a.name || "").localeCompare(b.name_ar || b.name || "", "ar");
      return an;
    });
  }, [categories]);

  const isActive = (slug: string) => {
    if (!pathname) return false;
    return pathname.startsWith(`/categories/${slug}`) || pathname.startsWith(`/news/category/${slug}`);
  };

  return (
    <div className="catbar">
      <div className="inner">
        <div className="scroll-wrapper">
          <div className="scroll">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="chip-skeleton" />
                ))
              : sorted.map((cat) => {
                  const active = isActive(cat.slug);
                  return (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={`chip ${active ? "active" : ""}`}
                    >
                      {cat.name_ar || cat.name}
                    </Link>
                  );
                })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .catbar {
          position: sticky;
          top: 0;
          z-index: 950;
          backdrop-filter: blur(8px);
          background: hsl(var(--bg));
          border-bottom: 1px solid hsl(var(--line));
        }
        .inner { max-width: 1400px; margin: 0 auto; padding: 0 12px; }
        .scroll-wrapper { position: relative; }
        .scroll {
          display: flex; align-items: center; gap: 8px; padding: 8px 0;
          overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; ms-overflow-style: none;
        }
        .scroll::-webkit-scrollbar { display: none; }
        .chip {
          display: inline-flex; align-items: center; justify-content: center;
          white-space: nowrap; text-decoration: none;
          padding: 8px 14px; border-radius: 9999px; border: 1px solid transparent;
          background: transparent; color: hsl(var(--fg)); font-size: 13px;
          transition: background .2s ease, color .2s ease, border-color .2s ease, transform .15s ease;
        }
        .chip:hover { background: hsl(var(--accent) / 0.08); border-color: hsl(var(--accent) / 0.2); color: hsl(var(--accent)); transform: translateY(-1px); }
        .chip.active { background: hsl(var(--accent) / 0.12); border-color: hsl(var(--accent)); color: hsl(var(--accent)); font-weight: 600; }
        .chip-skeleton {
          height: 32px; min-width: 90px; border-radius: 9999px; background: hsl(var(--line) / 0.35);
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse { 0% { opacity: .6 } 50% { opacity: .35 } 100% { opacity: .6 } }
      `}</style>
    </div>
  );
}


