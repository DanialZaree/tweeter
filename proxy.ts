import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/app/auth';

const protectedRoutes = ['/profile'];

export default async function middleware(request: NextRequest) {
  const session = await auth();

  const { pathname } = request.nextUrl;

  if (pathname === '/auth' && request.nextUrl.searchParams.has('callbackUrl')) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}
