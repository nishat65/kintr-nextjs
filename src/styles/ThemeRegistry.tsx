'use client';

import { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from 'next-themes';
import { getDesignTokens } from './theme';

export const ThemeRegistry = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const theme = useMemo(
    () => createTheme(getDesignTokens(resolvedTheme === 'dark' ? 'dark' : 'light')),
    [resolvedTheme]
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
};
