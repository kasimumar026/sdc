import connectDB from "@/connectDB";
import { NextRequest, NextResponse } from "next/server";
import Wallet from "@/models/walletModel";
import userModel from "@/models/userModel";
import axios from "axios";
import { verifyJwt } from "@/helpers/jwt";

// Helper function to pause execution (prevents hitting API rate limits)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function verifyAdmin(request: NextRequest) {
  const cookie = request.headers.get("cookie") || "";
  const tokenMatch = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="));

  if (!tokenMatch) return null;
  const token = tokenMatch.split("=")[1];
  const payload: any = await verifyJwt(token);

  if (!payload?.id) return null;

  // Ensure only authorized admin accounts can run migration
  const user = await userModel.findById(payload.id);
  if (!user || user.role !== "admin") return null;

  return user;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // // 1. Authenticate request - ensure only admins run this endpoint
    // const admin = await verifyAdmin(request);
    // if (!admin) {
    //   return NextResponse.json(
    //     { error: "Unauthorized. Admin privileges required." },
    //     { status: 401 }
    //   );
    // }

    // 2. Fetch all users from database
    const users = await userModel.find({});
    
    const results = {
      totalUsers: users.length,
      successCount: 0,
      failedCount: 0,
      failures: [] as Array<{ userId: string; email: string; reason: string }>,
    };

    // 3. Process users sequentially to prevent rate limits
    for (const user of users) {
      try {
        // Find existing wallet if present
        let existingWallet = await Wallet.findOne({ userId: user._id });

        // Skip if user already has a PaymentPoint account
        if (existingWallet?.paymentPoint?.accountNumber) {
          results.successCount++;
          continue;
        }

        // Call PaymentPoint API
        const payload = {
          email: user.email,
          name: user.name,
          phoneNumber: user.phone,
          bankCode: ["20946", "20897"],
          businessId: "61deb6a83e1949bdbd9e07bad04c8ad28f25cb08",
        };

        const response = await axios.post(
          "https://api.paymentpoint.co/api/v1/createVirtualAccount",
          payload,
          {
            headers: {
              Authorization: `Bearer 2966ade1df32998469c029ec9b5c3a76a445c22ff93cf1a3ae9f272581c063e82564275e0fe1d719ea6606f87eb4ac7ad5f8ca11c75ab1ec35b3c53a`,
              "Content-Type": "application/json",
              "api-key": "defd8445a9c0d8761252c055105b71aa5bdea98d",
            },
            timeout: 10000,
          }
        );

        const bankAccounts = response.data?.bankAccounts;
        const accountObj = Array.isArray(bankAccounts)
          ? bankAccounts[0]
          : bankAccounts;

        if (!accountObj) {
          throw new Error(
            `Invalid provider response structure: ${JSON.stringify(response.data)}`
          );
        }

        const accountNumber =
          accountObj.accountNumber || accountObj.account_number || accountObj.accountNo;
        const accountName =
          accountObj.accountName || accountObj.account_name || accountObj.name;
        const bankName =
          accountObj.bankName || accountObj.bank_name || accountObj.bank;

        if (!accountNumber) {
          throw new Error(`Account number missing in payload: ${JSON.stringify(accountObj)}`);
        }

      

        // 4. Update existing wallet OR create new wallet
        if (existingWallet) {
          existingWallet.account_number = accountNumber;
          existingWallet.account_name = accountName;
          existingWallet.bank_name = bankName;
          existingWallet.paymentPoint = { accountNumber, accountName, bankName };
          
          await existingWallet.save();
        } else {
          // If no wallet exists, create one with a default placeholder PIN
          await Wallet.create({
            userId: user._id,
            account_number: accountNumber,
            account_name: accountName,
            bank_name: bankName,
            pin: "0000", // Placeholder PIN for legacy users without a set PIN
            paymentPoint: { accountNumber, accountName, bankName },
          });
        }

        results.successCount++;

        // Add small delay (200ms) between API requests to prevent rate limiting
        await sleep(200);
      } catch (err: any) {
        console.error(`Migration failed for user ${user.email}:`, err.message);
        results.failedCount++;
        results.failures.push({
          userId: user._id.toString(),
          email: user.email,
          reason: err?.response?.data?.message || err.message || "Unknown error",
        });
      }
    }

    return NextResponse.json({
      message: "Migration completed",
      summary: results,
    });
  } catch (error: any) {
    console.error("Migration fatal error:", error);
    return NextResponse.json(
      { error: error.message || "Migration process crashed" },
      { status: 500 }
    );
  }
}