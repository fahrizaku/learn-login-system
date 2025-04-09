// src/app/api/admin/make-admin/route.js

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

// Middleware to check if user is admin
async function isAdmin(request) {
  const userSession = cookies().get("user_session")?.value;

  if (!userSession) {
    return false;
  }

  const user = await db.user.findUnique({
    where: { id: userSession },
  });

  return user?.role === "admin";
}

export async function POST(request) {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin(request);
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId } = await request.json();

    // Update user role to admin
    await db.user.update({
      where: { id: userId },
      data: {
        role: "admin",
      },
    });

    return NextResponse.json({
      message: "User promoted to admin successfully",
    });
  } catch (error) {
    console.error("Error making admin:", error);
    return NextResponse.json({ error: "Error making admin" }, { status: 500 });
  }
}
