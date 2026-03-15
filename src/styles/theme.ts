import { ThemeOptions } from '@mui/material/styles';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';

export const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: '#CC4420',
      light: '#F5603A',
      dark: '#A83515',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#2B5EC4',
      light: '#3B72EE',
      dark: '#1A4599',
      contrastText: '#FFFFFF',
    },
    success: { main: '#4CAF50', light: '#81C784', dark: '#388E3C' },
    warning: { main: '#F5C332', light: '#FFD966', dark: '#C49A00' },
    error: { main: '#EF5350' },
    background: {
      default: mode === 'dark' ? '#0F0F1A' : '#FFFFFF',
      paper: mode === 'dark' ? '#1A1A2C' : '#FFFFFF',
    },
    text: {
      primary: mode === 'dark' ? '#F0F0FF' : '#2D2D3A',
      secondary: mode === 'dark' ? '#9090AA' : '#6B6B80',
    },
    divider: mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#E8E8F0',
  },
  typography: {
    fontFamily: '"Montserrat", "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: '56px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' },
    h2: { fontSize: '40px', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' },
    h3: { fontSize: '28px', fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: '22px', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '18px', fontWeight: 600 },
    h6: { fontSize: '16px', fontWeight: 600 },
    body1: { fontSize: '16px', fontWeight: 400, lineHeight: 1.6 },
    body2: { fontSize: '14px', fontWeight: 400, lineHeight: 1.5 },
    button: { fontSize: '15px', fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
    caption: { fontSize: '12px', fontWeight: 500 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          padding: '10px 28px',
          fontSize: '15px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        sizeLarge: { padding: '14px 36px', fontSize: '16px' },
        sizeSmall: { padding: '6px 18px', fontSize: '13px' },
        contained: { '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.15)' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.08)',
          borderRadius: '16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: '50px', fontWeight: 600, fontSize: '12px' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: '12px' },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, fontSize: '15px' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Custom color constants (not in MUI palette — for hardcoded dark surfaces etc.)
export const colors = {
  darkBg: '#1A1A2C',
  cream: '#FAF4EC',
  accentYellow: '#F5C332',
  accentBlue: '#4A9EF0',
  cardBg: '#F7F7FB',
  border: '#E8E8F0',
  overlay: 'rgba(26,26,44,0.7)',
};
