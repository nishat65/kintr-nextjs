'use client';

import { Card, CardContent, CardActionArea, Typography, Box, Chip } from '@mui/material';
import { Workspace } from '@/types';
import { Briefcase, Lock, Globe } from 'lucide-react';
import Link from 'next/link';

export const WorkspaceCard = ({ workspace }: { workspace: Workspace }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea component={Link} href={`/workspaces/${workspace.id}`} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F5603A, #FF9060)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Briefcase size={20} color="#fff" />
            </Box>
            <Chip
              icon={workspace.visibility === 'private' ? <Lock size={12} /> : <Globe size={12} />}
              label={workspace.visibility}
              size="small"
              variant="outlined"
              sx={{ fontSize: '11px', textTransform: 'capitalize' }}
            />
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }} noWrap>
            {workspace.name}
          </Typography>
          {workspace.description && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {workspace.description}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {workspace.goal_count ?? 0} goals
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
