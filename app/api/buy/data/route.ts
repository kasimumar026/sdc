import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/connectDB";
import requireAuth from "@/middlewares/authMiddleware";
import Wallet from "@/models/walletModel";
import DataPlan from "@/models/dataModel";
import Transaction from "@/models/transactionModel";
import axios from "axios";

type Body = {
  network?: string;
  category?: string;
  planId?: number | string;
  phone?: string;
  pin?: string;
  customer_reference?: string;
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const userId = (auth as any).id?.toString?.() ?? (auth as any).id;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: Body = await request.json().catch(() => ({}) as Body);
    const { planId, phone, pin, customer_reference } = body;

    // minimal validation: require planId, phone and pin
    if (!planId)
      return NextResponse.json({ error: "Plan is required" }, { status: 400 });
    if (!phone)
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    if (!pin || String(pin).length !== 4)
      return NextResponse.json({ error: "Invalid PIN" }, { status: 400 });

    // find plan in database by _id or externalId
    let plan: any = null;
    // try by ObjectId / _id first
    try {
      plan = await DataPlan.findById(String(planId)).lean();
    } catch (e) {
      plan = null;
    }
    if (!plan) {
      // try by numeric externalId
      const asNum = Number(planId);
      if (!Number.isNaN(asNum)) {
        plan = await DataPlan.findOne({ externalId: asNum }).lean();
      }
    }
    if (!plan)
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    const amount = Number(plan.amount || 0);
    if (!amount || amount <= 0)
      return NextResponse.json(
        { error: "Invalid plan amount" },
        { status: 400 },
      );

    // load wallet
    const wallet = await Wallet.findOne({ userId });
    if (!wallet)
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    if (wallet.isLocked)
      return NextResponse.json({ error: "Wallet is locked" }, { status: 403 });
    if (String(wallet.pin) !== String(pin))
      return NextResponse.json(
        { error: "Invalid wallet PIN" },
        { status: 401 },
      );
    if (Number(wallet.balance) < amount)
      return NextResponse.json(
        { error: "Insufficient funds" },
        { status: 400 },
      );

    // decide which provider endpoint to call based on plan.provider
    const headers: any = { "Content-Type": "application/json" };
    headers.Authorization = `Token ${process.env.TOKEN}`;

    let providerResponse: any = null;
    try {
      if (plan.provider.toLowerCase() === "mtn") {
        // Call SMEPLUG endpoint for MTN plans
        const providerUrl = "https://smeplug.ng/api/v1/data/purchase";
        // prefer externalId for provider's plan id
        if (!plan.externalId) {
          throw new Error("Plan does not have externalId required by provider");
        }
        // map provider string to numeric id for SMEPLUG (same mapping as other provider)
        const p = (plan.provider || "").toLowerCase();
        let network_id: number = 1;
        if (p === "mtn") network_id = 1;
        else if (p === "glo") network_id = 3;
        else if (p === "airtel") network_id = 2;
        else if (p === "9mobile") network_id = 4;

        const custRef = customer_reference || `DATA-${Date.now()}`;

        // SMEPLUG uses a separate secret token. Make selection explicit and readable
        // with a small switch so it's obvious which key is used for each plan id.
        const API_KEY_DEFAULT =
          "v2.eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NzcwODcsInRpbWUiOiIyMDI2LTA2LTEyIDAxOjAxOjEzIn0.ZFfDjz4oifAmbi59q7yN4kT17ftCn9PUbP_6-OO3Ujc";
        const API_KEY_5GB =
          "v2.eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NzgwNTEsInRpbWUiOiIyMDI2LTA3LTI0IDA5OjQ2OjEwIn0.v1jllyHLg86ptRst_FesDj03VGbFFhb7M8c2A3i2sI0"; // 5GB Data
        const API_KEY_2GB =
          "v2.eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NzcwODcsInRpbWUiOiIyMDI2LTA2LTEyIDAxOjAxOjEzIn0.ZFfDjz4oifAmbi59q7yN4kT17ftCn9PUbP_6-OO3Ujc"; // 2GB

        const AWOOF_API_KEY =
          "kvEvjrDOitmQykMjLipAXkn8HYIrsBRQR5fCZ13MzfB2ae5JuuK4StC5YU2e";

        const smeHeaders = { ...headers } as any;
        const incomingAsNum = Number(planId);
        const planExternalIdNum = Number(plan.externalId);
        const lookupId = !Number.isNaN(planExternalIdNum)
          ? planExternalIdNum
          : !Number.isNaN(incomingAsNum)
            ? incomingAsNum
            : undefined;

        let selectedSecret = API_KEY_DEFAULT;
        switch (lookupId) {
          case 427:
            selectedSecret = API_KEY_5GB;
            break;
          case 425:
            selectedSecret = API_KEY_2GB;
            break;
          case 426:
            selectedSecret = API_KEY_2GB;
            break;
          case 510:
            selectedSecret = AWOOF_API_KEY;
            break;
          case 453:
            selectedSecret = AWOOF_API_KEY;
            break;
          case 55:
            selectedSecret = AWOOF_API_KEY;
            break;
          default:
            selectedSecret = API_KEY_DEFAULT;
        }

        smeHeaders.Authorization = `Bearer ${selectedSecret}`;

        providerResponse = (
          await axios.post(
            providerUrl,
            {
              network_id,
              plan_id: Number(plan.externalId),
              phone,
              customer_reference: custRef,
            },
            { headers: smeHeaders },
          )
        ).data;
      } else {
        // Call Bilalsada endpoint for non-MTN providers
        const providerUrl =
          process.env.BILALSADASUB_URL || "https://bilalsadasub.com/api/data";
        // map provider string to network id expected by bilalsada API
        let network_id: number | undefined = undefined;
        const p = (plan.provider || "").toLowerCase();
        if (p === "mtn") network_id = 1;
        else if (p === "glo") network_id = 3;
        else if (p === "airtel") network_id = 2;
        else if (p === "9mobile") network_id = 4;

        if (!plan.externalId) {
          throw new Error("Plan does not have externalId required by provider");
        }

        providerResponse = (
          await axios.post(
            providerUrl,
            {
              network: network_id,
              data_plan: Number(plan.externalId),
              phone,
              bypass: false,
              "request-id": `DATA-${Date.now()}`,
            },
            { headers },
          )
        ).data;
      }
    } catch (err: any) {
      const message = err?.response?.data || err?.message || "Purchase error";
      // record failed transaction for audit
      const failRef = `FAIL-DATA-${Date.now()}`;
      await Transaction.create({
        userId,
        type: "data",
        amount,
        txRef: failRef,
        providerResponse: err?.response?.data || { message },
        meta: { plan: plan.name, phone, provider: plan.provider },
        status: "failed",
      });

      return NextResponse.json(
        { error: "Provider error", details: message },
        { status: 502 },
      );
    }

    // Determine success from provider response
    const success =
      providerResponse?.status === "success" ||
      providerResponse?.status === true;

    if (!success) {
      const txRefFail =
        providerResponse?.txRef ||
        providerResponse?.reference ||
        `FAIL-DATA-${Date.now()}`;
      await Transaction.create({
        userId,
        type: "data",
        amount,
        txRef: txRefFail,
        providerResponse,
        meta: { plan: plan.name, phone, provider: plan.provider },
        status: "failed",
      });

      return NextResponse.json(
        { error: "Provider reported failure", provider: providerResponse },
        { status: 502 },
      );
    }

    // Deduct wallet on success
    wallet.balance = Number(wallet.balance) - amount;
    wallet.ledgerBalance = Number(wallet.ledgerBalance) - amount;
    await wallet.save();

    // record successful transaction data
    const txRef =
      providerResponse?.txRef ||
      providerResponse?.reference ||
      `SIM-DATA-${Date.now()}`;
    await Transaction.create({
      userId,
      type: "data",
      amount,
      txRef,
      providerResponse,
      meta: { plan: plan.name, phone, provider: plan.provider },
      status: "success",
    });

    return NextResponse.json(
      {
        message: "Data purchase successful",
        provider: providerResponse,
        wallet,
        name: plan.name,
        phone,
        amount,
        txRef,
      },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Failed to purchase data",
        details: err?.response?.data || err?.message,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to buy data if you like" });
}
