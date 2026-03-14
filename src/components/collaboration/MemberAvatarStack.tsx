'use client';

import { Box, Avatar, Tooltip } from '@mui/material';
import { Profile } from '@/types';

export const MemberAvatarStack = ({ members, max = 4 }: { members: Profile[]; max?: number }) => {
  const visible = members.slice(0, max);
  const overflow = members.length - max;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((m, i) => (
        <Tooltip key={m.id} title={m.display_name}>
          <Avatar
            src={m.avatar_url ?? undefined}
            alt={m.display_name}
            sx={{
              width: 28,
              height: 28,
              fontSize: '11px',
              border: '2px solid white',
              ml: i === 0 ? 0 : -1,
              zIndex: visible.length - i,
            }}
          >
            {m.display_name[0]}
          </Avatar>
        </Tooltip>
      ))}
      {overflow > 0 && (
        <Avatar sx={{ width: 28, height: 28, fontSize: '11px', bgcolor: '#E8E8F0', color: '#6B6B80', border: '2px solid white', ml: -1 }}>
          +{overflow}
        </Avatar>
      )}
    </Box>
  );
};
