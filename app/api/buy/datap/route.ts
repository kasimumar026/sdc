// import { NextRequest, NextResponse } from "next/server";
// import connectDB from "@/connectDB";
// import requireAuth from "@/middlewares/authMiddleware";
// import Wallet from "@/models/walletModel";
// import DataM from "@/models/dataM";
// import Transaction from "@/models/transactionModel";
// import providerModel from "@/models/providerModel";
// import axios from "axios";

// type Body = {
//   network?: string;
//   category?: string;
//   planId?: string;
//   phone?: string;
//   pin?: string;
//   id?: string;
//   idempotencyKey?: string;
//   customer_reference?: string;
// };

// // Helper: Verify if provider response indicates actual success
// const isProviderSuccess = (res: any): boolean => {
//   if (!res) return false;
//   if (res.status === true || res.success === true) return true;

//   const statusStr = String(
//     res.status || res.Status || res.status_code || res.code || "",
//   ).toLowerCase();

//   return [
//     "success",
//     "successful",
//     "approved",
//     "completed",
//     "true",
//     "00",
//     "200",
//   ].includes(statusStr);
// };

// // Helper: Resolve provider network integer
// const getNetworkCode = (providerName: string = ""): number => {
//   const p = providerName.toLowerCase();
//   if (p.includes("mtn")) return 1;
//   if (p.includes("airtel")) return 2;
//   if (p.includes("glo")) return 3;
//   if (p.includes("9mobile") || p.includes("etisalat")) return 4;
//   return 1;
// };

// // --- Provider Handlers ---
// const buyWithBilalSadaSub = async (data: any) => {
//   const providerUrl = "https://bilalsadasub.com/api/data";
//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Token ${data.token}`,
//   };

//   const response = await axios.post(
//     providerUrl,
//     {
//       network: getNetworkCode(data.plan.provider || data.plan.network),
//       data_plan: Number(data.plan.externalId || data.plan.id),
//       phone: data.phone,
//       bypass: false,
//       "request-id": `DATA-${Date.now()}`,
//       customer_reference: data.customer_reference,
//     },
//     { headers, timeout: 15000 },
//   );

//   let responseData = response.data;
//   responseData = {
//     ...responseData,
//     message: "Success",
//   };
//   return responseData;
// };

// const buyWithRumahGlobal = async (data: any) => {
//   const providerUrl = "https://rumahglobal.com.ng/api/data/";
//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Token ${data.token}`,
//   };

//   let network_id = 1;
//   const p = (data.plan.provider || data.plan.network || "").toLowerCase();
//   if (p.includes("glo")) network_id = 2;
//   else if (p.includes("9mobile")) network_id = 3;
//   else if (p.includes("airtel")) network_id = 4;

//   const response = await axios.post(
//     providerUrl,
//     {
//       network: network_id,
//       plan: Number(data.plan.externalId || data.plan.id),
//       mobile_number: data.phone,
//       customer_reference: data.customer_reference,
//       Ported_number: false,
//     },
//     { headers, timeout: 15000 },
//   );
//   return response.data;
// };

// const buyWithSMEPlug = async (data: any) => {
//   const providerUrl = "https://smeplug.ng/api/v1/data/purchase";
//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${data.token}`,
//   };

//   const response = await axios.post(
//     providerUrl,
//     {
//       network: getNetworkCode(data.plan.provider || data.plan.network),
//       network_id: getNetworkCode(data.plan.provider || data.plan.network),
//       plan_id: Number(data.plan.externalId || data.plan.id),
//       phone: data.phone,
//       customer_reference: data.customer_reference,
//     },
//     { headers, timeout: 15000 },
//   );
//   return response.data;
// };

// // --- Main Handler ---
// export async function POST(request: NextRequest) {
//   try {
//     await connectDB();

//     const auth = await requireAuth(request);
//     if (auth instanceof NextResponse) return auth;

