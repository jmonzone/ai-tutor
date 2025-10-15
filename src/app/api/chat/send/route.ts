import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getUserAndConnect } from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";

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

    const assistantMessage = {
      userId,
      conversationId,
      role: "assistant",
      content: replyText,
      voiceBase64: audioBase64,
    };

    if (userId && conversationId) {
      (async () => {
        try {
          const [userMsgDoc, assistantMsgDoc] = await Promise.all([
            Message.create(latestUserMessage),
            Message.create(assistantMessage),
          ]);

          await Conversation.findByIdAndUpdate(conversationId, {
            $push: {
              messages: { $each: [userMsgDoc._id, assistantMsgDoc._id] },
            },
          });
        } catch (err) {
          console.error("Background save failed:", err);
        }
      })();
    }

    return NextResponse.json({ reply: assistantMessage });
  } catch (err) {
    console.error("Error in chat route:", err);
    return NextResponse.json({ error: "Chat or TTS failed" }, { status: 500 });
  }
}
