import { NextRequest, NextResponse } from "next/server";

const CLEAR_TOKEN_COOKIE = `token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;

export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const redirectTo = new URL("/auth/login", url.origin);
		return NextResponse.redirect(redirectTo, {
			headers: { "Set-Cookie": CLEAR_TOKEN_COOKIE },
		});
	} catch (error: any) {
		console.error("Logout (GET) error:", error);
		return NextResponse.json({ error: error?.message || "Logout failed" }, { status: 500 });
	}
}

export async function POST(_: NextRequest) {
	try {
		// For POST requests (e.g., fetch from client) return JSON and clear cookie
		return NextResponse.json(
			{ message: "Logged out" },
			{
				status: 200,
				headers: {
					"Set-Cookie": CLEAR_TOKEN_COOKIE,
				},
			}
		);
	} catch (error: any) {
		console.error("Logout (POST) error:", error);
		return NextResponse.json({ error: error?.message || "Logout failed" }, { status: 500 });
	}
}

