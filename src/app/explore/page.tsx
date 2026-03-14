"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  Skeleton,
  Grid,
} from "@mui/material";
import { Search, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { useDebounce } from "use-debounce";
import { GoalList } from "@/components/goals/GoalList";
import { usePublicGoals } from "@/hooks/useGoals";
import { GoalScope } from "@/types";
import { colors } from "@/styles/theme";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState<GoalScope | "all">("all");
  const [debouncedSearch] = useDebounce(search, 300);

  const { data: publicGoals = [], isLoading } = usePublicGoals(scopeFilter);

  const filtered = publicGoals.filter((g) => {
    const matchesSearch =
      !debouncedSearch ||
      g.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      g.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesSearch;
  });

  const sortedByVotes = [...filtered].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <Box sx={{ pt: "8px", minHeight: "100vh", bgcolor: "#F7F7FB" }}>
      {/* Header */}
      <Box sx={{ backgroundColor: colors.darkBg, py: 6 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
            >
              <Compass size={28} color="#F5603A" />
              <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
                Explore Goals
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{ color: "rgba(255,255,255,0.55)", mb: 4, maxWidth: 480 }}
            >
              Discover what people around the world are working towards. Get
              inspired and cheer them on.
            </Typography>
            <TextField
              placeholder="Search goals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                width: { xs: "100%", md: 480 },
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(255,255,255,0.08)",
                  borderRadius: "50px",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                  "&.Mui-focused fieldset": { borderColor: "#F5603A" },
                  color: "#fff",
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(255,255,255,0.4)",
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} color="rgba(255,255,255,0.4)" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Tabs
            value={scopeFilter}
            onChange={(_, v) => setScopeFilter(v)}
            sx={{
              "& .MuiTabs-indicator": { backgroundColor: "#F5603A" },
              "& .MuiTab-root": { color: "#6B6B80" },
              "& .Mui-selected": { color: "#F5603A !important" },
            }}
          >
            {[
              { label: "All", value: "all" },
              { label: "Day", value: "day" },
              { label: "Month", value: "month" },
              { label: "Year", value: "year" },
            ].map((t) => (
              <Tab key={t.value} label={t.label} value={t.value} />
            ))}
          </Tabs>
          <Chip
            label={`${sortedByVotes.length} goals found`}
            size="small"
            sx={{ bgcolor: "#EEF4FF", color: "#3B72EE", fontWeight: 700 }}
          />
        </Box>

        {isLoading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton variant="rounded" height={180} sx={{ borderRadius: '16px' }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <GoalList
            goals={sortedByVotes}
            showAuthor
            emptyMessage="No public goals match your search"
          />
        )}
      </Container>
    </Box>
  );
}
