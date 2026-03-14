import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  markMessagesRead,
  fetchGoalMessages,
  sendGoalMessage,
} from '@/lib/supabase/queries/messages';
import { createClient } from '@/lib/supabase/client';

export const useConversations = (userId: string | undefined) =>
  useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => fetchConversations(userId!),
    enabled: !!userId,
  });

export const useMessages = (userId: string | undefined, partnerId: string | undefined) =>
  useQuery({
    queryKey: ['messages', userId, partnerId],
    queryFn: () => fetchMessages(userId!, partnerId!),
    enabled: !!userId && !!partnerId,
  });

export const useSendMessage = (userId: string, partnerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendMessage(userId, partnerId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', userId, partnerId] });
      qc.invalidateQueries({ queryKey: ['conversations', userId] });
    },
  });
};

export const useMarkMessagesRead = (userId: string, senderId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markMessagesRead(userId, senderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', userId, senderId] });
      qc.invalidateQueries({ queryKey: ['conversations', userId] });
    },
  });
};

// Realtime for DM thread
export const useMessagesRealtime = (userId: string | undefined, partnerId: string | undefined) => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId || !partnerId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${userId}:${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new as { sender_id: string; recipient_id: string };
          const isRelevant =
            (msg.sender_id === userId && msg.recipient_id === partnerId) ||
            (msg.sender_id === partnerId && msg.recipient_id === userId);
          if (isRelevant) {
            qc.invalidateQueries({ queryKey: ['messages', userId, partnerId] });
            qc.invalidateQueries({ queryKey: ['conversations', userId] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, partnerId, qc]);
};

// Goal chat
export const useGoalMessages = (goalId: string | undefined) =>
  useQuery({
    queryKey: ['goal-messages', goalId],
    queryFn: () => fetchGoalMessages(goalId!),
    enabled: !!goalId,
  });

export const useSendGoalMessage = (goalId: string, goalOwnerId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ senderId, content }: { senderId: string; content: string }) =>
      sendGoalMessage(goalId, senderId, content, goalOwnerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goal-messages', goalId] });
    },
  });
};

export const useGoalMessagesRealtime = (goalId: string | undefined) => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!goalId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`goal-messages:${goalId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'goal_messages',
          filter: `goal_id=eq.${goalId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['goal-messages', goalId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [goalId, qc]);
};