//     const userId = (auth as any).id?.toString?.() ?? (auth as any).id;
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body: Body = await request.json().catch(() => ({}) as Body);
//     const { planId, phone, pin, customer_reference, id, idempotencyKey } = body;

//     // 1. Validation
//     const targetPlanId = planId || id;
//     if (!targetPlanId) {
//       return NextResponse.json(
//         { error: "Plan ID is required" },
//         { status: 400 },
//       );
//     }
//     if (!phone) {
//       return NextResponse.json(
//         { error: "Phone number is required" },
//         { status: 400 },
//       );
//     }
//     if (!pin || String(pin).length !== 4) {
//       return NextResponse.json(
//         { error: "Invalid PIN format" },
//         { status: 400 },
//       );
//     }

//     if (!idempotencyKey) {
//       return NextResponse.json(
//         { error: "Idempotency key is required" },
//         { status: 400 },
//       );
//     }

//     // 2. Safe Query Plan & Provider
//     const targetPlanIdStr = String(targetPlanId);
//     const isObjectId = /^[0-9a-fA-F]{24}$/.test(targetPlanIdStr);
//     const numericId = Number(targetPlanId);

//     let plan: any = null;

//     if (isObjectId) {
//       plan = await DataM.findById(targetPlanId).lean();
//     }

//     if (!plan) {
//       plan = await DataM.findOne({
//         $or: [
//           { externalId: targetPlanIdStr },
//           ...(!isNaN(numericId) ? [{ externalId: numericId }] : []),
//           { planId: targetPlanIdStr },
//           ...(!isNaN(numericId) ? [{ planId: numericId }] : []),
//           { id: targetPlanIdStr },
//           ...(!isNaN(numericId) ? [{ id: numericId }] : []),
//         ],
//       }).lean();
//     }

//     if (!plan) {
//       return NextResponse.json(
//         { error: "Selected plan not found" },
//         { status: 404 },
//       );
//     }

//     const provider: any = await providerModel.findById(plan.providerId).lean();
//     if (!provider) {
//       return NextResponse.json(
//         { error: "Data provider unavailable" },
//         { status: 404 },
//       );
//     }

//     const planAmount = Number(plan.amount);

//     // 3. Query Wallet & Check PIN / Balance
//     const wallet = await Wallet.findOne({ userId });
//     if (!wallet) {
//       return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
//     }
//     if (wallet.isLocked) {
//       return NextResponse.json({ error: "Wallet is locked" }, { status: 403 });
//     }
//     if (String(wallet.pin) !== String(pin)) {
//       return NextResponse.json(
//         { error: "Invalid transaction PIN" },
//         { status: 401 },
//       );
//     }
//     if (Number(wallet.balance) < planAmount) {
//       return NextResponse.json(
//         { error: "Insufficient wallet balance" },
//         { status: 400 },
//       );
//     }

//     // 4. Dispatch Provider API Request
//     const custRef = customer_reference || `DATA-${Date.now()}`;
//     const payload = {
//       phone,
//       plan,
//       userId,
//       token: provider.apiKey || provider.token || plan.token,
//       customer_reference: custRef,
//     };

//     let apiResponse: any = null;
//     const providerUrl = provider.url?.toLowerCase() || "";

//     try {
//       if (providerUrl.includes("rumahglobal")) {
//         apiResponse = await buyWithRumahGlobal(payload);
//       } else if (providerUrl.includes("bilalsadasub")) {
//         apiResponse = await buyWithBilalSadaSub(payload);
//       } else if (providerUrl.includes("smeplug")) {
//         apiResponse = await buyWithSMEPlug(payload);
//       } else {
//         return NextResponse.json(
//           { error: "Unsupported API Provider" },
//           { status: 400 },
//         );
//       }

//       // 5. Verify Internal API Success
//       if (!isProviderSuccess(apiResponse)) {
//         throw new Error(
//           apiResponse?.message ||
//             apiResponse?.msg ||
//             apiResponse?.error ||
//             "Provider rejected the data purchase request",
//         );
//       }
//     } catch (apiError: any) {
//       console.error(
//         "Provider Error:",
//         apiError?.response?.data || apiError?.message,
//       );

