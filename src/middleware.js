import { NextResponse } from "next/server";

export function middleware(request) {
  const userSession = request.cookies.get("user_session");

  // Protected routes including admin
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/orders") ||
    request.nextUrl.pathname.startsWith("/admin") // Added admin routes
  ) {
    if (!userSession) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Public routes when logged in
  if (
    userSession &&
    (request.nextUrl.pathname === "/auth/login" ||
      request.nextUrl.pathname === "/auth/register" ||
      request.nextUrl.pathname === "/forgot-password" ||
      request.nextUrl.pathname === "/reset-password")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/orders/:path*",
    "/admin/:path*", // Added admin routes
    "/auth/:path*",
    "/forgot-password",
    "/reset-password",
  ],
};
