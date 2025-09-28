"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // عدم إعادة المحاولة في حالة الفشل إلا مرة واحدة
            retry: 1,
            // مدة الكاش الافتراضية
            staleTime: 0,
            // مدة الاحتفاظ بالكاش
            gcTime: 0,
            // إعادة الجلب عند إعادة التركيز
            refetchOnWindowFocus: true,
            // إعادة الجلب عند إعادة الاتصال
            refetchOnReconnect: true,
          },
          mutations: {
            // عدم إعادة المحاولة في حالة فشل الطفرات
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
