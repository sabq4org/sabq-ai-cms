"use client";

import { useEffect, useState } from "react";

export default function TableOfContents() {
  const [items, setItems] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll(".article-content h2, .article-content h3")) as HTMLElement[];
    const collected = headings.slice(0, 6).map((el, i) => {
      if (!el.id) el.id = `h-${i}-${el.textContent?.slice(0,10)}`;
      return { id: el.id, text: el.textContent || `العنوان ${i+1}` };
    });
    setItems(collected);
  }, []);

  if (items.length === 0) return null;
  
  return (
    <nav aria-label="جدول المحتويات" className="rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">جدول المحتويات</h3>
      <ul className="space-y-1 text-sm">
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className="text-blue-600 hover:underline dark:text-blue-400">{it.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}


