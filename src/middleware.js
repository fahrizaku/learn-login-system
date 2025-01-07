import { NextResponse } from "next/server";

export function middleware(request) {
  const userSession = request.cookies.get("user_session");

  // Protected routes
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/profile") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/orders")
  ) {
    if (!userSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Public routes when logged in
  if (
    userSession &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register" ||
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
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
