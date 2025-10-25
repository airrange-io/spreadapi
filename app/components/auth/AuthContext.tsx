'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Hanko } from '@teamhanko/hanko-elements';
import { useRouter, usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  // Check if we're on a public view route (embeddable snippets/apps)
  const isViewRoute = pathname?.match(/^\/app\/v1\/services\/[^\/]+\/view\/[^\/]+/);

  useEffect(() => {
    // Skip Hanko initialization on public view routes
    if (isViewRoute) {
      setLoading(false);
      return;
    }

    const hankoInstance = new Hanko(hankoApi);
    setHanko(hankoInstance);
  }, [isViewRoute]);

  useEffect(() => {
    if (!hanko) return;

    const checkAuth = async () => {
      try {
        const currentUser = await (hanko as any).user.getCurrent();
        setUser(currentUser);
        setError(null);
        
        // Store user data in Redis
        if (currentUser) {
          try {
            await fetch('/api/auth/user-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: currentUser.id,
                userData: currentUser,
                action: 'session_check'
              })
            });
          } catch (error) {
            console.error('Failed to store user data:', error);
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

    const unsubscribeExpired = hanko.onSessionExpired(async () => {
      setUser(null);
      setLoading(false);
    });

    return () => {
      // Cleanup listeners if they exist
    };
  }, [hanko]);

  const logout = async () => {
    try {
      if (hanko && user) {
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