import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchUserGoals,
  fetchPublicGoals,
  fetchGoalById,
  createGoal,
  updateGoal,
  updateGoalStatus,
  deleteGoal,
  fetchGoalVoteCounts,
  fetchUserVoteOnGoal,
  upsertVote,
  removeVote,
  fetchComments,
  addComment,
  deleteComment,
} from '@/lib/supabase/queries/goals';
import { GoalFormValues, GoalScope, GoalStatus } from '@/types';

export const useUserGoals = (userId: string | undefined, scope?: GoalScope | 'all') =>
  useQuery({
    queryKey: ['goals', 'user', userId, scope],
    queryFn: () => fetchUserGoals(userId!, scope),
    enabled: !!userId,
  });

export const usePublicGoals = (scope?: GoalScope | 'all') =>
  useQuery({
    queryKey: ['goals', 'public', scope],
    queryFn: () => fetchPublicGoals(scope),
  });

export const useGoal = (id: string | undefined) =>
  useQuery({
    queryKey: ['goal', id],
    queryFn: () => fetchGoalById(id!),
    enabled: !!id,
  });

export const useCreateGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ values, userId }: { values: GoalFormValues; userId: string }) =>
      createGoal(values, userId),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ['goals', 'user', userId] });
    },
  });
};

export const useUpdateGoalStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: GoalStatus }) =>
      updateGoalStatus(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      qc.invalidateQueries({ queryKey: ['goal', id] });
    },
  });
};

export const useUpdateGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<GoalFormValues> }) =>
      updateGoal(id, values),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      qc.invalidateQueries({ queryKey: ['goal', data.id] });
    },
  });
};

export const useDeleteGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

export const useGoalVoteCounts = (goalId: string | undefined) =>
  useQuery({
    queryKey: ['votes', 'counts', goalId],
    queryFn: () => fetchGoalVoteCounts(goalId!),
    enabled: !!goalId,
  });

export const useUserVote = (goalId: string | undefined, userId: string | undefined) =>
  useQuery({
    queryKey: ['votes', 'user', goalId, userId],
    queryFn: () => fetchUserVoteOnGoal(goalId!, userId!),
    enabled: !!goalId && !!userId,
  });

export const useVote = (goalId: string, userId: string) => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['votes', 'counts', goalId] });
    qc.invalidateQueries({ queryKey: ['votes', 'user', goalId, userId] });
  };
  const upsert = useMutation({
    mutationFn: (type: 'upvote' | 'downvote') => upsertVote(goalId, userId, type),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: () => removeVote(goalId, userId),
    onSuccess: invalidate,
  });
  return { upsert, remove };
};

export const useComments = (goalId: string | undefined) =>
  useQuery({
    queryKey: ['comments', goalId],
    queryFn: () => fetchComments(goalId!),
    enabled: !!goalId,
  });

export const useAddComment = (goalId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, content }: { userId: string; content: string }) =>
      addComment(goalId, userId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', goalId] });
    },
  });
};

export const useDeleteComment = (goalId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', goalId] });
    },
  });
};
