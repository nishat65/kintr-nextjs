'use client';

import { Box, Avatar, Typography } from '@mui/material';
import { GoalActivity, ActivityType } from '@/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const activityLabel = (type: ActivityType, metadata: Record<string, unknown>, actorName: string): string => {
  switch (type) {
    case 'created': return `${actorName} created this goal`;
    case 'status_changed': return `${actorName} changed status from ${metadata.from} → ${metadata.to}`;
    case 'assigned': return `${actorName} assigned this goal to ${metadata.assignee_name}`;
    case 'unassigned': return `${actorName} unassigned this goal`;
    case 'priority_changed': return `${actorName} changed priority to ${metadata.to}`;
    case 'due_date_set': return `${actorName} set due date to ${metadata.date}`;
    case 'title_edited': return `${actorName} edited the title`;
    case 'comment_added': return `${actorName} added a comment`;
    case 'attachment_added': return `${actorName} attached ${metadata.file_name}`;
    default: return `${actorName} made a change`;
  }
};

export const ActivityFeedItem = ({ activity }: { activity: GoalActivity }) => {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Avatar src={activity.actor.avatar_url ?? undefined} sx={{ width: 28, height: 28, mt: 0.2 }}>
        {activity.actor.display_name[0]}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {activityLabel(activity.type, activity.metadata, activity.actor.display_name)}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {dayjs(activity.created_at).fromNow()}
        </Typography>
      </Box>
    </Box>
  );
};
