"use client";
import { useCallback } from "react";
import { Menu } from "lucide-react";

interface SidebarToggleButtonProps {
  onToggle: () => void;
  isOpen: boolean;
  className?: string;
}

export function SidebarToggleButton({ onToggle, isOpen, className }: SidebarToggleButtonProps) {
  const label = isOpen ? "إغلاق القائمة" : "فتح القائمة";
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={isOpen}
      aria-controls="light-sidebar-panel"
      onClick={onToggle}
      className={`inline-flex items-center justify-center rounded-lg p-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/60 dark:focus:ring-blue-400/50 transition-colors ${className || ''}`}
    >
      <Menu className="w-6 h-6" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
