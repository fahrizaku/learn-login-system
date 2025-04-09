// src/app/api/admin/verify-user/route.js

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

    const { phone, code } = await request.json();

    // Find user by phone and verification code
    const user = await db.user.findFirst({
      where: {
        phone,
        verificationCode: code,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid verification information" },
        { status: 400 }
      );
    }

    // Update user to verified
    await db.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        verificationCode: null, // Clear verification code after successful verification
      },
    });

    return NextResponse.json({
      message: "User verified successfully",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Error verifying user" },
      { status: 500 }
    );
  }
}
