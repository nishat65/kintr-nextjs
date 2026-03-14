'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  TextField,
  Chip,
  Alert,
  InputAdornment,
} from '@mui/material';
import { X, Search, Target, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';
import { useAuthStore } from '@/stores/authStore';
import { useUserGoals } from '@/hooks/useGoals';
import { useAddGoalToWorkspace } from '@/hooks/useWorkspaces';
import { WorkspaceGoal } from '@/types';

const scopeColor: Record<string, string> = {
  day: '#F5603A',
  month: '#3B72EE',
  year: '#F5C332',
};

interface AddGoalToWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  existingGoals: WorkspaceGoal[];
}

export const AddGoalToWorkspaceDialog = ({
  open,
  onClose,
  workspaceId,
  existingGoals,
}: AddGoalToWorkspaceDialogProps) => {
  const { user } = useAuthStore();
  const { data: userGoals = [], isLoading } = useUserGoals(user?.id, 'all');
  const addGoal = useAddGoalToWorkspace(workspaceId);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const existingGoalIds = new Set(existingGoals.map((wg) => wg.goal_id));

  const filtered = userGoals.filter(
    (g) =>
      !existingGoalIds.has(g.id) &&
      (search === '' || g.title.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async (goalId: string) => {
    if (!user) return;
    setAdding(goalId);
    setError(null);
    try {
      await addGoal.mutateAsync({ goalId, userId: user.id });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAdding(null);
    }
  };

  const handleClose = () => {
    setSearch('');
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '20px' } } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>Add Goal to Workspace</Typography>
        <IconButton onClick={handleClose} size="small"><X size={18} /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Select one of your personal goals to add to this workspace.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>
        )}

        <TextField
          fullWidth
          placeholder="Search goals…"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} color="#6B6B80" />
                </InputAdornment>
              ),
            },
          }}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Target size={36} color="#E8E8F0" />
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
              {search ? 'No goals match your search' : 'All your goals are already in this workspace'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 360, overflowY: 'auto' }}>
            {filtered.map((goal) => {
              const isAdding = adding === goal.id;
              const alreadyAdded = existingGoalIds.has(goal.id);
              return (
                <Box
                  key={goal.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'border-color 0.15s',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {goal.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={goal.scope.toUpperCase()}
                        size="small"
                        sx={{
                          fontSize: '10px',
                          fontWeight: 700,
                          height: 18,
                          bgcolor: `${scopeColor[goal.scope]}15`,
                          color: scopeColor[goal.scope],
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {goal.scope === 'day'
                          ? dayjs(goal.target_date).format('MMM D, YYYY')
                          : goal.scope === 'month'
                          ? dayjs(goal.target_date).format('MMMM YYYY')
                          : dayjs(goal.target_date).format('YYYY')}
                      </Typography>
                    </Box>
                  </Box>

                  {alreadyAdded ? (
                    <CheckCircle2 size={20} color="#4CAF50" />
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleAdd(goal.id)}
                      disabled={isAdding || !!adding}
                      sx={{ borderRadius: '8px', minWidth: 64, flexShrink: 0 }}
                    >
                      {isAdding ? <CircularProgress size={14} /> : 'Add'}
                    </Button>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="contained" onClick={handleClose} fullWidth sx={{ borderRadius: '10px' }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};
