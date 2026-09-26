import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/connectDB";
import requireAuth from "@/middlewares/authMiddleware";
import transactionModel from "@/models/transactionModel";


export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const url = new URL(request.url);
        const id = url.pathname.split("/").pop();

        if (!id) {
            return NextResponse.json({ message: "Transaction ID is required" }, { status: 400 });
        }

        const transaction = await transactionModel.findById(id);

        if (!transaction) {
            return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
        }

        return NextResponse.json(transaction);
    } catch (error: any) {
        console.error("Error while fetching transaction:", error);
        return NextResponse.json(
            { message: "Error", error: error.message },
            { status: 500 }
        );
    }
}

// working
