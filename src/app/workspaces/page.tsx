'use client';

import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Plus, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { useUserWorkspaces, useCreateWorkspace } from '@/hooks/useWorkspaces';
import { WorkspaceCard } from '@/components/collaboration/WorkspaceCard';
import { WorkspaceFormValues } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  description: z.string().max(200).optional(),
  visibility: z.enum(['private', 'public']),
});

export default function WorkspacesPage() {
  const { user } = useAuthStore();
  const { data: workspaces, isLoading } = useUserWorkspaces(user?.id);
  const createWorkspace = useCreateWorkspace();
  const [open, setOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', visibility: 'private' },
  });

  const onSubmit = async (values: WorkspaceFormValues) => {
    if (!user) return;
    await createWorkspace.mutateAsync({ values, userId: user.id });
    reset();
    setOpen(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>Workspaces</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Collaborate on goals with your team or friends
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setOpen(true)}>
            New Workspace
          </Button>
        </Box>

        {isLoading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map(i => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton variant="rounded" height={180} sx={{ borderRadius: '16px' }} />
              </Grid>
            ))}
          </Grid>
        ) : workspaces && workspaces.length > 0 ? (
          <Grid container spacing={3}>
            {workspaces.map((ws, i) => (
              <Grid key={ws.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <WorkspaceCard workspace={ws} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Briefcase size={48} />
            <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 1 }}>No workspaces yet</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Create a workspace to collaborate on goals with others
            </Typography>
            <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setOpen(true)}>
              Create your first workspace
            </Button>
          </Box>
        )}
      </Container>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 0 }}>Create Workspace</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField
              label="Workspace name"
              fullWidth
              sx={{ mb: 2 }}
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 3 }}
              {...register('description')}
            />
            <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Visibility</Typography>
            <Controller
              name="visibility"
              control={control}
              render={({ field }) => (
                <ToggleButtonGroup
                  exclusive
                  value={field.value}
                  onChange={(_, v) => { if (v) field.onChange(v); }}
                  sx={{ width: '100%' }}
                >
                  <ToggleButton value="private" sx={{ flex: 1, borderRadius: '12px !important' }}>
                    Private
                  </ToggleButton>
                  <ToggleButton value="public" sx={{ flex: 1, borderRadius: '12px !important' }}>
                    Public
                  </ToggleButton>
                </ToggleButtonGroup>
              )}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpen(false)} variant="outlined" sx={{ borderColor: 'divider' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting || createWorkspace.isPending}>
              Create
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
