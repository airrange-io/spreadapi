'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Hanko } from '@teamhanko/hanko-elements';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  logout: async () => {},
  isAuthenticated: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const hankoApi = process.env.NEXT_PUBLIC_HANKO_API_URL!;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hanko, setHanko] = useState<Hanko>();
  const router = useRouter();
  

  useEffect(() => {
    const hankoInstance = new Hanko(hankoApi);
    setHanko(hankoInstance);
  }, []);

  useEffect(() => {
    if (!hanko) return;

    const checkAuth = async () => {
      try {
        const currentUser = await (hanko as any).user.getCurrent();
        setUser(currentUser);
        setError(null);
        
        // Cache user data in Redis
        if (currentUser) {
          try {
            await fetch('/api/auth/cache-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: currentUser.id,
                userData: currentUser,
                action: 'session_check'
              })
            });
          } catch (cacheError) {
            console.error('Failed to cache user data:', cacheError);
          }
        }
      } catch (err: any) {
        // User is not authenticated - this is expected, not an error
        setUser(null);
        setError(null);
        
        // Only log unexpected errors
        if (err?.status !== 401 && err?.code !== 'unauthorized') {
          console.error('Auth check error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const unsubscribe = hanko.onSessionCreated(() => {
      checkAuth();
    });

    const unsubscribeExpired = hanko.onSessionExpired(() => {
      setUser(null);
      setLoading(false);
    });

    return () => {
      // Cleanup listeners if they exist
    };
  }, [hanko]);

  const logout = async () => {
    try {
      if (hanko) {
        await (hanko as any).user.logout();
        setUser(null);
        router.push('/');
      }
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Failed to logout');
    }
  };

  const value = {
    user,
    loading,
    error,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}