import { createBrowserClient } from '@supabase/ssr';

// Browser-side Supabase client — use inside Client Components and hooks
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
