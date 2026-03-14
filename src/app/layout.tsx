import type { Metadata } from 'next';
import { Providers } from './providers';
import { AppShell } from '@/components/layout/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kintr — Track & share your goals',
  description: 'Set, track, and share personal goals with friends. Day, month, and year scopes. Built for accountability.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ margin: 0, padding: 0, fontFamily: '"Montserrat", sans-serif' }}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
