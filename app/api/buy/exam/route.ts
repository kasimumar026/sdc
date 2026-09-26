import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/connectDB";
import requireAuth from "@/middlewares/authMiddleware";
import Wallet from "@/models/walletModel";
import Transaction from "@/models/transactionModel";
import axios from "axios";

type Body = {
	exam?: string | number;
	quantity?: number | string;
	pin?: string;
};

export async function POST(request: NextRequest) {
	try {
		await connectDB();

		const auth = await requireAuth(request);
		if (auth instanceof NextResponse) return auth;

		const userId = (auth as any).id?.toString?.() ?? (auth as any).id;
		if (!userId)
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const body: Body = await request.json().catch(() => ({} as Body));
		const { exam, quantity, pin } = body;

		if (exam === undefined || exam === null)
			return NextResponse.json({ error: "Exam id is required" }, { status: 400 });

			const qty = Number(quantity || 1);
			if (!qty || qty <= 0) return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });

			// server-side exam price mapping (do not trust client for prices)
			const EXAM_PRICES: Record<string | number, number> = {
				1: 3400, // WAEC
				2: 1200, // NECO
				3: 850, // NABTEB
			};

			const pricePer = EXAM_PRICES[exam as any];
			if (!pricePer) {
				return NextResponse.json({ error: "Invalid exam id or pricing not available" }, { status: 400 });
			}

			const numAmount = Number(pricePer) * qty;

		if (!pin || String(pin).length !== 4)
			return NextResponse.json({ error: "Invalid PIN" }, { status: 400 });

		// load wallet
		const wallet = await Wallet.findOne({ userId });
		if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
		if (wallet.isLocked) return NextResponse.json({ error: "Wallet is locked" }, { status: 403 });
		if (String(wallet.pin) !== String(pin))
			return NextResponse.json({ error: "Invalid wallet PIN" }, { status: 401 });
		if (Number(wallet.balance) < numAmount)
			return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });

		// prepare provider payload
				const payload: any = {
					exam: exam,
					quantity: qty,
					// price and total are server-side only, not sent by client for trust reasons
				};

		// provider endpoint
		const baseUrl = process.env.BILALSADASUB_BASE_URL?.replace(/\/$/, "") || "https://bilalsadasub.com/api";
		const providerUrl = `${baseUrl}/exam`;

		try {
			let providerResponse: any = null;

			const headers: any = { "Content-Type": "application/json" };
			if (process.env.TOKEN) {
				headers.Authorization = `Token ${process.env.TOKEN}`;
			} else if (process.env.BILALSADASUB_USERNAME && process.env.BILALSADASUB_PASSWORD) {
				const creds = Buffer.from(`${process.env.BILALSADASUB_USERNAME}:${process.env.BILALSADASUB_PASSWORD}`).toString("base64");
				headers.Authorization = `Basic ${creds}`;
			}

			const res = await axios.post(providerUrl, payload, { headers });
			providerResponse = res.data;

			const success =
				providerResponse?.status === "success" ||
				providerResponse?.success === true ||
				(providerResponse?.code && String(providerResponse.code).startsWith("2"));

					if (!success) {
						const txRefFail = providerResponse?.txRef || providerResponse?.reference || `FAIL-EXAM-${Date.now()}`;
						await Transaction.create({
							userId,
							type: "exam",
							amount: numAmount,
							txRef: txRefFail,
							providerResponse,
							meta: { exam, quantity: qty, pricePer },
							status: "failed",
						});

				return NextResponse.json({ error: "Provider reported failure", provider: providerResponse }, { status: 502 });
			}

			// Deduct wallet on success
			wallet.balance = Number(wallet.balance) - numAmount;
			wallet.ledgerBalance = Number(wallet.ledgerBalance) - numAmount;
			await wallet.save();

			// record successful transaction
			const txRef = providerResponse?.txRef || providerResponse?.reference || `SIM-EXAM-${Date.now()}`;
					await Transaction.create({
						userId,
						type: "exam",
						amount: numAmount,
						txRef,
						providerResponse,
						meta: { exam, quantity: qty, pricePer },
						status: "success",
					});

			return NextResponse.json({ message: "Exam purchase successful", provider: providerResponse, wallet, txRef }, { status: 200 });
		} catch (err: any) {
			console.error("Provider call error:", err?.response || err?.message || err);
			const message = err?.response?.data || err?.message || "Provider error";
			// record failed transaction
			const failRef = `FAIL-EXAM-${Date.now()}`;
			await Transaction.create({
				userId,
				type: "exam",
				amount: numAmount,
				txRef: failRef,
				providerResponse: err?.response?.data || { message },
				meta: { exam, quantity: qty },
				status: "failed",
			});

			return NextResponse.json({ error: "Provider error", details: message }, { status: 502 });
		}
	} catch (error: any) {
		console.error("buy/exam error:", error);
		return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
	}
}

export async function GET() {
	return NextResponse.json({ message: "Use POST to buy exam" });
}

