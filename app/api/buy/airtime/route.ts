import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/connectDB";
import axios from "axios";
import requireAuth from "@/middlewares/authMiddleware";
import Wallet from "@/models/walletModel";
import Transaction from "@/models/transactionModel";

type Body = {
  network?: string;
  phone?: string;
  amount?: number | string;
  pin?: string;
  plan?: string; // optional plan id or code
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // authenticate
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const userId = (auth as any).id?.toString?.() ?? (auth as any).id;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: Body = await request.json().catch(() => ({}) as Body);
    const { network, phone, amount, pin, plan } = body;

    if (!network)
      return NextResponse.json(
        { error: "Network is required" },
        { status: 400 },
      );
    if (!phone)
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    const numAmount = Number(amount || 0);
    if (!numAmount || numAmount <= 0)
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    if (!pin || String(pin).length !== 4)
      return NextResponse.json({ error: "Invalid PIN" }, { status: 400 });

    // load wallet
    const wallet = await Wallet.findOne({ userId });
    if (!wallet)
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    if (wallet.isLocked)
      return NextResponse.json({ error: "Wallet is locked" }, { status: 403 });

    // check pin
    if (String(wallet.pin) !== String(pin))
      return NextResponse.json(
        { error: "Invalid wallet PIN", pin, walletPin: wallet.pin },
        { status: 401 },
      );

    // check balance
    if (Number(wallet.balance) < numAmount)
      return NextResponse.json(
        { error: "Insufficient funds" },
        { status: 400 },
      );

    // prepare provider payload
    const payload = {
      network: network,
      phone, // keep leading zero
      plan_type: "VTU",
      bypass: false,
      amount: numAmount,
      "request-id": `AIRT-${Date.now()}`,
    };

    // Prefer provider token if configured, otherwise try base URL credentials, otherwise simulate
    const providerToken = process.env.TOKEN;
    const baseUrl =
      process.env.BILALSADASUB_BASE_URL?.replace(/\/$/, "") ||
      "https://bilalsadasub.com/api";

    try {
      let providerResponse: any = null;

      if (providerToken || baseUrl) {
        const headers: any = { "Content-Type": "application/json" };
        if (providerToken) {
          headers.Authorization = `Token ${providerToken}`;
        } else if (
          process.env.BILALSADASUB_USERNAME &&
          process.env.BILALSADASUB_PASSWORD
        ) {
          const creds = Buffer.from(
            `${process.env.BILALSADASUB_USERNAME}:${process.env.BILALSADASUB_PASSWORD}`,
          ).toString("base64");
          headers.Authorization = `Basic ${creds}`;
        }

        const url = `${baseUrl}/topup`;
        const res = await axios.post(url, payload, { headers });
        providerResponse = res.data;
      } else {
        // simulate provider response for local/dev
        providerResponse = {
          status: "success",
          provider: "simulated",
          network,
          phone,
          amount: numAmount,
          txRef: `SIM-AIR-${Date.now()}`,
        };
      }

      // Determine success from provider response
      const success =
        providerResponse?.status === "success" ||
        providerResponse?.success === true ||
        (providerResponse?.code &&
          String(providerResponse.code).startsWith("2"));

      if (!success) {
        // Do not deduct wallet; record failed transaction for audit
        const txRefFail =
          providerResponse?.txRef ||
          providerResponse?.reference ||
          `FAIL-AIR-${Date.now()}`;
        await Transaction.create({
          userId,
          type: "airtime",
          amount: numAmount,
          txRef: txRefFail,
          providerResponse,
          meta: { network, phone, plan },
          status: "failed",
        });

        return NextResponse.json(
          { error: "Provider reported failure", provider: providerResponse },
          { status: 502 },
        );
      }

      // Deduct wallet on success
      // subtract 2% fee
      const deduction = Math.round(numAmount * 0.98); // consider smallest currency unit to avoid floats
      wallet.balance = Number(wallet.balance) - deduction;
      wallet.ledgerBalance = Number(wallet.ledgerBalance) - deduction;
      await wallet.save();

      // record transaction
      const txRef =
        providerResponse?.txRef ||
        providerResponse?.reference ||
        `SIM-AIR-${Date.now()}`;
      await Transaction.create({
        userId,
        type: "airtime",
        amount: numAmount,
        txRef,
        providerResponse,
        meta: { network, phone, plan },
        status: "success",
      });

      return NextResponse.json(
        {
          message: "Airtime purchase successful",
          provider: providerResponse,
          wallet,
          txRef,
        },
        { status: 200 },
      );
    } catch (err: any) {
      console.error(
        "Provider call error:",
        err?.response || err?.message || err,
      );
      return NextResponse.json(
        {
          error: err?.response?.data?.message || "Failed to buy airtime",
          details: err?.response?.data || err?.message,
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("buy/airtime error:", error);
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to buy airtime" });
}
