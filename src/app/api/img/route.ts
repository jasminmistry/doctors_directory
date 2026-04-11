import { NextResponse } from 'next/server';

const ALLOWED_HOSTS = [
  'lh3.googleusercontent.com',
  'lh4.googleusercontent.com',
  'lh5.googleusercontent.com',
  'lh6.googleusercontent.com',
  'maps.googleapis.com',
  'streetviewpixels-pa.googleapis.com',
];

const DEFAULT_IMAGE_PATH = '/directory/images/default-dr-profile-1.webp';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const url = searchParams.get('url');

  const fallback = NextResponse.redirect(new URL(DEFAULT_IMAGE_PATH, origin));

  if (!url) return fallback;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return fallback;
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) return fallback;

  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    });

    if (!upstream.ok) return fallback;

    const contentType = upstream.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) return fallback;

    const buffer = await upstream.arrayBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    });
  } catch {
    return fallback;
  }
}
