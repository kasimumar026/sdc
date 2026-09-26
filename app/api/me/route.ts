import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/connectDB";
import User from "@/models/userModel";
import requireAuth from "@/middlewares/authMiddleware";
import walletModel from "@/models/walletModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const userId = (auth as any).id?.toString?.() ?? (auth as any).id;
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await User.findById(userId).select("-password").lean();
    if (!user)
      return NextResponse.json({ message: "Not found" }, { status: 404 });

        const wallet = await walletModel.findOne({ userId: user._id }).lean();

    return NextResponse.json({ user, wallet }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const userId = (auth as any).id?.toString?.() ?? (auth as any).id;
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const updatedUser = await User.findByIdAndUpdate(userId, body, {
      new: true,
    })
      .select("-password")
      .lean();
    if (!updatedUser)
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Error", error: error.message },
      { status: 500 }
    );
  }
}