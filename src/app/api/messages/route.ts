import { connectToDatabase } from "@/lib/mongodb";
import { Message } from "@/models/Message";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const conversationId = url.searchParams.get("conversationId");
    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: "Missing conversationId" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    return NextResponse.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
