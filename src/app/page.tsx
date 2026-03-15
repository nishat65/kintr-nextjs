"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
} from "@mui/material";
import {
  Target,
  Users,
  Trophy,
  Zap,
  Calendar,
  Globe,
  TrendingUp,
  CheckCircle,
  Star,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { colors } from "@/styles/theme";
import { useAuthStore } from "@/stores/authStore";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

const features = [
  {
    icon: <Calendar size={28} color="#F5603A" />,
    title: "Track daily goals",
    description:
      "Break big dreams into daily actions. Set day, month, or year goals and build unstoppable momentum.",
  },
  {
    icon: <Users size={28} color="#3B72EE" />,
    title: "Connect with friends",
    description:
      "Build mutual connections, share goals publicly, and cheer each other on with comments and reactions.",
  },
  {
    icon: <Trophy size={28} color="#F5C332" />,
    title: "Celebrate every win",
    description:
      "Upvote friends' goals, leave encouragement, and get real-time notifications when you hit milestones.",
  },
];

const testimonials = [
  {
    quote:
      "Kintr helped me finally stay consistent. Having friends see my goals made all the difference.",
    name: "Alex Johnson",
    handle: "@alex_builds",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
  },
  {
    quote:
      "I completed 18 books this year because Kintr kept me accountable. This app is a game changer.",
    name: "Priya Patel",
    handle: "@priya_reads",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
  },
  {
    quote:
      "The goal chat feature is brilliant — real conversations tied to specific goals. Love the focus.",
    name: "Sara Chen",
    handle: "@sara_creates",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sara",
  },
];

const categories = [
  {
    label: "Day Goals",
    icon: <Zap size={24} />,
    color: "#F5603A",
    bg: "#FFF0EC",
    description: "Daily habits & quick wins",
  },
  {
    label: "Month Goals",
    icon: <TrendingUp size={24} />,
    color: "#3B72EE",
    bg: "#EEF4FF",
    description: "Month-long challenges",
  },
  {
    label: "Year Goals",
    icon: <Target size={24} />,
    color: "#F5C332",
    bg: "#FFFBEC",
    description: "Life-changing ambitions",
  },
  {
    label: "Public Goals",
    icon: <Globe size={24} />,
    color: "#4CAF50",
    bg: "#F0FBF0",
    description: "Explore what others chase",
  },
];

const stats = [
  { value: "10K+", label: "Active goal setters" },
  { value: "50K+", label: "Goals tracked" },
  { value: "95%", label: "Completion rate" },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Box sx={{ pt: "8px" }}>
      {/* ── Hero ── */}
      <Box sx={{ backgroundColor: "#fff", overflow: "hidden" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 14 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                <Chip
                  label="✨ Your goals, your journey"
                  sx={{
                    mb: 3,
                    bgcolor: "#FFF0EC",
                    color: "#B03818",
                    fontWeight: 700,
                    fontSize: "13px",
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    color: "#2D2D3A",
                    mb: 3,
                    fontSize: { xs: "40px", md: "56px" },
                  }}
                >
                  Achieve what you set your{" "}
                  <Box component="span" sx={{ color: "#F5603A" }}>
                    mind
                  </Box>{" "}
                  to
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#6B6B80",
                    mb: 5,
                    fontSize: "18px",
                    maxWidth: 480,
                    lineHeight: 1.7,
                  }}
                >
                  Set goals for today, this month, or this year. Track progress,
                  share with friends, and celebrate every win together.
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Link
                    href={isAuthenticated ? "/dashboard" : "/login?mode=register"}
                    style={{ textDecoration: "none" }}
                  >
                    <Button variant="contained" color="primary" size="large">
                      {isAuthenticated ? "Go to Dashboard" : "Get started free"}
                    </Button>
                  </Link>
                  <Link href="/explore" style={{ textDecoration: "none" }}>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: "#2B5EC4",
                        color: "#2B5EC4",
                        "&:hover": {
                          borderColor: "#1A4599",
                          bgcolor: "#EEF4FF",
                        },
                      }}
                    >
                      Explore goals
                    </Button>
                  </Link>
                </Stack>
                <Stack
                  direction="row"
                  spacing={3}
                  sx={{ mt: 5, flexWrap: "wrap" }}
                >
                  {[
                    { icon: <CheckCircle size={16} />, text: "Free to start" },
                    { icon: <CheckCircle size={16} />, text: "No credit card" },
                    { icon: <CheckCircle size={16} />, text: "Instant access" },
                  ].map((item) => (
                    <Box
                      key={item.text}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        color: "#6B6B80",
                      }}
                    >
                      <Box sx={{ color: "#4CAF50" }}>{item.icon}</Box>
                      <Typography variant="body2" fontWeight={500}>
                        {item.text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </motion.div>
            </Grid>

            {/* Hero visual — goal card mockups */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box
                  sx={{ position: "relative", height: { xs: 320, md: 460 } }}
                >
                  {/* Main card */}
                  <Card
                    sx={{
                      position: "absolute",
                      top: "10%",
                      left: "5%",
                      width: "75%",
                      p: 1,
                      background:
                        "linear-gradient(135deg, #1A1A2C 0%, #2D2D4A 100%)",
                      color: "#fff",
                      zIndex: 2,
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Chip
                          label="YEAR GOAL"
                          size="small"
                          sx={{
                            bgcolor: "rgba(245,196,50,0.2)",
                            color: "#E0AD10",
                            fontSize: "10px",
                            fontWeight: 700,
                          }}
                        />
                        <Chip
                          label="In progress"
                          size="small"
                          sx={{
                            bgcolor: "rgba(59,114,238,0.2)",
                            color: "#A0BFFF",
                            fontSize: "10px",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="h6"
                        component="p"
                        sx={{ color: "#fff", mb: 1, fontSize: "16px" }}
                      >
                        Launch my side project 🚀
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(255,255,255,0.55)",
                          mb: 2,
                          fontSize: "13px",
                        }}
                      >
                        Ship Kintr to production and get first 100 users.
                      </Typography>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            color: "rgba(255,255,255,0.5)",
                            fontSize: "12px",
                          }}
                        >
                          <Star size={12} />
                          <Typography variant="caption">48 upvotes</Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            color: "rgba(255,255,255,0.5)",
                            fontSize: "12px",
                          }}
                        >
                          <Users size={12} />
                          <Typography variant="caption">12 comments</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Secondary card */}
                  <Card
                    sx={{
                      position: "absolute",
                      bottom: "5%",
                      right: "0%",
                      width: "65%",
                      p: 0.5,
                      border: "2px solid #F0F0F8",
                      zIndex: 3,
                    }}
                  >
                    <CardContent sx={{ pb: "12px !important" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Chip
                          label="DAY GOAL"
                          size="small"
                          sx={{
                            bgcolor: "#FFF0EC",
                            color: "#B03818",
                            fontSize: "10px",
                            fontWeight: 700,
                          }}
                        />
                        <Chip
                          label="Completed"
                          size="small"
                          sx={{
                            bgcolor: "#F0FBF0",
                            color: "#2E7D32",
                            fontSize: "10px",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="h6"
                        component="p"
                        sx={{ color: "#2D2D3A", fontSize: "15px", mb: 0.5 }}
                      >
                        Morning workout ✅
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#6B6B80", fontSize: "12px" }}
                      >
                        30-min HIIT before 7am
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Floating user avatars */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "5%",
                      right: "5%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      zIndex: 1,
                    }}
                  >
                    {["alex", "sara", "marco"].map((seed) => (
                      <Avatar
                        key={seed}
                        alt={`${seed} avatar`}
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                        sx={{
                          width: 40,
                          height: 40,
                          border: "2px solid #fff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                      />
                    ))}
                  </Box>

                  {/* Decoration blobs */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "30%",
                      right: "15%",
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "rgba(245,196,50,0.15)",
                      zIndex: 0,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "30%",
                      left: "0%",
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: "rgba(59,114,238,0.12)",
                      zIndex: 0,
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Features ── */}
      <Box
        sx={{
          backgroundColor: "#fff",
          borderTop: "1px solid #F0F0F8",
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <Typography
              variant="h2"
              textAlign="center"
              sx={{ mb: 2, fontSize: { xs: "28px", md: "40px" } }}
            >
              Everything you need to reach your goals
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ color: "#6B6B80", mb: 8, maxWidth: 540, mx: "auto" }}
            >
              Kintr combines personal goal tracking with a social accountability
              layer — so you never go it alone.
            </Typography>
          </motion.div>
          <Grid container spacing={4}>
            {features.map((feature, i) => (
              <Grid key={i} size={{ xs: 12, md: 4 }}>
                <motion.div
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <Box sx={{ textAlign: "center", p: 4 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#F7F7FB",
                        mx: "auto",
                        mb: 3,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ mb: 1.5, fontWeight: 700 }}>
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "#6B6B80", lineHeight: 1.7 }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Testimonials ── */}
      <Box sx={{ backgroundColor: "#fff", py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <Typography
              variant="h2"
              textAlign="center"
              sx={{ mb: 10, fontSize: { xs: "28px", md: "40px" } }}
            >
              Kintr Stories
            </Typography>
          </motion.div>
          <Grid container spacing={4}>
            {testimonials.map((t, i) => (
              <Grid key={i} size={{ xs: 12, md: 4 }}>
                <motion.div
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <Card sx={{ height: "100%", p: 1 }}>
                    <CardContent>
                      <Typography
                        sx={{
                          fontSize: "28px",
                          color: "#F5603A",
                          mb: 1,
                          lineHeight: 1,
                        }}
                      >
                        ❝
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#2D2D3A",
                          mb: 3,
                          lineHeight: 1.7,
                          fontStyle: "italic",
                        }}
                      >
                        {t.quote}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Avatar alt={t.name} src={t.avatar} sx={{ width: 40, height: 40 }} />
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ color: "#2D2D3A" }}
                          >
                            {t.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#6B6B80" }}
                          >
                            {t.handle}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── CTA Section (Cream BG) ── */}
      <Box
        sx={{
          backgroundColor: colors.cream,
          py: { xs: 8, md: 14 },
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Typography
                  variant="h2"
                  sx={{ mb: 3, fontSize: { xs: "28px", md: "40px" } }}
                >
                  Start tracking your goals today
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#6B6B80", mb: 5, lineHeight: 1.7 }}
                >
                  Join thousands of people already using Kintr to stay focused
                  and accountable — one goal at a time.
                </Typography>
                <Link
                  href={isAuthenticated ? "/dashboard" : "/login?mode=register"}
                  style={{ textDecoration: "none" }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ mb: 4 }}
                  >
                    {isAuthenticated ? "Go to Dashboard" : "Start your journey"}
                  </Button>
                </Link>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "#6B6B80", mb: 2, fontWeight: 600 }}
                  >
                    Goal scopes
                  </Typography>
                  <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
                    {[
                      "Daily habits",
                      "Weekly streaks",
                      "Monthly challenges",
                      "Year goals",
                      "Shared goals",
                      "Private goals",
                    ].map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor: "#fff",
                          color: "#2D2D3A",
                          fontWeight: 600,
                          border: "1px solid #E8E8F0",
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card
                  sx={{
                    background: "linear-gradient(135deg, #1A1A2C, #2D2D4A)",
                    color: "#fff",
                    p: 2,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" component="p" sx={{ color: "#fff", mb: 3 }}>
                      Your goals this month
                    </Typography>
                    {[
                      {
                        title: "Read 4 books",
                        scope: "MONTH",
                        status: "In progress",
                        color: "#3B72EE",
                      },
                      {
                        title: "Exercise 3x/week",
                        scope: "MONTH",
                        status: "In progress",
                        color: "#3B72EE",
                      },
                      {
                        title: "Launch side project",
                        scope: "YEAR",
                        status: "In progress",
                        color: "#F5C332",
                      },
                    ].map((goal, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 1.5,
                          borderBottom:
                            i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ color: "#fff", fontWeight: 600 }}
                          >
                            {goal.title}
                          </Typography>
                          <Chip
                            label={goal.scope}
                            size="small"
                            sx={{
                              mt: 0.5,
                              bgcolor: `${goal.color}22`,
                              color: goal.color,
                              fontSize: "10px",
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                        <Chip
                          label={goal.status}
                          size="small"
                          sx={{
                            bgcolor: "rgba(59,114,238,0.2)",
                            color: "#A0BFFF",
                            fontSize: "11px",
                          }}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Wave Divider ── */}
      <Box sx={{ lineHeight: 0, overflow: "hidden", bgcolor: "#fff" }}>
        <svg
          viewBox="0 0 1440 160"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          <path
            d="M0,80 C240,160 480,0 720,80 C960,160 1200,0 1440,80 L1440,160 L0,160 Z"
            fill={colors.accentYellow}
            opacity="0.35"
          />
          <path
            d="M0,100 C360,20 720,160 1080,60 C1260,20 1380,100 1440,80 L1440,160 L0,160 Z"
            fill={colors.accentBlue}
            opacity="0.25"
          />
          <path
            d="M0,120 C180,60 400,160 720,100 C1000,50 1300,140 1440,100 L1440,160 L0,160 Z"
            fill={colors.cream}
          />
        </svg>
      </Box>

      {/* ── Categories Grid ── */}
      <Box sx={{ backgroundColor: colors.cream, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <Typography
              variant="h2"
              textAlign="center"
              sx={{ mb: 2, fontSize: { xs: "28px", md: "40px" } }}
            >
              Goals for every timeline
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ color: "#6B6B80", mb: 8, maxWidth: 500, mx: "auto" }}
            >
              Whether you&apos;re building a habit today or chasing a dream this
              year, Kintr has you covered.
            </Typography>
          </motion.div>
          <Grid container spacing={3}>
            {categories.map((cat, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <motion.div
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <Card
                    sx={{
                      p: 1,
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: "16px",
                          bgcolor: cat.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 2,
                          color: cat.color,
                        }}
                      >
                        {cat.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        component="h3"
                        fontWeight={700}
                        sx={{ mb: 0.5 }}
                      >
                        {cat.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#6B6B80" }}>
                        {cat.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Social Proof / Dark CTA ── */}
      <Box sx={{ backgroundColor: colors.darkBg, py: { xs: 8, md: 14 } }}>
        <Container maxWidth="lg">
          {/* Stats */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <Typography
              variant="h2"
              textAlign="center"
              sx={{
                color: "#fff",
                mb: 2,
                fontSize: { xs: "28px", md: "40px" },
              }}
            >
              Join thousands getting more done with Kintr
            </Typography>
            <Grid container spacing={4} justifyContent="center" sx={{ my: 6 }}>
              {stats.map((stat, i) => (
                <Grid key={i} size={{ xs: 4, md: 3 }}>
                  <Box textAlign="center">
                    <Typography
                      variant="h3"
                      sx={{
                        color: "#F5603A",
                        fontWeight: 800,
                        mb: 0.5,
                        fontSize: { xs: "28px", md: "36px" },
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* CTA Cards */}
          <Grid container spacing={4} justifyContent="center">
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  bgcolor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  p: 1,
                }}
              >
                <CardContent>
                  <Typography variant="h6" component="h3" sx={{ color: "#fff", mb: 1 }}>
                    Free plan
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ color: "#F5603A", mb: 2, fontWeight: 800 }}
                  >
                    $0
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      mb: 3,
                    }}
                  >
                    {[
                      "Up to 10 active goals",
                      "Public goal sharing",
                      "Connect with 5 friends",
                      "Comments & reactions",
                    ].map((item) => (
                      <Box
                        key={item}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CheckCircle size={16} color="#4CAF50" />
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255,255,255,0.75)" }}
                        >
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Link
                    href={isAuthenticated ? "/dashboard" : "/login?mode=register"}
                    style={{ textDecoration: "none" }}
                  >
                    <Button variant="contained" color="primary" fullWidth>
                      {isAuthenticated ? "Go to Dashboard" : "Get started free"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{ bgcolor: "#B83A18", border: "2px solid #D45030", p: 1 }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" component="h3" sx={{ color: "#fff" }}>
                      Pro plan
                    </Typography>
                    <Chip
                      label="Popular"
                      size="small"
                      sx={{
                        bgcolor: "#1A1A2C",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "11px",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{ color: "#fff", mb: 2, fontWeight: 800 }}
                  >
                    $5/mo
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      mb: 3,
                    }}
                  >
                    {[
                      "Unlimited goals",
                      "Private goals & connections",
                      "Unlimited connections",
                      "Goal chat & DMs",
                      "Priority support",
                    ].map((item) => (
                      <Box
                        key={item}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CheckCircle size={16} color="rgba(255,255,255,0.9)" />
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255,255,255,0.9)" }}
                        >
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Link
                    href={isAuthenticated ? "/dashboard" : "/login?mode=register"}
                    style={{ textDecoration: "none" }}
                  >
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: "#fff",
                        color: "#B83A18",
                        "&:hover": { bgcolor: "#f5f5f5" },
                      }}
                    >
                      {isAuthenticated ? "Go to Dashboard" : "Start free trial"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
