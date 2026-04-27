import { NextResponse, type NextRequest } from "next/server";

const CSRF_COOKIE = "__Host-portal_csrf";

function randomToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Buffer.from(arr)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Two jobs:
 *  1. If the request's Host is `portal.<root>`, rewrite the URL so the rest of
 *     Next.js sees `/portal/<path>`. Marketing site stays at the root domain.
 *  2. Inject security headers on every response.
 */

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

const PORTAL_CSP = [
  "default-src 'self'",
  "img-src 'self' data: blob:",
  "style-src 'self' 'unsafe-inline'",
  // Next.js bundles need 'unsafe-inline' for inline runtime; we accept it on
  // the portal because there's no untrusted user HTML rendered.
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

function isPortalHost(host: string | null): boolean {
  if (!host) return false;
  const h = host.split(":")[0].toLowerCase();
  return h === "portal.asmc.com.sa" || h.startsWith("portal.localhost");
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host");
  const url = req.nextUrl;
  let res: NextResponse;

  if (isPortalHost(host) && !url.pathname.startsWith("/portal")) {
    const rewritten = url.clone();
    rewritten.pathname = `/portal${url.pathname === "/" ? "" : url.pathname}`;
    res = NextResponse.rewrite(rewritten);
  } else {
    res = NextResponse.next();
  }

  // Mint a CSRF cookie on first portal request. Server components can read it
  // (via cookies()), forms embed it as a hidden field, and server actions
  // double-submit-verify it. Cookie can't be set from a server component, so
  // we do it here in middleware.
  const onPortal = url.pathname.startsWith("/portal") || isPortalHost(host);
  if (onPortal && !req.cookies.get(CSRF_COOKIE)) {
    res.cookies.set(CSRF_COOKIE, randomToken(32), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(k, v);
  }

  // HSTS: only meaningful in prod over HTTPS.
  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  // CSP: stricter for portal pages, looser for marketing (which uses inline
  // SVG, dynamic OG image, etc.).
  if (
    url.pathname.startsWith("/portal") ||
    isPortalHost(host)
  ) {
    res.headers.set("Content-Security-Policy", PORTAL_CSP);
  }

  return res;
}

export const config = {
  matcher: [
    // Skip static assets so we don't waste CPU adding headers we'll override.
    "/((?!_next/static|_next/image|favicon.ico|opengraph-image|icon|robots.txt|sitemap.xml).*)",
  ],
};
