import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Message } from "@/models/Message";
import { getUserAndConnect } from "@/lib/mongodb";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserAndConnect(req);
    const { conversationId, messages } = await req.json();

    console.log(conversationId, messages);

    if (!conversationId) {
      return NextResponse.json(
        { error: "Missing conversationId" },
        { status: 400 }
      );
    }

    const latestUserMessage = messages[messages.length - 1];
    if (latestUserMessage?.role === "user" && userId) {
      await Message.create({
        conversationId,
        role: "user",
        content: latestUserMessage.content,
        userId,
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const replyText = completion.choices[0].message?.content || "";

    const ttsResponse = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: replyText,
    });

    const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
    const audioBase64 = audioBuffer.toString("base64");

    let assistantMessage;
    if (userId) {
      assistantMessage = await Message.create({
        conversationId,
        role: "assistant",
        content: replyText,
        voiceBase64: audioBase64,
        userId,
      });
    } else {
      assistantMessage = {
        conversationId,
        role: "assistant",
        content: replyText,
        voiceBase64: audioBase64,
        userId,
      };
    }

    return NextResponse.json({ reply: assistantMessage });
  } catch (err) {
    console.error("Error in chat route:", err);
    return NextResponse.json({ error: "Chat or TTS failed" }, { status: 500 });
  }
}
