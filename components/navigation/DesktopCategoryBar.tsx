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
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 950,
        backdropFilter: 'blur(8px)',
        background: 'hsl(var(--bg))',
        borderBottom: '1px solid hsl(var(--line))',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 12px' }}>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 0',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 32,
                      minWidth: 90,
                      borderRadius: 9999,
                      background: 'hsl(var(--line) / 0.35)',
                    }}
                  />
                ))
              : sorted.map((cat) => {
                  const active = isActive(cat.slug);
                  return (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      aria-current={active ? 'page' : undefined}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap',
                        textDecoration: 'none',
                        padding: '8px 14px',
                        borderRadius: 9999,
                        border: active ? '1px solid hsl(var(--accent))' : '1px solid transparent',
                        background: active ? 'hsl(var(--accent) / 0.12)' : 'transparent',
                        color: active ? 'hsl(var(--accent))' : 'hsl(var(--fg))',
                        fontSize: 13,
                        transition: 'background .2s ease, color .2s ease, border-color .2s ease, transform .15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLAnchorElement).style.background = 'hsl(var(--accent) / 0.08)';
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'hsl(var(--accent) / 0.2)';
                          (e.currentTarget as HTMLAnchorElement).style.color = 'hsl(var(--accent))';
                          (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'transparent';
                          (e.currentTarget as HTMLAnchorElement).style.color = 'hsl(var(--fg))';
                          (e.currentTarget as HTMLAnchorElement).style.transform = 'none';
                        }
                      }}
                    >
                      {cat.name_ar || cat.name}
                    </Link>
                  );
                })}
          </div>
        </div>
      </div>
    </div>
  );
}


