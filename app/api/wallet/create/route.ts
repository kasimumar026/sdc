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
      businessId: "2a9b83cbc8ccb272a5c146ee0e2126ca86b1e706",
    };

    try {
      const response = await axios.post(
        "https://api.paymentpoint.co/api/v1/createVirtualAccount",
        data,
        {
          headers: {
            Authorization: `Bearer cd9ba577cf045d511d436e59e0e3c6b94f7f79d668f6f02bb1567dce464359a2b54710b71bc85bb277ee812ba4ffc4e1fd0164b5c3de1808c32888ae`,
            "Content-Type": "application/json",
            "api-key": "699cd2e86272ce9cfea562325957c85d0a5f1788"
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
