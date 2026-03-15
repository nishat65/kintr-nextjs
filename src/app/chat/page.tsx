"use client";

import { Box, Container, Typography, Button, Skeleton } from "@mui/material";
import { motion } from "framer-motion";
import { MessageCircle, Lock } from "lucide-react";
import { DMInboxItem } from "@/components/chat/DMInbox";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/styles/theme";
import { useConversations } from "@/hooks/useMessages";
import Link from "next/link";

export default function ChatPage() {
  const { user, isAuthenticated } = useAuthStore();

  const { data: conversations = [], isLoading } = useConversations(user?.id);

  if (!isAuthenticated) {
    return (
      <Box sx={{ pt: "8px", minHeight: "100vh", bgcolor: "background.default" }}>
        <Box sx={{ backgroundColor: colors.darkBg, py: 6 }}>
          <Container maxWidth="md">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <MessageCircle size={28} color="#F5603A" />
              <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
                Messages
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.55)" }}>
              Direct messages with your connections.
            </Typography>
          </Container>
        </Box>
        <Container maxWidth="md" sx={{ py: 10 }}>
          <Box sx={{ textAlign: "center", py: 8, border: "2px dashed", borderColor: "divider", borderRadius: "20px" }}>
            <Lock size={40} color="currentColor" />
            <Typography variant="h6" sx={{ color: "text.primary", mt: 2, fontWeight: 700 }}>
              Sign in to access messages
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1, mb: 4 }}>
              Chat privately with your connections to stay motivated together.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                component={Link}
                href="/login"
                variant="contained"
                sx={{ bgcolor: "#F5603A", "&:hover": { bgcolor: "#d94e2e" }, borderRadius: "50px", px: 4 }}
              >
                Sign in
              </Button>
              <Button
                component={Link}
                href="/login?mode=register"
                variant="outlined"
                sx={{ borderColor: "#F5603A", color: "#F5603A", "&:hover": { bgcolor: "rgba(245, 96, 58, 0.12)" }, borderRadius: "50px", px: 4 }}
              >
                Create account
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: "8px", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box sx={{ backgroundColor: colors.darkBg, py: 6 }}>
        <Container maxWidth="md">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <MessageCircle size={28} color="#F5603A" />
            <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
              Messages
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.55)" }}>
            Direct messages with your connections.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 5 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {isLoading ? (
            [0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: "16px" }} />
            ))
          ) : conversations.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 12,
                border: "2px dashed", borderColor: "divider",
                borderRadius: "20px",
              }}
            >
              <MessageCircle size={40} color="currentColor" />
              <Typography variant="h6" sx={{ color: "text.secondary", mt: 2 }}>
                No messages yet
              </Typography>
              <Typography variant="body2" sx={{ color: "text.disabled" }}>
                Connect with someone to start a conversation
              </Typography>
            </Box>
          ) : (
            conversations.map((msg, i) => {
              const partner =
                msg.sender_id === user?.id
                  ? msg.recipient ?? msg.sender
                  : msg.sender;
              const unread = msg.sender_id !== user?.id && !msg.read_at;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <DMInboxItem partner={partner} lastMessage={msg} unread={unread} />
                </motion.div>
              );
            })
          )}
        </Box>
      </Container>
    </Box>
  );
}
