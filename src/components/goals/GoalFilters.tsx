'use client';

import { Box, Tabs, Tab, Button } from '@mui/material';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useGoalsStore } from '@/stores/goalsStore';
import { GoalScope } from '@/types';

const scopeTabs: { label: string; value: GoalScope | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'day' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
];

export const GoalFilters = () => {
  const { activeScope, setActiveScope } = useGoalsStore();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
      <Tabs
        value={activeScope}
        onChange={(_, v) => setActiveScope(v)}
        sx={{
          '& .MuiTabs-indicator': { backgroundColor: '#F5603A', height: 3, borderRadius: '2px' },
          '& .MuiTab-root': { color: '#6B6B80', minWidth: 'auto', px: 2 },
          '& .Mui-selected': { color: '#F5603A !important' },
        }}
      >
        {scopeTabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>

      <Link href="/goals/new" style={{ textDecoration: 'none' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={16} />}
          size="small"
        >
          New Goal
        </Button>
      </Link>
    </Box>
  );
};
