import { openai } from "@/lib/openai";
import { Conversation } from "@/models/Conversation";
import { NextRequest, NextResponse } from "next/server";
import { getUserAndConnect } from "@/lib/mongodb";
import { Message } from "@/types/message";

export async function POST(req: NextRequest) {
  const userId = await getUserAndConnect(req);

  const { conversation } = await req.json();
  if (!conversation) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const textContent = conversation.messages
    .map((m: Message) => m.content)
    .join(" ");

  console.log("compressing messages ", conversation.messages, textContent);

  const titlePrompt = `Suggest a concise conversation title for: "${textContent}"`;
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
