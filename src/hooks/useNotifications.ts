import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  starNotification,
  deleteNotification,
  deleteAllNotifications,
} from '@/lib/supabase/queries/notifications';
import { createClient } from '@/lib/supabase/client';

export const useNotifications = (userId: string | undefined) =>
  useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => fetchNotifications(userId!),
    enabled: !!userId,
  });

export const useUnreadCount = (userId: string | undefined) => {
  const { data } = useNotifications(userId);
  return data?.filter((n) => !n.read_at).length ?? 0;
};

export const useMarkNotificationRead = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });
};

export const useMarkAllRead = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });
};

export const useStarNotification = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, starred }: { id: string; starred: boolean }) =>
      starNotification(id, starred),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });
};

export const useDeleteNotification = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });
};

export const useDeleteAllNotifications = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteAllNotifications(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });
};

// Realtime subscription hook
export const useNotificationsRealtime = (userId: string | undefined) => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['notifications', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, qc]);
};
