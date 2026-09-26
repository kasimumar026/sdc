import connectDB from "@/connectDB";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import Wallet from "@/models/walletModel";
import { verifyJwt } from "@/helpers/jwt";

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, newpin, pin } = body;

    const wallet = await Wallet.findOne({ userId: id });
    if (!wallet)
      return NextResponse.json({ error: "wallet not found" }, { status: 404 });

    const isMatch = wallet.pin === pin;
    if (!isMatch)
      return NextResponse.json({ error: "Incorrect pin" }, { status: 400 });

    const updated = await Wallet.findByIdAndUpdate(
      wallet._id,
      { pin: newpin },
      { new: true },
    ).select("-pin -__v");

    return NextResponse.json({ message: "Updated", user: updated });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
