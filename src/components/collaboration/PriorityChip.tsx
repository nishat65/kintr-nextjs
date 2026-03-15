'use client';

import { Chip } from '@mui/material';
import { GoalPriority } from '@/types';

const PRIORITY_CONFIG: Record<GoalPriority, { label: string; color: string; bg: string }> = {
  none: { label: 'No priority', color: '#6B6B80', bg: 'rgba(107, 107, 128, 0.12)' },
  low: { label: 'Low', color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.12)' },
  medium: { label: 'Medium', color: '#F5C332', bg: 'rgba(245, 195, 50, 0.12)' },
  high: { label: 'High', color: '#F5603A', bg: 'rgba(245, 96, 58, 0.12)' },
  urgent: { label: 'Urgent', color: '#EF5350', bg: 'rgba(239, 83, 80, 0.12)' },
};

export const PriorityChip = ({ priority, size = 'small' }: { priority: GoalPriority; size?: 'small' | 'medium' }) => {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <Chip
      label={cfg.label}
      size={size}
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, border: `1px solid ${cfg.color}30` }}
    />
  );
};
