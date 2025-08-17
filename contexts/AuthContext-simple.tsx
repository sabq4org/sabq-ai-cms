'use client';

import React, { createContext, useContext, ReactNode } from 'react';

export interface AuthContextType {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const authValue: AuthContextType = {
    user: null,
    loading: false,
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
    refreshUser: async () => {},
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}
