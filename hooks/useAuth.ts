'use client';

import { useState, useEffect, useContext } from 'react';
import { AuthContext, AuthContextType, User } from '@/contexts/AuthContext';

interface UseAuthReturn {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  logout: () => void;
  userId: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const authContext = useContext(AuthContext);

  if (authContext === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, loading, logout } = authContext;
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      const userIsLoggedIn = !!user;
      setIsLoggedIn(userIsLoggedIn);
      const userIsAdmin = userIsLoggedIn && user ? (user.role === 'admin' || user.role === 'super_admin') : false;
      setIsAdmin(userIsAdmin);
      if (user?.id) {
        setUserId(String(user.id));
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_id', String(user.id));
        }
      } else if (typeof window !== 'undefined') {
        const id = localStorage.getItem('user_id');
        setUserId(id);
      }
    }
  }, [user, loading]);

  return { 
    user, 
    isLoggedIn, 
    isAdmin,
    isLoading: loading,
    logout,
    userId
  };
}; 