"use client";
import { cn } from "@/lib/utils";
import React from "react";

export default function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("mx-auto max-w-[1200px] px-4 md:px-6", className)}>
      {children}
    </div>
  );
}