//       const errorMsg =
//         apiError?.response?.data ||
//         apiError?.message ||
//         "Provider Purchase Error";

//       // Log Failed Transaction
//       await Transaction.create({
//         userId,
//         type: "data",
//         amount: planAmount,
//         txRef: `FAIL-${custRef}`,
//         providerResponse: errorMsg,
//         meta: { plan: plan.name, phone, provider: plan.provider },
//         status: "failed",
//       });

//       return NextResponse.json(
//         { error: "Provider failed to fulfill request", details: errorMsg },
//         { status: 502 },
//       );
//     }

//     // 6. Deduct Balance after Verified Provider Success
//     const updatedWallet = await Wallet.findOneAndUpdate(
//       { userId, balance: { $gte: planAmount } },
//       { $inc: { balance: -planAmount } },
//       { new: true },
//     );

//     if (!updatedWallet) {
//       return NextResponse.json(
//         { error: "Insufficient funds or concurrent transaction detected" },
//         { status: 400 },
//       );
//     }

//     // 7. Audit Log: Record Successful Transaction
//     const txRef = idempotencyKey;
//     const transaction = await Transaction.create({
//       userId,
//       type: "data",
//       amount: planAmount,
//       txRef,
//       providerResponse: apiResponse,
//       meta: { plan: plan.name, phone, provider: plan.provider },
//       status: "success",
//     });

//     return NextResponse.json(
//       {
//         message: "Data purchase successful",
//         phone,
//         amount: planAmount,
//         txRef: transaction.txRef,
//         newBalance: updatedWallet.balance,
//         providerResponse: apiResponse,
//       },
//       { status: 200 },
//     );
//   } catch (err: any) {
//     console.error("Data purchase route error:", err);
//     return NextResponse.json(
//       { error: "Internal Server Error", details: err?.message },
//       { status: 500 },
//     );
//   }
// }

// export async function GET() {
//   return NextResponse.json({
//     message: "Use POST method to purchase data bundles.",
//   });
// }

const hmz: any = 0

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/connectDB";
import requireAuth from "@/middlewares/authMiddleware";

import Wallet from "@/models/walletModel";
import DataM from "@/models/dataM";
import Transaction from "@/models/transactionModel";
import providerModel from "@/models/providerModel";

import axios from "axios";

type Body = {
  network?: string;
  category?: string;
  planId?: string;
  phone?: string;
  pin?: string;
  id?: string;

  // Must be generated by the client ONCE per logical purchase.
  // Retries must reuse the same key.
  idempotencyKey?: string;

  // Optional provider/customer reference.
  customer_reference?: string;
};

/**
 * Verify if provider response indicates actual success.
 */
const isProviderSuccess = (res: any): boolean => {
  if (!res) return false;

  if (res.status === true || res.success === true || res.ok) {
    return true;
  }

  const statusStr = String(
    res.status || res.Status || res.status_code || res.code || "",
  ).toLowerCase();

  return [
    "success",
    "successful",
    "approved",
    "completed",
    "true",
    "00",
    "200",
  ].includes(statusStr);
};

/**
 * Resolve provider network integer.
 */
const getNetworkCode = (providerName: string = ""): number => {
  const p = providerName.toLowerCase();

  if (p.includes("mtn")) return 1;
  if (p.includes("airtel")) return 2;
  if (p.includes("glo")) return 3;
  if (p.includes("9mobile") || p.includes("etisalat")) return 4;

  return 1;
};

/**
 * Provider: Bilal Sada Sub
 */
