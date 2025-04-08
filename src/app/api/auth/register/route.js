//  src/app/api/auth/register/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/bcrypt";

export async function POST(request) {
  try {
    const { phone, password, name } = await request.json();

    // Basic phone number validation
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { phone }, // Changed from email to phone
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Phone number already registered" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        phone,
        password: hashedPassword, // Store hashed password
        name,
      },
    });

    return NextResponse.json({
      message: "User registered successfully",
      user: { id: user.id, phone: user.phone, name: user.name },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error registering user" },
      { status: 500 }
    );
  }
}
