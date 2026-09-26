import connectDB from "@/connectDB";
import { NextRequest, NextResponse } from "next/server";
import Wallet from "@/models/walletModel";
import { verifyJwt } from "@/helpers/jwt";
import { User } from "lucide-react";
import userModel from "@/models/userModel";
import axios from "axios";

async function getUserIdFromRequest(request: NextRequest) {
  const cookie = request.headers.get("cookie") || "";
  const tokenMatch = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="));
  if (!tokenMatch) return null;
  const token = tokenMatch.split("=")[1];
  const payload: any = await verifyJwt(token);
  return payload?.id || null;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { pin } = body;
    const userId = await getUserIdFromRequest(request);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // get user using userId
    const user = await userModel.findById(userId);
    console.log("user", user);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = await Wallet.findOne({ userId });
    if (existing)
      return NextResponse.json({
        message: "Wallet already exists",
        wallet: existing,
      });

    // create account number
    const data = {
      email: user.email,
      name: user.name,
      phoneNumber: user.phone,
      bankCode: ["20946", "20897"],
      businessId: "61deb6a83e1949bdbd9e07bad04c8ad28f25cb08",
    };

    try {
      const response = await axios.post(
        "https://api.paymentpoint.co/api/v1/createVirtualAccount",
        data,
        {
          headers: {
            Authorization: `Bearer 2966ade1df32998469c029ec9b5c3a76a445c22ff93cf1a3ae9f272581c063e82564275e0fe1d719ea6606f87eb4ac7ad5f8ca11c75ab1ec35b3c53a`,
            "Content-Type": "application/json",
            "api-key": "defd8445a9c0d8761252c055105b71aa5bdea98d"
          },
        }
      );

      console.log("response from payment provider", response.data);

      const bankAccounts = response.data.bankAccounts;
      const accountObj = Array.isArray(bankAccounts)
        ? bankAccounts[0]
        : bankAccounts;

      if (!accountObj) {
        console.error("Unexpected response from payment provider", response.data);
        return NextResponse.json(
          { error: "Invalid bank account data" },
          { status: 502 }
        );
      }

      const accountNumber =
        accountObj.accountNumber ??
        accountObj.account_number ??
        accountObj.accountNo ??
        accountObj.account;
      const accountName =
        accountObj.accountName ?? accountObj.account_name ?? accountObj.name;
      const bankName =
        accountObj.bankName ?? accountObj.bank_name ?? accountObj.bank;

      await Wallet.create({
        userId,
        account_number: accountNumber,
        account_name: accountName,
        bank_name: bankName,
        pin,
        paymentPoint: { accountNumber, accountName, bankName },
      });

      console.log("Wallet created successfully ", response.data);
    } catch (error: any) {
      console.error(error);
      return NextResponse.json(
        { error: error?.message || "Payment provider error" },
        { status: 500 }
      );
    }

 

    return NextResponse.json({ message: "Wallet created" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