const buyWithBilalSadaSub = async (data: any) => {
  const providerUrl = "https://bilalsadasub.com/api/data";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Token ${data.token}`,
  };

  const response = await axios.post(
    providerUrl,
    {
      network: getNetworkCode(data.plan.provider || data.plan.network),

      data_plan: Number(data.plan.externalId || data.plan.id),

      phone: data.phone,

      bypass: false,

      // IMPORTANT:
      // Use the same reference for retries.
      "request-id": data.customer_reference,

      customer_reference: data.customer_reference,
    },
    {
      headers,
    },
  );

  return {
    ...response.data,
    message: "Success",
  };
};

/**
 * Provider: Rumah Global
 */
const buyWithRumahGlobal = async (data: any) => {
  const providerUrl = "https://rumahglobal.com.ng/api/data/";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Token ${data.token}`,
  };

  let network_id = 1;

  const p = (data.plan.provider || data.plan.network || "").toLowerCase();

  if (p.includes("glo")) {
    network_id = 2;
  } else if (p.includes("9mobile")) {
    network_id = 3;
  } else if (p.includes("airtel")) {
    network_id = 4;
  }

  const response = await axios.post(
    providerUrl,
    {
      network: network_id,

      plan: Number(data.plan.externalId || data.plan.id),

      mobile_number: data.phone,

      customer_reference: data.customer_reference,

      Ported_number: false,
    },
    {
      headers,
    },
  );

  return response.data;
};

/**
 * Provider: SME Plug
 */
