import connectDB from "@/connectDB";
import Transaction from "@/models/transactionModel";
import Wallet from "@/models/walletModel";
import { createHmac, timingSafeEqual } from "node:crypto";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ACKNOWLEDGEMENT = { status: true, message: "successful" };

function verifyBillstackSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
  secret: string,
) {
  if (!timestamp || !/^\d+$/.test(timestamp) || !signature) return false;

  const eventTime = Number(timestamp);
  if (
    !Number.isSafeInteger(eventTime) ||
    Math.abs(Date.now() / 1000 - eventTime) > 300
  ) {
    return false;
  }

  if (!/^[a-f\d]{64}$/i.test(signature)) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest();
  const received = Buffer.from(signature, "hex");

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

function acknowledge() {
  return NextResponse.json(ACKNOWLEDGEMENT, { status: 200 });
}

export async function POST(request: NextRequest) {
  const secret = "Bill_Stack-SEC-KEY-bb32d2a02a698a8aea02a1166bd9d2fd";
  if (!secret) {
    console.error("Billstack webhook secret is not configured");
    return NextResponse.json(
      { message: "Webhook is not configured" },
      { status: 500 },
    );
  }

  const rawBody = await request.text();
  const validSignature = verifyBillstackSignature(
    rawBody,
    request.headers.get("x-wiaxy-timestamp"),
    request.headers.get("x-wiaxy-signature-256"),
    secret,
  );

  if (!validSignature) {
    return NextResponse.json(
      { message: "Invalid webhook signature" },
      { status: 401 },
    );
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  if (payload?.event !== "PAYMENT_NOTIFICATION") return acknowledge();

  const payment = payload?.data;
  if (payment?.type !== "RESERVED_ACCOUNT_TRANSACTION") return acknowledge();

  const accountReference = payment.reference || payment.merchant_reference;
  const paymentReference = payment.transaction_ref || payment.wiaxy_ref;
  const amount = Number(payment.amount);

  if (
    typeof accountReference !== "string" ||
    !accountReference ||
    typeof paymentReference !== "string" ||
    !paymentReference ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return NextResponse.json(
      { message: "Invalid payment notification" },
      { status: 400 },
    );
  }

  await connectDB();
  const txRef = `billstack_${paymentReference}`;
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const wallet = await Wallet.findOne({
        "billstack.reference": accountReference,
      }).session(session);

      if (!wallet) {
        const error = new Error("Wallet for Billstack reference was not found");
        error.name = "BillstackWalletNotFound";
        throw error;
      }

      let transaction = await Transaction.findOne({ txRef }).session(session);
      if (transaction?.status === "success") {
        return;
      }

      if (!transaction) {
        transaction = new Transaction({
          userId: wallet.userId,
          type: "fund",
          amount,
          txRef,
          status: "success",
        });
      } else {
        transaction.userId = wallet.userId;
        transaction.type = "fund";
        transaction.amount = amount;
        transaction.status = "success";
      }
      transaction.providerResponse = payload;
      transaction.meta = {
        provider: "billstack",
        accountReference,
        paymentReference,
      };
      await transaction.save({ session });

      const result = await Wallet.updateOne(
        { _id: wallet._id },
        { $inc: { balance: amount, ledgerBalance: amount } },
        { session },
      );

      if (result.matchedCount !== 1) {
        throw new Error("Wallet could not be credited");
      }
    });

    return acknowledge();
  } catch (error: any) {
    if (error?.code === 11000) {
      const existingTransaction = await Transaction.findOne({ txRef });
      if (existingTransaction?.status === "success") return acknowledge();
    }

    if (error?.name === "BillstackWalletNotFound") {
      console.error(error.message, { accountReference });
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error("Billstack payment notification could not be processed", {
      message: error?.message,
      paymentReference,
    });
    return NextResponse.json(
      { message: "Payment notification could not be processed" },
      { status: 500 },
    );
  } finally {
    await session.endSession();
  }
}
