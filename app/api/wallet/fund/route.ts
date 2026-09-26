import connectDB from "@/connectDB";
import { NextRequest, NextResponse } from "next/server";
import Wallet from "@/models/walletModel";
import Transaction from "@/models/transactionModel";
import { verifyJwt } from "@/helpers/jwt";
import axios from "axios";
import crypto from "crypto";
import { MehIcon } from "lucide-react";

async function getUserIdFromRequest(request: NextRequest) {
  const cookie = request.headers.get("cookie") || "";
  const tokenMatch = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="));
  if (!tokenMatch) return null;
  const token = tokenMatch.split("=")[1];
  const payload: any = await verifyJwt(token);
  return payload?.id || null;
}

// POST /api/wallet/fund
// Body: { amount: number, returnUrl?: string }
// Creates an Opay payment session (if OPAY_BASE_URL configured) or simulates
// Returns: { payment_url, txRef, transaction }
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { amount, returnUrl } = body;
    const num = Number(amount || 0);
    if (!num || num <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    // create a pending transaction first
    const txRef = `fund_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const tx = await Transaction.create({
      userId,
      type: "fund", // wallet funding transaction
      amount: num,
      txRef,
      providerResponse: {},
      status: "pending",
    });

    const OPAY_BASE_URL = process.env.OPAY_BASE_URL;
    const OPAY_MERCHANT_ID = process.env.OPAY_MERCHANT_ID;
    const OPAY_SECRET_KEY = process.env.OPAY_SECRET_KEY; // used to HMAC sign the request body
    const OPAY_WEBHOOK_URL = process.env.OPAY_WEBHOOK_URL || `${process.env.NEXTAUTH_URL || ""}/api/wallet/opay/webhook`;

    // If Opay merchant & secret are configured, attempt to create a real payment session
    if (OPAY_MERCHANT_ID && OPAY_SECRET_KEY) {
      try {
        const payload = {
          amount: {
            currency: "NGN",
            total: num,
          },
          callbackUrl: OPAY_WEBHOOK_URL,
          country: "NG",
          expireAt: 300,
          merchantName: "ShuraimDataSub",
          notify: {
            notifyLanguage: "English",
            notifyMethod: "EMAIL",
            notifyUserEmail: "",
            notifyUserMobile: "",
            notifyUserName: "",
          },
          payMethod: "ReferenceCode",
          product: {
            name: "Wallet Topup",
            description: "Fund wallet",
          },
          reference: txRef,
          metadata: { userId: userId.toString(), purpose: "wallet_fund" },
        } as any;

        // create HMAC sha512 signature of JSON body using OPAY secret key (per docs)
        const hmac = crypto.createHmac("sha512", OPAY_SECRET_KEY).update(JSON.stringify(payload)).digest("hex");

        const headers: any = {
          "Content-Type": "application/json",
          MerchantId: OPAY_MERCHANT_ID,
          Authorization: `Bearer ${hmac}`,
        };

        // Choose endpoint: use OPAY_BASE_URL if provided else fallback to Opay sandbox international endpoint
        const opayEndpoint = OPAY_BASE_URL
          ? `${OPAY_BASE_URL.replace(/\/$/, "")}/api/v1/international/payment/create`
          : `https://sandboxapi.opaycheckout.com/api/v1/international/payment/create`;

        // Log the outgoing request (avoid printing secrets)
        console.info("Opay create request", { opayEndpoint, merchant: OPAY_MERCHANT_ID, txRef });
        const resp = await axios.post(opayEndpoint, payload, { headers, timeout: 15000 });
        const data = resp.data || {};

        // attach provider response to transaction
        tx.providerResponse = data;
        await tx.save();

        // Common fields Opay might return
        const payment_url = data.paymentUrl || data.payment_url || data.checkout_url || data.redirect_url || data.url || (data.data && (data.data.redirectUrl || data.data.paymentUrl));
        return NextResponse.json({ payment_url, txRef, transaction: tx });
      } catch (err: any) {
        // Save provider error on transaction for debugging
        const providerErr = err?.response?.data || { message: err?.message || "Unknown error" };
        try {
          tx.providerResponse = providerErr;
          tx.status = "failed";
          await tx.save();
        } catch (saveErr) {
          console.error("Failed saving tx provider error", saveErr);
        }

        console.error("Opay create payment failed:", providerErr);
        // Return provider error to client to make debugging easier
        return NextResponse.json({ error: "Opay create payment failed", provider: providerErr }, { status: 502 });
      }
    }

    // If we reach here it means Opay was not configured or the create call failed.
    // Return an explicit error rather than a simulated payment page so callers
    // know to inspect server logs or set OPAY_* env vars.
    return NextResponse.json(
      { error: "Opay payment creation failed or Opay not configured. Check OPAY_MERCHANT_ID and OPAY_SECRET_KEY in env." },
      { status: 502 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
