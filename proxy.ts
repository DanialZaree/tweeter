import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/app/auth';

const protectedRoutes = ['/profile'];

// In-memory sliding window rate limiter for HTTP endpoints
type RateLimitRecord = { count: number; resetTime: number };
const httpRateLimits = new Map<string, RateLimitRecord>();

function checkHttpRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const record = httpRateLimits.get(key);

  if (httpRateLimits.size > 1000) {
    for (const [k, v] of httpRateLimits.entries()) {
      if (now > v.resetTime) {
        httpRateLimits.delete(k);
      }
    }
  }

  if (!record || now > record.resetTime) {
    httpRateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter: Math.max(1, retryAfter) };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, retryAfter: 0 };
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  // 1. Block sensitive file probes and dotfiles (Finding #1-4, #37-39, #41-44)
  const isDotFile = pathname.startsWith('/.');
  const isSensitiveProbe =
    pathname === '/phpinfo.php' ||
    pathname === '/actuator' ||
    pathname.startsWith('/actuator/') ||
    pathname === '/graphiql' ||
    pathname.startsWith('/graphiql/') ||
    pathname === '/swagger-ui.html' ||
    pathname === '/swagger-ui' ||
    pathname.startsWith('/swagger-ui/') ||
    pathname === '/openapi.json' ||
    /\.(php|asp|aspx|jsp|env|bak|config|sql|yaml|yml|ini|log|sh)$/i.test(pathname);

  if (isDotFile || isSensitiveProbe) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

  // 2. Enforce HTTP methods on non-API routes (Finding #31-36)
  if (!pathname.startsWith('/api')) {
    const allowedMethods = ['GET', 'HEAD', 'POST', 'OPTIONS'];
    if (!allowedMethods.includes(request.method)) {
      return new NextResponse('Method Not Allowed', {
        status: 405,
        headers: {
          Allow: 'GET, HEAD, POST, OPTIONS',
          'Content-Type': 'text/plain',
        },
      });
    }
  }

  // 3. Rate limiting on sensitive auth endpoints (Finding #45, #46)
  if (pathname === '/auth') {
    // Max 10 requests per minute to /auth
    const rateCheck = checkHttpRateLimit(`auth:${ip}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return new NextResponse('Too Many Requests. Please wait before trying again.', {
        status: 429,
        headers: {
          'Retry-After': rateCheck.retryAfter.toString(),
          'Content-Type': 'text/plain',
        },
      });
    }
  }

  if (pathname.startsWith('/api/auth/')) {
    // Max 10 requests per minute to /api/auth/*
    const rateCheck = checkHttpRateLimit(`api_auth:${ip}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too Many Requests', retryAfter: rateCheck.retryAfter },
        {
          status: 429,
          headers: {
            'Retry-After': rateCheck.retryAfter.toString(),
          },
        },
      );
    }
  }

  // 4. Sanitize query string & prevent reflected credentials / XSS on /auth (Finding #5-8)
  if (pathname === '/auth') {
    const searchParams = request.nextUrl.searchParams;
    const sensitiveParams = ['userName', 'email', 'password', 'confirmPassword'];
    const hasSensitiveParam = sensitiveParams.some((p) => searchParams.has(p));
    const rawSearch = request.nextUrl.search;
    const hasDangerousChars = /[<>"'();]/.test(rawSearch);

    if (hasSensitiveParam || hasDangerousChars || searchParams.has('callbackUrl')) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  // 5. Protected routes enforcement
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtected) {
    const session = await auth();
    if (!session) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icons/|images/|manifest.webmanifest|favicon.ico).*)'],
};
