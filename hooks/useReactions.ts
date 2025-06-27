import { useState, useCallback, useEffect } from 'react';

/** بنية التخزين العامة في localStorage تحت المفتاح sabq_reactions */
export interface ReactionState {
  liked?: boolean;
  saved?: boolean;
  shared?: boolean;
  [key: string]: any; // لدعم تفاعلات مستقبلية
}

export interface NamespaceReactions {
  [contentId: string]: ReactionState;
}

export interface AllReactions {
  [namespace: string]: NamespaceReactions;
}

const STORAGE_KEY = 'sabq_reactions';

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/** تحميل جميع التفاعلات من localStorage */
function loadReactions(): AllReactions {
  if (typeof window === 'undefined') return {};
  return safeParse<AllReactions>(localStorage.getItem(STORAGE_KEY), {});
}

/** حفظ جميع التفاعلات إلى localStorage */
function saveReactions(data: AllReactions) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** ترحيل المفاتيح القديمة (likedArticles، savedAnalysis …) إلى البنية الجديدة */
function migrateOldKeys() {
  if (typeof window === 'undefined') return;
  const migratedFlag = localStorage.getItem('sabq_reactions_migrated');
  if (migratedFlag) return; // تم الترحيل مسبقاً

  const reactions: AllReactions = loadReactions();

  // مقالات – likedArticles / savedArticles (كانت arrays of ids)
  const likedArticles = safeParse<string[]>(localStorage.getItem('likedArticles'), []);
  const savedArticles = safeParse<string[]>(localStorage.getItem('savedArticles'), []);

  if (likedArticles.length || savedArticles.length) {
    reactions.articles = reactions.articles || {};
    likedArticles.forEach(id => {
      reactions.articles[id] = { ...reactions.articles[id], liked: true };
    });
    savedArticles.forEach(id => {
      reactions.articles[id] = { ...reactions.articles[id], saved: true };
    });
  }

  // تحليلات عميقة – likedAnalysis / savedAnalysis (arrays)
  const likedAnalysis = safeParse<string[]>(localStorage.getItem('likedAnalysis'), []);
  const savedAnalysis = safeParse<string[]>(localStorage.getItem('savedAnalysis'), []);

  if (likedAnalysis.length || savedAnalysis.length) {
    reactions.deep = reactions.deep || {};
    likedAnalysis.forEach(id => {
      reactions.deep[id] = { ...reactions.deep[id], liked: true };
    });
    savedAnalysis.forEach(id => {
      reactions.deep[id] = { ...reactions.deep[id], saved: true };
    });
  }

  // حذف المفاتيح القديمة بعد الترحيل
  localStorage.removeItem('likedArticles');
  localStorage.removeItem('savedArticles');
  localStorage.removeItem('likedAnalysis');
  localStorage.removeItem('savedAnalysis');

  saveReactions(reactions);
  localStorage.setItem('sabq_reactions_migrated', '1');
}

/** الهوك الموحد للتفاعلات */
export function useReactions(namespace: string) {
  const [data, setData] = useState<NamespaceReactions>(() => {
    if (typeof window === 'undefined') return {};
    migrateOldKeys();
    const reactions = loadReactions();
    return reactions[namespace] || {};
  });

  // تحديث localStorage والمزامنة عبر النوافذ
  const writeData = useCallback(
    (updater: (prev: NamespaceReactions) => NamespaceReactions) => {
      setData(prev => {
        const next = updater(prev);
        const all = loadReactions();
        all[namespace] = next;
        saveReactions(all);
        window.dispatchEvent(new Event('reactions-updated'));
        return next;
      });
    },
    [namespace]
  );

  const toggleLike = useCallback(
    (id: string) => {
      writeData(prev => ({
        ...prev,
        [id]: { ...prev[id], liked: !prev[id]?.liked }
      }));
    },
    [writeData]
  );

  const toggleSave = useCallback(
    (id: string) => {
      writeData(prev => ({
        ...prev,
        [id]: { ...prev[id], saved: !prev[id]?.saved }
      }));
    },
    [writeData]
  );

  const getReaction = useCallback((id: string): ReactionState => data[id] || {}, [data]);
  const isLiked = useCallback((id: string) => !!data[id]?.liked, [data]);
  const isSaved = useCallback((id: string) => !!data[id]?.saved, [data]);

  // استماع لتعديلات من تبويبات أخرى
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const all = loadReactions();
        setData(all[namespace] || {});
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [namespace]);

  return {
    data,
    getReaction,
    isLiked,
    isSaved,
    toggleLike,
    toggleSave,
  } as const;
} 