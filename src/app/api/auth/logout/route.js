// file location: src/app/api/auth/logout/route.js

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  cookies().delete("user_session");
  return NextResponse.json({ message: "Logged out successfully" });
}
