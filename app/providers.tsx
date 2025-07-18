'use client';

import React from 'react'
import Image from 'next/image'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { DarkModeProvider } from '@/contexts/DarkModeContext'
import { Toaster } from 'react-hot-toast'

// دالة بسيطة لترحيل الإعدادات القديمة
const migrateThemeSettings = () => {
  if (typeof window !== 'undefined') {
    const darkMode = localStorage.getItem('darkMode');
    const theme = localStorage.getItem('theme');
    
    if (darkMode && !theme) {
      localStorage.setItem('theme', JSON.parse(darkMode) ? 'dark' : 'light');
    }
  }
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  // ترحيل إعدادات الثيم القديمة عند التحميل
  useEffect(() => {
    migrateThemeSettings();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <DarkModeProvider>
          {children}
          <Toaster 
            position="top-center"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10b981',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </DarkModeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}