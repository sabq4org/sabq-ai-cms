"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * تعريف أنواع الأزرار المختلفة باستخدام CVA
 */
const buttonVariants = cva(
  // الأنماط الأساسية المشتركة
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // الزر الأساسي - Navy Blue
        primary:
          "bg-brand-primary text-brand-primaryFg hover:bg-brand-primaryLight shadow-sm hover:shadow-md",
        
        // الزر الثانوي - Slate Gray
        secondary:
          "bg-brand-secondary text-brand-secondaryFg hover:bg-brand-secondaryDark border border-brand-border",
        
        // زر التمييز - Emerald Green
        accent:
          "bg-brand-accent text-brand-accentFg hover:bg-brand-accentDark shadow-sm hover:shadow-md",
        
        // زر الخطر
        danger:
          "bg-brand-danger text-white hover:bg-red-700 shadow-sm hover:shadow-md",
        
        // زر شفاف (Ghost)
        ghost:
          "hover:bg-brand-secondary text-brand-fg",
        
        // زر بإطار فقط (Outline)
        outline:
          "border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-brand-primaryFg",
        
        // زر رابط
        link:
          "text-brand-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface EnhancedButtonProps
  extends Omit<HTMLMotionProps<"button">, "size">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * مكون زر محسّن مع تأثيرات حركية
 * 
 * الميزات:
 * - أنواع متعددة (primary, secondary, accent, danger, ghost, outline, link)
 * - أحجام مختلفة (sm, md, lg, xl, icon)
 * - حالة تحميل مع spinner
 * - دعم الأيقونات (يسار ويمين)
 * - تأثيرات حركية دقيقة (micro-interactions)
 * - دعم كامل للـ Dark Mode
 */
const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ duration: 0.15 }}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span>{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span>{rightIcon}</span>}
      </motion.button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton, buttonVariants };

