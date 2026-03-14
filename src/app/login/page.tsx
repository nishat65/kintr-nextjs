"use client";

import { Suspense, useState } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Chip,
  CircularProgress,
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
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Target, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { colors } from "@/styles/theme";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = z.object({
  display_name: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-z0-9_]+$/, "Lowercase, numbers, and underscores only"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

const PasswordField = ({
  id,
  label,
  error,
  helperText,
  showPassword,
  onToggle,
  registration,
}: {
  id: string;
  label: string;
  error?: boolean;
  helperText?: string;
  showPassword: boolean;
  onToggle: () => void;
  registration: ReturnType<ReturnType<typeof useForm>["register"]>;
}) => (
  <FormControl
    fullWidth
    variant="outlined"
    error={error}
    sx={{ mb: error && helperText ? 1 : 3 }}
  >
    <InputLabel htmlFor={id}>{label}</InputLabel>
    <OutlinedInput
      id={id}
      type={showPassword ? "text" : "password"}
      label={label}
      {...registration}
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={onToggle}
            onMouseDown={(e) => e.preventDefault()}
            edge="end"
            size="small"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </IconButton>
        </InputAdornment>
      }
      sx={{ borderRadius: "12px" }}
    />
    {error && helperText && <FormHelperText>{helperText}</FormHelperText>}
  </FormControl>
);

function LoginContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login"
  );
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const handleLogin = async (data: LoginValues) => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (authError) {
      setError(authError.message);
      return;
    }
    // router.refresh() lets the middleware detect the new session and redirect to /dashboard
    router.refresh();
  };

  const handleRegister = async (data: RegisterValues) => {
    setError(null);
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.display_name,
          username: data.username,
        },
      },
    });
    if (authError) {
      setError(authError.message);
      return;
    }
    router.refresh();
  };

  const handleGoogleAuth = async () => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (authError) setError(authError.message);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: "8px",
        background: `linear-gradient(135deg, ${colors.darkBg} 0%, #2D2D4A 100%)`,
        display: "flex",
        alignItems: "center",
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #F5603A, #FF9060)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Target size={22} color="#fff" />
              </Box>
              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "24px",
                  letterSpacing: "-0.02em",
                }}
              >
                kintr
              </Typography>
            </Link>
          </Box>

          <Card sx={{ borderRadius: "20px", overflow: "hidden" }}>
            <CardContent sx={{ p: 5 }}>
              {/* Mode toggle */}
              <Box
                sx={{
                  display: "flex",
                  bgcolor: "#F7F7FB",
                  borderRadius: "50px",
                  p: 0.5,
                  mb: 4,
                }}
              >
                {(["login", "register"] as const).map((m) => (
                  <Button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setError(null);
                      setShowPassword(false);
                    }}
                    fullWidth
                    sx={{
                      borderRadius: "50px",
                      py: 1,
                      fontWeight: 700,
                      fontSize: "14px",
                      bgcolor: mode === m ? "#fff" : "transparent",
                      color: mode === m ? "#2D2D3A" : "#6B6B80",
                      boxShadow:
                        mode === m ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                      "&:hover": {
                        bgcolor: mode === m ? "#fff" : "rgba(0,0,0,0.04)",
                      },
                    }}
                  >
                    {m === "login" ? "Log in" : "Sign up"}
                  </Button>
                ))}
              </Box>

              <Typography
                variant="h4"
                sx={{ mb: 0.5, textAlign: "center", fontWeight: 700 }}
              >
                {mode === "login" ? "Welcome back!" : "Create your account"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#6B6B80", textAlign: "center", mb: 4 }}
              >
                {mode === "login"
                  ? "Log in to track your goals and connect with friends."
                  : "Start your goal-tracking journey today."}
              </Typography>

              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 3, borderRadius: "12px", fontSize: "13px" }}
                >
                  {error}
                </Alert>
              )}

              {/* Google OAuth button */}
              <Button
                variant="outlined"
                fullWidth
                onClick={handleGoogleAuth}
                sx={{
                  mb: 3,
                  borderColor: "#E8E8F0",
                  color: "#2D2D3A",
                  fontWeight: 600,
                  "&:hover": { borderColor: "#c8c8d8", bgcolor: "#F7F7FB" },
                  display: "flex",
                  gap: 1.5,
                }}
              >
                <Box component="span" sx={{ fontSize: "18px" }}>
                  G
                </Box>
                Continue with Google
              </Button>

              <Divider sx={{ mb: 3 }}>
                <Chip
                  label="or"
                  size="small"
                  sx={{ color: "#6B6B80", bgcolor: "#F7F7FB", fontWeight: 600 }}
                />
              </Divider>

              {mode === "login" ? (
                <Box
                  component="form"
                  onSubmit={loginForm.handleSubmit(handleLogin)}
                >
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    sx={{ mb: 2 }}
                    {...loginForm.register("email")}
                    error={!!loginForm.formState.errors.email}
                    helperText={loginForm.formState.errors.email?.message}
                  />
                  <PasswordField
                    id="login-password"
                    label="Password"
                    error={!!loginForm.formState.errors.password}
                    helperText={loginForm.formState.errors.password?.message}
                    showPassword={showPassword}
                    onToggle={() => setShowPassword((p) => !p)}
                    registration={loginForm.register("password")}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={loginForm.formState.isSubmitting}
                  >
                    {loginForm.formState.isSubmitting ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      "Log in"
                    )}
                  </Button>
                </Box>
              ) : (
                <Box
                  component="form"
                  onSubmit={registerForm.handleSubmit(handleRegister)}
                >
                  <TextField
                    label="Display name"
                    fullWidth
                    sx={{ mb: 2 }}
                    {...registerForm.register("display_name")}
                    error={!!registerForm.formState.errors.display_name}
                    helperText={
                      registerForm.formState.errors.display_name?.message
                    }
                  />
                  <TextField
                    label="Username"
                    fullWidth
                    sx={{ mb: 2 }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <Typography sx={{ color: "#6B6B80", mr: 0.5 }}>
                            @
                          </Typography>
                        ),
                      },
                    }}
                    {...registerForm.register("username")}
                    error={!!registerForm.formState.errors.username}
                    helperText={registerForm.formState.errors.username?.message}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    sx={{ mb: 2 }}
                    {...registerForm.register("email")}
                    error={!!registerForm.formState.errors.email}
                    helperText={registerForm.formState.errors.email?.message}
                  />
                  <PasswordField
                    id="register-password"
                    label="Password"
                    error={!!registerForm.formState.errors.password}
                    helperText={registerForm.formState.errors.password?.message}
                    showPassword={showPassword}
                    onToggle={() => setShowPassword((p) => !p)}
                    registration={registerForm.register("password")}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={registerForm.formState.isSubmitting}
                  >
                    {registerForm.formState.isSubmitting ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </Box>
              )}

              <Typography
                variant="body2"
                textAlign="center"
                sx={{ color: "#6B6B80", mt: 3 }}
              >
                {mode === "login"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <Box
                  component="span"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setError(null);
                    setShowPassword(false);
                  }}
                  sx={{
                    color: "#F5603A",
                    fontWeight: 700,
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {mode === "login" ? "Sign up" : "Log in"}
                </Box>
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
