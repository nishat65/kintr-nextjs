import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { rateLimit } from '@/lib/utils/rateLimit';

// Rate limit configs — tuned for serverless (shared instance)
const RATE_LIMITS = {
  auth: { maxRequests: 20, windowMs: 5 * 60 * 1000 },       // 20 attempts per 5 min
  general: { maxRequests: 500, windowMs: 60 * 1000 },        // 500 per min
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

  // Only rate-limit auth form submissions (POST), not page loads
  if (
    (pathname === '/login' || pathname === '/register') &&
    request.method === 'POST'
  ) {
    const result = rateLimit(`auth:${ip}`, RATE_LIMITS.auth);
    if (!result.allowed) {
      return new NextResponse('Too many login attempts. Please try again later.', {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        },
      });
    }
  }

  // General rate limiting
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
