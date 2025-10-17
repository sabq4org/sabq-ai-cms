/**
 * 📊 أقسام محسّنة مع عناوين وفاصلات أنيقة
 */

"use client";

import React from "react";
import { motion } from "framer-motion";

interface SectionDividerProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange";
  variant?: "default" | "light" | "gradient";
  showDot?: boolean;
}

const colorMap = {
  blue: {
    light: "from-blue-50 to-blue-100",
    dark: "dark:from-blue-900/20 dark:to-blue-800/20",
    accent: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
  },
  green: {
    light: "from-green-50 to-green-100",
    dark: "dark:from-green-900/20 dark:to-green-800/20",
    accent: "bg-green-500",
    text: "text-green-600 dark:text-green-400",
  },
  purple: {
    light: "from-purple-50 to-purple-100",
    dark: "dark:from-purple-900/20 dark:to-purple-800/20",
    accent: "bg-purple-500",
    text: "text-purple-600 dark:text-purple-400",
  },
  orange: {
    light: "from-orange-50 to-orange-100",
    dark: "dark:from-orange-900/20 dark:to-orange-800/20",
    accent: "bg-orange-500",
    text: "text-orange-600 dark:text-orange-400",
  },
};

export function SectionDivider({
  title,
  subtitle,
  icon,
  color = "blue",
  variant = "default",
  showDot = true,
}: SectionDividerProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`my-12 sm:my-16 md:my-20 py-8 sm:py-12 bg-gradient-to-r ${colors.light} ${colors.dark} rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700/50`}
    >
      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          {showDot && (
            <motion.div
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${colors.accent}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          {icon && <div className={colors.text}>{icon}</div>}
          {title && (
            <h2 className={`text-2xl sm:text-3xl font-bold ${colors.text}`}>
              {title}
            </h2>
          )}
        </div>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}

interface SectionWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange";
  className?: string;
}

export function SectionWrapper({
  children,
  title,
  subtitle,
  icon,
  color = "blue",
  className = "",
}: SectionWrapperProps) {
  return (
    <section className={`py-8 sm:py-12 md:py-16 ${className}`}>
      {title && (
        <SectionDivider
          title={title}
          subtitle={subtitle}
          icon={icon}
          color={color}
        />
      )}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

interface AnimatedLineProps {
  color?: string;
  className?: string;
}

export function AnimatedDividerLine({
  color = "bg-gradient-to-r from-blue-500 to-purple-500",
  className = "",
}: AnimatedLineProps) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.8 }}
      className={`h-1 ${color} rounded-full ${className}`}
      style={{ originX: 0 }}
    />
  );
}
