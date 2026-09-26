import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/helpers/jwt";
import { getCookies } from "next-client-cookies/server";

export async function requireAuth(request: NextRequest) {
  try {
    const cookies = await getCookies();
    const token = cookies.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: no token" },
        { status: 401 }
      );
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json(
        { message: "Unauthorized: invalid token" },
        { status: 401 }
      );
    }

    return payload;
  } catch (error) {
    console.error("authMiddleware error:", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export default requireAuth;
