// src/app/api/auth/login/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { comparePassword } from "@/lib/bcrypt";

export async function POST(request) {
  try {
    const { phone, password } = await request.json();

    const user = await db.user.findUnique({
      where: { phone }, // Changed from email to phone
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Use bcrypt to compare passwords
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Set session cookie
    cookies().set("user_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({
      message: "Logged in successfully",
      user: { id: user.id, phone: user.phone, name: user.name },
    });
  } catch (error) {
    return NextResponse.json({ error: "Error logging in" }, { status: 500 });
  }
}
