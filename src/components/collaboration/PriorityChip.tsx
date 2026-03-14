'use client';

import { Chip } from '@mui/material';
import { GoalPriority } from '@/types';

const PRIORITY_CONFIG: Record<GoalPriority, { label: string; color: string; bg: string }> = {
  none: { label: 'No priority', color: '#6B6B80', bg: '#F7F7FB' },
  low: { label: 'Low', color: '#4CAF50', bg: '#E8F5E9' },
  medium: { label: 'Medium', color: '#F5C332', bg: '#FFF8E1' },
  high: { label: 'High', color: '#F5603A', bg: '#FFF3EF' },
  urgent: { label: 'Urgent', color: '#EF5350', bg: '#FFEBEE' },
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
