"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Newspaper, FileText, BarChart3, Settings } from "lucide-react";
import React from "react";

export default function AdminLiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "all";

  const tabs: Array<{ key: string; label: string; href: string }> = [
    { key: "all", label: "الكل", href: "/admin-lite/news?status=all" },
    { key: "published", label: "منشور", href: "/admin-lite/news?status=published" },
    { key: "draft", label: "مسودة", href: "/admin-lite/news?status=draft" },
    { key: "scheduled", label: "مجدول", href: "/admin-lite/news?status=scheduled" },
    { key: "archived", label: "مؤرشف", href: "/admin-lite/news?status=archived" },
  ];

  function isActiveTab(key: string): boolean {
    return status === key;
  }

  function isActiveBottom(href: string): boolean {
    return pathname?.startsWith(href);
  }

  return (
    <html dir="rtl">
      <head>
        <link rel="stylesheet" href="/manus-ui.css" />
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </head>
      <body style={{ background: "hsl(var(--bg))", color: "hsl(var(--fg))" }}>
        {/* Sticky, swipeable header */}
        <header
          className="sticky top-0 z-40 border-b backdrop-blur supports-[backdrop-filter]:bg-white/60"
          style={{
            background: "hsl(var(--bg) / 0.85)",
            borderColor: "hsl(var(--line))",
          }}
        >
          <div className="px-3 pt-3">
            <div className="text-sm text-muted" style={{ marginBottom: 8 }}>سبق الذكية · النسخة الخفيفة</div>
          </div>
          <div className="overflow-x-auto no-scrollbar snap-x snap-mandatory">
            <div className="flex gap-8 px-3 py-2 items-center w-max">
              {tabs.map((t) => (
                <Link
                  key={t.key}
                  href={t.href}
                  className="snap-start"
                >
                  <span
                    className="inline-flex items-center px-4 py-2 rounded-full border text-sm"
                    style={{
                      background: isActiveTab(t.key)
                        ? "hsl(var(--accent) / 0.08)"
                        : "hsl(var(--bg-card))",
                      color: isActiveTab(t.key)
                        ? "hsl(var(--accent))"
                        : "hsl(var(--fg))",
                      borderColor: isActiveTab(t.key)
                        ? "hsl(var(--accent) / 0.25)"
                        : "hsl(var(--line))",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {t.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </header>

        <main style={{ paddingBottom: 72 }}>{children}</main>

        {/* Bottom navigation */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur"
          style={{
            background: "hsl(var(--bg) / 0.9)",
            borderColor: "hsl(var(--line))",
          }}
        >
          <div className="grid grid-cols-5 text-xs">
            <Link href="/sabq-admin" className="flex flex-col items-center py-2">
              <Home
                className="w-5 h-5"
                style={{ color: isActiveBottom("/sabq-admin") ? "hsl(var(--accent))" : "hsl(var(--muted))" }}
              />
              <span style={{ color: isActiveBottom("/sabq-admin") ? "hsl(var(--accent))" : "hsl(var(--muted))" }}>الرئيسية</span>
            </Link>

            <Link href="/admin-lite/news" className="flex flex-col items-center py-2">
              <Newspaper
                className="w-5 h-5"
                style={{ color: isActiveBottom("/admin-lite/news") ? "hsl(var(--accent))" : "hsl(var(--muted))" }}
              />
              <span style={{ color: isActiveBottom("/admin-lite/news") ? "hsl(var(--accent))" : "hsl(var(--muted))" }}>الأخبار</span>
            </Link>

            <Link href="/admin/articles" className="flex flex-col items-center py-2">
              <FileText
                className="w-5 h-5"
                style={{ color: isActiveBottom("/admin/articles") ? "hsl(var(--accent))" : "hsl(var(--muted))" }}
              />
              <span style={{ color: isActiveBottom("/admin/articles") ? "hsl(var(--accent))" : "hsl(var(--muted))" }}>المقالات</span>
            </Link>

            <Link href="/admin/analytics" className="flex flex-col items-center py-2">
              <BarChart3
                className="w-5 h-5"
                style={{ color: isActiveBottom("/admin/analytics") ? "hsl(var(--accent))" : "hsl(var(--muted))" }}
              />
              <span style={{ color: isActiveBottom("/admin/analytics") ? "hsl(var(--accent))" : "hsl(var(--muted))" }}>التحليلات</span>
            </Link>

            <Link href="/admin/settings" className="flex flex-col items-center py-2">
              <Settings
                className="w-5 h-5"
                style={{ color: isActiveBottom("/admin/settings") ? "hsl(var(--accent))" : "hsl(var(--muted))" }}
              />
              <span style={{ color: isActiveBottom("/admin/settings") ? "hsl(var(--accent))" : "hsl(var(--muted))" }}>الإعدادات</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  );
}


