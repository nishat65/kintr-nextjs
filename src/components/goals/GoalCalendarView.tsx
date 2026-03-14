'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Paper,
  Drawer,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import { ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { Goal } from '@/types';
import Link from 'next/link';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const statusColor: Record<string, string> = {
  not_started: '#6B6B80',
  in_progress:  '#3B72EE',
  completed:    '#4CAF50',
  failed:       '#EF5350',
};

interface GoalCalendarViewProps {
  goals: Goal[];
}

export const GoalCalendarView = ({ goals }: GoalCalendarViewProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs().startOf('month'));
  const [selectedDay, setSelectedDay] = useState<Dayjs | null>(dayjs());
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Build a map: "YYYY-MM-DD" → Goal[]
  const goalsByDate = useMemo(() => {
    const map = new Map<string, Goal[]>();
    for (const goal of goals) {
      // Only day-scope goals with actual dates appear on calendar cells
      if (goal.scope !== 'day') continue;
      const key = dayjs(goal.target_date).format('YYYY-MM-DD');
      const existing = map.get(key) ?? [];
      map.set(key, [...existing, goal]);
    }
    return map;
  }, [goals]);

  // Goals for selected day
  const selectedDayGoals = selectedDay
    ? (goalsByDate.get(selectedDay.format('YYYY-MM-DD')) ?? [])
    : [];

  // Calendar grid cells
  const calendarDays = useMemo(() => {
    const start = currentMonth.startOf('month').startOf('week');
    const end = currentMonth.endOf('month').endOf('week');
    const days: Dayjs[] = [];
    let cursor = start;
    while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
      days.push(cursor);
      cursor = cursor.add(1, 'day');
    }
    return days;
  }, [currentMonth]);

  const today = dayjs();

  const handleDayClick = (day: Dayjs) => {
    setSelectedDay(day);
    if (isMobile) setDrawerOpen(true);
  };

  const DayPanel = () => (
    <Box sx={{ p: 2, minWidth: isMobile ? undefined : 280, width: isMobile ? '100%' : undefined }}>
      {/* Panel header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {selectedDay ? selectedDay.format('dddd') : '—'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {selectedDay ? selectedDay.format('MMMM D, YYYY') : ''}
          </Typography>
        </Box>
        {isMobile && (
          <IconButton size="small" onClick={() => setDrawerOpen(false)}>
            <X size={18} />
          </IconButton>
        )}
      </Box>

      {selectedDayGoals.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 5,
            gap: 1,
            color: 'text.secondary',
          }}
        >
          <Calendar size={32} opacity={0.3} />
          <Typography variant="body2">No goals this day</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {selectedDayGoals.map((goal) => (
            <Link key={goal.id} href={`/goals/${goal.id}`} style={{ textDecoration: 'none' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  borderLeft: `4px solid ${statusColor[goal.status]}`,
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background-color 0.15s',
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={700}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {goal.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: statusColor[goal.status],
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                    {goal.status.replace('_', ' ')}
                  </Typography>
                </Box>
              </Paper>
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      {/* Calendar grid */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Month nav */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton size="small" onClick={() => setCurrentMonth(m => m.subtract(1, 'month'))}>
            <ChevronLeft size={20} />
          </IconButton>
          <Typography variant="h6" fontWeight={700}>
            {currentMonth.format('MMMM YYYY')}
          </Typography>
          <IconButton size="small" onClick={() => setCurrentMonth(m => m.add(1, 'month'))}>
            <ChevronRight size={20} />
          </IconButton>
        </Box>

        {/* Weekday headers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            mb: 0.5,
          }}
        >
          {WEEKDAYS.map((wd) => (
            <Typography
              key={wd}
              variant="caption"
              fontWeight={700}
              sx={{ textAlign: 'center', color: 'text.secondary', py: 0.5 }}
            >
              {wd}
            </Typography>
          ))}
        </Box>

        {/* Day cells */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '2px',
          }}
        >
          {calendarDays.map((day) => {
            const key = day.format('YYYY-MM-DD');
            const dayGoals = goalsByDate.get(key) ?? [];
            const isCurrentMonth = day.month() === currentMonth.month();
            const isToday = day.isSame(today, 'day');
            const isSelected = selectedDay?.isSame(day, 'day');

            return (
              <Box
                key={key}
                onClick={() => handleDayClick(day)}
                sx={{
                  minHeight: { xs: 52, md: 80 },
                  p: 0.75,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  bgcolor: isSelected
                    ? 'primary.main'
                    : isToday
                    ? 'primary.50'
                    : 'transparent',
                  opacity: isCurrentMonth ? 1 : 0.35,
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                  },
                  transition: 'background-color 0.12s',
                  position: 'relative',
                }}
              >
                {/* Day number */}
                <Typography
                  variant="caption"
                  fontWeight={isToday || isSelected ? 800 : 500}
                  sx={{
                    display: 'block',
                    color: isSelected ? '#fff' : isToday ? 'primary.main' : 'text.primary',
                    mb: 0.25,
                  }}
                >
                  {day.date()}
                </Typography>

                {/* Goal dots / chips */}
                {dayGoals.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {dayGoals.slice(0, isMobile ? 1 : 2).map((g) => (
                      <Tooltip key={g.id} title={g.title} placement="top" arrow>
                        <Box
                          sx={{
                            height: 5,
                            borderRadius: '3px',
                            bgcolor: isSelected ? 'rgba(255,255,255,0.7)' : statusColor[g.status],
                            maxWidth: '100%',
                          }}
                        />
                      </Tooltip>
                    ))}
                    {dayGoals.length > (isMobile ? 1 : 2) && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '9px',
                          color: isSelected ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                          lineHeight: 1,
                        }}
                      >
                        +{dayGoals.length - (isMobile ? 1 : 2)} more
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          {Object.entries(statusColor).map(([status, color]) => (
            <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: color }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                {status.replace('_', ' ')}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Day detail panel — desktop sidebar */}
      {!isMobile && (
        <Paper
          elevation={0}
          sx={{
            width: 280,
            flexShrink: 0,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '16px',
            minHeight: 400,
          }}
        >
          <DayPanel />
        </Paper>
      )}

      {/* Day detail — mobile bottom drawer */}
      {isMobile && (
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          slotProps={{ paper: { sx: { borderTopLeftRadius: '20px', borderTopRightRadius: '20px', maxHeight: '60vh' } } }}
        >
          <Box sx={{ pt: 1, pb: 2 }}>
            <Box sx={{ width: 40, height: 4, borderRadius: '2px', bgcolor: 'divider', mx: 'auto', mb: 1 }} />
            <DayPanel />
          </Box>
        </Drawer>
      )}
    </Box>
  );
};
