'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ServiceWorkerRegistrar } from './ServiceWorkerRegistrar';
import { Box, CircularProgress } from '@mui/material';

const PUBLIC_ROUTES = ['/', '/login', '/register'];
// Semi-public: accessible without login, but show sidebar when authenticated
const SEMI_PUBLIC_ROUTES = ['/explore', '/connections', '/chat'];
const SIDEBAR_WIDTH = 240;

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const isSemiPublic = SEMI_PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isProtected = !isPublic && !isSemiPublic;

  // Client-side redirect guard: if auth resolved and user is not authenticated
  // on a protected route, redirect to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated && isProtected) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, isProtected, router]);

  // Redirect authenticated users away from login/register to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // While session is resolving, show a spinner to prevent content flash.
  // Landing page (/) renders immediately; other routes wait for auth.
  if (isLoading && pathname !== '/') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If authenticated and on a public auth route (login/register), redirect immediately
  if (!isLoading && isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || isPublic) {
    return (
      <>
        <ServiceWorkerRegistrar />
        <Navbar />
        <main>{children}</main>
        {isPublic && pathname === '/' && <Footer />}
      </>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <ServiceWorkerRegistrar />

      {/* Sidebar — desktop only */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Sidebar />
      </Box>

      {/* Main content area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Topbar in sidebar mode — hides nav links */}
        <Navbar sidebarMode />

        <Box
          component="main"
          sx={{
            flex: 1,
            pt: '68px',
            pb: { xs: '64px', md: 0 },
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </Box>
  );
};
