import { NextRequest, NextResponse } from "next/server";
import { getUserAndConnect } from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";
import { toFrontend, toFrontendArray } from "@/utils/utils";
import "@/models/File";
import "@/models/Message";

export async function GET(req: NextRequest) {
  const userId = await getUserAndConnect(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .populate({ path: "file" })
      .populate({ path: "messages" });

    return NextResponse.json({ conversations: toFrontendArray(conversations) });
  } catch (err) {
    console.error("Failed to fetch conversations:", err);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const userId = await getUserAndConnect(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, fileId } = await req.json();
  const conversation = await Conversation.create({
    userId,
    title,
    file: fileId,
    messages: [],
  });

  return NextResponse.json({ conversation: toFrontend(conversation) });
}
