// app/api/auth/validate/route.ts
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    console.log(json);
    const { token } = json;
    if (!token) {
      return NextResponse.json(
        { valid: false, error: "No token provided" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = verify(token, secret) as { userId: string; email?: string };

    return NextResponse.json({
      valid: true,
      userId: decoded.userId,
      email: decoded.email || null,
    });
  } catch (err) {
    console.error("Token validation failed:", err);
    return NextResponse.json(
      { valid: false, error: "Invalid token" },
      { status: 401 }
    );
  }
}
