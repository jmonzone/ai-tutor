import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { toFrontend } from "@/utils/utils";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValid = await user.comparePassword(password);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return NextResponse.json({
    success: true,
    token,
    user: toFrontend(user),
  });
}
