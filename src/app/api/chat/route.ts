import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { connectToDatabase } from "@/lib/mongodb";
import { Message } from "@/models/Message";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { conversationId, messages } = await req.json();

    console.log(conversationId, messages);

    if (!conversationId) {
      return NextResponse.json(
        { error: "Missing conversationId" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const latestUserMessage = messages[messages.length - 1];
    if (latestUserMessage?.role === "user") {
      await Message.create({
        conversationId,
        role: "user",
        content: latestUserMessage.content,
        senderId: latestUserMessage.senderId,
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

    const assistantMessage = await Message.create({
      conversationId,
      role: "assistant",
      content: replyText,
      voiceBase64: audioBase64,
      senderId: "000",
    });

    return NextResponse.json({
      reply: assistantMessage,
    });
  } catch (err) {
    console.error("Error in chat route:", err);
    return NextResponse.json({ error: "Chat or TTS failed" }, { status: 500 });
  }
}
