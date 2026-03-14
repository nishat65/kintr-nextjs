'use client';

import { BottomNavigation, BottomNavigationAction, Paper, Badge, Box } from '@mui/material';
import { LayoutDashboard, Compass, Briefcase, MessageSquare, Bell } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUnreadCount } from '@/hooks/useNotifications';

const tabs = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Explore', href: '/explore', icon: Compass },
  { label: 'Workspaces', href: '/workspaces', icon: Briefcase },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Alerts', href: '/notifications', icon: Bell },
];

export const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const unreadCount = useUnreadCount(user?.id);

  const currentValue = tabs.findIndex(t => pathname.startsWith(t.href));

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        display: { xs: 'block', md: 'none' },
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
      elevation={0}
    >
      <BottomNavigation
        value={currentValue === -1 ? false : currentValue}
        onChange={(_, newValue) => { router.push(tabs[newValue].href); }}
        sx={{ height: 64 }}
      >
        {tabs.map(({ label, icon: Icon, href }) => (
          <BottomNavigationAction
            key={href}
            label={label}
            icon={
              label === 'Alerts' && unreadCount > 0 ? (
                <Badge badgeContent={unreadCount} color="error" max={9}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} />
                  </Box>
                </Badge>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} />
                </Box>
              )
            }
            sx={{ minWidth: 0, '& .MuiBottomNavigationAction-label': { fontSize: '11px' } }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};
