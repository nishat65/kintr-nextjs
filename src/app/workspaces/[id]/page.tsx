'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Tooltip,
  IconButton,
} from '@mui/material';
import { LayoutGrid, List, UserPlus, Settings, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  useWorkspace,
  useWorkspaceMembers,
  useWorkspaceGoals,
  useUpdateGoalStatusInWorkspace,
  useRemoveGoalFromWorkspace,
  useWorkspaceGoalsRealtime,
} from '@/hooks/useWorkspaces';
import { KanbanBoard } from '@/components/collaboration/KanbanBoard';
import { GoalStatus } from '@/types';
import { MemberAvatarStack } from '@/components/collaboration/MemberAvatarStack';
import { createNotification } from '@/lib/supabase/queries/notifications';
import { InviteMemberDialog } from '@/components/collaboration/InviteMemberDialog';
import { AddGoalToWorkspaceDialog } from '@/components/collaboration/AddGoalToWorkspaceDialog';

type ViewMode = 'board' | 'list';

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [view, setView] = useState<ViewMode>('board');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [addGoalOpen, setAddGoalOpen] = useState(false);

  const { data: workspace, isLoading: wsLoading } = useWorkspace(id);
  const { data: members } = useWorkspaceMembers(id);
  const { data: workspaceGoals, isLoading: goalsLoading } = useWorkspaceGoals(id);
  const updateStatus = useUpdateGoalStatusInWorkspace(id);
  const removeGoal = useRemoveGoalFromWorkspace(id);
  useWorkspaceGoalsRealtime(id);

  const userRole = members?.find(m => m.user_id === user?.id)?.role;
  const canEdit = userRole === 'owner' || userRole === 'admin' || userRole === 'member';
  const canManageMembers = userRole === 'owner' || userRole === 'admin';

  const handleStatusChange = async (goalId: string, status: GoalStatus) => {
    await updateStatus.mutateAsync({ goalId, status });

    // Notify all workspace collaborators (except the mover)
    if (!user?.id) return;
    const collaborators = members?.filter(m => m.user_id !== user.id) ?? [];
    if (collaborators.length === 0) return;
    try {
      await Promise.all(
        collaborators.map(m =>
          createNotification({
            user_id: m.user_id,
            actor_id: user.id,
            type: 'goal_status_changed',
            entity_type: 'goal',
            entity_id: goalId,
          })
        )
      );
    } catch {
      // Notification delivery failure should not surface to user
    }
  };

  if (wsLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>;
  }
  if (!workspace) {
    return <Box sx={{ p: 4 }}><Alert severity="error">Workspace not found</Alert></Box>;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: { xs: 2, md: 4 },
          py: 3,
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <Link href="/workspaces" style={{ textDecoration: 'none' }}>
            <Button
              startIcon={<ArrowLeft size={16} />}
              sx={{ color: 'text.secondary', mb: 1, minWidth: 0, p: '4px 8px', borderRadius: '8px' }}
            >
              Workspaces
            </Button>
          </Link>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={800}>{workspace.name}</Typography>
              {workspace.description && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {workspace.description}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {members && <MemberAvatarStack members={members.map(m => m.user)} max={5} />}
              {canEdit && (
                <Button
                  startIcon={<Plus size={16} />}
                  variant="contained"
                  size="small"
                  onClick={() => setAddGoalOpen(true)}
                  sx={{ borderRadius: '8px' }}
                >
                  Add Goal
                </Button>
              )}
              {canManageMembers && (
                <Button
                  startIcon={<UserPlus size={16} />}
                  variant="outlined"
                  size="small"
                  onClick={() => setInviteOpen(true)}
                  sx={{ borderColor: 'divider', color: 'text.primary' }}
                >
                  Invite
                </Button>
              )}
              {userRole === 'owner' && (
                <IconButton component={Link} href={`/workspaces/${id}/settings`} size="small">
                  <Settings size={18} />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* View tabs */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
            <Button
              startIcon={<LayoutGrid size={16} />}
              variant={view === 'board' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setView('board')}
              sx={{ borderRadius: '8px', borderColor: 'divider' }}
            >
              Board
            </Button>
            <Button
              startIcon={<List size={16} />}
              variant={view === 'list' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setView('list')}
              sx={{ borderRadius: '8px', borderColor: 'divider' }}
            >
              List
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1280, mx: 'auto' }}>
        {goalsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 5 }}><CircularProgress /></Box>
        ) : view === 'board' ? (
          <KanbanBoard goals={workspaceGoals ?? []} onStatusChange={handleStatusChange} />
        ) : (
          <Box>
            {(workspaceGoals ?? []).map(wg => (
              <Box
                key={wg.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  mb: 1,
                  bgcolor: 'background.paper',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={700}>{wg.goal.title}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{wg.goal.scope}</Typography>
                </Box>
                <Chip label={wg.goal.status.replace('_', ' ')} size="small" sx={{ textTransform: 'capitalize' }} />
                {wg.assignee && (
                  <Tooltip title={wg.assignee.display_name}>
                    <Avatar src={wg.assignee.avatar_url ?? undefined} sx={{ width: 28, height: 28 }}>
                      {wg.assignee.display_name[0]}
                    </Avatar>
                  </Tooltip>
                )}
                {canEdit && (
                  <Tooltip title="Remove from workspace">
                    <IconButton
                      size="small"
                      onClick={() => removeGoal.mutate(wg.id)}
                      disabled={removeGoal.isPending}
                      sx={{ color: 'error.main', opacity: 0.6, '&:hover': { opacity: 1 } }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ))}
            {(!workspaceGoals || workspaceGoals.length === 0) && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  No goals in this workspace yet
                </Typography>
                {canEdit && (
                  <Button
                    startIcon={<Plus size={16} />}
                    variant="outlined"
                    onClick={() => setAddGoalOpen(true)}
                    sx={{ borderRadius: '10px' }}
                  >
                    Add your first goal
                  </Button>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>

      <InviteMemberDialog open={inviteOpen} onClose={() => setInviteOpen(false)} workspaceId={id} ownerId={workspace.owner_id} />
      <AddGoalToWorkspaceDialog
        open={addGoalOpen}
        onClose={() => setAddGoalOpen(false)}
        workspaceId={id}
        existingGoals={workspaceGoals ?? []}
      />
    </Box>
  );
}
