"use client";

import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  FormHelperText,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Zap, TrendingUp, Target } from "lucide-react";
import Link from "next/link";
import dayjs, { Dayjs } from "dayjs";
import { useAuthStore } from "@/stores/authStore";
import { useCreateGoal } from "@/hooks/useGoals";
import { GoalFormValues } from "@/types";
import { colors } from "@/styles/theme";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Max 120 characters"),
  description: z.string().max(500, "Max 500 characters").optional(),
  scope: z.enum(["day", "month", "year"]),
  target_date: z.string().min(1, "Target date is required"),
  target_time: z.string().optional(),
  visibility: z.enum(["public", "private"]),
  priority: z.enum(["none", "low", "medium", "high", "urgent"]).optional(),
});

const PRIORITY_OPTIONS = [
  { value: "none",   label: "None",   color: "#6B6B80" },
  { value: "low",    label: "Low",    color: "#4CAF50" },
  { value: "medium", label: "Medium", color: "#F5C332" },
  { value: "high",   label: "High",   color: "#F5603A" },
];

const scopeOptions = [
  { value: "day",   label: "Day",   icon: <Zap size={16} />,        desc: "Complete today",  color: "#F5603A" },
  { value: "month", label: "Month", icon: <TrendingUp size={16} />, desc: "This month",      color: "#3B72EE" },
  { value: "year",  label: "Year",  icon: <Target size={16} />,     desc: "This year",       color: "#F5C332" },
];

