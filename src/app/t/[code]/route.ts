// app/t/[code]/route.ts
// Next.js 15 (params is a Promise).
import { NextRequest, NextResponse } from 'next/server';
import { resolveScan } from '@/lib/resolveTag';

export const dynamic = 'force-dynamic'; // never cache this physical scan route

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const cleanCode = (code || '').replace(/[|%#?&\s/]+$/g, '').trim();
  const source = req.nextUrl.searchParams.get('s') === 'nfc' ? 'nfc' : 'qr';
  const result = await resolveScan(cleanCode, source, { logPage: true });

  // 302 + no-store: a 301 would be permanently cached by phones/browsers and break physical tag reassignment
  const init = {
    status: 302,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
    },
  };

  if (result.kind === 'redirect') {
    return NextResponse.redirect(result.url, init);
  }
  if (result.kind === 'page') {
    const basePath = result.target === 'review' ? `/r/${result.slug}/review` : `/r/${result.slug}`;
    const url = new URL(basePath, req.url);
    url.searchParams.set('via', cleanCode.toLowerCase()); // /r page must NOT double-log when `via` is present
    url.searchParams.set('s', source);
    return NextResponse.redirect(url, init);
  }

  if (result.kind === 'unavailable') {
    // Admin shortcut: in /t/[code], if tag is unassigned and super admin session exists, redirect to /admin/tags?assign={code}
    if (result.unassigned) {
      const isSuperAdmin =
        req.cookies.get('zentap_admin')?.value === 'true' ||
        req.cookies.get('admin_token')?.value ||
        req.cookies.get('sb-access-token')?.value;

      if (isSuperAdmin) {
        return NextResponse.redirect(new URL(`/admin/tags?assign=${code.toLowerCase()}`, req.url), init);
      }
    }
    return NextResponse.redirect(new URL('/unavailable', req.url), init);
  }

  return NextResponse.redirect(new URL('/unavailable', req.url), init);
}
