import connectDB from "@/connectDB";
import requireAuth from "@/middlewares/authMiddleware";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const userId = (auth as any).id?.toString?.() ?? (auth as any).id;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, firstName, lastName, phone } = await request.json();

    if (!email || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "Missing required customer details" },
        { status: 400 },
      );
    }

    // 1. Create the customer on Paystack
    // const customerResponse = await fetch("https://api.paystack.co/customer", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET_KEY}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     email,
    //     first_name: firstName,
    //     last_name: lastName,
    //     phone,
    //     metadata: { userId }, // Tie it back to your internal DB user ID
    //   }),
    // });

    // const customerData = await customerResponse.json();
    // if (!customerData.status) {
    //   return NextResponse.json(
    //     { error: customerData.message },
    //     { status: 400 },
    //   );
    // }

    // const customerCode = customerData.data.customer_code;

    // console.log("Customer created successfully:", customerCode);

    // // 2. Generate the Dedicated Virtual Account for this customer
    const accountResponse = await fetch(
      "https://api.paystack.co/dedicated_account/assign",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
          country: "NG",
          
          //  preferred_bank: "test-bank",
          // customer: customerCode,
          preferred_bank: "titan-paystack" // Optional: leave blank for Paystack to auto-select
        }),
      },
    );

    const accountData = await accountResponse.json();
    if (!accountData.status) {
      return NextResponse.json({ error: accountData.message }, { status: 400 });
    }

    // 3. Success! Save accountData.data to your database (MongoDB/Prisma/etc.) here.
    // accountData.data.account_number and accountData.data.bank.name contain the details.

    return NextResponse.json(
      { success: true, accountData: accountData },
      { status: 200 },
    );
  } catch (error) {
    console.error("Virtual account generation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
