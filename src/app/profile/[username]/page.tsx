"use client";

import { use } from "react";
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { UserPlus, MessageCircle, Target } from "lucide-react";
import { useProfileByUsername } from "@/hooks/useProfile";
import { usePublicGoals } from "@/hooks/useGoals";
import { GoalList } from "@/components/goals/GoalList";
import { colors } from "@/styles/theme";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { data: profile, isLoading } = useProfileByUsername(username);
  const { data: allGoals = [] } = usePublicGoals();
  const goals = allGoals.filter((g) => g.user_id === profile?.id);

  if (isLoading) {
    return (
      <Box
        sx={{
          pt: "8px",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box
        sx={{
          pt: "8px",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h5">User not found</Typography>
      </Box>
    );
  }

  const stats = [
    { label: "Goals", value: goals.length },
    {
      label: "Completed",
      value: goals.filter((g) => g.status === "completed").length,
    },
  ];

  return (
    <Box sx={{ pt: "8px", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box sx={{ backgroundColor: colors.darkBg, pb: 6, pt: 6 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 4,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <Avatar
                src={profile.avatar_url ?? undefined}
                sx={{
                  width: 88,
                  height: 88,
                  border: "4px solid rgba(255,255,255,0.15)",
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h4"
                  sx={{ color: "#fff", fontWeight: 700 }}
                >
                  {profile.display_name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.5)", mb: 1 }}
                >
                  @{profile.username}
                </Typography>
                {profile.bio && (
                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgba(255,255,255,0.75)",
                      mb: 3,
                      maxWidth: 480,
                    }}
                  >
                    {profile.bio}
                  </Typography>
                )}
                <Box sx={{ display: "flex", gap: 4, mb: 3, flexWrap: "wrap" }}>
                  {stats.map((stat) => (
                    <Box key={stat.label}>
                      <Typography
                        variant="h5"
                        sx={{ color: "#fff", fontWeight: 800 }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.45)" }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<UserPlus size={15} />}
                    size="small"
                  >
                    Connect
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<MessageCircle size={15} />}
                    size="small"
                    sx={{
                      borderColor: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      "&:hover": {
                        borderColor: "#fff",
                        bgcolor: "rgba(255,255,255,0.08)",
                      },
                    }}
                  >
                    Message
                  </Button>
                </Box>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Target size={20} color="#F5603A" />
          <Typography variant="h5" fontWeight={700}>
            Public Goals
          </Typography>
          <Chip
            label={goals.length}
            size="small"
            sx={{ bgcolor: "rgba(245, 96, 58, 0.12)", color: "#F5603A", fontWeight: 700 }}
          />
        </Box>
        <Divider sx={{ mb: 4 }} />
        <GoalList goals={goals} emptyMessage="No public goals yet" />
      </Container>
    </Box>
  );
}
