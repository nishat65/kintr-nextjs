'use client';

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Menu as MenuIcon, Bell, Target, Sun, Moon } from 'lucide-react';
import { useTheme as useNextTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUnreadCount, useNotificationsRealtime } from '@/hooks/useNotifications';
import { colors } from '@/styles/theme';

const navLinks = [
  { label: 'Explore', href: '/explore' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Connections', href: '/connections' },
  { label: 'Chat', href: '/chat' },
];

interface NavbarProps {
  sidebarMode?: boolean;
}

export const Navbar = ({ sidebarMode = false }: NavbarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  const unreadCount = useUnreadCount(user?.id);
  useNotificationsRealtime(user?.id);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { theme: nextTheme, setTheme } = useNextTheme();

  const toggleTheme = () => setTheme(nextTheme === 'dark' ? 'light' : 'dark');

  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: colors.darkBg,
        borderBottom: 'none',
        zIndex: 1300,
      }}
    >
      <Toolbar sx={{ maxWidth: sidebarMode ? '100%' : '1280px', mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, minHeight: '68px !important' }}>
        {/* Logo — hidden in sidebarMode on desktop (sidebar has branding area) */}
        {(!sidebarMode || isMobile) && (
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #F5603A, #FF9060)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Target size={18} color="#fff" />
            </Box>
            <Box
              component="span"
              sx={{
                color: '#fff',
                fontWeight: 800,
                fontSize: '20px',
                letterSpacing: '-0.02em',
                fontFamily: '"Montserrat", sans-serif',
              }}
            >
              kintr
            </Box>
          </Link>
        )}

        {/* Desktop Nav Links — hidden in sidebarMode (links live in Sidebar) */}
        {!isMobile && !sidebarMode && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 5 }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <Box
                  component="span"
                  sx={{
                    color: pathname === link.href ? '#fff' : 'rgba(255,255,255,0.65)',
                    fontWeight: 500,
                    fontSize: '15px',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.08)' },
                    fontFamily: '"Montserrat", sans-serif',
                  }}
                >
                  {link.label}
                </Box>
              </Link>
            ))}
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Desktop Right Actions */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Theme Toggle */}
            <IconButton onClick={toggleTheme} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff' } }}>
              {nextTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>

            {/* While session is loading, show nothing — avoids Login button flash */}
            {!isLoading && (isAuthenticated && user ? (
              <>
                <Link href="/notifications" style={{ textDecoration: 'none' }}>
                  <IconButton sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff' } }}>
                    <Badge badgeContent={unreadCount} color="error" max={9}>
                      <Bell size={20} />
                    </Badge>
                  </IconButton>
                </Link>
                <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                  <Avatar
                    src={user.avatar_url ?? undefined}
                    alt={user.display_name}
                    sx={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.2)' }}
                  />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1,
                        borderRadius: '12px',
                        minWidth: 180,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      },
                    },
                  }}
                >
                  <MenuItem component={Link} href={`/profile/${user.username}`} onClick={handleMenuClose}>
                    My Profile
                  </MenuItem>
                  <MenuItem component={Link} href="/settings" onClick={handleMenuClose}>
                    Settings
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }} sx={{ color: 'error.main' }}>
                    Sign out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="text"
                    sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/login?mode=register" style={{ textDecoration: 'none' }}>
                  <Button variant="contained" color="primary">
                    Get started
                  </Button>
                </Link>
              </>
            ))}
          </Box>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ color: 'rgba(255,255,255,0.85)' }}
          >
            <MenuIcon size={24} />
          </IconButton>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 260, backgroundColor: colors.darkBg } } }}
      >
        <Box sx={{ pt: 2 }}>
          <List>
            {navLinks.map((link) => (
              <ListItem key={link.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
                >
                  <ListItemText primary={link.label} slotProps={{ primary: { fontWeight: 500 } }} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />
            {/* Theme toggle in mobile drawer */}
            <ListItem disablePadding>
              <ListItemButton onClick={toggleTheme} sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
                <ListItemText primary={nextTheme === 'dark' ? 'Light mode' : 'Dark mode'} slotProps={{ primary: { fontWeight: 500 } }} />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />
            {!isLoading && (isAuthenticated ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    href="/notifications"
                    onClick={() => setDrawerOpen(false)}
                    sx={{ color: 'rgba(255,255,255,0.85)' }}
                  >
                    <ListItemText primary={`Notifications (${unreadCount})`} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => { handleLogout(); setDrawerOpen(false); }} sx={{ color: '#FF6B6B' }}>
                    <ListItemText primary="Sign out" />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/login" onClick={() => setDrawerOpen(false)} sx={{ color: 'rgba(255,255,255,0.85)' }}>
                    <ListItemText primary="Log in" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/login?mode=register" onClick={() => setDrawerOpen(false)} sx={{ color: '#F5603A' }}>
                    <ListItemText primary="Get started" slotProps={{ primary: { fontWeight: 700 } }} />
                  </ListItemButton>
                </ListItem>
              </>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};
