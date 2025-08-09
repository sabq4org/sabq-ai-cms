"use client";

interface KeyTakeawaysProps {
  points?: string[];
}

export default function KeyTakeaways({ points }: KeyTakeawaysProps) {
  if (!points || points.length === 0) return null;
  return (
    <div className="rounded-xl p-4 sm:p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
      <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">نقاط رئيسية</h3>
      <ul className="list-disc pr-5 space-y-1 text-amber-900 dark:text-amber-200">
        {points.slice(0,5).map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}


