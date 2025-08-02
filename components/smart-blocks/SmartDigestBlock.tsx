'use client';

import React from 'react';

interface SmartDigestBlockProps {
  forceTimeSlot?: 'morning' | 'noon' | 'evening' | 'night';
}

export default function SmartDigestBlock({ forceTimeSlot }: SmartDigestBlockProps = {}) {
  // تم إزالة ميزة الجرعات الذكية من النظام
  return null;
}