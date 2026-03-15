'use client';

import { useEffect, useMemo } from 'react';
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

  // Force body color/bg to stay in sync with the MUI theme.
  // Emotion can cache stale CssBaseline global styles across theme switches,
  // so we apply these directly to guarantee correct text contrast.
  useEffect(() => {
    document.body.style.color = theme.palette.text.primary;
    document.body.style.backgroundColor = theme.palette.background.default;
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline key={resolvedTheme} enableColorScheme />
      {children}
    </ThemeProvider>
  );
};
