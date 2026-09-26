import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/connectDB";
import requireAuth from "@/middlewares/authMiddleware";
import Provider from "@/models/providerModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ message: " ID is required" }, { status: 400 });
    }

    const provider = await Provider.findById(id).lean();
    if (!provider)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ provider }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ message: " ID is required" }, { status: 400 });
    }
    const doc = await Provider.findByIdAndDelete(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 },
    );
  }
}
