"use client";

import { useState } from "react";
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
  IconButton,
  InputAdornment,
  OutlinedInput,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings, Camera, Eye, EyeOff, Lock } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useUpdateProfile } from "@/hooks/useProfile";
import { createClient } from "@/lib/supabase/client";
import { colors } from "@/styles/theme";

const schema = z.object({
  display_name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(200, "Max 200 characters").optional(),
});

const passwordSchema = z
  .object({
    new_password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type SettingsValues = z.infer<typeof schema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const updateProfile = useUpdateProfile(user?.id ?? "");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

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

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (values: PasswordValues) => {
    setPasswordSuccess(false);
    setPasswordError(null);
    setPasswordLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: values.new_password,
      });
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess(true);
        passwordForm.reset();
      }
    } catch {
      setPasswordError("An unexpected error occurred");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Box sx={{ pt: "8px", minHeight: "100vh", bgcolor: "background.default" }}>
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
                      border: "2px solid",
                      borderColor: "background.paper",
                    }}
                  >
                    <Camera size={14} color="#fff" />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={700}>
                    {user?.display_name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    @{user?.username}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.disabled" }}>
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

          <Card sx={{ borderRadius: "20px", mb: 3 }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <Lock size={20} />
                <Typography variant="h6" fontWeight={700}>
                  Change Password
                </Typography>
              </Box>

              {passwordSuccess && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: "12px" }}>
                  Password updated successfully!
                </Alert>
              )}
              {passwordError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
                  {passwordError}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              >
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={!!passwordForm.formState.errors.new_password}
                  sx={{ mb: 2 }}
                >
                  <InputLabel htmlFor="new-password">New Password</InputLabel>
                  <OutlinedInput
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    label="New Password"
                    {...passwordForm.register("new_password")}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowNewPassword((p) => !p)}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                          size="small"
                          tabIndex={-1}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    }
                    sx={{ borderRadius: "12px" }}
                  />
                  {passwordForm.formState.errors.new_password && (
                    <FormHelperText>
                      {passwordForm.formState.errors.new_password.message}
                    </FormHelperText>
                  )}
                </FormControl>

                <TextField
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  sx={{ mb: 3 }}
                  {...passwordForm.register("confirm_password")}
                  error={!!passwordForm.formState.errors.confirm_password}
                  helperText={passwordForm.formState.errors.confirm_password?.message}
                />

                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
                  Must be 12+ characters with uppercase, lowercase, number, and special character.
                </Typography>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Update password"
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: "20px", border: "1px solid", borderColor: "error.light" }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 1, color: "#EF5350" }}
              >
                Danger Zone
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                Once you delete your account, all your goals, connections, and
                messages will be permanently removed.
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  borderColor: "#EF5350",
                  color: "#EF5350",
                  "&:hover": { bgcolor: "rgba(239, 83, 80, 0.12)" },
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
