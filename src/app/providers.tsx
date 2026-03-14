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
    refreshUser();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const authUser = session.user;
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        // Fall back to auth metadata if profile row not yet created
        setUser(profile ?? {
          id: authUser.id,
          username: authUser.user_metadata?.username ?? authUser.email?.split('@')[0] ?? authUser.id,
          display_name: authUser.user_metadata?.display_name ?? authUser.user_metadata?.full_name ?? 'User',
          avatar_url: authUser.user_metadata?.avatar_url ?? null,
          bio: null,
          created_at: authUser.created_at,
          updated_at: authUser.created_at,
        });
      } else {
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
