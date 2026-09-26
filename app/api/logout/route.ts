import { NextRequest, NextResponse } from "next/server";

export async function POST(_: NextRequest) {
  try {
    // Clear the token cookie by setting it with Max-Age=0
    return NextResponse.json(
      { message: "Logged out" },
      {
        status: 200,
        headers: {
          "Set-Cookie": `token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
        },
      }
    );
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: error?.message || "Logout failed" }, { status: 500 });
  }
}
