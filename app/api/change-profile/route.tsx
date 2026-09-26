import connectDB from "@/connectDB";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import Wallet from "@/models/walletModel";
import { verifyJwt } from "@/helpers/jwt";

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, name, email, phone } = body;

    const user = await User.findById(id);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    let updatedValues: any = {}
    if(name) updatedValues.name = name;
    if(email) updatedValues.email = email;
    if(phone) updatedValues.phone = phone;

    const updated = await User.findByIdAndUpdate(
      id,
      updatedValues,
      { new: true },
    );

    return NextResponse.json({
      message: "Updated Successfully",
      user: updated,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
