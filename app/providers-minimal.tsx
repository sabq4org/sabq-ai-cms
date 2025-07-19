'use client';

import React from 'react'
import { AuthProvider } from '@/contexts/AuthContext-simple'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
