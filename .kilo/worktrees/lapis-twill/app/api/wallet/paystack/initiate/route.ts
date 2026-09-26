import connectDB from "@/connectDB";
import { NextRequest, NextResponse } from "next/server";
import Transaction from "@/models/transactionModel";
import User from "@/models/userModel";
import { verifyJwt } from "@/helpers/jwt";
import axios from "axios";

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

// POST /api/wallet/paystack/initiate
// Body: { amount: number }
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { amount } = body || {};
    const num = Number(amount || 0);
    if (!num || num <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const user = await User.findById(userId).select("email");
    if (!user || !user.email) return NextResponse.json({ error: "User email not found" }, { status: 400 });

    const txRef = `paystack_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const tx = await Transaction.create({
      userId,
      type: "fund",
      amount: num,
      txRef,
      providerResponse: {},
      status: "pending",
    });

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";
  const BASE_URL = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || `https://afaruk-datasub.vercel.app`;
  const CALLBACK_URL = `${BASE_URL.replace(/\/$/, "")}/api/wallet/paystack/webhook`;
  // Optional: route payments to a Paystack subaccount (use your subaccount code)
  const PAYSTACK_SUBACCOUNT = "ACCT_qw1nw75un3ekwxw";
  const PAYSTACK_SPLIT_CODE = "SPL_gr19nemn8r";
  const PAYSTACK_TOKEN = ""
  
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "PAYSTACK_SECRET_KEY not configured" }, { status: 500 });
    }

    // Paystack expects amount in kobo
    const payload = {
      email: user.email,
      amount: Math.round(num * 100),
      reference: txRef,
      callback_url: CALLBACK_URL,
      // subaccount: PAYSTACK_SUBACCOUNT,
      // split_code: PAYSTACK_SPLIT_CODE,
      metadata: { userId: userId.toString(), purpose: "wallet_fund" },
    } as any;

    // If a subaccount is configured, tell Paystack to credit that subaccount by default
    if (PAYSTACK_SUBACCOUNT) {
      payload.subaccount = PAYSTACK_SUBACCOUNT;
      // it's helpful to also include metadata for bookkeeping
      payload.metadata = { ...(payload.metadata || {}), subaccount: PAYSTACK_SUBACCOUNT };
    }

    const headers = {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    try {
      const resp = await axios.post(`${PAYSTACK_BASE_URL}/transaction/initialize`, payload, { headers, timeout: 15000 });
      const data = resp.data || {};

      tx.providerResponse = data;
      await tx.save();

      const auth_url = data?.data?.authorization_url || data?.data?.authorization?.authorization_url;
      return NextResponse.json({ authorization_url: auth_url, reference: txRef, transaction: tx });
    } catch (err: any) {
      const providerErr = err?.response?.data || { message: err?.message || "Unknown error" };
      try {
        tx.providerResponse = providerErr;
        tx.status = "failed";
        await tx.save();
      } catch (saveErr) {
        console.error("Failed saving tx provider error", saveErr);
      }
      return NextResponse.json({ error: "Paystack initialize failed", provider: providerErr }, { status: 502 });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
