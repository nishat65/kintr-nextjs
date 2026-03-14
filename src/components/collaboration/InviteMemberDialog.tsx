'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { useInviteMember, useWorkspaceGoals } from '@/hooks/useWorkspaces';
import { useSearchProfiles } from '@/hooks/useProfile';
import { useCreateAcceptedConnection } from '@/hooks/useConnections';
import { createNotification } from '@/lib/supabase/queries/notifications';
import { useDebounce } from 'use-debounce';
import { Profile } from '@/types';

export const InviteMemberDialog = ({
  open,
  onClose,
  workspaceId,
  ownerId,
}: {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  ownerId: string;
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const { data: results, isLoading } = useSearchProfiles(debouncedQuery);
  const { data: workspaceGoals } = useWorkspaceGoals(workspaceId);
  const inviteMember = useInviteMember(workspaceId);
  const autoConnect = useCreateAcceptedConnection(ownerId);

  const handleInvite = async (user: Profile) => {
    await inviteMember.mutateAsync({ userId: user.id, role: 'member' });

    // Auto-accept connection between owner and new collaborator
    autoConnect.mutate(user.id);

    // Notify the new member they've been added
    await createNotification({
      user_id: user.id,
      actor_id: ownerId,
      type: 'collaborator_added',
      entity_type: 'workspace',
      entity_id: workspaceId,
    });

    // If the new collaborator already owns goals in this workspace, warn the owner
    const collaboratorGoals = workspaceGoals?.filter(wg => wg.goal?.user_id === user.id) ?? [];
    if (collaboratorGoals.length > 0) {
      await createNotification({
        user_id: ownerId,
        actor_id: user.id,
        type: 'collaborator_has_goal',
        entity_type: 'workspace',
        entity_id: workspaceId,
      });
    }

    setQuery('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle fontWeight={800}>Invite Member</DialogTitle>
      <DialogContent>
        <TextField
          label="Search by username or name"
          fullWidth
          value={query}
          onChange={e => setQuery(e.target.value)}
          sx={{ mb: 2 }}
        />
        {isLoading && <CircularProgress size={20} />}
        {results?.map(profile => (
          <Box
            key={profile.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: '12px',
              '&:hover': { bgcolor: 'action.hover' },
              cursor: 'pointer',
            }}
            onClick={() => handleInvite(profile)}
          >
            <Avatar src={profile.avatar_url ?? undefined} sx={{ width: 36, height: 36 }}>
              {profile.display_name[0]}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700}>{profile.display_name}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>@{profile.username}</Typography>
            </Box>
          </Box>
        ))}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: 'divider' }}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
