'use client';

import { Box, Typography, Button } from '@mui/material';
import { WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        px: 3,
      }}
    >
      <WifiOff size={48} />
      <Typography variant="h4" fontWeight={800} sx={{ mt: 3, mb: 1 }}>
        You&apos;re offline
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
        Check your internet connection and try again.
      </Typography>
      <Button component={Link} href="/dashboard" variant="contained">
        Try again
      </Button>
    </Box>
  );
}
