import connectDB from "@/connectDB";
import { verifyJwt } from "@/helpers/jwt";
import Wallet from "@/models/walletModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload: any = await verifyJwt(token);
    const userId = payload?.id?.toString?.() ?? payload?.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { pin } = await request.json();
    if (!/^\d{4}$/.test(String(pin ?? ""))) {
      return NextResponse.json(
        { message: "PIN must be 4 digits" },
        { status: 400 },
      );
    }

    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $set: { pin: String(pin) } },
      { new: true, upsert: true, runValidators: true },
    );

    return NextResponse.json({ message: "Wallet PIN saved", wallet });
  } catch (error: any) {
    console.error("Could not save wallet PIN:", error);
    return NextResponse.json(
      { message: "Could not save wallet PIN", error: error.message },
      { status: 500 },
    );
  }
}
