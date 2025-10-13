import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: "token",
      value: "",
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (err) {
    console.error("Logout failed:", err);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
