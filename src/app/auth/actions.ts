'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const signOutAction = async () => {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  // Explicitly clear all Supabase auth cookies (including chunked tokens)
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-')) {
      cookieStore.delete(cookie.name);
    }
  }

  redirect('/login');
};
