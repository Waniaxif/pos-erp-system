import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("pos_admin_token")?.value;

  // Protect all routes starting with /admin
  if (!token && request.nextUrl.pathname.startsWith("/admin")) {
    // Redirect unauthenticated users to the login page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Ensure middleware only runs on specific paths
export const config = {
  matcher: ["/admin/:path*"],
};
