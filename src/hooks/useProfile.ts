import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProfile,
  fetchProfileByUsername,
  fetchAllProfiles,
  searchProfiles,
  updateProfile,
  uploadAvatar,
} from '@/lib/supabase/queries/profiles';

export const useProfile = (userId: string | undefined) =>
  useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });

export const useAllProfiles = (excludeUserId?: string) =>
  useQuery({
    queryKey: ['profiles', 'all', excludeUserId],
    queryFn: () => fetchAllProfiles(excludeUserId),
  });

export const useProfileByUsername = (username: string | undefined) =>
  useQuery({
    queryKey: ['profile', 'username', username],
    queryFn: () => fetchProfileByUsername(username!),
    enabled: !!username,
  });

export const useSearchProfiles = (query: string) =>
  useQuery({
    queryKey: ['profiles', 'search', query],
    queryFn: () => searchProfiles(query),
    enabled: query.length >= 2,
  });

export const useUpdateProfile = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: { display_name?: string; bio?: string; avatar_url?: string }) =>
      updateProfile(userId, updates),
    onSuccess: (updated) => {
      qc.setQueryData(['profile', userId], updated);
    },
  });
};

export const useUploadAvatar = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadAvatar(userId, file),
    onSuccess: async (publicUrl) => {
      await updateProfile(userId, { avatar_url: publicUrl });
      qc.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
};
