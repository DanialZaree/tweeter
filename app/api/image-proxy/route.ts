import { NextRequest, NextResponse } from 'next/server';

const ALLOWED = ['res.cloudinary.com'];
const err = (msg: string, status: number) => NextResponse.json({ error: msg }, { status });

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url');
  if (!raw) return err('Missing url', 400);

  let url: URL;
  try { url = new URL(raw); } catch { return err('Invalid url', 400); }

  if (!ALLOWED.some((h) => url.hostname.endsWith(h))) return err('Blocked', 403);

  const res = await fetch(url.href, { signal: AbortSignal.timeout(5000) }).catch(() => null);
  if (!res?.ok) return err('Upstream error', 502);

  const type = res.headers.get('content-type') || '';
  if (!type.startsWith('image/')) return err('Not an image', 400);

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=86400, immutable' },
  });
}
