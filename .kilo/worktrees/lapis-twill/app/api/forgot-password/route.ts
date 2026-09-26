import connectDB from "@/connectDB";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import requireAuth from "@/middlewares/authMiddleware";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { message: "Phone is required" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // update the user code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.code = code;
    await user.save();

    // // send sms using bilalsada api
    // try {
    //   const response: any = await axios({
    //     method: "post",
    //     url: "https://bilalsadasub.com/api/bulksms",
    //     headers: {
    //       Authorization:
    //         "2284d5194753c18256c055ab7e545d966b91516afad7e53521cbdce73169",
    //       "Content-Type": "application/json",
    //     },
    //     data: {
    //       sender: "ShuraimSub",
    //       number: phone.trim(),
    //       message: `Your password code is ${user.password}`,
    //     },
    //     timeout: 15000,
    //   });

    //   if (response.ok) {
    //     console.log(`Successfully sent to ${phone}:`, response.data);
    //     return NextResponse.json(
    //       { message: "Password reset code sent to phone" },
    //       { status: 200 },
    //     );
    //   }

    //   console.warn(
    //     `SMS provider returned non-2xx status for ${phone}:`,
    //     status,
    //     response?.data,
    //   );
    //   return NextResponse.json(
    //     { message: "Failed to send SMS", provider: response?.data || null },
    //     { status: 502 },
    //   );
    // } catch (err: any) {
    //   console.error(`Failed sending SMS to ${phone}:`, err?.message || err);
    //   return NextResponse.json(
    //     { message: "Error", error: "Failed to send SMS" },
    //     { status: 500 },
    //   );
    // }

    return NextResponse.json({phone, code});
  } catch (error: any) {
    console.error("forgot-password error", error);
    return NextResponse.json(
      { message: "Error", error: error.message },
      { status: 500 },
    );
  }
}
