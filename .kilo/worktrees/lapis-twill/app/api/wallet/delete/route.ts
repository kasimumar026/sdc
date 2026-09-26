import connectDB from "@/connectDB";
import { NextRequest, NextResponse } from "next/server";
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

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const deleted = await Wallet.findOneAndDelete({ userId });
    if (!deleted) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    return NextResponse.json({ message: "Wallet deleted" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
