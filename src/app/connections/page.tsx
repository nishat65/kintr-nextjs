"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Chip,
  Button,
  Avatar,
  Skeleton,
} from "@mui/material";
import { motion } from "framer-motion";
import { Users, UserPlus, Lock, UserCheck, UserMinus, Clock } from "lucide-react";
import { ConnectionCard } from "@/components/connections/ConnectionCard";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/styles/theme";
import { Connection } from "@/types";
import {
  useConnections,
  useSendConnectionRequest,
  useRespondToConnection,
  useRemoveConnection,
} from "@/hooks/useConnections";
import { useAllProfiles } from "@/hooks/useProfile";
import Link from "next/link";

export default function ConnectionsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState(0);

  const userId = user?.id;

  const { data: rawConnections = [], isLoading: connLoading } = useConnections(userId);
  const connections = rawConnections as unknown as Connection[];
  const { data: allProfiles = [], isLoading: profilesLoading } = useAllProfiles(userId);

  const sendRequest = useSendConnectionRequest(userId ?? "");
  const respondToConn = useRespondToConnection(userId ?? "");
  const removeConn = useRemoveConnection(userId ?? "");

  const friends = connections.filter(
    (c) => (c.requester_id === userId || c.addressee_id === userId) && c.status === "accepted"
  );
  const pendingIncoming = connections.filter(
    (c) => c.addressee_id === userId && c.status === "pending"
  );
  const pendingOutgoing = connections.filter(
    (c) => c.requester_id === userId && c.status === "pending"
  );

  const connectedUserIds = new Set(
    connections.map((c) => (c.requester_id === userId ? c.addressee_id : c.requester_id))
  );
  const discoverable = allProfiles.filter((p) => !connectedUserIds.has(p.id));

  if (!isAuthenticated) {
    return (
      <Box sx={{ pt: "8px", minHeight: "100vh", bgcolor: "#F7F7FB" }}>
        <Box sx={{ backgroundColor: colors.darkBg, py: 6 }}>
          <Container maxWidth="lg">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Users size={28} color="#F5603A" />
              <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
                Connections
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.55)" }}>
              Build your accountability network.
            </Typography>
          </Container>
        </Box>
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Box sx={{ textAlign: "center", py: 8, border: "2px dashed #E8E8F0", borderRadius: "20px" }}>
            <Lock size={40} color="#E8E8F0" />
            <Typography variant="h6" sx={{ color: "#2D2D3A", mt: 2, fontWeight: 700 }}>
              Sign in to manage your connections
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B6B80", mt: 1, mb: 4 }}>
              Connect with people, send requests, and build your accountability network.
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
                sx={{ borderColor: "#F5603A", color: "#F5603A", "&:hover": { bgcolor: "#FFF0EC" }, borderRadius: "50px", px: 4 }}
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
    <Box sx={{ pt: "8px", minHeight: "100vh", bgcolor: "#F7F7FB" }}>
      <Box sx={{ backgroundColor: colors.darkBg, py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Users size={28} color="#F5603A" />
            <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
              Connections
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.55)" }}>
            Build your accountability network.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            mb: 4,
            "& .MuiTabs-indicator": { backgroundColor: "#F5603A" },
            "& .MuiTab-root": { color: "#6B6B80" },
            "& .Mui-selected": { color: "#F5603A !important" },
          }}
        >
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                Friends
                <Chip
                  label={friends.length}
                  size="small"
                  sx={{ bgcolor: "#F7F7FB", color: "#6B6B80", fontWeight: 700, fontSize: "11px" }}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                Pending
                {(pendingIncoming.length + pendingOutgoing.length) > 0 && (
                  <Chip
                    label={pendingIncoming.length + pendingOutgoing.length}
                    size="small"
                    sx={{ bgcolor: "#FFF0EC", color: "#F5603A", fontWeight: 700, fontSize: "11px" }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                People
                <Chip
                  label={discoverable.length}
                  size="small"
                  sx={{ bgcolor: "#F7F7FB", color: "#6B6B80", fontWeight: 700, fontSize: "11px" }}
                />
              </Box>
            }
          />
        </Tabs>

        {/* Friends Tab */}
        {tab === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {connLoading ? (
                [0, 1, 2].map((i) => (
                  <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: "16px" }} />
                ))
              ) : friends.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 10, border: "2px dashed #E8E8F0", borderRadius: "20px" }}>
                  <Users size={40} color="#E8E8F0" />
                  <Typography variant="h6" sx={{ color: "#6B6B80", mt: 2 }}>
                    No connections yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#9B9BAB" }}>
                    Connect with people to start sharing goals
                  </Typography>
                </Box>
              ) : (
                friends.map((conn) => (
                  <ConnectionCard
                    key={conn.id}
                    connection={conn}
                    currentUserId={userId!}
                    onRemove={(id) => removeConn.mutate(id)}
                  />
                ))
              )}
            </Box>
          </motion.div>
        )}

        {/* Pending Tab */}
        {tab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {connLoading ? (
                [0, 1].map((i) => (
                  <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: "16px" }} />
                ))
              ) : (
                <>
                  {pendingIncoming.length > 0 && (
                    <Box>
                      <Typography variant="overline" sx={{ color: "#6B6B80", fontWeight: 700, mb: 1.5, display: "block" }}>
                        Incoming ({pendingIncoming.length})
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {pendingIncoming.map((conn) => (
                          <ConnectionCard
                            key={conn.id}
                            connection={conn}
                            currentUserId={userId!}
                            onAccept={(id) => respondToConn.mutate({ connectionId: id, status: "accepted" })}
                            onReject={(id) => respondToConn.mutate({ connectionId: id, status: "rejected" })}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {pendingOutgoing.length > 0 && (
                    <Box>
                      <Typography variant="overline" sx={{ color: "#6B6B80", fontWeight: 700, mb: 1.5, display: "block" }}>
                        Sent ({pendingOutgoing.length})
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {pendingOutgoing.map((conn) => {
                          const other = conn.addressee;
                          return (
                            <Box
                              key={conn.id}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                p: 2.5,
                                bgcolor: "#fff",
                                borderRadius: "16px",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                flexWrap: "wrap",
                              }}
                            >
                              <Avatar src={other?.avatar_url ?? ""} sx={{ width: 48, height: 48 }}>
                                {other?.display_name?.[0]}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" fontWeight={700}>
                                  {other?.display_name ?? "Unknown"}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#6B6B80" }}>
                                  @{other?.username}
                                </Typography>
                              </Box>
                              <Chip
                                icon={<Clock size={12} />}
                                label="Pending"
                                size="small"
                                sx={{ bgcolor: "#FFF8E1", color: "#F59E0B", fontWeight: 600 }}
                              />
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<UserMinus size={14} />}
                                onClick={() => removeConn.mutate(conn.id)}
                                sx={{ borderRadius: "50px" }}
                              >
                                Cancel
                              </Button>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                  {pendingIncoming.length === 0 && pendingOutgoing.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 10, border: "2px dashed #E8E8F0", borderRadius: "20px" }}>
                      <Typography variant="h6" sx={{ color: "#6B6B80" }}>
                        No pending requests
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </motion.div>
        )}

        {/* People Tab */}
        {tab === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {profilesLoading ? (
                [0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: "16px" }} />
                ))
              ) : discoverable.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 10, border: "2px dashed #E8E8F0", borderRadius: "20px" }}>
                  <UserCheck size={40} color="#E8E8F0" />
                  <Typography variant="h6" sx={{ color: "#6B6B80", mt: 2 }}>
                    You&apos;re connected with everyone!
                  </Typography>
                </Box>
              ) : (
                discoverable.map((profile) => (
                  <Box
                    key={profile.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2.5,
                      bgcolor: "#fff",
                      borderRadius: "16px",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      flexWrap: "wrap",
                    }}
                  >
                    <Avatar src={profile.avatar_url ?? ""} sx={{ width: 48, height: 48 }}>
                      {profile.display_name?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight={700}>
                        {profile.display_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6B6B80" }}>
                        @{profile.username}
                      </Typography>
                      {profile.bio && (
                        <Typography variant="body2" sx={{ color: "#9B9BAB", mt: 0.5, fontSize: "12px" }}>
                          {profile.bio}
                        </Typography>
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<UserPlus size={14} />}
                      onClick={() => sendRequest.mutate(profile.id)}
                      disabled={sendRequest.isPending}
                      sx={{
                        borderColor: "#F5603A",
                        color: "#F5603A",
                        "&:hover": { bgcolor: "#FFF0EC" },
                        borderRadius: "50px",
                      }}
                    >
                      Connect
                    </Button>
                  </Box>
                ))
              )}
            </Box>
          </motion.div>
        )}
      </Container>
    </Box>
  );
}
