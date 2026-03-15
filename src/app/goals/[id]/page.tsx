"use client";

import { use, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  TextField,
  Divider,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Lock,
  Globe,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAuthStore } from "@/stores/authStore";
import {
  useGoal,
  useUpdateGoalStatus,
  useGoalVoteCounts,
  useUserVote,
  useVote,
  useComments,
  useAddComment,
} from "@/hooks/useGoals";
import {
  useGoalMessages,
  useSendGoalMessage,
  useGoalMessagesRealtime,
} from "@/hooks/useMessages";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { colors } from "@/styles/theme";
import { parseMentions } from "@/lib/utils/mentions";
import { fetchProfileByUsername } from "@/lib/supabase/queries/profiles";
import { createNotification } from "@/lib/supabase/queries/notifications";

dayjs.extend(relativeTime);

// Render text with @mentions highlighted
const MentionText = ({ text }: { text: string }) => {
  const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^@[a-zA-Z0-9_]+$/.test(part) ? (
          <Box
            key={i}
            component="span"
            sx={{ color: "#F5603A", fontWeight: 600 }}
          >
            {part}
          </Box>
        ) : (
          part
        )
      )}
    </>
  );
};

const scopeConfig = {
  day: { label: "DAY", color: "#F5603A", bg: "rgba(245, 96, 58, 0.12)" },
  month: { label: "MONTH", color: "#3B72EE", bg: "rgba(59, 114, 238, 0.12)" },
  year: { label: "YEAR", color: "#F5C332", bg: "rgba(245, 195, 50, 0.12)" },
};

