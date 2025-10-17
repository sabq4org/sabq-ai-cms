/**
 * ✨ مكونات Micro-interactions وتأثيرات محسّنة
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: "lift" | "glow" | "shadow" | "scale";
}

export function HoverCard({
  children,
  className = "",
  hoverEffect = "lift",
}: HoverCardProps) {
  const effects = {
    lift: {
      initial: { y: 0 },
      hover: { y: -8 },
    },
    glow: {
      initial: { boxShadow: "0 0 0 rgba(59, 130, 246, 0)" },
      hover: { boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" },
    },
    shadow: {
      initial: { boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
      hover: { boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)" },
    },
    scale: {
      initial: { scale: 1 },
      hover: { scale: 1.05 },
    },
  };

  return (
    <motion.div
      initial={effects[hoverEffect].initial}
      whileHover={effects[hoverEffect].hover}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`${className}`}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export function AnimatedButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  icon,
  loading = false,
}: AnimatedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const variantClasses = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl",
    secondary:
      "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3 text-lg",
  };

  return (
    <motion.button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={loading}
      className={`
        inline-flex items-center gap-2 font-semibold rounded-lg
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-5 h-5"
        >
          ⏳
        </motion.div>
      ) : icon ? (
        icon
      ) : null}
      {children}
    </motion.button>
  );
}

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className = "",
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration,
        type: "spring",
        stiffness: 100,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  delay = 0.1,
  className = "",
}: StaggerContainerProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function ScaleIn({ children, delay = 0, className = "" }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        type: "spring",
        stiffness: 200,
      }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function Counter({
  from = 0,
  to,
  duration = 2,
  suffix = "",
  prefix = "",
  className = "",
}: CounterProps) {
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev < to) {
          return Math.min(prev + Math.ceil((to - from) / (duration * 10)), to);
        }
        return prev;
      });
    }, (duration * 1000) / 10);

    return () => clearInterval(interval);
  }, [from, to, duration]);

  return (
    <span className={className}>
      {prefix}
      {count.toLocaleString("ar-SA")}
      {suffix}
    </span>
  );
}
