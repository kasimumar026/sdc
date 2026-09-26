import connectDB from "@/connectDB";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import Wallet from "@/models/walletModel";
import { verifyJwt } from "@/helpers/jwt";

async function getUserIdFromRequest(request: NextRequest) {
  const cookie = request.headers.get("cookie") || "";
  const tokenMatch = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("token="));
  if (!tokenMatch) return null;
  const token = tokenMatch.split("=")[1];
  const payload: any = await verifyJwt(token);
  return payload?.id || null;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findById(userId).select("-password -__v").lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const wallet = await Wallet.findOne({ userId: user._id }).lean();

    return NextResponse.json({ user, wallet });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, phone, password } = body;

    const update: any = {};
    if (name) update.name = name;
    if (phone) update.phone = phone;
    if (password) update.password = password;

    const updated = await User.findByIdAndUpdate(userId, update, { new: true }).select("-password -__v");

    const wallet = await Wallet.findOne({ userId });

    return NextResponse.json({ message: "Updated", user: updated, wallet });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
