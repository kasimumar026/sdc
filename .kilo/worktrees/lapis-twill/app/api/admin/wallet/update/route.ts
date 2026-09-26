import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/connectDB";
import requireAuth from "@/middlewares/authMiddleware";
import Wallet from "@/models/walletModel";
import Transaction from "@/models/transactionModel";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json().catch(() => ({}));
    const { userId, amount, reason } = body as {
      userId?: string;
      amount?: number;
      reason?: string;
    };

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    if (amount === undefined || Number.isNaN(Number(amount)))
      return NextResponse.json({ error: "amount required" }, { status: 400 });

    const amt = Number(amount);

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    // Apply change
    wallet.balance = Number(wallet.balance) + amt;
    wallet.ledgerBalance = Number(wallet.ledgerBalance) + amt;
    await wallet.save();

    // Create a transaction record for audit
    const tx = await Transaction.create({
      userId,
      type: "fund",
      amount: amt,
      txRef: `ADMIN-ADJUST-${Date.now()}`,
      providerResponse: { reason: reason || "admin adjustment" },
      status: "success",
      meta: { reason },
    });

    return NextResponse.json({ wallet, tx }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
