import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/features/auth/session-cookie";

const PUBLIC_PATHS = ["/login", "/design-system"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * Cheap gate: only checks whether the session cookie is present, so this never makes a
 * network call to locka-api. Full validity (expired/revoked tokens) is enforced by
 * `getSession()` in the protected layout, which does call locka-api.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const isPublic = isPublicPath(pathname);

  if (!hasSession && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Every route under /api/* has its own auth guard (see features/auth/guard.ts) that
  // returns a proper JSON 401/403. Redirecting API calls to an HTML /login page here would
  // break fetch()-based error handling in every client component that calls these routes.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
