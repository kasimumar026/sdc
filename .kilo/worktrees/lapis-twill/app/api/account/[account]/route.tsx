import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/connectDB";
import UserModel from "@/models/userModel";
import Wallet from "@/models/walletModel";
import transactionModel from "@/models/transactionModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { message: "user ID is required" },
        { status: 400 },
      );
    }

    const user = await UserModel.findById(id).select("-password").lean();
    const wallet = await Wallet.findOne({ userId: user._id }).lean();
    // get latest 5 transactions for this user
    const transactions = await transactionModel
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    if (!user) {
      return NextResponse.json({ message: "user not found" }, { status: 404 });
    }

    return NextResponse.json({ user, wallet, transactions });
  } catch (error: any) {
    console.error("Error while fetching user:", error);
    return NextResponse.json(
      { message: "Error", error: error.message },
      { status: 500 },
    );
  }
}
