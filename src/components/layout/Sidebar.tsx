'use client';

import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography, Divider } from '@mui/material';
import { LayoutDashboard, Compass, Users, MessageSquare, Bell, Settings, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUnreadCount, useNotificationsRealtime } from '@/hooks/useNotifications';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Explore', href: '/explore', icon: Compass },
  { label: 'Workspaces', href: '/workspaces', icon: Briefcase },
  { label: 'Connections', href: '/connections', icon: Users },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const unreadCount = useUnreadCount(user?.id);
  useNotificationsRealtime(user?.id);

  return (
    <Box
      sx={{
        width: 240,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1200,
        pt: '68px',
      }}
    >
      <List sx={{ flex: 1, px: 1.5, py: 1 }}>
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          const badge = label === 'Notifications' && unreadCount > 0 ? unreadCount : 0;
          return (
            <ListItem key={href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={href}
                sx={{
                  borderRadius: '10px',
                  bgcolor: active ? 'primary.main' : 'transparent',
                  color: active ? '#fff' : 'text.primary',
                  '&:hover': {
                    bgcolor: active ? 'primary.main' : 'action.hover',
                  },
                  py: 1.2,
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <Icon size={18} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontSize: '14px', fontWeight: active ? 700 : 500 }}
                />
                {badge > 0 && (
                  <Box
                    sx={{
                      bgcolor: 'error.main',
                      color: '#fff',
                      borderRadius: '50px',
                      minWidth: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      px: 0.5,
                    }}
                  >
                    {badge > 9 ? '9+' : badge}
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {user && (
        <>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={user.avatar_url ?? undefined} sx={{ width: 36, height: 36 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} noWrap>{user.display_name}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>@{user.username}</Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};
