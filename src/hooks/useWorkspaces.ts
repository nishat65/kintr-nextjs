import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  fetchUserWorkspaces,
  fetchWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  fetchWorkspaceMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  fetchWorkspaceGoals,
  addGoalToWorkspace,
  updateWorkspaceGoal,
  updateGoalStatus,
  removeGoalFromWorkspace,
  fetchGoalActivities,
  insertActivity,
  fetchAttachments,
  uploadAttachment,
  deleteAttachment,
  fetchWorkspaceTags,
  createTag,
} from '@/lib/supabase/queries/workspaces';
import { WorkspaceRole, GoalPriority, GoalStatus, WorkspaceFormValues } from '@/types';

export const useUserWorkspaces = (userId?: string) =>
  useQuery({
    queryKey: ['workspaces', userId],
    queryFn: () => fetchUserWorkspaces(userId!),
    enabled: !!userId,
  });

export const useWorkspace = (workspaceId?: string) =>
  useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => fetchWorkspace(workspaceId!),
    enabled: !!workspaceId,
  });

export const useCreateWorkspace = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ values, userId }: { values: WorkspaceFormValues; userId: string }) =>
      createWorkspace(values, userId),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ['workspaces', userId] });
    },
  });
};

export const useUpdateWorkspace = (workspaceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<{ name: string; description: string; visibility: 'private' | 'public' }>) =>
      updateWorkspace(workspaceId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace', workspaceId] });
    },
  });
};

export const useDeleteWorkspace = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: string) => deleteWorkspace(workspaceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export const useWorkspaceMembers = (workspaceId?: string) =>
  useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: () => fetchWorkspaceMembers(workspaceId!),
    enabled: !!workspaceId,
  });

export const useInviteMember = (workspaceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role?: WorkspaceRole }) =>
      inviteMember(workspaceId, userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
    },
  });
};

export const useUpdateMemberRole = (workspaceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: WorkspaceRole }) =>
      updateMemberRole(workspaceId, userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
    },
  });
};

export const useRemoveMember = (workspaceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeMember(workspaceId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
    },
  });
};

export const useWorkspaceGoals = (workspaceId?: string) =>
  useQuery({
    queryKey: ['workspace-goals', workspaceId],
    queryFn: () => fetchWorkspaceGoals(workspaceId!),
    enabled: !!workspaceId,
  });

export const useAddGoalToWorkspace = (workspaceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, userId }: { goalId: string; userId: string }) =>
      addGoalToWorkspace(workspaceId, goalId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-goals', workspaceId] });
      qc.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export const useUpdateWorkspaceGoal = (workspaceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{ assignee_id: string | null; priority: GoalPriority; due_date: string | null; position: number }>;
    }) => updateWorkspaceGoal(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-goals', workspaceId] });
    },
  });
};

export const useUpdateGoalStatusInWorkspace = (workspaceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, status }: { goalId: string; status: GoalStatus }) =>
      updateGoalStatus(goalId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-goals', workspaceId] });
      qc.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

export const useRemoveGoalFromWorkspace = (workspaceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeGoalFromWorkspace(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-goals', workspaceId] });
      qc.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export const useGoalActivities = (goalId?: string) =>
  useQuery({
    queryKey: ['goal-activities', goalId],
    queryFn: () => fetchGoalActivities(goalId!),
    enabled: !!goalId,
  });

export const useInsertActivity = (goalId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      actorId,
      type,
      metadata,
    }: {
      actorId: string;
      type: string;
      metadata?: Record<string, unknown>;
    }) => insertActivity(goalId, actorId, type, metadata),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goal-activities', goalId] });
    },
  });
};

export const useWorkspaceGoalsRealtime = (workspaceId?: string) => {
  const qc = useQueryClient();
  useEffect(() => {
    if (!workspaceId) return;
    const supabase = createClient();

    // Listen for workspace_goals table changes (add/remove/assign/priority)
    const wgChannel = supabase
      .channel(`workspace-goals-wg:${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspace_goals',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['workspace-goals', workspaceId] });
        }
      )
      .subscribe();

    // Listen for goals table changes (status updates happen on goals, not workspace_goals)
    const goalsChannel = supabase
      .channel(`workspace-goals-status:${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'goals',
        },
        () => {
          qc.invalidateQueries({ queryKey: ['workspace-goals', workspaceId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(wgChannel);
      supabase.removeChannel(goalsChannel);
    };
  }, [workspaceId, qc]);
};

export const useGoalActivitiesRealtime = (goalId?: string) => {
  const qc = useQueryClient();
  useEffect(() => {
    if (!goalId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`goal-activities-${goalId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'goal_activities',
          filter: `goal_id=eq.${goalId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['goal-activities', goalId] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [goalId, qc]);
};

export const useAttachments = (goalId?: string) =>
  useQuery({
    queryKey: ['attachments', goalId],
    queryFn: () => fetchAttachments(goalId!),
    enabled: !!goalId,
  });

export const useUploadAttachment = (goalId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      uploadAttachment(goalId, userId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attachments', goalId] });
    },
  });
};

export const useDeleteAttachment = (goalId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAttachment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attachments', goalId] });
    },
  });
};

export const useWorkspaceTags = (workspaceId?: string) =>
  useQuery({
    queryKey: ['workspace-tags', workspaceId],
    queryFn: () => fetchWorkspaceTags(workspaceId!),
    enabled: !!workspaceId,
  });

export const useCreateTag = (workspaceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) =>
      createTag(workspaceId, name, color),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-tags', workspaceId] });
    },
  });
};
