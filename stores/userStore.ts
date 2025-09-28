"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  preferences?: {
    categories?: string[];
    topics?: string[];
    authors?: string[];
    darkMode?: boolean;
    fontSize?: 'small' | 'medium' | 'large';
    notifications?: boolean;
  };
  lastLogin?: string;
  isVerified?: boolean;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateUserPreferences: (preferences: Partial<User['preferences']>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      updateUserPreferences: (preferences) => 
        set((state) => ({
          user: state.user 
            ? { 
                ...state.user, 
                preferences: { 
                  ...state.user.preferences, 
                  ...preferences 
                } 
              } 
            : null
        })),
      logout: () => set({ user: null, error: null }),
    }),
    {
      name: 'sabq-user-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
