import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/connectDB";
import requireAuth from "@/middlewares/authMiddleware";
import Provider from "@/models/providerModel";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json().catch(() => ({}));
    const { name, url, service } = body as {
      name?: string;
      url?: string;
      service?: string;
    };

    if (!name || !url || !service) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const doc = await Provider.create({ name, url, service });
    return NextResponse.json({ provider: doc }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const providers = await Provider.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ providers }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
