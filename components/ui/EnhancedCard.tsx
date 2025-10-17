"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * تعريف أنواع البطاقات المختلفة باستخدام CVA
 */
const cardVariants = cva(
  // الأنماط الأساسية المشتركة
  "rounded-lg transition-all duration-200",
  {
    variants: {
      variant: {
        // البطاقة الافتراضية
        default:
          "bg-white dark:bg-gray-800 border border-brand-border dark:border-gray-700 shadow-sm hover:shadow-md",
        
        // بطاقة بدون حدود
        flat:
          "bg-brand-secondary dark:bg-gray-800",
        
        // بطاقة بارزة
        elevated:
          "bg-white dark:bg-gray-800 shadow-md hover:shadow-lg",
        
        // بطاقة شفافة
        ghost:
          "bg-transparent",
        
        // بطاقة بإطار فقط
        outline:
          "bg-transparent border-2 border-brand-border dark:border-gray-700",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      hoverable: {
        true: "cursor-pointer hover:scale-[1.02] hover:shadow-lg",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      hoverable: false,
    },
  }
);

export interface EnhancedCardProps
  extends Omit<HTMLMotionProps<"div">, "padding">,
    VariantProps<typeof cardVariants> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * مكون بطاقة محسّن مع تأثيرات حركية
 * 
 * الميزات:
 * - أنواع متعددة (default, flat, elevated, ghost, outline)
 * - أحجام padding مختلفة (none, sm, md, lg, xl)
 * - دعم header و footer اختياريين
 * - تأثيرات حركية عند التمرير (hoverable)
 * - دعم كامل للـ Dark Mode
 */
const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  (
    {
      className,
      variant,
      padding,
      hoverable,
      header,
      footer,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(cardVariants({ variant, padding, hoverable, className }))}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {header && (
          <div className="border-b border-brand-border dark:border-gray-700 pb-3 mb-3">
            {header}
          </div>
        )}
        
        {children}
        
        {footer && (
          <div className="border-t border-brand-border dark:border-gray-700 pt-3 mt-3">
            {footer}
          </div>
        )}
      </motion.div>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

/**
 * مكون رأس البطاقة (Card Header)
 */
const EnhancedCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5", className)}
    {...props}
  />
));
EnhancedCardHeader.displayName = "EnhancedCardHeader";

/**
 * مكون عنوان البطاقة (Card Title)
 */
const EnhancedCardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-brand-fg dark:text-white",
      className
    )}
    {...props}
  />
));
EnhancedCardTitle.displayName = "EnhancedCardTitle";

/**
 * مكون وصف البطاقة (Card Description)
 */
const EnhancedCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-brand-fgMuted dark:text-gray-400", className)}
    {...props}
  />
));
EnhancedCardDescription.displayName = "EnhancedCardDescription";

/**
 * مكون محتوى البطاقة (Card Content)
 */
const EnhancedCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
EnhancedCardContent.displayName = "EnhancedCardContent";

/**
 * مكون ذيل البطاقة (Card Footer)
 */
const EnhancedCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center", className)}
    {...props}
  />
));
EnhancedCardFooter.displayName = "EnhancedCardFooter";

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  EnhancedCardFooter,
  cardVariants,
};

