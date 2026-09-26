import connectDB from "@/connectDB";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { signJwt } from "@/helpers/jwt";

import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { password, name, email, phone } = body;

    const emailExist = await User.findOne({ email });

    if (emailExist) {
      return NextResponse.json(
        { message: "Email already exists", emailExist },
        { status: 500 },
      );
    }

    const phoneExist = await User.findOne({ phone });

    if (phoneExist) {
      return NextResponse.json(
        { message: "phone already exists" },
        { status: 500 },
      );
    }

    const newUser = {
      name: name.toLowerCase().trim(),
      email,
      phone,
      password,
    };

    const user = await User.create(newUser);

    
    

    const token = await signJwt({ id: user.id, role: user.role });

    const response = NextResponse.json(
      {
        message: "Created Successfully ✅",
        data: { user },
        token,
      },
      {
        status: 201,
        headers: {
          "Set-Cookie": `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
            60 * 60 * 7
          }`,
        },
      },
    );
    return response;
  } catch (error: any) {
    console.error("Error while creating document:", error);
    return NextResponse.json(
      { message: "Error", error: error.message },
      { status: 500 },
    );
  }
}
