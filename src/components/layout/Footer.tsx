import { Box, Container, Grid, Typography, Divider, IconButton } from '@mui/material';
import { Target, Twitter, Github, Instagram } from 'lucide-react';
import Link from 'next/link';
import { colors } from '@/styles/theme';

const footerLinks = {
  Product: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Explore Goals', href: '/explore' },
    { label: 'Connections', href: '/connections' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Use', href: '#' },
  ],
  Account: [
    { label: 'Sign Up', href: '/login?mode=register' },
    { label: 'Log In', href: '/login' },
    { label: 'Settings', href: '/settings' },
  ],
};

export const Footer = () => {
  return (
    <Box component="footer" sx={{ backgroundColor: colors.darkBg, color: 'rgba(255,255,255,0.8)', pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Brand */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
              <Typography
                sx={{ color: '#fff', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}
              >
                kintr
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 280 }}>
              Set meaningful goals, track your progress, and celebrate wins with people who care.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
              {[Twitter, Github, Instagram].map((Icon, i) => (
                <IconButton
                  key={i}
                  size="small"
                  sx={{
                    color: 'rgba(255,255,255,0.4)',
                    '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  <Icon size={18} />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <Grid key={category} size={{ xs: 6, md: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.35)',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  display: 'block',
                  mb: 2,
                }}
              >
                {category}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {links.map((link) => (
                  <Link key={link.label} href={link.href} style={{ textDecoration: 'none' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.6)',
                        '&:hover': { color: '#fff' },
                        transition: 'color 0.15s',
                        cursor: 'pointer',
                      }}
                    >
                      {link.label}
                    </Typography>
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mt: 6, mb: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
            © 2026 Kintr. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
            Built for goal setters everywhere 🎯
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
