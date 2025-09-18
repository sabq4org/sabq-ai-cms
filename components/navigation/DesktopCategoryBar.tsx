"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

  return (
    <div
      style={{
        position: "sticky",
        top: (typeof window !== "undefined" && getComputedStyle(document.documentElement).getPropertyValue("--category-bar-top")) || undefined,
        zIndex: 950,
        background: "hsl(var(--bg), #fff)",
        borderBottom: "1px solid hsl(var(--line))",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            padding: "8px 0",
          }}
        >
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 32,
                  minWidth: 90,
                  borderRadius: 9999,
                  background: "hsl(var(--line) / 0.35)",
                  animation: "pulse 1.4s ease-in-out infinite",
                }}
              />
            ))
          ) : (
            sorted.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="category-chip"
                style={{
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  padding: "6px 12px",
                  borderRadius: 9999,
                  border: "1px solid hsl(var(--line))",
                  background: "hsl(var(--bg-card))",
                  color: "hsl(var(--fg))",
                  fontSize: 13,
                }}
              >
                {cat.name_ar || cat.name}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


