import { NextResponse, type NextRequest } from "next/server";

// The app authenticates with a custom session cookie (see lib/auth/session.ts),
// NOT Supabase. This edge guard only checks the cookie's PRESENCE so an
// unauthenticated visitor is bounced from the dashboard early; the page itself
// (getUser → resolveSessionUser) does the real token validation against the DB.
//
// Kept in sync by hand with SESSION_COOKIE in lib/auth/session.ts — middleware
// runs on the edge, so we avoid importing that module (it pulls in next/headers
// + the DB client, which aren't edge-friendly).
const SESSION_COOKIE = "aibm_session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  // Protect the job-board dashboard: no session cookie → send to login.
  if (!hasSession && pathname.startsWith("/job-board/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
