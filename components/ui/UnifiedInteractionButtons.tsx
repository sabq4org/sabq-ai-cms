'use client';

import React, { useEffect } from 'react';
import { Heart, Bookmark, Share2, Loader2 } from 'lucide-react';
import { useArticleInteraction } from '@/stores/userInteractions';
import { cn } from '@/lib/utils';

interface UnifiedInteractionButtonsProps {
  articleId: string;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  initialStats?: {
    likes?: number;
    saves?: number;
    shares?: number;
  };
  onInteraction?: (type: 'like' | 'save' | 'share', newState: boolean) => void;
}

export default function UnifiedInteractionButtons({
  articleId,
  className = '',
  variant = 'default',
  size = 'md',
  showLabels = false,
  initialStats = {},
  onInteraction
}: UnifiedInteractionButtonsProps) {
  const {
    liked,
    saved,
    shared,
    isLoading,
    error,
    clearError,
    toggleLike,
    toggleSave,
    toggleShare
  } = useArticleInteraction(articleId);

  // Clear error when component unmounts or articleId changes
  useEffect(() => {
    return () => clearError();
  }, [articleId, clearError]);

  // Handle interaction with callback
  const handleInteraction = async (type: 'like' | 'save' | 'share', toggleFn: () => Promise<boolean>) => {
    try {
      const newState = await toggleFn();
      onInteraction?.(type, newState);
    } catch (error) {
      console.error(`خطأ في ${type}:`, error);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: {
      button: 'p-1.5',
      icon: 'w-3 h-3',
      text: 'text-xs',
      gap: 'gap-1'
    },
    md: {
      button: 'p-2',
      icon: 'w-4 h-4',
      text: 'text-sm',
      gap: 'gap-1.5'
    },
    lg: {
      button: 'p-3',
      icon: 'w-5 h-5',
      text: 'text-base',
      gap: 'gap-2'
    }
  };

  const currentSize = sizeClasses[size];

  // Variant classes
  const getVariantClasses = (isActive: boolean, baseColor: string) => {
    const base = `
      ${currentSize.button} rounded-lg transition-all duration-200 
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none focus:ring-2 focus:ring-offset-2
    `;

    switch (variant) {
      case 'compact':
        return cn(base, isActive 
          ? `bg-${baseColor}-100 text-${baseColor}-700 border border-${baseColor}-200 hover:bg-${baseColor}-200 focus:ring-${baseColor}-500` 
          : `bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 focus:ring-gray-500`);
      
      case 'minimal':
        return cn(base, isActive 
          ? `text-${baseColor}-600 hover:text-${baseColor}-700 hover:bg-${baseColor}-50 focus:ring-${baseColor}-500` 
          : `text-gray-500 hover:text-gray-600 hover:bg-gray-50 focus:ring-gray-500`);
      
      default:
        return cn(base, isActive 
          ? `bg-${baseColor}-600 text-white hover:bg-${baseColor}-700 focus:ring-${baseColor}-500` 
          : `bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500`);
    }
  };

  // Error display
  if (error) {
    return (
      <div className={cn('flex items-center gap-2 text-red-600 text-sm', className)}>
        <span>⚠️ {error}</span>
        <button
          onClick={clearError}
          className="text-red-700 hover:text-red-800 underline"
        >
          إخفاء
        </button>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center',
      currentSize.gap,
      variant === 'compact' ? 'flex-wrap' : '',
      className
    )}>
      {/* Like Button */}
      <button
        onClick={() => handleInteraction('like', toggleLike)}
        disabled={isLoading}
        className={getVariantClasses(liked, 'red')}
        aria-label={liked ? 'إلغاء الإعجاب' : 'إعجاب'}
        title={liked ? 'إلغاء الإعجاب' : 'أعجبني'}
      >
        <div className={cn('flex items-center', currentSize.gap)}>
          {isLoading ? (
            <Loader2 className={cn(currentSize.icon, 'animate-spin')} />
          ) : (
            <Heart 
              className={cn(currentSize.icon, liked ? 'fill-current' : '')} 
            />
          )}
          {showLabels && (
            <span className={cn(currentSize.text, 'font-medium')}>
              {liked ? 'معجب' : 'إعجاب'}
              {initialStats.likes !== undefined && ` (${initialStats.likes + (liked ? 1 : 0)})`}
            </span>
          )}
        </div>
      </button>

      {/* Save Button */}
      <button
        onClick={() => handleInteraction('save', toggleSave)}
        disabled={isLoading}
        className={getVariantClasses(saved, 'blue')}
        aria-label={saved ? 'إلغاء الحفظ' : 'حفظ'}
        title={saved ? 'محفوظ' : 'حفظ المقال'}
      >
        <div className={cn('flex items-center', currentSize.gap)}>
          {isLoading ? (
            <Loader2 className={cn(currentSize.icon, 'animate-spin')} />
          ) : (
            <Bookmark 
              className={cn(currentSize.icon, saved ? 'fill-current' : '')} 
            />
          )}
          {showLabels && (
            <span className={cn(currentSize.text, 'font-medium')}>
              {saved ? 'محفوظ' : 'حفظ'}
              {initialStats.saves !== undefined && ` (${initialStats.saves + (saved ? 1 : 0)})`}
            </span>
          )}
        </div>
      </button>

      {/* Share Button */}
      <button
        onClick={() => handleInteraction('share', toggleShare)}
        disabled={isLoading}
        className={getVariantClasses(shared, 'green')}
        aria-label="مشاركة"
        title="مشاركة المقال"
      >
        <div className={cn('flex items-center', currentSize.gap)}>
          {isLoading ? (
            <Loader2 className={cn(currentSize.icon, 'animate-spin')} />
          ) : (
            <Share2 className={currentSize.icon} />
          )}
          {showLabels && (
            <span className={cn(currentSize.text, 'font-medium')}>
              مشاركة
              {initialStats.shares !== undefined && ` (${initialStats.shares + (shared ? 1 : 0)})`}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

// Hook for getting interaction states without UI
export function useInteractionStates(articleId: string) {
  const {
    liked,
    saved,
    shared,
    isLoading,
    error,
    toggleLike,
    toggleSave,
    toggleShare
  } = useArticleInteraction(articleId);

  return {
    states: { liked, saved, shared },
    isLoading,
    error,
    actions: { toggleLike, toggleSave, toggleShare }
  };
}

// Individual interaction buttons for more granular control
export function LikeButton({ articleId, className, size = 'md', showCount = false, initialCount = 0 }: {
  articleId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  initialCount?: number;
}) {
  const { liked, isLoading, toggleLike } = useArticleInteraction(articleId);
  const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const buttonClass = size === 'sm' ? 'p-1' : size === 'lg' ? 'p-3' : 'p-2';

  return (
    <button
      onClick={toggleLike}
      disabled={isLoading}
      className={cn(
        buttonClass,
        'rounded-lg transition-colors duration-200 flex items-center gap-1',
        liked 
          ? 'text-red-600 hover:text-red-700' 
          : 'text-gray-500 hover:text-red-600',
        className
      )}
      aria-label={liked ? 'إلغاء الإعجاب' : 'إعجاب'}
    >
      {isLoading ? (
        <Loader2 className={cn(sizeClass, 'animate-spin')} />
      ) : (
        <Heart className={cn(sizeClass, liked ? 'fill-current' : '')} />
      )}
      {showCount && (
        <span className="text-sm font-medium">
          {initialCount + (liked ? 1 : 0)}
        </span>
      )}
    </button>
  );
}

export function SaveButton({ articleId, className, size = 'md' }: {
  articleId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const { saved, isLoading, toggleSave } = useArticleInteraction(articleId);
  const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const buttonClass = size === 'sm' ? 'p-1' : size === 'lg' ? 'p-3' : 'p-2';

  return (
    <button
      onClick={toggleSave}
      disabled={isLoading}
      className={cn(
        buttonClass,
        'rounded-lg transition-colors duration-200',
        saved 
          ? 'text-blue-600 hover:text-blue-700' 
          : 'text-gray-500 hover:text-blue-600',
        className
      )}
      aria-label={saved ? 'إلغاء الحفظ' : 'حفظ'}
    >
      {isLoading ? (
        <Loader2 className={cn(sizeClass, 'animate-spin')} />
      ) : (
        <Bookmark className={cn(sizeClass, saved ? 'fill-current' : '')} />
      )}
    </button>
  );
}

export function ShareButton({ articleId, className, size = 'md', onShare }: {
  articleId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onShare?: () => void;
}) {
  const { shared, isLoading, toggleShare } = useArticleInteraction(articleId);
  const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const buttonClass = size === 'sm' ? 'p-1' : size === 'lg' ? 'p-3' : 'p-2';

  const handleShare = async () => {
    await toggleShare();
    onShare?.();
  };

  return (
    <button
      onClick={handleShare}
      disabled={isLoading}
      className={cn(
        buttonClass,
        'rounded-lg transition-colors duration-200',
        'text-gray-500 hover:text-green-600',
        className
      )}
      aria-label="مشاركة"
    >
      {isLoading ? (
        <Loader2 className={cn(sizeClass, 'animate-spin')} />
      ) : (
        <Share2 className={sizeClass} />
      )}
    </button>
  );
}
