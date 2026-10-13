import connectDB from "@/connectDB";
import { signJwt } from "@/helpers/jwt";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { password, name, email, phone } = body;
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedPhone = typeof phone === "string" ? phone.trim() : "";

    if (!password || !normalizedName || !normalizedEmail || !normalizedPhone) {
      return NextResponse.json(
        { message: "Name, email, phone, and password are required" },
        { status: 400 },
      );
    }

    const [emailExists, phoneExists] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      User.findOne({ phone: normalizedPhone }),
    ]);

    if (emailExists) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 },
      );
    }
    if (phoneExists) {
      return NextResponse.json(
        { message: "Phone already exists" },
        { status: 409 },
      );
    }

    const user = await User.create({
      name: normalizedName.toLowerCase(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
    });

    const token = await signJwt({ id: user.id, role: user.role });
    return NextResponse.json(
      {
        message: "Created Successfully ✅",
        data: { user },
        token,
      },
      {
        status: 201,
        headers: {
          "Set-Cookie": `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${60 * 60 * 7}`,
        },
      },
    );
  } catch (error: any) {
    console.error("Error while registering user:", error);
    return NextResponse.json(
      { message: "Could not complete registration", error: error.message },
      { status: 500 },
    );
  }
}
