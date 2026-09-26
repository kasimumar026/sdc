import connectDB from "@/connectDB";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { signJwt } from "@/helpers/jwt";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const { phone, password } = body;

    let existingUser = await User.findOne({ phone });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Invalid Credentials" },
        { status: 400 }
      );
    }

    if (existingUser.password !== password) {
      return NextResponse.json({ error: "Invalid Password" }, { status: 401 });
    }

    const token = await signJwt({ id: existingUser.id, role: existingUser.role });
    console.log(token);
    const response = NextResponse.json(
      {
        message: "Successfully Logged In",
        user: existingUser,
        token,
      },
      {
        status: 201,
        headers: {
          "Set-Cookie": `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
            60 * 60 * 7
          }`,
        },
      }
    );

    return response;

  } catch (error: any) {
    console.error("Error while creating document:", error);
    return NextResponse.json(
      { message: "Error", error: error.message },
      { status: 500 }
    );
  }
}
