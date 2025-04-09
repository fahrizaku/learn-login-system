// src/app/api/admin/pending-verifications/route.js

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

export async function GET(request) {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin(request);
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all unverified users
    const pendingUsers = await db.user.findMany({
      where: {
        verified: false,
        verificationCode: {
          not: null,
        },
      },
      select: {
        id: true,
        phone: true,
        name: true,
        verificationCode: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      pendingUsers,
    });
  } catch (error) {
    console.error("Error fetching pending verifications:", error);
    return NextResponse.json(
      { error: "Error fetching pending verifications" },
      { status: 500 }
    );
  }
}
