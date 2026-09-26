import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/connectDB";
import requireAuth from "@/middlewares/authMiddleware";
import Message from "@/models/message";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const message = await Message.findOne().lean();

    return NextResponse.json(
      { message: message?.message || "No welcome message set" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Admin GET error:", error);
    return NextResponse.json(
      { message: "Error", error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    // check if user is admin
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    if (auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ message: "Invalid message" }, { status: 400 });
    }

    // Update or create the welcome message
    const updatedMessage = await Message.findOneAndUpdate(
      {},
      { message },
      { new: true, upsert: true },
    );

    return NextResponse.json(
      { message: updatedMessage.message },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Admin POST error:", error);
    return NextResponse.json(
      { message: "Error", error: error.message },
      { status: 500 },
    );
  }
}
