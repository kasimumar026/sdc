import connectDB from "@/connectDB";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { signJwt } from "@/helpers/jwt";
import requireAuth from "@/middlewares/authMiddleware";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const userId = (auth as any).id?.toString?.() ?? (auth as any).id;
    console.log(userId);
    if (!userId)
      return NextResponse.json(
        { message: "Unauthorized User" },
        { status: 401 }
      );

    const user = await User.findById(userId).select("-password").lean();
    if (!user)
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    const body = await request.json();

    const { code } = body;

    if (code !== user.code) {
      return NextResponse.json({ error: "Invalid Code" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isEmailVerified: true },
      {
        new: true,
      }
    )
      .select("-password")
      .lean();
    if (!updatedUser)
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({
      message: "Successfully Verified",
      user: user,
    });
  } catch (error: any) {
    console.error("Error while creating document:", error);
    return NextResponse.json(
      { message: "Error", error: error.message },
      { status: 500 }
    );
  }
}
