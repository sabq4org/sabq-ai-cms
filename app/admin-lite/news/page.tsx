"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MoreVertical, Edit, Trash2, Eye, Clock } from "lucide-react";

type LiteArticle = {
  id: string;
  title: string;
  slug?: string;
  thumbnail_url?: string | null;
  status: string;
  published_at?: string | null;
};

export default function AdminLiteNewsPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "all";

  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<LiteArticle[]>([]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("status", status);
    p.set("limit", "20");
    return p.toString();
  }, [status]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/admin/news?${query}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        const items: LiteArticle[] = (data?.items || data?.articles || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          thumbnail_url: a.thumbnail_url || a.cover_image || null,
          status: a.status,
          published_at: a.published_at || a.created_at || null,
        }));
        setArticles(items);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [query]);

  return (
    <div className="px-3 py-3" style={{ background: "hsl(var(--bg))" }}>
      {/* قائمة أخبار مبسطة للجوال */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted">جاري التحميل...</div>
        ) : articles.length === 0 ? (
          <div className="card" style={{ padding: 16 }}>
            <div className="card-title">لا توجد أخبار</div>
            <div className="card-subtitle">قم بإنشاء خبر جديد الآن</div>
            <div style={{ marginTop: 12 }}>
              <Link href="/admin/news/unified" className="btn btn-primary">
                إنشاء خبر جديد
              </Link>
            </div>
          </div>
        ) : (
          articles.map((a) => <MobileNewsCard key={a.id} article={a} />)
        )}
      </div>
    </div>
  );
}

function MobileNewsCard({ article }: { article: LiteArticle }) {
  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "غير منشور";

  return (
    <div
      className="card"
      style={{
        display: "grid",
        gridTemplateColumns: "64px 1fr auto",
        gap: 12,
        alignItems: "center",
        padding: 12,
      }}
    >
      {/* الصورة */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 8,
          overflow: "hidden",
          background: "hsl(var(--bg-card))",
          border: "1px solid hsl(var(--line))",
        }}
      >
        {article.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={article.title}
            src={article.thumbnail_url}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            className="flex items-center justify-center h-full text-xs text-muted"
            style={{ color: "hsl(var(--muted))" }}
          >
            لا صورة
          </div>
        )}
      </div>

      {/* النص */}
      <div style={{ minWidth: 0 }}>
        <div className="text-sm" style={{ fontWeight: 700 }}>
          <span className="line-clamp-2" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {article.title}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span
            className="chip"
            style={{
              background:
                article.status === "published"
                  ? "hsl(var(--accent) / 0.08)"
                  : "hsl(var(--bg-card))",
              color:
                article.status === "published"
                  ? "hsl(var(--accent))"
                  : "hsl(var(--muted))",
              border:
                article.status === "published"
                  ? "1px solid hsl(var(--accent) / 0.25)"
                  : "1px solid hsl(var(--line))",
            }}
          >
            {article.status === "published" ? "منشور" : article.status === "draft" ? "مسودة" : article.status}
          </span>
          <span className="inline-flex items-center gap-1 text-muted">
            <Clock className="w-3 h-3" /> {formattedDate}
          </span>
        </div>
      </div>

      {/* إجراءات */}
      <div className="relative">
        <details>
          <summary
            className="btn btn-sm"
            style={{ background: "hsl(var(--bg-card))", border: "1px solid hsl(var(--line))" }}
          >
            <MoreVertical className="w-4 h-4" />
          </summary>
          <div
            className="card"
            style={{
              position: "absolute",
              insetInlineStart: 0,
              marginTop: 8,
              width: 200,
              background: "hsl(var(--bg-card))",
              border: "1px solid hsl(var(--line))",
              padding: 8,
            }}
          >
            <ActionItem href={`/news/${article.slug || article.id}`} icon={<Eye className="w-4 h-4" style={{ color: "hsl(var(--accent))" }} />} label="عرض" />
            <ActionItem href={`/admin/news/unified?id=${article.id}`} icon={<Edit className="w-4 h-4" style={{ color: "hsl(var(--muted))" }} />} label="تعديل" />
            <ActionItem href={`/admin/news`} icon={<Trash2 className="w-4 h-4" style={{ color: "#dc2626" }} />} label="حذف" />
          </div>
        </details>
      </div>
    </div>
  );
}

function ActionItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded hover:bg-accent/5"
      style={{ color: "hsl(var(--fg))" }}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  );
}


