'use client';

import React, { ReactNode } from 'react';

interface SmartSlotProps {
  position?: string;
  children?: ReactNode;
}

/**
 * SmartSlot: Placeholder لبلوكات ذكية يتم حقنها ديناميكياً لاحقاً.
 * حالياً يعرض حاوية بسيطة لتجنب أخطاء البناء.
 */
export default function SmartSlot({ position = 'default', children }: SmartSlotProps) {
  return (
    <div className="smart-slot border border-dashed border-blue-300 p-4 rounded-lg text-center text-sm text-blue-600/80">
      {children || `SmartSlot: ${position}`}
    </div>
  );
} 