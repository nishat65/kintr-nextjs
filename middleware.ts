import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { rateLimit } from '@/lib/utils/rateLimit';

// Rate limit configs per route pattern
const RATE_LIMITS = {
  auth: { maxRequests: 10, windowMs: 15 * 60 * 1000 },     // 10 per 15 min
  api: { maxRequests: 100, windowMs: 60 * 1000 },           // 100 per min
  general: { maxRequests: 200, windowMs: 60 * 1000 },       // 200 per min
} as const;

const getClientIp = (request: NextRequest): string => {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  // Apply stricter rate limiting to auth routes
  if (pathname === '/login' || pathname === '/register') {
    // Only rate limit POST-like requests (form submissions via navigation)
    const result = rateLimit(`auth:${ip}`, RATE_LIMITS.auth);
    if (!result.allowed) {
      return new NextResponse('Too many requests. Please try again later.', {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(RATE_LIMITS.auth.maxRequests),
          'X-RateLimit-Remaining': '0',
        },
      });
    }
  }

  // General rate limiting for all other routes
  const generalResult = rateLimit(`general:${ip}`, RATE_LIMITS.general);
  if (!generalResult.allowed) {
    return new NextResponse('Too many requests. Please try again later.', {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((generalResult.resetAt - Date.now()) / 1000)),
      },
    });
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and Next.js internals
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
