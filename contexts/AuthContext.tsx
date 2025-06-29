'use client';

import { useState, useEffect, createContext, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface User extends JwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserFromCookie = () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedUser = jwtDecode<User>(token);
        setUser(decodedUser);
      } catch (error) {
        console.error("Failed to decode token, removing it:", error);
        Cookies.remove('token');
        setUser(null);
      }
    }
    setLoading(false);
  };
  
  useEffect(() => {
    loadUserFromCookie();
  }, []);

  const login = (token: string) => {
    try {
      const decodedUser = jwtDecode<User>(token);
      setUser(decodedUser);
      Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'lax' });
    } catch (error) {
      console.error("Failed to process token on login:", error);
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('token');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 