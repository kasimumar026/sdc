import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/connectDB";
import DataPlan from "@/models/dataM";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { message: "user ID is required" },
        { status: 400 },
      );
    }
    const doc = await DataPlan.findById(id).lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, data: doc });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { message: "user ID is required" },
        { status: 400 },
      );
    }
    const body = await request.json();
    await connectDB();

    const update: any = {};
    if (body.provider) update.provider = body.provider;
    if (body.category) update.category = body.category;
    if (body.externalId !== undefined) update.externalId = body.externalId;
    if (body.name) update.name = body.name;
    if (body.providerId) update.providerId = body.providerId;
    if (body.token) update.token = body.token;
    if (body.amount !== undefined) update.amount = Number(body.amount);
    if (body.buyingPrice !== undefined)
      update["meta.buyingPrice"] = Number(body.buyingPrice);
    if (body.validity) update.validity = body.validity;
    if (body.publish !== undefined)
      update.status = body.publish ? "active" : "disabled";

    const doc = await DataPlan.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true },
    ).lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, data: doc });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { message: "user ID is required" },
        { status: 400 },
      );
    }
    await connectDB();
    await DataPlan.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 },
    );
  }
}
