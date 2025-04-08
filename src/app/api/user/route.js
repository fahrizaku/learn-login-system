//  src/app/api/user/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const userSession = cookies().get("user_session")?.value;

    if (!userSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userSession },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't send password in response
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
  }
}
