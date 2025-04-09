// src/app/api/auth/verify/route.js

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: "User ID and verification code are required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already verified
    if (user.verified) {
      return NextResponse.json(
        { error: "User is already verified" },
        { status: 400 }
      );
    }

    // Verify the code
    if (user.verificationCode !== code) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Update user to verified
    await db.user.update({
      where: { id: userId },
      data: {
        verified: true,
        verificationCode: null, // Clear verification code after successful verification
      },
    });

    return NextResponse.json({
      message: "Phone verified successfully. You can now log in.",
      success: true,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Error verifying code" },
      { status: 500 }
    );
  }
}
