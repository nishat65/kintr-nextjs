import { createClient } from '@/lib/supabase/client';
import {
  Workspace,
  WorkspaceMember,
  WorkspaceGoal,
  GoalActivity,
  Attachment,
  GoalTag,
  WorkspaceRole,
  GoalPriority,
  GoalStatus,
} from '@/types';

const profileSelect = 'id, username, display_name, avatar_url, bio, created_at, updated_at';
const goalSelect = `id, user_id, title, description, scope, target_date, status, visibility, created_at, updated_at, author:profiles!goals_user_id_fkey(${profileSelect})`;

export const fetchUserWorkspaces = async (userId: string): Promise<Workspace[]> => {
  const supabase = createClient();
  const { data: memberData } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId);

  if (!memberData || memberData.length === 0) return [];

  const workspaceIds = memberData.map(m => m.workspace_id);
  const { data, error } = await supabase
    .from('workspaces')
    .select(`id, name, description, owner_id, visibility, created_at, updated_at, owner:profiles!workspaces_owner_id_fkey(${profileSelect}), workspace_goals(count)`)
    .in('id', workspaceIds)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(ws => ({
    ...ws,
    goal_count: (ws.workspace_goals as unknown as { count: number }[])?.[0]?.count ?? 0,
  })) as unknown as Workspace[];
};

export const fetchWorkspace = async (workspaceId: string): Promise<Workspace> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspaces')
    .select(`id, name, description, owner_id, visibility, created_at, updated_at, owner:profiles!workspaces_owner_id_fkey(${profileSelect})`)
    .eq('id', workspaceId)
    .single();
  if (error) throw error;
  return data as unknown as Workspace;
};

export const createWorkspace = async (
  values: { name: string; description?: string; visibility: 'private' | 'public' },
  userId: string
): Promise<Workspace> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      name: values.name,
      description: values.description ?? null,
      visibility: values.visibility,
      owner_id: userId,
    })
    .select(`id, name, description, owner_id, visibility, created_at, updated_at, owner:profiles!workspaces_owner_id_fkey(${profileSelect})`)
    .single();
  if (error) throw error;
  await supabase.from('workspace_members').insert({ workspace_id: data.id, user_id: userId, role: 'owner' });
  return data as unknown as Workspace;
};

export const updateWorkspace = async (
  workspaceId: string,
  values: Partial<{ name: string; description: string; visibility: 'private' | 'public' }>
): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('workspaces').update(values).eq('id', workspaceId);
  if (error) throw error;
};

export const deleteWorkspace = async (workspaceId: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('workspaces').delete().eq('id', workspaceId);
  if (error) throw error;
};

export const fetchWorkspaceMembers = async (workspaceId: string): Promise<WorkspaceMember[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspace_members')
    .select(`id, workspace_id, user_id, role, joined_at, user:profiles!workspace_members_user_id_fkey(${profileSelect})`)
    .eq('workspace_id', workspaceId)
    .order('joined_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as WorkspaceMember[];
};

export const inviteMember = async (
  workspaceId: string,
  userId: string,
  role: WorkspaceRole = 'member'
): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('workspace_members')
    .insert({ workspace_id: workspaceId, user_id: userId, role });
  if (error) throw error;
};

export const updateMemberRole = async (
  workspaceId: string,
  userId: string,
  role: WorkspaceRole
): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('workspace_members')
    .update({ role })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);
  if (error) throw error;
};

export const removeMember = async (workspaceId: string, userId: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);
  if (error) throw error;
};

export const fetchWorkspaceGoals = async (workspaceId: string): Promise<WorkspaceGoal[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspace_goals')
    .select(`id, workspace_id, goal_id, assignee_id, priority, due_date, position, created_at, updated_at, goal:goals!workspace_goals_goal_id_fkey(${goalSelect}), assignee:profiles!workspace_goals_assignee_id_fkey(${profileSelect})`)
    .eq('workspace_id', workspaceId)
    .order('position', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as WorkspaceGoal[];
};

export const addGoalToWorkspace = async (
  workspaceId: string,
  goalId: string,
  userId: string
): Promise<WorkspaceGoal> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspace_goals')
    .insert({ workspace_id: workspaceId, goal_id: goalId, assignee_id: userId, position: Date.now() })
    .select(`id, workspace_id, goal_id, assignee_id, priority, due_date, position, created_at, updated_at, goal:goals!workspace_goals_goal_id_fkey(${goalSelect}), assignee:profiles!workspace_goals_assignee_id_fkey(${profileSelect})`)
    .single();
  if (error) throw error;
  return data as unknown as WorkspaceGoal;
};

export const updateWorkspaceGoal = async (
  id: string,
  updates: Partial<{ assignee_id: string | null; priority: GoalPriority; due_date: string | null; position: number }>
): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('workspace_goals').update(updates).eq('id', id);
  if (error) throw error;
};

export const updateGoalStatus = async (goalId: string, status: GoalStatus): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('goals').update({ status }).eq('id', goalId);
  if (error) throw error;
};

export const removeGoalFromWorkspace = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('workspace_goals').delete().eq('id', id);
  if (error) throw error;
};

export const fetchGoalActivities = async (goalId: string): Promise<GoalActivity[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('goal_activities')
    .select(`id, goal_id, actor_id, type, metadata, created_at, actor:profiles!goal_activities_actor_id_fkey(${profileSelect})`)
    .eq('goal_id', goalId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as unknown as GoalActivity[];
};

export const insertActivity = async (
  goalId: string,
  actorId: string,
  type: string,
  metadata: Record<string, unknown> = {}
): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('goal_activities')
    .insert({ goal_id: goalId, actor_id: actorId, type, metadata });
  if (error) throw error;
};

export const fetchAttachments = async (goalId: string): Promise<Attachment[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('attachments')
    .select(`id, goal_id, uploaded_by, file_name, file_url, file_size, mime_type, created_at, uploader:profiles!attachments_uploaded_by_fkey(${profileSelect})`)
    .eq('goal_id', goalId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Attachment[];
};

export const uploadAttachment = async (
  goalId: string,
  userId: string,
  file: File
): Promise<Attachment> => {
  const supabase = createClient();
  const path = `${userId}/${goalId}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage.from('attachments').upload(path, file);
  if (uploadError) throw uploadError;
  const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(path);
  const { data, error } = await supabase
    .from('attachments')
    .insert({
      goal_id: goalId,
      uploaded_by: userId,
      file_name: file.name,
      file_url: publicUrl,
      file_size: file.size,
      mime_type: file.type,
    })
    .select(`id, goal_id, uploaded_by, file_name, file_url, file_size, mime_type, created_at, uploader:profiles!attachments_uploaded_by_fkey(${profileSelect})`)
    .single();
  if (error) throw error;
  return data as unknown as Attachment;
};

export const deleteAttachment = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('attachments').delete().eq('id', id);
  if (error) throw error;
};

export const fetchWorkspaceTags = async (workspaceId: string): Promise<GoalTag[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('goal_tags')
    .select('id, workspace_id, name, color, created_at')
    .eq('workspace_id', workspaceId)
    .order('name');
  if (error) throw error;
  return (data ?? []) as unknown as GoalTag[];
};

export const createTag = async (
  workspaceId: string,
  name: string,
  color: string
): Promise<GoalTag> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('goal_tags')
    .insert({ workspace_id: workspaceId, name, color })
    .select('id, workspace_id, name, color, created_at')
    .single();
  if (error) throw error;
  return data as unknown as GoalTag;
};
