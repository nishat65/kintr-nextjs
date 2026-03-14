import { create } from 'zustand';
import { Profile } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  refreshUser: async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    // User has a valid session — they ARE authenticated regardless of profile state
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    // Fall back to auth metadata if profile row doesn't exist yet
    const resolvedProfile: Profile | null = profile ?? (user.user_metadata ? {
      id: user.id,
      username: user.user_metadata.username ?? user.email?.split('@')[0] ?? user.id,
      display_name: user.user_metadata.display_name ?? user.user_metadata.full_name ?? 'User',
      avatar_url: user.user_metadata.avatar_url ?? null,
      bio: null,
      created_at: user.created_at,
      updated_at: user.created_at,
    } : null);
    set({ user: resolvedProfile, isAuthenticated: true, isLoading: false });
  },
}));
