import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "./helpers/jwt";

interface CustomNextRequest extends NextRequest {
  user: any;
}

export async function proxy(req: CustomNextRequest) {
  const token: any = req.cookies.get("token")?.value;

  // if there's no token, redirect to home page if trying to access dashboard or admin
  if (!token) {
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      // redirect to home page
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (req.nextUrl.pathname === "/admin") {
      // redirect to home page, admin page should not be accessible without token
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  try {
    const decoded: any = await verifyJwt(token);
    console.log("decoded token:", decoded);

    if (decoded) {
      if (req.nextUrl.pathname === "/") {
        // if admin redirect to admin
        if (decoded.role === "admin") {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (req.nextUrl.pathname.startsWith("/admin")) {
        if (decoded.role !== "admin") {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }

      req.headers.set("user", JSON.stringify(decoded));

      return NextResponse.next();
    } else {
      if (
        req.nextUrl.pathname.startsWith("/dashboard") ||
        req.nextUrl.pathname.startsWith("/admin")
      ) {
        const response = NextResponse.next();
        // response.cookies.delete("token");

        if (req.nextUrl.pathname.startsWith("/api/")) {
          return NextResponse.json(
            { message: "Invalid or expired token" },
            { status: 401 },
          );
        }

        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  } catch (error) {}

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"], // updated to match all pages
};
