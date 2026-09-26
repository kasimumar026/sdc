import connectDB from "@/connectDB";
import { NextRequest, NextResponse } from "next/server";
import Transaction from "@/models/transactionModel";
import Wallet from "@/models/walletModel";
import crypto from "crypto";
import userModel from "@/models/userModel";

export async function POST(request: NextRequest) {
  try {

    console.log("Received PaymentPoint webhook request:", request);
    await connectDB();

    const raw = await request.text();
    const payload = JSON.parse(raw);

    // Get PaymentPoint signature header (case-insensitive)
    const paymentpointSignature =
      request.headers.get("paymentpoint-signature") ||
      request.headers.get("Paymentpoint-Signature");

    if (!paymentpointSignature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const PAYMENTPOINT_SECRET = process.env.PAYMENTPOINT_SECRET || "2966ade1df32998469c029ec9b5c3a76a445c22ff93cf1a3ae9f272581c063e82564275e0fe1d719ea6606f87eb4ac7ad5f8ca11c75ab1ec35b3c53a";
    // compute both hex and base64 representations to tolerate provider differences
    const hmacHex = crypto.createHmac("sha256", PAYMENTPOINT_SECRET).update(raw).digest("hex");
    const hmacBase64 = crypto.createHmac("sha256", PAYMENTPOINT_SECRET).update(raw).digest("base64");

    // normalize incoming header: strip common prefixes and whitespace
    const incomingSig = String(paymentpointSignature || "").trim();
    const normalizedIncoming = incomingSig.replace(/^sha256[:=]\s*/i, "");

    const matchesHex = normalizedIncoming.toLowerCase() === hmacHex.toLowerCase();
    const matchesBase64 = normalizedIncoming === hmacBase64;

    // log verification for debugging (avoid logging secret)
    console.error("PaymentPoint signature verification:", {
      incoming: normalizedIncoming,
      computedHex: hmacHex,
      computedBase64: hmacBase64,
      matchesHex,
      matchesBase64,
    });

    if (!matchesHex && !matchesBase64) {
      console.error("Invalid PaymentPoint signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Extract expected fields from payload
    const transactionId = payload?.transaction_id || payload?.data?.transaction_id;
    const amountPaid = Number(payload?.amount_paid ?? payload?.data?.amount_paid ?? 0);
    const settlementAmount = Number(payload?.settlement_amount ?? payload?.data?.settlement_amount ?? 0);
    const statusPP =
      payload?.transaction_status || payload?.status || payload?.notification_status || "";

    console.log("Received PaymentPoint webhook:", { transactionId, amountPaid, settlementAmount, statusPP });

    // Try to find existing transaction
    let tx = await Transaction.findOne({ txRef: transactionId });

    if (!tx) {
      const email = payload?.customer?.email || payload?.data?.customer?.email;
      if (email) {
        const USER = await userModel.findOne({ email });
        const wallet = USER ? await Wallet.findOne({ userId: USER._id }) : null;
        const userId = wallet?.userId || USER?._id;
        if (userId) {
          tx = new Transaction({ txRef: transactionId, userId, amount: amountPaid, status: "pending" });
          await tx.save();
        }
      }
    }

    if (!tx) {
      console.error("Transaction not found for PaymentPoint id:", transactionId);
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const normalizedStatus = String(statusPP).toLowerCase();
    const isSuccessStatus = ["success", "completed", "paid", "payment_successful"].some((s) => normalizedStatus.includes(s));

    if (tx.status !== "success" && isSuccessStatus) {
      tx.status = "success";
      tx.providerResponse = payload;
      await tx.save();

      const amount = Number(amountPaid || 0);
      const updatedWallet = await Wallet.findOneAndUpdate(
        { userId: tx.userId },
        {
          $inc: {
            balance: amount,
            ledgerBalance: amount,
          },
        },
        { new: true },
      );

      console.log("Updated Wallet (PaymentPoint):", updatedWallet);

      if (!updatedWallet) {
        console.warn("Wallet not found for user", tx.userId);
        return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
      }

      return NextResponse.json({ status: "success" });
    }

    if (tx.status === "success") return NextResponse.json({ message: "Already processed" }, { status: 200 });
    return NextResponse.json({ status: "event ignored" });
  } catch (err: any) {
    console.error("PaymentPoint webhook error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
