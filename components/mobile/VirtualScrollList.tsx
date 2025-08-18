"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  style?: React.CSSProperties;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export default function VirtualScrollList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  className,
  style,
  onEndReached,
  endReachedThreshold = 0.8
}: VirtualScrollListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // حساب ارتفاع العنصر
  const getItemHeight = useCallback((index: number) => {
    return typeof itemHeight === "function" ? itemHeight(index) : itemHeight;
  }, [itemHeight]);

  // حساب الارتفاع الكلي
  const getTotalHeight = useCallback(() => {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      total += getItemHeight(i);
    }
    return total;
  }, [items.length, getItemHeight]);

  // حساب موضع العنصر
  const getItemOffset = useCallback((index: number) => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getItemHeight(i);
    }
    return offset;
  }, [getItemHeight]);

  // تحديث النطاق المرئي
  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    // العثور على أول عنصر مرئي
    let start = 0;
    let accumulatedHeight = 0;
    
    while (start < items.length && accumulatedHeight < scrollTop) {
      accumulatedHeight += getItemHeight(start);
      if (accumulatedHeight < scrollTop) start++;
    }

    // العثور على آخر عنصر مرئي
    let end = start;
    accumulatedHeight = getItemOffset(start);
    
    while (end < items.length && accumulatedHeight < scrollTop + containerHeight) {
      accumulatedHeight += getItemHeight(end);
      end++;
    }

    // إضافة overscan
    start = Math.max(0, start - overscan);
    end = Math.min(items.length, end + overscan);

    setVisibleRange({ start, end });
    setScrollTop(scrollTop);
    setContainerHeight(containerHeight);

    // التحقق من الوصول لنهاية القائمة
    if (onEndReached) {
      const scrollPercentage = 
        (scrollTop + containerHeight) / getTotalHeight();
      
      if (scrollPercentage >= endReachedThreshold) {
        onEndReached();
      }
    }
  }, [items.length, getItemHeight, getItemOffset, getTotalHeight, overscan, onEndReached, endReachedThreshold]);

  // معالج التمرير
  const handleScroll = useCallback(() => {
    requestAnimationFrame(updateVisibleRange);
  }, [updateVisibleRange]);

  // تحديث عند تغيير العناصر أو حجم النافذة
  useEffect(() => {
    updateVisibleRange();

    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(updateVisibleRange);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateVisibleRange]);

  // العناصر المرئية
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const offsetY = getItemOffset(visibleRange.start);

  return (
    <div
      ref={containerRef}
      className={`virtual-scroll-container ${className || ""}`}
      style={{
        height: "100%",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        position: "relative",
        ...style
      }}
      onScroll={handleScroll}
    >
      {/* Spacer للحفاظ على ارتفاع القائمة الكلي */}
      <div 
        style={{ 
          height: getTotalHeight(),
          position: "relative"
        }}
      >
        {/* العناصر المرئية فقط */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.start + index;
            const height = getItemHeight(actualIndex);
            
            return (
              <motion.div
                key={actualIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                style={{ height }}
              >
                {renderItem(item, actualIndex)}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Hook لإدارة البيانات اللانهائية
export function useInfiniteScroll<T>({
  fetchMore,
  hasMore = true,
  threshold = 0.8
}: {
  fetchMore: () => Promise<T[]>;
  hasMore?: boolean;
  threshold?: number;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const newItems = await fetchMore();
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchMore, loading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setLoading(false);
    setError(null);
  }, []);

  return {
    items,
    loading,
    error,
    loadMore,
    reset,
    hasMore,
    page
  };
}

// مكون قائمة محسّنة للأداء
export function OptimizedList<T>({
  items,
  renderItem,
  keyExtractor,
  estimatedItemSize = 100,
  onEndReached,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  refreshing = false,
  onRefresh,
  ...props
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  estimatedItemSize?: number;
  onEndReached?: () => void;
  ListHeaderComponent?: React.ReactNode;
  ListFooterComponent?: React.ReactNode;
  ListEmptyComponent?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [dimensions, setDimensions] = useState<Map<string, number>>(new Map());

  const getItemHeight = useCallback((index: number) => {
    const key = keyExtractor(items[index], index);
    return dimensions.get(key) || estimatedItemSize;
  }, [items, dimensions, estimatedItemSize, keyExtractor]);

  const measureItem = useCallback((key: string, height: number) => {
    setDimensions(prev => {
      const next = new Map(prev);
      next.set(key, height);
      return next;
    });
  }, []);

  const renderItemWithMeasure = useCallback((item: T, index: number) => {
    const key = keyExtractor(item, index);
    
    return (
      <MeasureableItem
        key={key}
        onMeasure={(height) => measureItem(key, height)}
      >
        {renderItem(item, index)}
      </MeasureableItem>
    );
  }, [renderItem, keyExtractor, measureItem]);

  if (items.length === 0 && ListEmptyComponent) {
    return <>{ListEmptyComponent}</>;
  }

  return (
    <div {...props}>
      {refreshing && (
        <div style={{ 
          textAlign: "center", 
          padding: "20px",
          background: "hsl(var(--bg))"
        }}>
          <div className="loading-spinner" />
        </div>
      )}
      
      {ListHeaderComponent}
      
      <VirtualScrollList
        items={items}
        itemHeight={getItemHeight}
        renderItem={renderItemWithMeasure}
        onEndReached={onEndReached}
      />
      
      {ListFooterComponent}
    </div>
  );
}

// مكون لقياس ارتفاع العناصر
function MeasureableItem({
  children,
  onMeasure
}: {
  children: React.ReactNode;
  onMeasure: (height: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const height = ref.current.getBoundingClientRect().height;
      onMeasure(height);
    }
  }, [onMeasure]);

  return <div ref={ref}>{children}</div>;
}
