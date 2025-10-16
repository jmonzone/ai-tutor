import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getUserAndConnect } from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import { OpenAIMessage } from "@/types/message";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserAndConnect(req);
    const { conversationId, messages, fileText } = await req.json();

    console.log("sending message", conversationId, messages, fileText);

    if (!conversationId) {
      return NextResponse.json(
        { error: "Missing conversationId" },
        { status: 400 }
      );
    }

    const latestUserMessage = messages[messages.length - 1];

    const systemPrompt = fileText
      ? `You are an AI assistant helping a user study a document. The following is the content of the document:\n\n"""${fileText.slice(
          0,
          8000
        )}"""\n\nUse this as context to answer questions or explain related concepts, but give a very quick summary.`
      : "You are an AI assistant. Answer naturally and clearly.";

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: OpenAIMessage) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      temperature: 0.3,
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
