import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, setAccessToken, getAccessToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessTokenState, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state on refresh via HttpOnly refresh cookie
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (res.ok) {
          const json = await res.json();
          const token = json.data.accessToken;
          const userObj = json.data.user;
          setAccessToken(token);
          setAccessTokenState(token);
          setUser(userObj);
        }
      } catch (err) {
        setAccessToken(null);
        setAccessTokenState(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const handleUnauthorized = () => {
      setAccessToken(null);
      setAccessTokenState(null);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post<{ accessToken: string; user: User }>('/api/auth/login', {
        email,
        password,
      });

      setAccessToken(res.accessToken);
      setAccessTokenState(res.accessToken);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout', {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAccessToken(null);
      setAccessTokenState(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: accessTokenState,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
