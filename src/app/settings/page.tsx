"use client";

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings, Camera } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useUpdateProfile } from "@/hooks/useProfile";
import { colors } from "@/styles/theme";

const schema = z.object({
  display_name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(200, "Max 200 characters").optional(),
});

type SettingsValues = z.infer<typeof schema>;

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const updateProfile = useUpdateProfile(user?.id ?? "");

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: user?.display_name ?? "",
      bio: user?.bio ?? "",
    },
  });

  const onSubmit = async (values: SettingsValues) => {
    if (!user) return;
    const updated = await updateProfile.mutateAsync({
      display_name: values.display_name,
      bio: values.bio ?? undefined,
    });
    setUser({ ...user, ...updated });
  };

  return (
    <Box sx={{ pt: "8px", minHeight: "100vh", bgcolor: "#F7F7FB" }}>
      <Box sx={{ backgroundColor: colors.darkBg, py: 6 }}>
        <Container maxWidth="md">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Settings size={28} color="#F5603A" />
            <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
              Settings
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 5 }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card sx={{ borderRadius: "20px", mb: 3 }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 4 }}>
                Profile
              </Typography>

              {updateProfile.isSuccess && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: "12px" }}>
                  Profile saved!
                </Alert>
              )}
              {updateProfile.error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
                  {(updateProfile.error as Error).message}
                </Alert>
              )}

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 3, mb: 5 }}
              >
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={user?.avatar_url ?? undefined}
                    sx={{ width: 80, height: 80 }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      bgcolor: "#F5603A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      border: "2px solid #fff",
                    }}
                  >
                    <Camera size={14} color="#fff" />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={700}>
                    {user?.display_name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B6B80" }}>
                    @{user?.username}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9B9BAB" }}>
                    Click the camera to change your photo
                  </Typography>
                </Box>
              </Box>

              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  label="Display name"
                  fullWidth
                  sx={{ mb: 3 }}
                  {...register("display_name")}
                  error={!!errors.display_name}
                  helperText={errors.display_name?.message}
                />
                <TextField
                  label="Username"
                  fullWidth
                  sx={{ mb: 3 }}
                  value={`@${user?.username ?? ""}`}
                  disabled
                  helperText="Username cannot be changed"
                />
                <TextField
                  label="Bio"
                  fullWidth
                  multiline
                  rows={3}
                  sx={{ mb: 4 }}
                  placeholder="Tell the world about your goals..."
                  {...register("bio")}
                  error={!!errors.bio}
                  helperText={errors.bio?.message}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!isDirty || updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: "20px", border: "1px solid #FFD5D5" }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 1, color: "#EF5350" }}
              >
                Danger Zone
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B6B80", mb: 3 }}>
                Once you delete your account, all your goals, connections, and
                messages will be permanently removed.
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  borderColor: "#EF5350",
                  color: "#EF5350",
                  "&:hover": { bgcolor: "#FFF0F0" },
                }}
              >
                Delete account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
