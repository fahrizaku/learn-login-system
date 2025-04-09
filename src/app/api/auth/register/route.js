// src/app/api/auth/register/route.js

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/bcrypt";
import { generateVerificationCode } from "@/lib/verification";

export async function POST(request) {
  try {
    const { phone, password, name } = await request.json();

    // Basic phone validation
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      if (!existingUser.verified) {
        // Generate a new verification code for existing unverified user
        const verificationCode = generateVerificationCode();

        await db.user.update({
          where: { id: existingUser.id },
          data: { verificationCode },
        });

        return NextResponse.json({
          message:
            "Please enter the verification code that will be sent to your WhatsApp.",
          userId: existingUser.id,
          needVerification: true,
        });
      }

      return NextResponse.json(
        { error: "Phone number already registered" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Create new unverified user with verification code
    const user = await db.user.create({
      data: {
        phone,
        password: hashedPassword,
        name,
        verificationCode,
        verified: false,
      },
    });

    // In production, here you would send the code to the admin
    // This would be through a notification system, database alert, etc.
    console.log(
      `New user registration: ${phone} with code: ${verificationCode}`
    );

    return NextResponse.json({
      message:
        "Please enter the verification code that will be sent to your WhatsApp.",
      userId: user.id,
      needVerification: true,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Error registering user" },
      { status: 500 }
    );
  }
}