export default function NewGoalPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const createGoal = useCreateGoal();

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      scope: "day",
      target_date: dayjs().format("YYYY-MM-DD"),
      target_time: dayjs().format("HH:mm"),
      visibility: "public",
      priority: "none",
    },
  });

  const scope = watch("scope");
  const targetDate = watch("target_date");
  const targetTime = watch("target_time");

  // Combine date + time into a Dayjs for DateTimePicker
  const dayjsDateTime: Dayjs = dayjs(
    `${targetDate || dayjs().format("YYYY-MM-DD")}T${targetTime || "00:00"}`
  );

  const onSubmit = async (values: GoalFormValues) => {
    if (!user) return;
    let target_date = values.target_date;
    if (values.scope === "month") target_date = `${target_date}-01`;
    if (values.scope === "year")  target_date = `${target_date}-01-01`;
    const newGoal = await createGoal.mutateAsync({
      values: { ...values, target_date },
      userId: user.id,
    });
    router.push(`/goals/${newGoal.id}`);
  };

  return (
    <Box sx={{ pt: "8px", minHeight: "100vh", bgcolor: "#F7F7FB" }}>
      <Box sx={{ backgroundColor: colors.darkBg, py: 4 }}>
        <Container maxWidth="md">
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <Button
              startIcon={<ArrowLeft size={16} />}
              sx={{ color: "rgba(255,255,255,0.7)", mb: 2, "&:hover": { color: "#fff" } }}
            >
              Back to Dashboard
            </Button>
          </Link>
          <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
            Create a new goal
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)", mt: 1 }}>
            Be specific, set a scope, and share it with the world.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 5 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              {createGoal.error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
                  {(createGoal.error as Error).message}
                </Alert>
              )}
              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                {/* Title */}
                <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>Goal title</Typography>
                <TextField
                  placeholder="e.g., Read 4 books this month"
                  fullWidth
                  sx={{ mb: 4 }}
                  {...register("title")}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />

                {/* Description */}
                <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
                  Description{" "}
                  <Box component="span" sx={{ fontWeight: 400, color: "#6B6B80", fontSize: "14px" }}>
                    (optional)
                  </Box>
                </Typography>
                <TextField
                  placeholder="What does success look like? Why does this matter?"
                  fullWidth
                  multiline
                  rows={3}
                  sx={{ mb: 4 }}
                  {...register("description")}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />

                {/* Scope */}
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Goal scope</Typography>
                <Controller
                  name="scope"
                  control={control}
                  render={({ field }) => (
                    <ToggleButtonGroup
                      exclusive
                      value={field.value}
                      onChange={(_, v) => { if (v) field.onChange(v); }}
                      sx={{ mb: 1, width: "100%", gap: 1.5, flexWrap: "wrap" }}
                    >
                      {scopeOptions.map((opt) => (
                        <ToggleButton
                          key={opt.value}
                          value={opt.value}
                          sx={{
                            flex: 1,
                            minWidth: 100,
                            borderRadius: "12px !important",
                            border: `2px solid ${field.value === opt.value ? opt.color : "#E8E8F0"} !important`,
                            bgcolor: field.value === opt.value ? `${opt.color}15` : "#fff",
                            color: field.value === opt.value ? opt.color : "#6B6B80",
                            "&:hover": { bgcolor: `${opt.color}0A`, borderColor: `${opt.color} !important` },
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                            py: 2,
                          }}
                        >
                          {opt.icon}
                          <Typography variant="body2" fontWeight={700}>{opt.label}</Typography>
                          <Typography variant="caption" sx={{ color: "inherit", opacity: 0.7 }}>
                            {opt.desc}
                          </Typography>
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  )}
                />
                {errors.scope && <FormHelperText error>{errors.scope.message}</FormHelperText>}

                {/* Target date / datetime */}
                <Typography variant="h6" sx={{ mb: 1.5, mt: 4, fontWeight: 700 }}>
                  {scope === "day" ? "Target date & time" : "Target date"}
                </Typography>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  {scope === "day" && (
                    <DateTimePicker
                      label="Date & Time"
                      value={dayjsDateTime}
                      onChange={(newVal) => {
                        if (newVal && newVal.isValid()) {
                          setValue("target_date", newVal.format("YYYY-MM-DD"));
                          setValue("target_time", newVal.format("HH:mm"));
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          sx: { mb: 4 },
                          error: !!errors.target_date,
                          helperText: errors.target_date?.message,
                        },
                      }}
                    />
                  )}

                  {scope === "month" && (
                    <DatePicker
                      label="Month"
                      views={["year", "month"]}
                      openTo="month"
                      value={dayjs(targetDate || dayjs().format("YYYY-MM-DD"))}
                      onChange={(newVal) => {
                        if (newVal && newVal.isValid()) {
                          setValue("target_date", newVal.format("YYYY-MM"));
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          sx: { mb: 4 },
                          error: !!errors.target_date,
                          helperText: errors.target_date?.message,
                        },
                      }}
                    />
                  )}

                  {scope === "year" && (
                    <DatePicker
                      label="Year"
                      views={["year"]}
                      openTo="year"
                      minDate={dayjs("2024-01-01")}
                      maxDate={dayjs("2030-12-31")}
                      value={dayjs(targetDate ? `${targetDate}-01-01` : `${dayjs().year()}-01-01`)}
                      onChange={(newVal) => {
                        if (newVal && newVal.isValid()) {
                          setValue("target_date", newVal.format("YYYY"));
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          sx: { mb: 4 },
                          error: !!errors.target_date,
                          helperText: errors.target_date?.message,
                        },
                      }}
                    />
                  )}
                </LocalizationProvider>

                {/* Visibility */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 3,
                    bgcolor: "#F7F7FB",
                    borderRadius: "12px",
                    mb: 5,
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight={700}>Make this goal public</Typography>
                    <Typography variant="body2" sx={{ color: "#6B6B80" }}>
                      Public goals can be seen and cheered on by anyone
                    </Typography>
                  </Box>
                  <Controller
                    name="visibility"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value === "public"}
                            onChange={(e) => field.onChange(e.target.checked ? "public" : "private")}
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": { color: "#F5603A" },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#F5603A" },
                            }}
                          />
                        }
                        label=""
                      />
                    )}
                  />
                </Box>

                {/* Priority */}
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Priority</Typography>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <ToggleButtonGroup
                      exclusive
                      value={field.value ?? "none"}
                      onChange={(_, v) => { if (v) field.onChange(v); }}
                      sx={{ mb: 5, gap: 1, flexWrap: "wrap" }}
                    >
                      {PRIORITY_OPTIONS.map((opt) => (
                        <ToggleButton
                          key={opt.value}
                          value={opt.value}
                          sx={{
                            flex: 1,
                            minWidth: 72,
                            borderRadius: "10px !important",
                            border: `2px solid ${field.value === opt.value ? opt.color : "#E8E8F0"} !important`,
                            bgcolor: field.value === opt.value ? `${opt.color}18` : "transparent",
                            color: field.value === opt.value ? opt.color : "#6B6B80",
                            fontWeight: 700,
                            fontSize: "13px",
                            "&:hover": { bgcolor: `${opt.color}0A`, borderColor: `${opt.color} !important` },
                          }}
                        >
                          {opt.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  )}
                />

                {/* Submit */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Link href="/dashboard" style={{ textDecoration: "none", flex: 1 }}>
                    <Button variant="outlined" fullWidth sx={{ borderColor: "#E8E8F0", color: "#6B6B80" }}>
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ flex: 2 }}
                    disabled={isSubmitting || createGoal.isPending}
                  >
                    {isSubmitting || createGoal.isPending ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      "Create Goal"
                    )}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
