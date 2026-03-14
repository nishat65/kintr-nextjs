"use client";

import { use, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Avatar,
  TextField,
  IconButton,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { useProfile } from "@/hooks/useProfile";
import {
  useMessages,
  useSendMessage,
  useMessagesRealtime,
  useMarkMessagesRead,
} from "@/hooks/useMessages";
import { colors } from "@/styles/theme";
import { useState } from "react";

export default function DMThreadPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId: partnerId } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const { data: partner, isLoading: partnerLoading } = useProfile(partnerId);
  const { data: messages = [], isLoading: messagesLoading } = useMessages(currentUserId, partnerId);
  const sendMessage = useSendMessage(currentUserId ?? "", partnerId);
  const markRead = useMarkMessagesRead(currentUserId ?? "", partnerId);
  useMessagesRealtime(currentUserId, partnerId);

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when thread opens
  useEffect(() => {
    if (currentUserId && partnerId) {
      markRead.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, partnerId]);

  const handleSend = () => {
    if (!text.trim() || !currentUserId) return;
    sendMessage.mutate(text.trim());
    setText("");
  };

  return (
    <Box
      sx={{
        pt: "8px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Chat header */}
      <Box
        sx={{
          backgroundColor: colors.darkBg,
          py: 2,
          px: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <IconButton
          onClick={() => router.back()}
          sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } }}
        >
          <ArrowLeft size={20} />
        </IconButton>
        {partnerLoading ? (
          <Skeleton variant="circular" width={40} height={40} />
        ) : (
          <>
            <Avatar
              src={partner?.avatar_url ?? undefined}
              sx={{ width: 40, height: 40 }}
            />
            <Box>
              <Typography variant="body1" sx={{ color: "#fff", fontWeight: 700 }}>
                {partner?.display_name ?? "Loading..."}
              </Typography>
              {partner?.username && (
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.45)" }}
                >
                  @{partner.username}
                </Typography>
              )}
            </Box>
          </>
        )}
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 3, bgcolor: "#F7F7FB" }}>
        <Container maxWidth="md">
          {messagesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 5 }}>
              <CircularProgress size={28} />
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8, color: "#9B9BAB" }}>
              <Typography variant="body2">
                No messages yet. Say hello!
              </Typography>
            </Box>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender_id === currentUserId}
              />
            ))
          )}
          <div ref={bottomRef} />
        </Container>
      </Box>

      {/* Input */}
      <Box sx={{ bgcolor: "#fff", borderTop: "1px solid #F0F0F8", p: 2 }}>
        <Container maxWidth="md">
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <Avatar
              src={user?.avatar_url ?? undefined}
              sx={{ width: 36, height: 36, flexShrink: 0 }}
            />
            <TextField
              placeholder={`Message ${partner?.display_name ?? ""}...`}
              fullWidth
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "50px" } }}
            />
            <IconButton
              onClick={handleSend}
              disabled={!text.trim() || sendMessage.isPending}
              sx={{
                bgcolor: "#F5603A",
                color: "#fff",
                "&:hover": { bgcolor: "#C94020" },
                "&:disabled": { bgcolor: "#F0F0F8", color: "#C0C0D0" },
              }}
            >
              <Send size={18} />
            </IconButton>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
