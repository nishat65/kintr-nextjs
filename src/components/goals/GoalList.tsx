'use client';

import { Box, Typography, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Target } from 'lucide-react';
import { GoalCard } from './GoalCard';
import { Goal } from '@/types';

interface GoalListProps {
  goals: Goal[];
  showAuthor?: boolean;
  emptyMessage?: string;
  isLoading?: boolean;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goal: Goal) => void;
}

export const GoalList = ({ goals, showAuthor = false, emptyMessage = 'No goals yet', isLoading = false, onEdit, onDelete }: GoalListProps) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (goals.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 10,
          px: 4,
          border: '2px dashed #E8E8F0',
          borderRadius: '20px',
        }}
      >
        <Box sx={{ color: '#E8E8F0', mb: 2 }}>
          <Target size={48} />
        </Box>
        <Typography variant="h6" sx={{ color: '#6B6B80', mb: 1 }}>
          {emptyMessage}
        </Typography>
        <Typography variant="body2" sx={{ color: '#9B9BAB' }}>
          Set a goal and start tracking your progress
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
        gap: 3,
      }}
    >
      <AnimatePresence>
        {goals.map((goal, i) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <GoalCard goal={goal} showAuthor={showAuthor} onEdit={onEdit} onDelete={onDelete} />
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
};
