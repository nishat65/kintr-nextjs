'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Card, CardContent, Chip, Avatar } from '@mui/material';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { WorkspaceGoal, GoalStatus } from '@/types';
import { PriorityChip } from './PriorityChip';
import { GripVertical, Calendar } from 'lucide-react';
import dayjs from 'dayjs';

const COLUMNS: { status: GoalStatus; label: string; color: string }[] = [
  { status: 'not_started', label: 'Not Started', color: '#6B6B80' },
  { status: 'in_progress', label: 'In Progress', color: '#3B72EE' },
  { status: 'completed',   label: 'Completed',   color: '#4CAF50' },
  { status: 'failed',      label: 'Failed',       color: '#EF5350' },
];

// ─── Droppable column wrapper ────────────────────────────────────────────────
const DroppableColumn = ({
  status,
  color,
  label,
  children,
  count,
  isOver,
}: {
  status: GoalStatus;
  color: string;
  label: string;
  children: React.ReactNode;
  count: number;
  isOver: boolean;
}) => {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <Paper
      ref={setNodeRef}
      elevation={0}
      sx={{
        flex: '0 0 280px',
        bgcolor: isOver ? 'action.hover' : 'background.default',
        border: '1px solid',
        borderColor: isOver ? color : 'divider',
        borderRadius: '16px',
        p: 2,
        minHeight: 400,
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
        <Typography variant="body2" fontWeight={700}>{label}</Typography>
        <Chip label={count} size="small" sx={{ ml: 'auto', fontSize: '11px' }} />
      </Box>
      {children}
    </Paper>
  );
};

// ─── Sortable card ───────────────────────────────────────────────────────────
const GoalKanbanCard = ({
  wGoal,
  isDragging,
  isOverlay,
}: {
  wGoal: WorkspaceGoal;
  isDragging?: boolean;
  isOverlay?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: wGoal.id,
    data: { status: wGoal.goal.status },
  });

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging && !isOverlay ? 0.35 : 1,
        boxShadow: isOverlay ? '0 8px 32px rgba(0,0,0,0.18)' : undefined,
      }}
      sx={{ mb: 1.5, cursor: 'grab', '&:active': { cursor: 'grabbing' }, touchAction: 'none' }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            {...attributes}
            {...listeners}
            sx={{ mt: 0.2, color: 'text.secondary', cursor: 'grab', flexShrink: 0 }}
          >
            <GripVertical size={14} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
              {wGoal.goal.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <PriorityChip priority={wGoal.priority} />
              {wGoal.due_date && (
                <Chip
                  icon={<Calendar size={10} />}
                  label={dayjs(wGoal.due_date).format('MMM D')}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '11px' }}
                />
              )}
            </Box>
            {wGoal.assignee && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <Avatar
                  src={wGoal.assignee.avatar_url ?? undefined}
                  sx={{ width: 20, height: 20, fontSize: '10px' }}
                >
                  {wGoal.assignee.display_name[0]}
                </Avatar>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {wGoal.assignee.display_name}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ─── Board ───────────────────────────────────────────────────────────────────
export const KanbanBoard = ({
  goals,
  onStatusChange,
}: {
  goals: WorkspaceGoal[];
  onStatusChange: (goalId: string, status: GoalStatus) => void;
}) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overColumnStatus, setOverColumnStatus] = useState<GoalStatus | null>(null);
  // Local copy for optimistic updates so cards move instantly on drop
  const [localGoals, setLocalGoals] = useState<WorkspaceGoal[]>(goals);

  // Sync when server data arrives (after mutation refetch)
  useEffect(() => { setLocalGoals(goals); }, [goals]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getByStatus = (status: GoalStatus) => localGoals.filter(g => g.goal.status === status);

  const resolveColumn = (overId: UniqueIdentifier): GoalStatus | null => {
    const col = COLUMNS.find(c => c.status === overId);
    if (col) return col.status;
    const goal = localGoals.find(g => g.id === overId);
    if (goal) return goal.goal.status as GoalStatus;
    return null;
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id);
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    if (!over) { setOverColumnStatus(null); return; }
    setOverColumnStatus(resolveColumn(over.id));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    setOverColumnStatus(null);
    if (!over) return;

    const targetColumn = resolveColumn(over.id);
    if (!targetColumn) return;

    const draggedGoal = localGoals.find(g => g.id === active.id);
    if (!draggedGoal) return;

    if (draggedGoal.goal.status !== targetColumn) {
      // Optimistic update — move card immediately, server syncs in background
      setLocalGoals(prev =>
        prev.map(g =>
          g.id === active.id
            ? { ...g, goal: { ...g.goal, status: targetColumn } }
            : g
        )
      );
      onStatusChange(draggedGoal.goal.id, targetColumn);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverColumnStatus(null);
    // Restore from server state on cancel
    setLocalGoals(goals);
  };

  const activeGoal = activeId ? localGoals.find(g => g.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, minHeight: 500 }}>
        {COLUMNS.map(col => {
          const colGoals = getByStatus(col.status);
          return (
            <DroppableColumn
              key={col.status}
              status={col.status}
              color={col.color}
              label={col.label}
              count={colGoals.length}
              isOver={overColumnStatus === col.status}
            >
              <SortableContext
                items={colGoals.map(g => g.id)}
                strategy={verticalListSortingStrategy}
              >
                {colGoals.map(wGoal => (
                  <GoalKanbanCard
                    key={wGoal.id}
                    wGoal={wGoal}
                    isDragging={activeId === wGoal.id}
                  />
                ))}
              </SortableContext>
              {colGoals.length === 0 && (
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: overColumnStatus === col.status ? col.color : 'divider',
                    borderRadius: '12px',
                    p: 3,
                    textAlign: 'center',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Drop goals here
                  </Typography>
                </Box>
              )}
            </DroppableColumn>
          );
        })}
      </Box>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}>
        {activeGoal ? <GoalKanbanCard wGoal={activeGoal} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};
