import { createClient } from '@/lib/supabase/client';

const profileSelect = 'id, username, display_name, avatar_url, bio, created_at, updated_at';

export const fetchProfile = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(profileSelect)
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const fetchProfileByUsername = async (username: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(profileSelect)
    .eq('username', username)
    .single();
  if (error) throw error;
  return data;
};

export const searchProfiles = async (query: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(profileSelect)
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(20);
  if (error) throw error;
  return data ?? [];
};

export const fetchAllProfiles = async (excludeUserId?: string) => {
  const supabase = createClient();
  let query = supabase.from('profiles').select(profileSelect).order('display_name');
  if (excludeUserId) query = query.neq('id', excludeUserId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
};

export const updateProfile = async (
  userId: string,
  updates: { display_name?: string; bio?: string; avatar_url?: string }
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select(profileSelect)
    .single();
  if (error) throw error;
  return data;
};

export const uploadAvatar = async (userId: string, file: File) => {
  const supabase = createClient();
  const ext = file.name.split('.').pop();
  const path = `${userId}/avatar.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
};
