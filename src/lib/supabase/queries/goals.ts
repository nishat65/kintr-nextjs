import { createClient } from '@/lib/supabase/client';
import { Goal, Comment, GoalFormValues, GoalScope, GoalStatus } from '@/types';

export const fetchUserGoals = async (userId: string, scope?: GoalScope | 'all'): Promise<Goal[]> => {
  const supabase = createClient();
  let query = supabase
    .from('goals')
    .select('id, user_id, title, description, scope, target_date, status, visibility, priority, created_at, updated_at, author:profiles!goals_user_id_fkey(id, username, display_name, avatar_url, bio, created_at, updated_at)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (scope && scope !== 'all') {
    query = query.eq('scope', scope);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Goal[];
};

export const fetchPublicGoals = async (scope?: GoalScope | 'all'): Promise<Goal[]> => {
  const supabase = createClient();
  let query = supabase
    .from('goals')
    .select('id, user_id, title, description, scope, target_date, status, visibility, priority, created_at, updated_at, author:profiles!goals_user_id_fkey(id, username, display_name, avatar_url, bio, created_at, updated_at)')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(50);

  if (scope && scope !== 'all') {
    query = query.eq('scope', scope);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Goal[];
};

export const fetchGoalById = async (id: string): Promise<Goal> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('goals')
    .select('id, user_id, title, description, scope, target_date, status, visibility, priority, created_at, updated_at, author:profiles!goals_user_id_fkey(id, username, display_name, avatar_url, bio, created_at, updated_at)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as Goal;
};

export const createGoal = async (values: GoalFormValues, userId: string): Promise<Goal> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      title: values.title,
      description: values.description ?? null,
      scope: values.scope,
      target_date: values.target_date,
      visibility: values.visibility,
      priority: values.priority ?? 'none',
      status: 'not_started',
    })
    .select('id, user_id, title, description, scope, target_date, status, visibility, priority, created_at, updated_at, author:profiles!goals_user_id_fkey(id, username, display_name, avatar_url, bio, created_at, updated_at)')
    .single();
  if (error) throw error;
  return data as unknown as Goal;
};

export const updateGoalStatus = async (id: string, status: GoalStatus): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('goals').update({ status }).eq('id', id);
  if (error) throw error;
};

export const updateGoal = async (id: string, values: Partial<GoalFormValues>): Promise<Goal> => {
  const supabase = createClient();
  const updates: Record<string, unknown> = {};
  if (values.title !== undefined) updates.title = values.title;
  if ('description' in values) updates.description = values.description ?? null;
  if (values.scope !== undefined) updates.scope = values.scope;
  if (values.target_date !== undefined) updates.target_date = values.target_date;
  if (values.visibility !== undefined) updates.visibility = values.visibility;
  if (values.priority !== undefined) updates.priority = values.priority;
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .select('id, user_id, title, description, scope, target_date, status, visibility, priority, created_at, updated_at, author:profiles!goals_user_id_fkey(id, username, display_name, avatar_url, bio, created_at, updated_at)')
    .single();
  if (error) throw error;
  return data as unknown as Goal;
};

export const deleteGoal = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
};

export const fetchGoalVoteCounts = async (goalId: string): Promise<{ upvotes: number; downvotes: number }> => {
  const supabase = createClient();
  const { data, error } = await supabase.from('votes').select('type').eq('goal_id', goalId);
  if (error) throw error;
  const upvotes = data?.filter((v) => v.type === 'upvote').length ?? 0;
  const downvotes = data?.filter((v) => v.type === 'downvote').length ?? 0;
  return { upvotes, downvotes };
};

export const fetchUserVoteOnGoal = async (goalId: string, userId: string): Promise<'upvote' | 'downvote' | null> => {
  const supabase = createClient();
  const { data } = await supabase
    .from('votes')
    .select('type')
    .eq('goal_id', goalId)
    .eq('user_id', userId)
    .maybeSingle();
  return (data?.type as 'upvote' | 'downvote' | null) ?? null;
};

export const upsertVote = async (goalId: string, userId: string, type: 'upvote' | 'downvote'): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('votes')
    .upsert({ goal_id: goalId, user_id: userId, type }, { onConflict: 'goal_id,user_id' });
  if (error) throw error;
};

export const removeVote = async (goalId: string, userId: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('votes').delete().eq('goal_id', goalId).eq('user_id', userId);
  if (error) throw error;
};

export const fetchComments = async (goalId: string): Promise<Comment[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('comments')
    .select('id, goal_id, user_id, content, created_at, author:profiles!comments_user_id_fkey(id, username, display_name, avatar_url, bio, created_at, updated_at)')
    .eq('goal_id', goalId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Comment[];
};

export const addComment = async (goalId: string, userId: string, content: string): Promise<Comment> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('comments')
    .insert({ goal_id: goalId, user_id: userId, content })
    .select('id, goal_id, user_id, content, created_at, author:profiles!comments_user_id_fkey(id, username, display_name, avatar_url, bio, created_at, updated_at)')
    .single();
  if (error) throw error;
  return data as unknown as Comment;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) throw error;
};
