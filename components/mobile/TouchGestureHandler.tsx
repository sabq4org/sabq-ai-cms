"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";

interface TouchGestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullToRefresh?: () => Promise<void>;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function TouchGestureHandler({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPullToRefresh,
  onLongPress,
  onDoubleTap,
  threshold = 50,
  className,
  style
}: TouchGestureHandlerProps) {
  const controls = useAnimation();
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const lastTapTime = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // معالج السحب
  const handleDragEnd = async (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // تحديد اتجاه السحب
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      // سحب أفقي
      if (offset.x > threshold && velocity.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < -threshold && velocity.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      // سحب عمودي
      if (offset.y > threshold && velocity.y > 0) {
        if (onPullToRefresh && window.scrollY === 0) {
          // Pull to refresh
          setIsPulling(true);
          try {
            await onPullToRefresh();
          } finally {
            setIsPulling(false);
            setPullDistance(0);
            controls.start({ y: 0 });
          }
        } else if (onSwipeDown) {
          onSwipeDown();
        }
      } else if (offset.y < -threshold && velocity.y < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }
    
    // إعادة تعيين الموضع
    controls.start({ x: 0, y: 0 });
  };

  // معالج السحب المستمر
  const handleDrag = (event: any, info: PanInfo) => {
    if (onPullToRefresh && window.scrollY === 0 && info.offset.y > 0) {
      setPullDistance(info.offset.y);
    }
  };

  // معالج النقر
  const handleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime.current;
    
    if (timeSinceLastTap < 300 && onDoubleTap) {
      // نقرة مزدوجة
      onDoubleTap();
      lastTapTime.current = 0;
    } else {
      lastTapTime.current = now;
    }
  };

  // معالج الضغط المطول
  const handleTouchStart = () => {
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
        // اهتزاز خفيف للتأكيد
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 500);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // تنظيف المؤقتات
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return (
    <>
      {/* مؤشر Pull to Refresh */}
      {onPullToRefresh && (
        <div 
          className="pull-to-refresh-indicator"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "hsl(var(--bg))",
            borderBottom: "1px solid hsl(var(--line))",
            transform: `translateY(${Math.min(pullDistance - 60, 0)}px)`,
            opacity: Math.min(pullDistance / 100, 1),
            zIndex: 1000,
            transition: isPulling ? "none" : "all 0.3s ease"
          }}
        >
          {isPulling ? (
            <div className="loading-spinner" style={{ width: "24px", height: "24px" }} />
          ) : (
            <motion.div
              animate={{ rotate: pullDistance * 3 }}
              style={{ 
                fontSize: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ↓
            </motion.div>
          )}
          <span style={{ 
            marginLeft: "8px", 
            fontSize: "14px", 
            color: "hsl(var(--muted))" 
          }}>
            {isPulling ? "جاري التحديث..." : pullDistance > 80 ? "اترك للتحديث" : "اسحب للتحديث"}
          </span>
        </div>
      )}

      <motion.div
        ref={containerRef}
        className={className}
        style={style}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onDrag={handleDrag}
        onTap={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        animate={controls}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {children}
      </motion.div>
    </>
  );
}

// Hook مخصص للإيماءات
export function useTouchGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50
}: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;
    const isUpSwipe = distanceY > threshold;
    const isDownSwipe = distanceY < -threshold;

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // أفقي
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      } else if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    } else {
      // عمودي
      if (isUpSwipe && onSwipeUp) {
        onSwipeUp();
      } else if (isDownSwipe && onSwipeDown) {
        onSwipeDown();
      }
    }
  }, [touchEnd]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: () => setTouchEnd(null)
  };
}

// مكون Swipeable Card
export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  style,
  className
}: {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  const [offset, setOffset] = useState(0);
  const controls = useAnimation();

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold && onSwipeRight) {
      controls.start({ x: "100%" });
      setTimeout(() => {
        onSwipeRight();
        controls.start({ x: 0 });
      }, 300);
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      controls.start({ x: "-100%" });
      setTimeout(() => {
        onSwipeLeft();
        controls.start({ x: 0 });
      }, 300);
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <div style={{ position: "relative", overflow: "hidden", ...style }} className={className}>
      {/* الإجراءات الخلفية */}
      {leftAction && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: Math.min(Math.abs(offset) / 100, 1)
        }}>
          {leftAction}
        </div>
      )}
      
      {rightAction && (
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: Math.min(Math.abs(offset) / 100, 1)
        }}>
          {rightAction}
        </div>
      )}

      {/* المحتوى القابل للسحب */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        onDrag={(e, info) => setOffset(info.offset.x)}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ position: "relative", zIndex: 1, background: "inherit" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
