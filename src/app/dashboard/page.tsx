"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Fab,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { motion } from "framer-motion";
import { Plus, Flame, TrendingUp, Trophy, LayoutList, CalendarDays } from "lucide-react";
import Link from "next/link";
import { GoalFilters } from "@/components/goals/GoalFilters";
import { GoalList } from "@/components/goals/GoalList";
import { EditGoalDialog } from "@/components/goals/EditGoalDialog";
import { GoalCalendarView } from "@/components/goals/GoalCalendarView";
import { useGoalsStore } from "@/stores/goalsStore";
import { useAuthStore } from "@/stores/authStore";
import { useUserGoals, useDeleteGoal } from "@/hooks/useGoals";
import { colors } from "@/styles/theme";
import { Goal } from "@/types";

type ViewMode = "list" | "calendar";

const statCards = [
  { label: "Active Goals",  icon: <Flame size={18} />,      color: "#F5603A", bg: "rgba(245, 96, 58, 0.15)" },
  { label: "In Progress",   icon: <TrendingUp size={18} />, color: "#3B72EE", bg: "rgba(59, 114, 238, 0.15)" },
  { label: "Completed",     icon: <Trophy size={18} />,     color: "#4CAF50", bg: "rgba(76, 175, 80, 0.15)" },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { activeScope } = useGoalsStore();
  const { data: goals = [], isLoading } = useUserGoals(user?.id, activeScope);
  const deleteGoal = useDeleteGoal();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);

  const inProgressCount = goals.filter((g) => g.status === "in_progress").length;
  const completedCount  = goals.filter((g) => g.status === "completed").length;
  const activeCount     = goals.filter((g) => g.status !== "failed").length;
  const statValues = [activeCount, inProgressCount, completedCount];

  const filteredGoals =
    activeScope === "all"
      ? goals
      : goals.filter((g) => g.scope === activeScope);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteGoal.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <Box sx={{ pt: "8px", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <Box sx={{ backgroundColor: colors.darkBg, pb: 6, pt: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={user?.avatar_url ?? undefined}
              sx={{ width: 56, height: 56, border: "3px solid rgba(255,255,255,0.2)" }}
            />
            <Box>
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
                  Hey, {user?.display_name?.split(" ")[0]} 👋
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)" }}>
                  Let&apos;s crush your goals today
                </Typography>
              </motion.div>
            </Box>
          </Box>

          {/* Stat cards */}
          <Box
            sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mt: 4 }}
          >
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Box
                  sx={{
                    bgcolor: "rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    p: 2.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      bgcolor: stat.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                      flexShrink: 0,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ color: "#fff", fontWeight: 800 }}>
                      {isLoading ? "—" : statValues[i]}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Goals section */}
      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Section header with view toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h5" fontWeight={700}>
              My Goals
            </Typography>
            <Chip
              label={`${filteredGoals.length} goal${filteredGoals.length !== 1 ? "s" : ""}`}
              size="small"
              sx={{ bgcolor: "rgba(59, 114, 238, 0.12)", color: "#3B72EE", fontWeight: 700 }}
            />
          </Box>

          {/* List / Calendar toggle */}
          <ToggleButtonGroup
            size="small"
            exclusive
            value={viewMode}
            onChange={(_, v) => { if (v) setViewMode(v); }}
            sx={{
              "& .MuiToggleButton-root": {
                px: 1.5,
                py: 0.75,
                borderRadius: "10px !important",
                border: "1px solid",
                borderColor: "divider",
                gap: 0.5,
                textTransform: "none",
                fontSize: "13px",
                fontWeight: 600,
              },
              "& .MuiToggleButtonGroup-grouped:not(:last-of-type)": { mr: 0.5 },
            }}
          >
            <ToggleButton value="list">
              <LayoutList size={15} />
              List
            </ToggleButton>
            <ToggleButton value="calendar">
              <CalendarDays size={15} />
              Calendar
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Filters (only in list view) */}
        {viewMode === "list" && <GoalFilters />}

        {/* Content */}
        {viewMode === "list" ? (
          <GoalList
            goals={filteredGoals}
            emptyMessage="No goals for this scope yet"
            isLoading={isLoading}
            onEdit={setEditGoal}
            onDelete={setDeleteTarget}
          />
        ) : (
          <GoalCalendarView goals={goals} />
        )}
      </Container>

      {/* FAB */}
      <Link href="/goals/new" style={{ textDecoration: "none" }}>
        <Fab
          color="primary"
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            width: 56,
            height: 56,
            boxShadow: "0 8px 24px rgba(245,96,58,0.4)",
          }}
        >
          <Plus size={24} />
        </Fab>
      </Link>

      {/* Edit dialog */}
      {editGoal && (
        <EditGoalDialog
          goal={editGoal}
          open={!!editGoal}
          onClose={() => setEditGoal(null)}
        />
      )}

      {/* Delete confirm dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        slotProps={{ paper: { sx: { borderRadius: "20px" } } }}
      >
        <DialogTitle fontWeight={700}>Delete goal?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            &ldquo;{deleteTarget?.title}&rdquo; will be permanently deleted. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteTarget(null)}
            sx={{ borderColor: "divider" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleteGoal.isPending}
          >
            {deleteGoal.isPending ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
