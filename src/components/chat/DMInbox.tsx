import { Box, Typography, Avatar, Badge } from '@mui/material';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Message, Profile } from '@/types';

dayjs.extend(relativeTime);

interface DMInboxItemProps {
  partner: Profile;
  lastMessage: Message;
  unread: boolean;
}

export const DMInboxItem = ({ partner, lastMessage, unread }: DMInboxItemProps) => {
  return (
    <Link href={`/chat/${partner.id}`} style={{ textDecoration: 'none' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2.5,
          borderRadius: '16px',
          cursor: 'pointer',
          bgcolor: unread ? 'rgba(245, 96, 58, 0.06)' : 'background.paper',
          border: '1px solid',
          borderColor: unread ? 'rgba(245, 96, 58, 0.25)' : 'divider',
          transition: 'all 0.15s',
          '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' },
        }}
      >
        <Badge
          variant="dot"
          invisible={!unread}
          sx={{ '& .MuiBadge-badge': { bgcolor: '#F5603A', width: 10, height: 10, borderRadius: '50%' } }}
        >
          <Avatar src={partner.avatar_url ?? undefined} sx={{ width: 48, height: 48 }} />
        </Badge>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" fontWeight={unread ? 700 : 600} sx={{ color: 'text.primary' }}>
              {partner.display_name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', flexShrink: 0 }}>
              {dayjs(lastMessage.created_at).fromNow()}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: unread ? '#2D2D3A' : '#6B6B80',
              fontWeight: unread ? 600 : 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {lastMessage.content}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
};
