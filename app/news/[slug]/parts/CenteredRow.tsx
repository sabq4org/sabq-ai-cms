"use client";
import { cn } from "@/lib/utils";
import React from "react";

export default function CenteredRow({ children, className, max = 1360 }: { children: React.ReactNode; className?: string; max?: number }) {
  return (
    <div
      className={cn("w-full", className)}
      style={{ paddingInline: `max(16px, calc((100vw - ${max}px) / 2))` }}
    >
      {children}
    </div>
  );
}


