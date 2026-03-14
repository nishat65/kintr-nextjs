import { Box, Card, CardContent, Typography, Avatar, Button } from '@mui/material';
import { UserCheck, UserX, MessageCircle, UserMinus } from 'lucide-react';
import Link from 'next/link';
import { Connection } from '@/types';

interface ConnectionCardProps {
  connection: Connection;
  currentUserId: string;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export const ConnectionCard = ({ connection, currentUserId, onAccept, onReject, onRemove }: ConnectionCardProps) => {
  const otherUser = connection.requester_id === currentUserId ? connection.addressee : connection.requester;
  const isPending = connection.status === 'pending' && connection.addressee_id === currentUserId;

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Link href={`/profile/${otherUser.username}`} style={{ textDecoration: 'none' }}>
            <Avatar
              src={otherUser.avatar_url ?? undefined}
              sx={{ width: 48, height: 48, cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
            />
          </Link>
          <Box sx={{ flex: 1 }}>
            <Link href={`/profile/${otherUser.username}`} style={{ textDecoration: 'none' }}>
              <Typography variant="body1" fontWeight={700} sx={{ color: '#2D2D3A', '&:hover': { color: '#F5603A' } }}>
                {otherUser.display_name}
              </Typography>
            </Link>
            <Typography variant="caption" sx={{ color: '#6B6B80' }}>@{otherUser.username}</Typography>
            {otherUser.bio && (
              <Typography variant="body2" sx={{ color: '#6B6B80', mt: 0.5, fontSize: '12px' }}>
                {otherUser.bio}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {isPending ? (
              <>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<UserCheck size={14} />}
                  onClick={() => onAccept?.(connection.id)}
                >
                  Accept
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<UserX size={14} />}
                  sx={{ borderColor: '#E8E8F0', color: '#6B6B80' }}
                  onClick={() => onReject?.(connection.id)}
                >
                  Decline
                </Button>
              </>
            ) : (
              <>
                <Link href={`/chat/${otherUser.id}`} style={{ textDecoration: 'none' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<MessageCircle size={14} />}
                    sx={{ borderColor: '#E8E8F0', color: '#2D2D3A' }}
                  >
                    Message
                  </Button>
                </Link>
                {onRemove && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<UserMinus size={14} />}
                    onClick={() => onRemove(connection.id)}
                    sx={{ borderColor: 'error.light' }}
                  >
                    Remove
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
