'use client';

import { Box, Typography, Avatar, Tooltip, IconButton } from '@mui/material';
import {
  ThumbsUp, ThumbsDown, MessageCircle, UserPlus, UserCheck, Share2,
  MessageSquare, Briefcase, Target, Bell, AtSign, Star, Check, Trash2,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Notification, NotificationType } from '@/types';

dayjs.extend(relativeTime);

const notifConfig: Record<NotificationType, { icon: React.ReactElement; color: string; bg: string; text: string }> = {
  upvote: { icon: <ThumbsUp size={14} />, color: '#4CAF50', bg: '#F0FBF0', text: 'upvoted your goal' },
  downvote: { icon: <ThumbsDown size={14} />, color: '#EF5350', bg: '#FFF0F0', text: 'downvoted your goal' },
  comment: { icon: <MessageCircle size={14} />, color: '#3B72EE', bg: '#EEF4FF', text: 'commented on your goal' },
  message: { icon: <MessageSquare size={14} />, color: '#F5603A', bg: '#FFF0EC', text: 'sent you a message' },
  goal_message: { icon: <MessageCircle size={14} />, color: '#F5C332', bg: '#FFFBEC', text: 'sent a goal message' },
  connection_request: { icon: <UserPlus size={14} />, color: '#3B72EE', bg: '#EEF4FF', text: 'sent you a connection request' },
  connection_accepted: { icon: <UserCheck size={14} />, color: '#4CAF50', bg: '#F0FBF0', text: 'accepted your connection request' },
  goal_shared: { icon: <Share2 size={14} />, color: '#F5603A', bg: '#FFF0EC', text: 'shared a goal with you' },
  workspace_invite: { icon: <Briefcase size={14} />, color: '#3B72EE', bg: '#EEF4FF', text: 'invited you to a workspace' },
  goal_assigned: { icon: <Target size={14} />, color: '#F5603A', bg: '#FFF0EC', text: 'assigned a goal to you' },
  goal_status_changed: { icon: <Bell size={14} />, color: '#F5C332', bg: '#FFFBEC', text: 'updated a goal status' },
  mention: { icon: <AtSign size={14} />, color: '#9C27B0', bg: '#F3E5F5', text: 'mentioned you' },
  collaborator_added: { icon: <UserPlus size={14} />, color: '#3B72EE', bg: '#EEF4FF', text: 'added you to a workspace' },
  goal_deleted: { icon: <Bell size={14} />, color: '#EF5350', bg: '#FFF0F0', text: 'deleted a goal in your workspace' },
  goal_moved: { icon: <Briefcase size={14} />, color: '#F5C332', bg: '#FFFBEC', text: 'moved a goal to a different column' },
  collaborator_has_goal: { icon: <Target size={14} />, color: '#F5603A', bg: '#FFF0EC', text: 'already has a goal in this workspace' },
};

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onStar?: (id: string, starred: boolean) => void;
  onDelete?: (id: string) => void;
}

export const NotificationList = ({
  notifications,
  onMarkRead,
  onStar,
  onDelete,
}: NotificationListProps) => {
  if (notifications.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10, border: '2px dashed #E8E8F0', borderRadius: '20px' }}>
        <Typography variant="h6" sx={{ color: '#6B6B80' }}>All caught up!</Typography>
        <Typography variant="body2" sx={{ color: '#9B9BAB' }}>No new notifications</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {notifications.map((notif, i) => {
        const config = notifConfig[notif.type];
        const isUnread = !notif.read_at;

        return (
          <Box
            key={notif.id}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              p: 2.5,
              bgcolor: notif.starred ? '#FFFBF0' : isUnread ? '#FAFEFF' : '#fff',
              borderBottom: i < notifications.length - 1 ? '1px solid #F0F0F8' : 'none',
              borderLeft: isUnread ? '3px solid #F5603A' : notif.starred ? '3px solid #F5C332' : '3px solid transparent',
              transition: 'all 0.15s',
              '&:hover': { bgcolor: '#F7F7FB' },
              '&:hover .notif-actions': { opacity: 1 },
            }}
          >
            {/* Actor avatar with icon overlay */}
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar src={notif.actor.avatar_url ?? undefined} sx={{ width: 44, height: 44 }} />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: config.bg,
                  color: config.color,
                  border: '2px solid #fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {config.icon}
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ color: '#2D2D3A', lineHeight: 1.5 }}>
                <Box component="span" fontWeight={700}>{notif.actor.display_name}</Box>
                {' '}{config.text}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9B9BAB', display: 'block', mt: 0.5 }}>
                {dayjs(notif.created_at).fromNow()}
              </Typography>
            </Box>

            {/* Actions — visible on hover */}
            <Box
              className="notif-actions"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                opacity: 0,
                transition: 'opacity 0.15s',
                flexShrink: 0,
              }}
            >
              {isUnread && onMarkRead && (
                <Tooltip title="Mark as read">
                  <IconButton
                    size="small"
                    onClick={() => onMarkRead(notif.id)}
                    sx={{ color: '#4CAF50', '&:hover': { bgcolor: '#F0FBF0' } }}
                  >
                    <Check size={15} />
                  </IconButton>
                </Tooltip>
              )}
              {onStar && (
                <Tooltip title={notif.starred ? 'Unstar' : 'Star'}>
                  <IconButton
                    size="small"
                    onClick={() => onStar(notif.id, !notif.starred)}
                    sx={{
                      color: notif.starred ? '#F5C332' : '#9B9BAB',
                      '&:hover': { bgcolor: '#FFFBEC', color: '#F5C332' },
                    }}
                  >
                    <Star size={15} fill={notif.starred ? '#F5C332' : 'none'} />
                  </IconButton>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(notif.id)}
                    sx={{ color: '#9B9BAB', '&:hover': { bgcolor: '#FFF0F0', color: '#EF5350' } }}
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {isUnread && (
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F5603A', mt: 1, flexShrink: 0 }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
};
