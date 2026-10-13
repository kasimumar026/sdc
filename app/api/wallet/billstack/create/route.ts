import connectDB from "@/connectDB";
import { verifyJwt } from "@/helpers/jwt";
import User from "@/models/userModel";
import Wallet from "@/models/walletModel";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

type BillstackAccount = {
  account_number?: string;
  account_name?: string;
  bank_name?: string;
  bank_id?: string;
};

async function getAuthenticatedUserId(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  const payload: any = await verifyJwt(token);
  return payload?.id?.toString?.() ?? payload?.id ?? null;
}

function providerMessage(error: any) {
  const message = error?.response?.data?.message || error?.response?.data?.error;
  return typeof message === "string" ? message : undefined;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let wallet = await Wallet.findOne({ userId: user._id });
    if (wallet?.account_number) {
      return NextResponse.json({
        message: "Virtual account already exists",
        wallet,
      });
    }

    const billstackKey = process.env.BILLSTACK_KEY;
    if (!billstackKey) {
      return NextResponse.json(
        { message: "Virtual account service is not configured" },
        { status: 503 },
      );
    }

    const baseUrl = (
      process.env.BILLSTACK_URL || "https://api.billstack.co/v2"
    ).replace(/\/+$/, "");
    const reference = wallet?.billstack?.reference || `sdc_${user._id}`;

    if (!wallet) {
      wallet = await Wallet.create({
        userId: user._id,
        dvaStatus: "pending",
        billstack: { reference },
      });
    } else {
      wallet.dvaStatus = "pending";
      wallet.dvaErrorReason = undefined;
      wallet.billstack = { ...wallet.billstack, reference };
      await wallet.save();
    }

    let response;
    try {
      const nameParts = user.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName;

      response = await axios.post(
        `${baseUrl}/thirdparty/generateVirtualAccount/`,
        {
          reference,
          email: user.email,
          phone: user.phone,
          firstName,
          lastName,
          bank: "9PSB",
        },
        {
          headers: {
            Authorization: `Bearer ${billstackKey}`,
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error: any) {
      const message = providerMessage(error);
      wallet.dvaStatus = "failed";
      wallet.dvaErrorReason = message || "Billstack could not create a virtual account";
      await wallet.save();

      console.error("Billstack virtual account request failed", {
        status: error.response?.status,
        providerMessage: message,
        receivedProviderResponse: Boolean(error.response),
      });
      return NextResponse.json(
        { message: message ? `Billstack: ${message}` : wallet.dvaErrorReason },
        { status: 502 },
      );
    }

    if (response.data?.status !== true) {
      const message =
        typeof response.data?.message === "string"
          ? response.data.message
          : "Billstack did not confirm the virtual account request";
      wallet.dvaStatus = "failed";
      wallet.dvaErrorReason = message;
      await wallet.save();
      return NextResponse.json({ message: `Billstack: ${message}` }, { status: 502 });
    }

    const accounts = response.data?.data?.account;
    const account: BillstackAccount | undefined = Array.isArray(accounts)
      ? accounts[0]
      : accounts;
    if (!account?.account_number) {
      wallet.dvaStatus = "failed";
      wallet.dvaErrorReason = "Billstack returned no account number";
      await wallet.save();
      return NextResponse.json(
        { message: "Billstack returned no account number" },
        { status: 502 },
      );
    }

    wallet.account_number = account.account_number;
    wallet.account_name = account.account_name;
    wallet.bank_name = account.bank_name;
    wallet.dvaStatus = "success";
    wallet.dvaErrorReason = undefined;
    wallet.billstack = {
      reference: response.data?.data?.reference || reference,
      bankId: account.bank_id,
    };
    await wallet.save();

    return NextResponse.json({
      message: "Virtual account created",
      wallet,
    });
  } catch (error: any) {
    console.error("Could not create Billstack virtual account:", error);
    return NextResponse.json(
      { message: "Could not create a virtual account", error: error.message },
      { status: 500 },
    );
  }
}
