import { openai } from "@/lib/openai";
import { Conversation } from "@/models/Conversation";
import { NextRequest, NextResponse } from "next/server";
import { getUserAndConnect } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const userId = await getUserAndConnect(req);

  const { conversation, pages } = await req.json();
  if (!conversation || !pages) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  console.log("updating title");
  const condensedPages = pages
    .slice(0, 3)
    .map((p: string) => p.slice(0, 800))
    .join(" ");

  const titlePrompt = `Suggest a concise conversation title for: "${condensedPages}`;
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
