import { headers } from "next/headers";
import { auth } from "./modules/auth/lib/auth";
import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  // Fast path: no session cookie at all — redirect without hitting the
  // database. Forged cookies still fail the full validation below.
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
