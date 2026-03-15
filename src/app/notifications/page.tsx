"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import { Bell, CheckCheck, Trash2, Star } from "lucide-react";
import { NotificationList } from "@/components/notifications/NotificationList";
import { useAuthStore } from "@/stores/authStore";
import {
  useNotifications,
  useUnreadCount,
  useMarkAllRead,
  useMarkNotificationRead,
  useStarNotification,
  useDeleteNotification,
  useDeleteAllNotifications,
  useNotificationsRealtime,
} from "@/hooks/useNotifications";
import { colors } from "@/styles/theme";

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const userId = user?.id ?? "";
  const { data: notifications = [], isLoading } = useNotifications(user?.id);
  const unreadCount = useUnreadCount(user?.id);
  const markAllRead = useMarkAllRead(userId);
  const markRead = useMarkNotificationRead(userId);
  const star = useStarNotification(userId);
  const deleteOne = useDeleteNotification(userId);
  const deleteAll = useDeleteAllNotifications(userId);
  useNotificationsRealtime(user?.id);

  const [tab, setTab] = useState(0);

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const starred = sorted.filter((n) => n.starred);
  const displayed = tab === 0 ? sorted : starred;

  return (
    <Box sx={{ pt: "8px", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box sx={{ backgroundColor: colors.darkBg, py: 6 }}>
        <Container maxWidth="md">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Bell size={28} color="#F5603A" />
                <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
                  Notifications
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.55)" }}>
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                  : "All caught up!"}
              </Typography>
            </Box>

            {/* Header actions */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {unreadCount > 0 && (
                <Button
                  startIcon={<CheckCheck size={15} />}
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  sx={{ color: "rgba(255,255,255,0.65)", "&:hover": { color: "#fff" } }}
                  size="small"
                >
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  startIcon={<Trash2 size={15} />}
                  onClick={() => deleteAll.mutate()}
                  disabled={deleteAll.isPending}
                  sx={{ color: "rgba(255,255,255,0.45)", "&:hover": { color: "#FF6B6B" } }}
                  size="small"
                >
                  Delete all
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 5 }}>
        {/* Tabs: All / Starred */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            mb: 3,
            "& .MuiTabs-indicator": { backgroundColor: "primary.light" },
            "& .MuiTab-root": { color: "text.secondary" },
            "& .Mui-selected": { color: "primary.light !important" },
          }}
        >
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                All
                <Chip
                  label={sorted.length}
                  size="small"
                  sx={{ bgcolor: "action.hover", color: "text.secondary", fontWeight: 700, fontSize: "11px" }}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Star size={14} />
                Starred
                {starred.length > 0 && (
                  <Chip
                    label={starred.length}
                    size="small"
                    sx={{ bgcolor: "rgba(245, 195, 50, 0.12)", color: "#F5C332", fontWeight: 700, fontSize: "11px" }}
                  />
                )}
              </Box>
            }
          />
        </Tabs>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card sx={{ overflow: "hidden", borderRadius: "20px" }}>
              <NotificationList
                notifications={displayed}
                onMarkRead={(id) => markRead.mutate(id)}
                onStar={(id, starred) => star.mutate({ id, starred })}
                onDelete={(id) => deleteOne.mutate(id)}
              />
            </Card>
          </motion.div>
        )}
      </Container>
    </Box>
  );
}
