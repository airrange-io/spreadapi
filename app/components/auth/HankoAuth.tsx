'use client';

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { register, Hanko } from "@teamhanko/hanko-elements";

const hankoApi = process.env.NEXT_PUBLIC_HANKO_API_URL!;

interface HankoAuthProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function HankoAuth({ onSuccess, redirectTo = "/" }: HankoAuthProps) {
  const router = useRouter();
  const [hanko, setHanko] = useState<Hanko>();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (hankoApi) {
      setHanko(new Hanko(hankoApi));
    }
  }, []);

  const redirectAfterLogin = useCallback(() => {
    // Check if there's a returnTo parameter in the URL
    const searchParams = new URLSearchParams(window.location.search);
    const returnTo = searchParams.get('returnTo');
    
    
    if (onSuccess) {
      onSuccess();
    }
    
    // Redirect to returnTo URL or the specified redirectTo prop
    const targetUrl = returnTo || redirectTo;
    
    // Force a page reload to ensure auth state is refreshed
    window.location.href = targetUrl;
  }, [router, redirectTo, onSuccess]);

  useEffect(() => {
    if (!hanko) return;
    
    // Set up the redirect handler
    const unsubscribe = hanko.onSessionCreated(async () => {
      try {
        // Get the user data to cache it
        const user = await hanko.user.getCurrent();
        if (user) {
          // Cache user data in Redis
          await fetch('/api/auth/cache-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              userData: user,
              action: 'login'
            })
          });
        }
      } catch (error) {
        console.error('Failed to cache user data on login:', error);
      }
      
      redirectAfterLogin();
    });
    
    // Don't check if already logged in here - let the session handler do it
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [hanko, redirectAfterLogin]);

  useEffect(() => {
    register(hankoApi).catch((error) => {
      console.error("Failed to register Hanko elements:", error);
      setError("Failed to initialize authentication. Please try again.");
    });
  }, []);

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        color: '#ff4d4f' 
      }}>
        {error}
      </div>
    );
  }

  return <hanko-auth />;
}