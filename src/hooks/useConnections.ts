import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchConnections,
  sendConnectionRequest,
  respondToConnection,
  removeConnection,
  checkConnectionStatus,
  createAcceptedConnection,
} from '@/lib/supabase/queries/connections';

export const useConnections = (userId: string | undefined) =>
  useQuery({
    queryKey: ['connections', userId],
    queryFn: () => fetchConnections(userId!),
    enabled: !!userId,
  });

export const useConnectionStatus = (userA: string | undefined, userB: string | undefined) =>
  useQuery({
    queryKey: ['connection-status', userA, userB],
    queryFn: () => checkConnectionStatus(userA!, userB!),
    enabled: !!userA && !!userB && userA !== userB,
  });

export const useSendConnectionRequest = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (addresseeId: string) => sendConnectionRequest(userId, addresseeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['connections', userId] });
      qc.invalidateQueries({ queryKey: ['connection-status'] });
    },
  });
};

export const useRespondToConnection = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ connectionId, status }: { connectionId: string; status: 'accepted' | 'rejected' }) =>
      respondToConnection(connectionId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['connections', userId] });
    },
  });
};

export const useRemoveConnection = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (connectionId: string) => removeConnection(connectionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['connections', userId] });
      qc.invalidateQueries({ queryKey: ['connection-status'] });
    },
  });
};

export const useCreateAcceptedConnection = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (otherId: string) => createAcceptedConnection(userId, otherId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['connections', userId] });
    },
  });
};
