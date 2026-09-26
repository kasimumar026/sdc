import connectDB from "@/connectDB";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { sendPasswordChangedEmail } from "@/lib/email";
import { requireAuth } from "@/middlewares/authMiddleware";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const userId = (auth as any).id?.toString?.() ?? (auth as any).id;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { message: "email, code and newPassword are required" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.code || String(user.code) !== String(code)) {
      return NextResponse.json(
        { message: "Invalid or expired code" },
        { status: 400 },
      );
    }

    // Update password and clear or rotate the code
    user.password = newPassword;
    // rotate code to prevent reuse
    user.code = String(Math.floor(100000 + Math.random() * 900000));
    await user.save();

    // notify user of successful change
    await sendPasswordChangedEmail(email);

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error("forgot-password verify error", error);
    return NextResponse.json(
      { message: "Error", error: error.message },
      { status: 500 },
    );
  }
}
