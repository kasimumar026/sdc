import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/connectDB";
import requireAuth from "@/middlewares/authMiddleware";
import User from "@/models/userModel";
import walletModel from "@/models/walletModel";
import transactionModel from "@/models/transactionModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // check if user is admin
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    if (auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // not admin users
    const users = await User.find({ role: { $ne: "admin" } }).lean();

    const transactions = await transactionModel
      .find()
      .populate("userId")
      .sort({ _id: -1 })
      .limit(260)
      .lean();

    // total users
    const totalUsers = await User.countDocuments();
    const totalTransactions = await transactionModel.countDocuments();
// hi
    let hmz : any = 0;
    // sum of all wallets' balances using aggregation for accuracy/efficiency
    const agg = await walletModel.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]);

    const walletsTotal =
      agg && agg.length > 0 && agg[0].total ? agg[0].total : 0;

    return NextResponse.json(
      { totalUsers, walletsTotal, users, transactions, totalTransactions },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Admin GET error:", error);
    return NextResponse.json(
      { message: "Error", error: error.message },
      { status: 500 },
    );
  }
}
