'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { ThumbsUp, ThumbsDown, MessageCircle, Lock, Globe, Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Goal } from '@/types';
import { PriorityChip } from '@/components/collaboration/PriorityChip';
import { useAuthStore } from '@/stores/authStore';

dayjs.extend(relativeTime);

const scopeConfig = {
  day: { label: 'DAY', color: '#F5603A', bg: 'rgba(245, 96, 58, 0.12)' },
  month: { label: 'MONTH', color: '#3B72EE', bg: 'rgba(59, 114, 238, 0.12)' },
  year: { label: 'YEAR', color: '#F5C332', bg: 'rgba(245, 195, 50, 0.12)' },
};

const statusConfig = {
  not_started: { label: 'Not started', color: '#6B6B80', bg: 'rgba(107, 107, 128, 0.12)' },
  in_progress: { label: 'In progress', color: '#3B72EE', bg: 'rgba(59, 114, 238, 0.12)' },
  completed: { label: 'Completed', color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.12)' },
  failed: { label: 'Failed', color: '#EF5350', bg: 'rgba(239, 83, 80, 0.12)' },
};

interface GoalCardProps {
  goal: Goal;
  showAuthor?: boolean;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goal: Goal) => void;
}

export const GoalCard = ({ goal, showAuthor = false, onEdit, onDelete }: GoalCardProps) => {
  const scope = scopeConfig[goal.scope];
  const status = statusConfig[goal.status];
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
    }
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuAnchor(null);
  };

  const showActions = !!onEdit || !!onDelete;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Link href={`/goals/${goal.id}`} style={{ textDecoration: 'none' }}>
        <Card
          sx={{
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Header row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={scope.label}
                  size="small"
                  sx={{ bgcolor: scope.bg, color: scope.color, fontWeight: 700, fontSize: '10px' }}
                />
                <Chip
                  label={status.label}
                  size="small"
                  sx={{ bgcolor: status.bg, color: status.color, fontSize: '11px' }}
                />
                {goal.priority && goal.priority !== 'none' && (
                  <PriorityChip priority={goal.priority} />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Tooltip title={goal.visibility === 'private' ? 'Private' : 'Public'}>
                  <Box sx={{ color: 'text.secondary' }}>
                    {goal.visibility === 'private' ? <Lock size={14} /> : <Globe size={14} />}
                  </Box>
                </Tooltip>
                {showActions && (
                  <IconButton
                    size="small"
                    onClick={handleMenuOpen}
                    sx={{ ml: 0.5, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                  >
                    <MoreVertical size={16} />
                  </IconButton>
                )}
              </Box>
            </Box>

            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                mb: 1,
                fontWeight: 700,
                fontSize: '16px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {goal.title}
            </Typography>

            {/* Description */}
            {goal.description && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.6,
                }}
              >
                {goal.description}
              </Typography>
            )}

            {/* Target date */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2.5, color: 'text.secondary' }}>
              <Calendar size={13} />
              <Typography variant="caption" fontWeight={500}>
                {goal.scope === 'day'
                  ? dayjs(goal.target_date).format('MMM D, YYYY')
                  : goal.scope === 'month'
                  ? dayjs(goal.target_date).format('MMMM YYYY')
                  : dayjs(goal.target_date).format('YYYY')}
              </Typography>
            </Box>

            {/* Footer row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Author */}
              {showAuthor && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={goal.author.avatar_url ?? undefined} sx={{ width: 24, height: 24 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {goal.author.display_name}
                  </Typography>
                </Box>
              )}

              {/* Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: showAuthor ? 'auto' : 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#4CAF50' } }} onClick={handleVote}>
                    <ThumbsUp size={14} />
                  </IconButton>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {goal.upvotes}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#EF5350' } }} onClick={handleVote}>
                    <ThumbsDown size={14} />
                  </IconButton>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {goal.downvotes}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, ml: 0.5, color: 'text.secondary' }}>
                  <MessageCircle size={14} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {goal.comment_count}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Link>

      {/* Action menu — rendered outside Link to avoid nested anchor issues */}
      {showActions && (
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          slotProps={{ paper: { sx: { borderRadius: '12px', minWidth: 140 } } }}
        >
          {onEdit && (
            <MenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuAnchor(null);
                onEdit(goal);
              }}
            >
              <ListItemIcon><Pencil size={16} /></ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
          )}
          {onDelete && (
            <MenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuAnchor(null);
                onDelete(goal);
              }}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon sx={{ color: 'error.main' }}><Trash2 size={16} /></ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          )}
        </Menu>
      )}
    </motion.div>
  );
};
