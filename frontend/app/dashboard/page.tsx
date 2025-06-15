'use client';

import React from 'react';
import { useState } from 'react';
import DashboardExample from '@/components/dashboard/DashboardExample';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // في الإنتاج، سيتم استخدام المكون الكامل
  // هنا نستخدم المثال للعرض
  return <DashboardExample />;
} 