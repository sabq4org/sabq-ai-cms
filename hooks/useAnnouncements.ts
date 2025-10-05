'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type FeedType = 'banner' | 'list' | 'timeline';

interface UseAnnouncementsOptions {
  q?: string;
  type?: string;
  priority?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * خطاف مخصص لإدارة الإعلانات
 * Custom hook for managing announcements
 */
export function useAnnouncements(
  feed: FeedType,
  filters?: UseAnnouncementsOptions
) {
  let url = `/api/admin/announcements`;
  
  if (feed === 'timeline') {
    url = `/api/admin/announcements/timeline`;
  }

  // بناء query string
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }

  const fullUrl = queryParams.toString() 
    ? `${url}?${queryParams.toString()}` 
    : url;

  const { data, error, isLoading, mutate } = useSWR(fullUrl, fetcher, {
    refreshInterval: feed === 'banner' ? 60000 : 0, // Banner يحدث كل دقيقة
    revalidateOnFocus: true,
    dedupingInterval: 5000, // تجنب الطلبات المكررة
  });

  // منطق خاص للبانر: اختيار أول إعلان CRITICAL نشط
  let processedData = data;
  if (feed === 'banner' && data?.data) {
    processedData = data.data.find(
      (a: any) => 
        a.priority === 'CRITICAL' && 
        a.status === 'ACTIVE'
    );
  }

  return {
    data: processedData,
    error,
    isLoading,
    mutate,
  };
}
