import { openai } from "@/lib/openai";
import { Conversation } from "@/models/Conversation";
import { NextRequest, NextResponse } from "next/server";
import { getUserAndConnect } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const userId = await getUserAndConnect(req);

  const { conversation } = await req.json();
  if (!conversation) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const titlePrompt = `Suggest a concise conversation title for: "${conversation.messages}"`;
  const titleCompletion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: titlePrompt }],
  });

  const rawTitle = titleCompletion.choices[0].message?.content || "";
  const newTitle = rawTitle.trim().replace(/^["']|["']$/g, "");

  if (userId && newTitle) {
    await Conversation.findByIdAndUpdate(conversation.id, { title: newTitle });
  }

  return NextResponse.json({ title: newTitle });
}
