import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/connectDB";
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

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserIdFromRequest(request);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findById(userId).lean();
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json();

    const { password } = body;
    console.log(user, password);

    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid Password" }, { status: 401 });
    }

    const wallet = await Wallet.findOne({ userId: user._id }).lean();

    const walletPin = wallet?.pin || null;

    return NextResponse.json({ pin: walletPin }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
