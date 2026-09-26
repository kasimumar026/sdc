import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/connectDB";
import User from "@/models/userModel";
import requireAuth from "@/middlewares/authMiddleware";
import walletModel from "@/models/walletModel";
import transactionModel from "@/models/transactionModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const userId = (auth as any).id?.toString?.() ?? (auth as any).id;
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // const user = await User.findById(userId).select("-password").lean();
    // if (!user)
    //   return NextResponse.json({ message: "Not found" }, { status: 404 });

    const userTransactions = await transactionModel
  .find({ userId })
  .sort({ createdAt: -1 }) // Use -1 for newest first, 1 for oldest
  .lean();


    return NextResponse.json({ transactions: userTransactions }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Error", error: error.message },
      { status: 500 }
    );
  }
}
