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
          bgcolor: unread ? '#FFF8F6' : '#fff',
          border: `1px solid ${unread ? '#FFD5C8' : '#F0F0F8'}`,
          transition: 'all 0.15s',
          '&:hover': { bgcolor: '#F7F7FB', borderColor: '#E8E8F0' },
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
            <Typography variant="body2" fontWeight={unread ? 700 : 600} sx={{ color: '#2D2D3A' }}>
              {partner.display_name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9B9BAB', flexShrink: 0 }}>
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
