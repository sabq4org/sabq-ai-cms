"use client";
import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Newspaper, LayoutGrid, FileText, Compass, Brain } from "lucide-react";
import { NavItem } from "./NavItem";
import { useLightSidebar } from "./useLightSidebar";

interface LightSidebarProps {
  initialOpen?: boolean;
  onCloseExternal?: () => void;
}

const NAV_ITEMS = [
  { href: '/', label: 'الرئيسية', icon: <Home className="w-5 h-5" /> },
  { href: '/news', label: 'الأخبار', icon: <Newspaper className="w-5 h-5" /> },
  { href: '/categories', label: 'الأقسام', icon: <LayoutGrid className="w-5 h-5" /> },
  { href: '/articles', label: 'المقالات', icon: <FileText className="w-5 h-5" /> },
  { href: '/muqtareb', label: 'مُقترب', icon: <Compass className="w-5 h-5" /> },
  { href: '/depth', label: 'عمق', icon: <Brain className="w-5 h-5" /> },
];

export function LightSidebar({ initialOpen, onCloseExternal }: LightSidebarProps) {
  const { isOpen, open, close, toggle } = useLightSidebar();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const firstFocusable = useRef<HTMLAnchorElement | null>(null);
  const lastFocusable = useRef<HTMLAnchorElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (initialOpen) open();
  }, [initialOpen, open]);

  // Focus trap basic
  useEffect(() => {
    if (!isOpen) return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>("a, button");
    if (focusable && focusable.length) {
      focusable[0].focus();
      firstFocusable.current = focusable[0] as HTMLAnchorElement;
      lastFocusable.current = focusable[focusable.length - 1] as HTMLAnchorElement;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (focusable && focusable.length === 0) return;
        if (e.shiftKey && document.activeElement === firstFocusable.current) {
          e.preventDefault();
          lastFocusable.current?.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable.current) {
          e.preventDefault();
          firstFocusable.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const handleClose = () => {
    close();
    onCloseExternal?.();
    toggleRef.current?.focus();
  };

  return (
    <div className="relative" dir="rtl">
      {/* Toggle Button (consumer can also hide if already placing externally) */}
      <button
        ref={toggleRef}
        type="button"
        onClick={toggle}
        aria-controls="light-sidebar-panel"
        aria-expanded={isOpen}
        className="inline-flex items-center justify-center rounded-lg p-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/60 dark:focus:ring-blue-400/50 transition-colors"
      >
        <span className="sr-only">{isOpen ? 'إغلاق القائمة' : 'فتح القائمة'}</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              aria-hidden="true"
            />
            {/* Panel */}
            <motion.aside
              key="panel"
              id="light-sidebar-panel"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="القائمة الرئيسية"
              className="fixed top-0 right-0 h-full z-50 w-[78%] max-w-[300px] bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 shadow-xl flex flex-col overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.8 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight">القائمة</h2>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                >
                  <span className="sr-only">إغلاق</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1" aria-label="القائمة الأساسية">
                {NAV_ITEMS.map(item => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    onNavigate={handleClose}
                  />
                ))}
              </nav>
              <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-500 tracking-tight leading-snug">
                <p className="mb-1">© {new Date().getFullYear()} سبق الذكية</p>
                <p className="opacity-80">إصدار النسخة الخفيفة</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
