import { NextRequest, NextResponse } from 'next/server';

// Single, clean proxy file. Logs requests and upstream responses.

export function buildTargetUrl(path: string[]) {
  const pathStr = path.join('/');
  return path[0] === 'sanctum'
    ? `http://localhost:8000/${pathStr}`
    : `http://localhost:8000/api/${pathStr}`;
}

export function extractReqInfo(request: NextRequest) {
  return {
    method: request.method,
    origin: request.headers.get('origin') || null,
    authorization: request.headers.get('authorization') || null,
    cookie: request.headers.get('cookie') || null,
    url: request.url,
  };
}

export async function copyResponseHeaders(response: Response, origin: string | null) {
  const out: Record<string, string> = {};
  try {
    for (const [k, v] of response.headers) out[k.toLowerCase()] = v;
  } catch {
    const sc = response.headers.get('set-cookie');
    if (sc) out['set-cookie'] = sc;
    const ct = response.headers.get('content-type');
    if (ct) out['content-type'] = ct;
  }
  out['access-control-allow-origin'] = origin || 'http://localhost:3000';
  out['access-control-allow-credentials'] = 'true';
  out['access-control-allow-headers'] = 'Authorization, X-XSRF-TOKEN, Content-Type, Accept';
  return out;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const url = buildTargetUrl(path);
  const reqInfo = extractReqInfo(request);

  console.log('[proxy] GET incoming', { reqInfo, proxiedTo: url });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Authorization: reqInfo.authorization || '',
        Cookie: reqInfo.cookie || '',
        Origin: reqInfo.origin || 'http://localhost:3000',
      },
    });

    const bodyText = await response.text();
    const upstreamHeaders = await copyResponseHeaders(response, reqInfo.origin);

    console.log('[proxy] upstream response', { url, status: response.status, headers: upstreamHeaders });

    return new NextResponse(response.status === 204 ? null : bodyText, {
      status: response.status,
      headers: upstreamHeaders,
    });
  } catch (err: unknown) {
    console.error('[proxy] GET error', { url, error: err instanceof Error ? err.stack : String(err) });
    return new NextResponse(JSON.stringify({ error: 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const url = buildTargetUrl(path);
  const reqInfo = extractReqInfo(request);

  console.log('[proxy] POST incoming', { reqInfo, proxiedTo: url });

  try {
    const body = await request.text();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Authorization: reqInfo.authorization || '',
        Cookie: reqInfo.cookie || '',
        'Content-Type': 'application/json',
        Origin: reqInfo.origin || 'http://localhost:3000',
      },
      body,
    });

    const bodyText = await response.text();
    const upstreamHeaders = await copyResponseHeaders(response, reqInfo.origin);

    console.log('[proxy] upstream response', { url, status: response.status, headers: upstreamHeaders });

    return new NextResponse(response.status === 204 ? null : bodyText, {
      status: response.status,
      headers: upstreamHeaders,
    });
  } catch (err: unknown) {
    console.error('[proxy] POST error', { url, error: err instanceof Error ? err.stack : String(err) });
    return new NextResponse(JSON.stringify({ error: 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const url = buildTargetUrl(path);
  const reqInfo = extractReqInfo(request);

  console.log('[proxy] PUT incoming', { reqInfo, proxiedTo: url });

  try {
    const body = await request.text();

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Authorization: reqInfo.authorization || '',
        Cookie: reqInfo.cookie || '',
        'Content-Type': 'application/json',
        Origin: reqInfo.origin || 'http://localhost:3000',
      },
      body,
    });

    const bodyText = await response.text();
    const upstreamHeaders = await copyResponseHeaders(response, reqInfo.origin);

    console.log('[proxy] upstream response', { url, status: response.status, headers: upstreamHeaders });

    return new NextResponse(response.status === 204 ? null : bodyText, {
      status: response.status,
      headers: upstreamHeaders,
    });
  } catch (err: unknown) {
    console.error('[proxy] PUT error', { url, error: err instanceof Error ? err.stack : String(err) });
    return new NextResponse(JSON.stringify({ error: 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const url = buildTargetUrl(path);
  const reqInfo = extractReqInfo(request);

  console.log('[proxy] DELETE incoming', { reqInfo, proxiedTo: url });

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Authorization: reqInfo.authorization || '',
        Cookie: reqInfo.cookie || '',
        Origin: reqInfo.origin || 'http://localhost:3000',
      },
    });

    const bodyText = await response.text();
    const upstreamHeaders = await copyResponseHeaders(response, reqInfo.origin);

    console.log('[proxy] upstream response', { url, status: response.status, headers: upstreamHeaders });

    return new NextResponse(response.status === 204 ? null : bodyText, {
      status: response.status,
      headers: upstreamHeaders,
    });
  } catch (err: unknown) {
    console.error('[proxy] DELETE error', { url, error: err instanceof Error ? err.stack : String(err) });
    return new NextResponse(JSON.stringify({ error: 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || 'http://localhost:3000';
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, X-XSRF-TOKEN, Content-Type, Accept',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}