'use client';

import { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query/client';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { EmotionRegistry } from '@/lib/emotion/registry';
import { ThemeRegistry } from '@/styles/ThemeRegistry';

const AuthInitializer = () => {
  const { setUser, refreshUser } = useAuthStore();

  useEffect(() => {
    // Initial load — fetch user from session cookie
    refreshUser();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      // Skip events that don't change auth state
      if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') return;

      // For SIGNED_IN / SIGNED_OUT, defer refresh to the next tick
      // to avoid Supabase auth lock deadlock when querying inside onAuthStateChange
      if (event === 'SIGNED_IN') {
        setTimeout(() => refreshUser(), 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, refreshUser]);

  return null;
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <EmotionRegistry>
        <QueryClientProvider client={queryClient}>
          <ThemeRegistry>
            <AuthInitializer />
            {children}
          </ThemeRegistry>
        </QueryClientProvider>
      </EmotionRegistry>
    </NextThemesProvider>
  );
};
