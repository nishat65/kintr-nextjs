import { createClient } from '@/lib/supabase/client';
import { Notification, NotificationType } from "@/types";

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('id, user_id, actor_id, type, entity_type, entity_id, read_at, starred, created_at, actor:profiles!notifications_actor_id_fkey(id, username, display_name, avatar_url, bio, created_at, updated_at)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as unknown as Notification[];
};

export const markNotificationRead = async (notificationId: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId);
  if (error) throw error;
};

export const markAllNotificationsRead = async (userId: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
  if (error) throw error;
};

export const starNotification = async (notificationId: string, starred: boolean) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ starred })
    .eq('id', notificationId);
  if (error) throw error;
};

export const deleteNotification = async (notificationId: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
  if (error) throw error;
};

export const deleteAllNotifications = async (userId: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
};

export const createNotification = async (payload: {
  user_id: string;
  actor_id: string;
  type: NotificationType;
  entity_type: 'goal' | 'comment' | 'message' | 'connection' | 'workspace';
  entity_id: string;
}) => {
  const supabase = createClient();
  const { error } = await supabase.from('notifications').insert(payload);
  if (error) throw error;
};
