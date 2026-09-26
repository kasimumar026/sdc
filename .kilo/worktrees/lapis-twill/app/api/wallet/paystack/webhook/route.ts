

import connectDB from "@/connectDB";
import { NextRequest, NextResponse } from "next/server";
import Transaction from "@/models/transactionModel";
import Wallet from "@/models/walletModel";
import crypto from "crypto";
import userModel from "@/models/userModel";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const raw = await request.text();
    const payload = JSON.parse(raw);

    const signature = request.headers.get("x-paystack-signature") || "";
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

    // 1. SECURITY: Strict Signature Check
    const hmac = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(raw)
      .digest("hex");
    if (hmac !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = payload?.event;
    const data = payload?.data;
    

    console.error(
      "Received Paystack webhook event:",
      event,
      "with data:",
      data,
    );
    // =========================================================================
    // CASE 1: HANDLE DEDICATED VIRTUAL ACCOUNT ASSIGNMENT SUCCESS...
    // =========================================================================
    if (event === "dedicatedaccount.assign.success") {
      const email = data?.customer?.email;
      const accountNumber = data?.dedicated_account?.account_number;
      const bankName = data?.bank?.name;
      const accountName = data?.dedicated_account?.account_name;

      console.log("accountNumber:", accountNumber);
      
      const USER = await userModel.findOne({ email: email });
      if (!USER) {
        console.error("User not found for email:", email);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

        // const user = await Wallet.findOne({ userId: USER._id });
        // if (!user) {
        //   console.error("User not found for email:", email);
        //   return NextResponse.json({ error: "User not found" }, { status: 404 });
        // }

      const userId = USER._id;

      // const wallet = await Wallet.findOne({userId})

      const updatedWallet = await Wallet.findOneAndUpdate(
        { userId: userId },
        {
          $set: {
            bank_name: "PAYSTACK-TITAN",
            account_number: accountNumber,
            account_name: accountName,
            paystackCustomerCode: data?.customer?.customer_code,
            dvaStatus: "success--",
            dvaErrorReason: null,
          },
        },
        { new: true },
      );

      console.log("Updated Wallet after DVA assignment:", updatedWallet);

      if (!updatedWallet) {
        console.warn("Wallet not found for userId:", userId);
        return NextResponse.json(
          { error: "Wallet not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        status: "success",
        message: "DVA saved to wallet",
      });
    }

    // =========================================================================
    // CASE 2: HANDLE DEDICATED VIRTUAL ACCOUNT ASSIGNMENT FAILURE 🔴 (NEW)
    // =========================================================================
    if (event === "dedicatedaccount.assign.failed") {
        const email = data?.customer?.email;

      const USER = await userModel.findOne({ email: email });

      // Paystack usually provides a descriptive message in the top-level payload or data fields
      const failureReason =
        payload?.message || "Bank routing failure or compliance rejection";

      console.error(
        `DVA Generation Failed for userId: ${USER._id}. Reason: ${failureReason}`,
      );

      if (USER._id) {
        // Update the wallet document so your frontend can read the failure message
        await Wallet.findOneAndUpdate(
          { userId: USER._id },
          {
            $set: {
              dvaStatus: "failed",
              dvaErrorReason: failureReason,
            },
          },
        );
      }

      return NextResponse.json({
        status: "success",
        message: "Failure event logged",
      });
    }

    // =========================================================================
    // CASE 3: HANDLE TRANSACTION CHARGES (POPUP OR MANUAL BANK TRANSFERS)
    // =========================================================================
    if (event === "charge.success" || event === "charge.failed") {
      console.error("CHARGE SUCCESS:", JSON.stringify(payload, null, 2));
      const reference = data?.reference;
      const email = data?.customer?.email;

      const USER = await userModel.findOne({ email: email });

      let tx = await Transaction.findOne({ txRef: reference });

      if (!tx && data?.authorization?.channel === "dedicated__account" || data?.authorization?.channel === "dedicated_nuban") {
        // const userId = data?.customer?.metadata?.userId;
             const user = await Wallet.findOne({ userId: USER._id });

        const userId = user?.userId;
        console.log("UserId from Wallet:", userId);

        if (!userId) {
          return NextResponse.json(
            { error: "No userId attached to customer metadata for transfer" },
            { status: 400 },
          );
        }

        tx = new Transaction({
          txRef: reference,
          userId: userId,
          amount: data?.amount/100,
          status: "pending",
        });
        await tx.save();
      }

      if (!tx) {
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 },
        );
      }

      if (tx.status === "success") {
        return NextResponse.json(
          { message: "Already processed" },
          { status: 200 },
        );
      }

      if (event === "charge.success") {
        tx.status = "success";
        tx.providerResponse = payload;
        await tx.save();

        const amount = Number(data?.amount || 0) / 100;

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

        console.log("Updated Wallet:", updatedWallet);

        if (!updatedWallet) {
          console.warn("Wallet not found for user", tx.userId);
          return NextResponse.json(
            { error: "Wallet not found" },
            { status: 404 },
          );
        }

        return NextResponse.json({ status: "success" });
      }

      if (event === "charge.failed") {
        tx.status = "failed";
        await tx.save();
        return NextResponse.json({ status: "handled failure" });
      }
    }

    return NextResponse.json({ status: "event ignored" });
  } catch (err: any) {
    console.error("Paystack webhook error", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