const buyWithSMEPlug = async (data: any) => {
  const providerUrl = "https://smeplug.ng/api/v1/data/purchase";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.token}`,
  };

  const response = await axios.post(
    providerUrl,
    {
      network: getNetworkCode(data.plan.provider || data.plan.network),

      network_id: getNetworkCode(data.plan.provider || data.plan.network),

      plan_id: Number(data.plan.externalId || data.plan.id),

      phone: data.phone,

      customer_reference: data.customer_reference,
    },
    {
      headers,
    },
  );

  return response.data;
};

/**
 * Provider: Arewa247 Partner API
 */
const buyWithArewa247 = async (data: any) => {
  const apiKey = "AREWA247-API-KEY-9e3f1c8b0a5d4e2f8b6c7d9e1a2b3c4d";
 

  const response = await axios.post(
    "https://arewa247.com.ng/api/partner/v1/purchase/data",
    {
      network: "MTN",
      phone: data.phone,
      plan_id: 8,
      ported_number: false,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        "X-Idempotency-Key": data.customer_reference,
      },
      timeout: 15000,
    },
  );

  return response.data;
};

/**
 * Main purchase handler.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // --------------------------------------------------
    // 1. Authentication
    // --------------------------------------------------

    const auth = await requireAuth(request);

    if (auth instanceof NextResponse) {
      return auth;
    }

    const userId = (auth as any).id?.toString?.() ?? (auth as any).id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --------------------------------------------------
    // 2. Read request
    // --------------------------------------------------

    const body: Body = await request.json().catch(() => ({}) as Body);

    const { planId, phone, pin, customer_reference, id, idempotencyKey } = body;

    // --------------------------------------------------
    // 3. Validate idempotency key
    // --------------------------------------------------

    if (!idempotencyKey) {
      return NextResponse.json(
        {
          error: "Idempotency key is required",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // 4. Basic validation
    // --------------------------------------------------

    const targetPlanId = planId || id;

    if (!targetPlanId) {
      return NextResponse.json(
        {
          error: "Plan ID is required",
        },
        { status: 400 },
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          error: "Phone number is required",
        },
        { status: 400 },
      );
    }

    if (!pin || String(pin).length !== 4) {
      return NextResponse.json(
        {
          error: "Invalid PIN format",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // 5. Find plan
    // --------------------------------------------------

    const targetPlanIdStr = String(targetPlanId);

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(targetPlanIdStr);

    const numericId = Number(targetPlanId);

    let plan: any = null;

    if (isObjectId) {
      plan = await DataM.findById(targetPlanId).lean();
    }

    if (!plan) {
      plan = await DataM.findOne({
        $or: [
          {
            externalId: targetPlanIdStr,
          },

          ...(!isNaN(numericId)
            ? [
                {
                  externalId: numericId,
                },
              ]
            : []),

          {
            planId: targetPlanIdStr,
          },

          ...(!isNaN(numericId)
            ? [
                {
                  planId: numericId,
                },
              ]
            : []),

          {
            id: targetPlanIdStr,
          },

          ...(!isNaN(numericId)
            ? [
                {
                  id: numericId,
                },
              ]
            : []),
        ],
      }).lean();
    }

    if (!plan) {
      return NextResponse.json(
        {
          error: "Selected plan not found",
        },
        { status: 404 },
      );
    }

    // --------------------------------------------------
    // 6. Find provider
    // --------------------------------------------------

    const provider = await providerModel.findById(plan.providerId).lean();

    if (!provider) {
      return NextResponse.json(
        {
          error: "Data provider unavailable",
        },
        { status: 404 },
      );
    }

    const planAmount = Number(plan.amount);

    if (!Number.isFinite(planAmount) || planAmount <= 0) {
      return NextResponse.json(
        {
          error: "Invalid plan amount",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // 7. Check wallet
    // --------------------------------------------------

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return NextResponse.json(
        {
          error: "Wallet not found",
        },
        { status: 404 },
      );
    }

    if (wallet.isLocked) {
      return NextResponse.json(
        {
          error: "Wallet is locked",
        },
        { status: 403 },
      );
    }

    if (String(wallet.pin) !== String(pin)) {
      return NextResponse.json(
        {
          error: "Invalid transaction PIN",
        },
        { status: 401 },
      );
    }

    if (Number(wallet.balance) < planAmount) {
      return NextResponse.json(
        {
          error: "Insufficient wallet balance",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // 8. IDEMPOTENCY
    //
    // Try to create the transaction FIRST.
    //
    // txRef is unique in your Transaction model.
    // Therefore two requests with the same
    // idempotencyKey cannot both create a transaction.
    // --------------------------------------------------

    const txRef = String(idempotencyKey);

    let transaction: any;

    try {
      transaction = await Transaction.create({
        userId,
        type: "data",
        amount: planAmount,
        txRef,
        providerResponse: {},
        meta: {
          plan: plan.name,
          phone,
          provider: plan.provider,
          planId: targetPlanIdStr,
          idempotencyKey: txRef,
        },
        status: "pending",
      });
    } catch (error: any) {
      // ----------------------------------------------
      // Duplicate idempotency key
      // ----------------------------------------------

      if (error?.code === 11000) {
        const existingTransaction = await Transaction.findOne({
          userId,
          txRef,
        }).lean();

        if (!existingTransaction) {
          return NextResponse.json(
            {
              error: "Purchase is already being processed",
              txRef,
            },
            { status: 409 },
          );
        }

        // --------------------------------------------
        // Already completed
        // --------------------------------------------

        if (existingTransaction.status === "success") {
          return NextResponse.json(
            {
              message: "Data purchase successful",
              phone,
              amount: existingTransaction.amount,
              txRef: existingTransaction.txRef,
              transaction: existingTransaction,
            },
            { status: 200 },
          );
        }

        // --------------------------------------------
        // Still processing
        // --------------------------------------------

        if (existingTransaction.status === "pending") {
          return NextResponse.json(
            {
              message: "Purchase is already being processed",
              txRef: existingTransaction.txRef,
              status: existingTransaction.status,
            },
            { status: 202 },
          );
        }

        // --------------------------------------------
        // Previously failed
        //
        // Do NOT retry using the same key.
        // The client must create a new logical
        // purchase/idempotency key.
        // --------------------------------------------

        if (existingTransaction.status === "failed") {
          return NextResponse.json(
            {
              error: "This purchase request has already failed",
              txRef: existingTransaction.txRef,
              status: existingTransaction.status,
            },
            { status: 409 },
          );
        }
      }

      throw error;
    }

    // --------------------------------------------------
    // 9. Deduct wallet BEFORE provider call
    // --------------------------------------------------
    //
    // This protects us from:
    //
    // provider succeeds
    // ↓
    // server crashes
    // ↓
    // wallet deduction never happens
    //
    // The wallet update is atomic.
    // --------------------------------------------------

    const updatedWallet = await Wallet.findOneAndUpdate(
      {
        userId,
        balance: {
          $gte: planAmount,
        },
      },

      {
        $inc: {
          balance: -planAmount,
        },
      },

      {
        new: true,
      },
    );

    if (!updatedWallet) {
      await Transaction.findOneAndUpdate(
        {
          userId,
          txRef,
        },
        {
          $set: {
            status: "failed",

            providerResponse: {
              error: "Insufficient funds",
            },
          },
        },
      );

      return NextResponse.json(
        {
          error: "Insufficient funds",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // 10. Prepare provider request
    // --------------------------------------------------

    const custRef = customer_reference || idempotencyKey;
    const payload = {
      phone,
      plan,
      userId,
      token: (provider as any).apiKey || (provider as any).token || plan.token,
      customer_reference: custRef,
    };

    // --------------------------------------------------
    // 11. Call provider
    // --------------------------------------------------

    let apiResponse: any = null;

    const providerUrl = (provider as any).url?.toLowerCase() || "";

    try {
      if (providerUrl.includes("rumahglobal")) {
        apiResponse = await buyWithRumahGlobal(payload);
      } else if (providerUrl.includes("bilalsadasub")) {
        apiResponse = await buyWithBilalSadaSub(payload);
      } else if (providerUrl.includes("smeplug")) {
        apiResponse = await buyWithSMEPlug(payload);
      } else {
        apiResponse = await buyWithArewa247(payload);
      }

      // ----------------------------------------------
      // 12. Verify provider response
      // ----------------------------------------------

      if (!isProviderSuccess(apiResponse)) {
        throw new Error(
          apiResponse?.message ||
            apiResponse?.msg ||
            apiResponse?.error ||
            "Provider rejected the data purchase request",
        );
      }
    } catch (apiError: any) {
      console.error(
        "Provider Error:",
        apiError?.response?.data || apiError?.message,
      );

      const errorMsg =
        apiError?.response?.data ||
        apiError?.message ||
        "Provider Purchase Error";

      // ----------------------------------------------
      // 13. Refund wallet
      // ----------------------------------------------

      await Wallet.findOneAndUpdate(
        { userId },

        {
          $inc: {
            balance: planAmount,
          },
        },
      );

      // ----------------------------------------------
      // 14. Mark transaction failed
      // ----------------------------------------------

      await Transaction.findOneAndUpdate(
        {
          userId,
          txRef,
          status: "pending",
        },
        {
          $set: {
            status: "failed",
            providerResponse: errorMsg,
          },
        },
      );

      return NextResponse.json(
        {
          error: "Provider failed to fulfill request",
          txRef,
        },
        { status: 502 },
      );
    }

    // --------------------------------------------------
    // 15. Mark transaction successful
    // --------------------------------------------------

    const providerReference =
      apiResponse?.txRef || apiResponse?.reference || null;
    const completedTransaction = await Transaction.findOneAndUpdate(
      {
        userId,
        txRef,
        status: "pending",
      },

      {
        $set: {
          status: "success",
          providerResponse: apiResponse,
          "meta.providerReference": providerReference,
        },
      },

      {
        new: true,
      },
    ).lean();

    // --------------------------------------------------
    // 16. Final response
    // --------------------------------------------------

    return NextResponse.json(
      {
        message: "Data purchase successful",
        phone,
        amount: planAmount,
        txRef,
        newBalance: updatedWallet.balance,
        providerResponse: apiResponse,
        transaction: completedTransaction,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Data purchase route error:", err);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: err?.message,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to purchase data bundles.",
  });
}
