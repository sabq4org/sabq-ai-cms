'use client';

import { useDarkModeContext } from '@/contexts/DarkModeContext';
import useThemeEnforcer from '@/hooks/useThemeEnforcer';

export default function ThemeApplier() {
  const { darkMode, mounted } = useDarkModeContext();
  
  // استخدام Hook لضمان تطبيق الوضع الليلي
  useThemeEnforcer(darkMode, mounted);

  return null;
}
