import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // 1. Get chat text reply
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const replyText = completion.choices[0].message?.content || "";

    // 2. Generate TTS audio for the reply
    const ttsResponse = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy", // choose a voice
      input: replyText,
    });

    // Convert TTS response to Base64 so the frontend can play it
    const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
    const audioBase64 = audioBuffer.toString("base64");

    return NextResponse.json({
      reply: {
        role: "assistant",
        content: replyText,
        voiceBase64: audioBase64,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Chat or TTS failed" }, { status: 500 });
  }
}