const statusConfig = {
  not_started: { label: "Not started", color: "text.secondary", bg: "rgba(107, 107, 128, 0.12)" },
  in_progress: { label: "In progress", color: "#3B72EE", bg: "rgba(59, 114, 238, 0.12)" },
  completed: { label: "Completed", color: "#4CAF50", bg: "rgba(76, 175, 80, 0.12)" },
  failed: { label: "Failed", color: "#EF5350", bg: "rgba(239, 83, 80, 0.12)" },
};

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: goal, isLoading } = useGoal(id);
  const updateStatus = useUpdateGoalStatus();
  const { data: voteCounts = { upvotes: 0, downvotes: 0 } } =
    useGoalVoteCounts(id);
  const { data: userVote } = useUserVote(id, user?.id);
  const { upsert: vote, remove: unvote } = useVote(id, user?.id ?? "");
  const { data: comments = [] } = useComments(id);
  const addComment = useAddComment(id);
  const { data: goalMessages = [] } = useGoalMessages(id);
  const sendGoalMessage = useSendGoalMessage(id, goal?.user_id);
  useGoalMessagesRealtime(id);

  const [activeTab, setActiveTab] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [chatText, setChatText] = useState("");

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

  if (!goal) {
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
        <Box textAlign="center">
          <Typography variant="h4" sx={{ mb: 2 }}>
            Goal not found
          </Typography>
          <Link href="/dashboard">
            <Button variant="contained" color="primary">
              Go to Dashboard
            </Button>
          </Link>
        </Box>
      </Box>
    );
  }

  const scope = scopeConfig[goal.scope];
  const status = statusConfig[goal.status];
  const isOwner = user?.id === goal.user_id;

  const handleVote = (type: "upvote" | "downvote") => {
    if (!user) return;
    if (userVote === type) {
      unvote.mutate();
    } else {
      vote.mutate(type);
    }
  };

  const fireMentionNotifications = async (
    text: string,
    entityType: 'goal' | 'comment',
    entityId: string
  ) => {
    if (!user) return;
    const usernames = parseMentions(text);
    for (const username of usernames) {
      try {
        const profile = await fetchProfileByUsername(username);
        if (profile && profile.id !== user.id) {
          await createNotification({
            user_id: profile.id,
            actor_id: user.id,
            type: 'mention',
            entity_type: entityType,
            entity_id: entityId,
          });
        }
      } catch {
        // User not found — skip silently
      }
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;
    const content = commentText.trim();
    setCommentText("");
    const result = await addComment.mutateAsync({ userId: user.id, content });
    if (result?.id) {
      // Notify goal owner if someone else comments
      if (goal?.user_id && user.id !== goal.user_id) {
        await createNotification({
          user_id: goal.user_id,
          actor_id: user.id,
          type: 'comment',
          entity_type: 'goal',
          entity_id: id,
        });
      }
      await fireMentionNotifications(content, 'comment', result.id);
    }
  };

  const handleSendMessage = async () => {
    if (!chatText.trim() || !user) return;
    const content = chatText.trim();
    setChatText("");
    await sendGoalMessage.mutateAsync({ senderId: user.id, content });
    await fireMentionNotifications(content, 'goal', id);
  };

  return (
    <Box sx={{ pt: "8px", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <Box sx={{ backgroundColor: colors.darkBg, pb: 5, pt: 4 }}>
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={() => router.back()}
            sx={{
              color: "rgba(255,255,255,0.65)",
              mb: 3,
              "&:hover": { color: "#fff" },
            }}
          >
            Back
          </Button>

          <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
            <Chip
              label={scope.label}
              size="small"
              sx={{
                bgcolor: `${scope.color}22`,
                color: scope.color,
                fontWeight: 700,
                fontSize: "11px",
              }}
            />
            <Chip
              label={status.label}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "11px",
              }}
            />
            <Chip
              icon={
                goal.visibility === "private" ? (
                  <Lock size={11} />
                ) : (
                  <Globe size={11} />
                )
              }
              label={goal.visibility}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.6)",
                fontSize: "11px",
              }}
            />
          </Box>

          <Typography
            variant="h3"
            sx={{ color: "#fff", mb: 2, fontSize: { xs: "24px", md: "32px" } }}
          >
            {goal.title}
          </Typography>

          {goal.description && (
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.65)",
                mb: 3,
                maxWidth: 640,
                lineHeight: 1.7,
              }}
            >
              {goal.description}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                src={goal.author.avatar_url ?? undefined}
                sx={{ width: 36, height: 36 }}
              />
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "#fff", fontWeight: 600 }}
                >
                  {goal.author.display_name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.45)" }}
                >
                  @{goal.author.username}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <Calendar size={14} />
              <Typography variant="caption">
                {dayjs(goal.target_date).format("MMMM D, YYYY")}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
              <Button
                startIcon={<ThumbsUp size={15} />}
                onClick={() => handleVote("upvote")}
                sx={{
                  color: userVote === "upvote" ? "#fff" : "#4CAF50",
                  bgcolor:
                    userVote === "upvote" ? "#4CAF50" : "rgba(76,175,80,0.12)",
                  "&:hover": { bgcolor: "#4CAF50", color: "#fff" },
                }}
                size="small"
              >
                {voteCounts.upvotes}
              </Button>
              <Button
                startIcon={<ThumbsDown size={15} />}
                onClick={() => handleVote("downvote")}
                sx={{
                  color: userVote === "downvote" ? "#fff" : "#EF5350",
                  bgcolor:
                    userVote === "downvote"
                      ? "#EF5350"
                      : "rgba(239,83,80,0.12)",
                  "&:hover": { bgcolor: "#EF5350", color: "#fff" },
                }}
                size="small"
              >
                {voteCounts.downvotes}
              </Button>
            </Box>
          </Box>

          {isOwner && (
            <Box sx={{ display: "flex", gap: 1.5, mt: 3, flexWrap: "wrap" }}>
              {(
                ["not_started", "in_progress", "completed", "failed"] as const
              ).map((s) => (
                <Button
                  key={s}
                  size="small"
                  onClick={() => updateStatus.mutate({ id, status: s })}
                  sx={{
                    borderRadius: "50px",
                    fontWeight: 600,
                    fontSize: "12px",
                    bgcolor:
                      goal.status === s
                        ? statusConfig[s].bg
                        : "rgba(255,255,255,0.08)",
                    color:
                      goal.status === s
                        ? statusConfig[s].color
                        : "rgba(255,255,255,0.5)",
                    border: `1px solid ${
                      goal.status === s ? statusConfig[s].color : "transparent"
                    }`,
                    "&:hover": {
                      bgcolor: statusConfig[s].bg,
                      color: statusConfig[s].color,
                    },
                  }}
                >
                  {statusConfig[s].label}
                </Button>
              ))}
            </Box>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            mb: 4,
            "& .MuiTabs-indicator": { backgroundColor: "primary.light" },
            "& .MuiTab-root": { color: "text.secondary" },
            "& .Mui-selected": { color: "primary.light !important" },
          }}
        >
          <Tab
            icon={<MessageCircle size={16} />}
            iconPosition="start"
            label={`Comments (${comments.length})`}
          />
          <Tab
            icon={<MessageCircle size={16} />}
            iconPosition="start"
            label="Goal Chat"
          />
        </Tabs>

        {activeTab === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Avatar
                    src={user?.avatar_url ?? undefined}
                    sx={{ width: 36, height: 36, flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      placeholder="Leave a comment... (use @username to mention)"
                      fullWidth
                      multiline
                      minRows={2}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      sx={{ mb: 1.5 }}
                    />
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        endIcon={<Send size={14} />}
                        onClick={handleAddComment}
                        disabled={!commentText.trim() || addComment.isPending}
                      >
                        Post
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                        <Avatar
                          src={comment.author.avatar_url ?? undefined}
                          sx={{ width: 36, height: 36 }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {comment.author.display_name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            {dayjs(comment.created_at).fromNow()}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.primary", lineHeight: 1.6 }}
                      >
                        <MentionText text={comment.content} />
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        )}

        {activeTab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    minHeight: 300,
                    maxHeight: 480,
                    overflowY: "auto",
                    mb: 3,
                  }}
                >
                  {goalMessages.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 8, color: "text.disabled" }}>
                      <MessageCircle size={40} />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        No messages yet. Start the conversation!
                      </Typography>
                    </Box>
                  ) : (
                    goalMessages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.sender_id === user?.id}
                      />
                    ))
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Avatar
                    src={user?.avatar_url ?? undefined}
                    sx={{ width: 36, height: 36, flexShrink: 0 }}
                  />
                  <TextField
                    placeholder="Send a message..."
                    fullWidth
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    size="small"
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!chatText.trim() || sendGoalMessage.isPending}
                    sx={{
                      bgcolor: "#F5603A",
                      color: "#fff",
                      "&:hover": { bgcolor: "#C94020" },
                      "&:disabled": { bgcolor: "action.disabledBackground" },
                    }}
                  >
                    <Send size={18} />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </Container>
    </Box>
  );
}
