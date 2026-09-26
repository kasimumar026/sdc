import connectDB from "@/connectDB";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import Wallet from "@/models/walletModel";
import { verifyJwt } from "@/helpers/jwt";

async function getUserIdFromRequest(request: NextRequest) {
  const cookie = request.headers.get("cookie") || "";
  const tokenMatch = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="));
  if (!tokenMatch) return null;
  const token = tokenMatch.split("=")[1];
  const payload: any = await verifyJwt(token);
  return payload?.id || null;
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, newpassword, password } = body;

    const user = await User.findById(id);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isMatch =  user.password === password;
    if (!isMatch)
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 400 },
      );
    //   ccccccccc
    const updated = await User.findByIdAndUpdate(
      id,
      { password: newpassword },
      { new: true },
    ).select("-password -__v");

    return NextResponse.json({ message: "Updated", user: updated });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
