import { NextResponse } from "next/server";
import connectDB from "@/connectDB";
import DataM from "@/models/dataM";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic validation
    const {
      provider,
      category,
      externalId,
      name,
      buyingPrice,
      amount,
      validity,
      token,
      providerId,
      publish,
    } = body || {};

    if (
      !provider ||
      !category ||
      !name ||
      !token ||
      !providerId ||
      amount === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectDB();

    // Upsert by externalId if provided, otherwise by unique provider+category+name
    const filter: any = { provider, category };
    if (externalId !== undefined && externalId !== null) {
      filter.externalId = externalId;
    } else {
      filter.name = name;
    }

    const update = {
      provider,
      category,
      externalId: externalId !== undefined ? externalId : undefined,
      name,
      amount: Number(amount),
      meta: { buyingPrice: buyingPrice ? Number(buyingPrice) : undefined },
      validity,
      token,
      providerId,
      publish
    } as any;

    const opts = { upsert: true, new: true } as any;

    const doc = await DataM.findOneAndUpdate(filter, update, opts).lean();

    return NextResponse.json({ ok: true, data: doc });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const provider = url.searchParams.get("provider");
    const category = url.searchParams.get("category");

    const filter: any = {};
    if (provider) filter.provider = provider;
    if (category) filter.category = category;

    const docs = await DataM.find(filter)
      .sort({ provider: -1, category: -1, amount: -1 })
      .lean();

    return NextResponse.json({ ok: true, data: docs, message: "hamza" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 },
    );
  }
}
