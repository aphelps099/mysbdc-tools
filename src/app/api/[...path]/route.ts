/**
 * Catch-all API proxy — forwards /api/* requests to the backend at RUNTIME.
 *
 * Why not use next.config.js rewrites?
 *   rewrites() is evaluated at `next build` time and the destination URL is
 *   baked into .next/routes-manifest.json.  If BACKEND_URL isn't set during
 *   the build (or changes after), the proxy silently points at localhost:8000.
 *
 *   This route handler reads process.env.BACKEND_URL on every request,
 *   so it works correctly regardless of when the env var is set.
 */

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function backendUrl(): string {
  return (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');
}

function forwardHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  const auth = req.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;
  const ct = req.headers.get('content-type');
  if (ct) headers['Content-Type'] = ct;
  // Forward client IP for analytics geo-lookup
  const fwd = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  if (fwd) headers['X-Forwarded-For'] = fwd;
  return headers;
}

async function proxy(req: NextRequest, pathSegments: string[]): Promise<Response> {
  const target = `${backendUrl()}/api/${pathSegments.join('/')}${req.nextUrl.search}`;

  // Read body for non-GET/HEAD requests; only forward if non-empty.
  // IMPORTANT: use arrayBuffer() — NOT text() — to preserve binary data
  // (e.g. multipart/form-data audio uploads for transcription).
  let body: ArrayBuffer | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      const buf = await req.arrayBuffer();
      if (buf.byteLength > 0) body = buf;
    } catch {
      // No body — that's fine
    }
  }

  let res: globalThis.Response;
  try {
    res = await fetch(target, {
      method: req.method,
      headers: forwardHeaders(req),
      body,
      cache: 'no-store',
      // @ts-expect-error — Next.js extends RequestInit; duplex needed for streaming body
      duplex: 'half',
    });
  } catch (err) {
    // Log a concise one-liner instead of full stack traces to avoid log spam
    const reason = err instanceof Error ? err.message : String(err);
    const apiPath = pathSegments.join('/');
    console.warn(`[proxy] ${req.method} /api/${apiPath} → backend unreachable (${reason})`);
    return Response.json(
      { detail: `Cannot reach backend. BACKEND_URL=${backendUrl()}` },
      { status: 502 },
    );
  }

  const contentType = res.headers.get('content-type') || 'application/json';
  const responseHeaders: Record<string, string> = { 'Content-Type': contentType };

  if (contentType.includes('text/event-stream')) {
    responseHeaders['Cache-Control'] = 'no-cache';
    responseHeaders['Connection'] = 'keep-alive';
    responseHeaders['X-Accel-Buffering'] = 'no';
  }

  return new Response(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxy(req, path);
}
