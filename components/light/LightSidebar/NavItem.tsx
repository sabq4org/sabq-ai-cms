"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // if exists
import { HTMLAttributes } from "react";

interface NavItemProps extends HTMLAttributes<HTMLAnchorElement> {
  href: string;
  label: string;
  icon: React.ReactNode;
  onNavigate?: () => void;
}

export function NavItem({ href, label, icon, onNavigate, className, ...rest }: NavItemProps) {
  const pathnameRaw = usePathname();
  const pathname = pathnameRaw || "";
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      onClick={() => { onNavigate?.(); }}
      className={cn(
        "group flex flex-row-reverse items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/60 dark:focus:ring-blue-400/50",
        active
          ? "bg-gradient-to-l from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-200/60 dark:ring-blue-700/40"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60",
        className
      )}
      {...rest}
    >
      <span className="flex-1 text-right leading-snug tracking-tight">{label}</span>
      <span className="opacity-80 group-hover:opacity-100 transition-opacity" aria-hidden>{icon}</span>
    </Link>
  );
}
