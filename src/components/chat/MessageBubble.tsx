import { Box, Typography, Avatar } from '@mui/material';
import dayjs from 'dayjs';
import { Message, GoalMessage } from '@/types';

interface MessageBubbleProps {
  message: Message | GoalMessage;
  isOwn: boolean;
}

export const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        gap: 1,
        mb: 2,
      }}
    >
      {!isOwn && (
        <Avatar
          src={message.sender.avatar_url ?? undefined}
          sx={{ width: 32, height: 32, flexShrink: 0, mt: 0.5 }}
        />
      )}
      <Box sx={{ maxWidth: '70%' }}>
        {!isOwn && (
          <Typography variant="caption" sx={{ color: '#6B6B80', fontWeight: 600, ml: 1, display: 'block', mb: 0.5 }}>
            {message.sender.display_name}
          </Typography>
        )}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            bgcolor: isOwn ? '#F5603A' : '#F7F7FB',
            color: isOwn ? '#fff' : '#2D2D3A',
          }}
        >
          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
            {message.content}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#9B9BAB', mt: 0.5, display: 'block', textAlign: isOwn ? 'right' : 'left', px: 1 }}>
          {dayjs(message.created_at).format('h:mm A')}
        </Typography>
      </Box>
      {isOwn && (
        <Avatar
          src={message.sender.avatar_url ?? undefined}
          sx={{ width: 32, height: 32, flexShrink: 0, mt: 0.5 }}
        />
      )}
    </Box>
  );
};
