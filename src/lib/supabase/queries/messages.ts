import { createClient } from '@/lib/supabase/client';
import { Message, GoalMessage } from '@/types';

const profileSelect = 'id, username, display_name, avatar_url, bio, created_at, updated_at';
const messageSelect = `id, sender_id, recipient_id, content, read_at, created_at, sender:profiles!messages_sender_id_fkey(${profileSelect})`;
const conversationSelect = `id, sender_id, recipient_id, content, read_at, created_at,
  sender:profiles!messages_sender_id_fkey(${profileSelect}),
  recipient:profiles!messages_recipient_id_fkey(${profileSelect})`;
const goalMessageSelect = `id, goal_id, sender_id, content, created_at, sender:profiles!goal_messages_sender_id_fkey(${profileSelect})`;

export const fetchConversations = async (userId: string): Promise<Message[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .select(conversationSelect)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const seen = new Set<string>();
  return ((data ?? []) as unknown as Message[]).filter((msg) => {
    const partnerId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
    if (seen.has(partnerId)) return false;
    seen.add(partnerId);
    return true;
  });
};

export const fetchMessages = async (userId: string, partnerId: string): Promise<Message[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .select(messageSelect)
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${userId})`)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Message[];
};

export const sendMessage = async (senderId: string, recipientId: string, content: string): Promise<Message> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, recipient_id: recipientId, content })
    .select(messageSelect)
    .single();
  if (error) throw error;

  // Notify the recipient (never self-notify)
  if (senderId !== recipientId) {
    await supabase.from('notifications').insert({
      user_id: recipientId,
      actor_id: senderId,
      type: 'message',
      entity_type: 'message',
      entity_id: data.id,
    });
  }

  return data as unknown as Message;
};

export const markMessagesRead = async (userId: string, senderId: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', userId)
    .eq('sender_id', senderId)
    .is('read_at', null);
  if (error) throw error;
};

export const fetchGoalMessages = async (goalId: string): Promise<GoalMessage[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('goal_messages')
    .select(goalMessageSelect)
    .eq('goal_id', goalId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as GoalMessage[];
};

export const sendGoalMessage = async (
  goalId: string,
  senderId: string,
  content: string,
  goalOwnerId?: string
): Promise<GoalMessage> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('goal_messages')
    .insert({ goal_id: goalId, sender_id: senderId, content })
    .select(goalMessageSelect)
    .single();
  if (error) throw error;

  // Notify goal owner if someone else sends a message
  if (goalOwnerId && senderId !== goalOwnerId) {
    await supabase.from('notifications').insert({
      user_id: goalOwnerId,
      actor_id: senderId,
      type: 'goal_message',
      entity_type: 'goal',
      entity_id: goalId,
    });
  }

  return data as unknown as GoalMessage;
};
