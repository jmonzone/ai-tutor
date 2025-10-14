import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/models/Message";
import { getUserAndConnect } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const conversationId = url.searchParams.get("conversationId");
    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: "Missing conversationId" },
        { status: 400 }
      );
    }

    const userId = await getUserAndConnect(req);
    if (!userId) return NextResponse.json({ success: true, messages: [] });

    const messages = await Message.find({ conversationId, userId }).sort({
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
