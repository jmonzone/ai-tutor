import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getUserAndConnect } from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import { OpenAIMessage } from "@/types/message";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserAndConnect(req);
    const { conversation } = await req.json();

    if (!conversation?.id) {
      return NextResponse.json(
        { error: "Missing conversation" },
        { status: 400 }
      );
    }

    const { id, messages, pages } = conversation;
    const latestUserMessage = messages[messages.length - 1];

    const threshold = 0.2;

    const cosineSimilarity = (a: number[], b: number[]) => {
      const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
      return dot / (magA * magB);
    };

    console.log("calculating page embeddings");
    const pageEmbeddings = await Promise.all(
      pages.map((text: string) =>
        openai.embeddings
          .create({ model: "text-embedding-3-small", input: text })
          .then((res) => res.data[0].embedding as number[])
      )
    );
    console.log("calculating page embeddings complete");

    const questionEmbedding = (
      await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: latestUserMessage.content,
      })
    ).data[0].embedding as number[];

    const MIN_LENGTH = 5;
    const LENGTH_PENALTY = 0.5;

    const scoredPages = pageEmbeddings
      .map((emb, i) => {
        const similarity = cosineSimilarity(emb, questionEmbedding);
        const length = pages[i].length;
        const penalty = length < MIN_LENGTH ? LENGTH_PENALTY : 1.0;
        return {
          index: i,
          sim: similarity * penalty,
        };
      })
      .sort((a, b) => b.sim - a.sim);

    console.log(scoredPages);

    const relevantPages = scoredPages
      .filter((p) => p.sim >= threshold)
      .sort((a, b) => b.sim - a.sim);

    const pagesToUse =
      relevantPages.length > 0
        ? relevantPages.map((p) => ({
            page: p.index + 1,
            text: pages[p.index],
            similarity: p.sim,
          }))
        : pages.slice(0, 3).map((text, i) => ({
            page: i + 1,
            text,
            similarity: 0,
          }));

    const topPage = pagesToUse[0];

    const systemPrompt = `
You are an assistant helping the user understand a PDF document.
Use ONLY the provided text to answer the user's question.
Respond ONLY in valid JSON like:
{ "quote": "<relevant text>" }
`;

    const chatMessages: OpenAIMessage[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `
User question:
"${latestUserMessage.content}"

Document:
${topPage.text.slice(0, 120000)}
    `,
      },
    ];

    const relevance = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(relevance.choices[0].message?.content || "{}");
    const { quote } = result;

    // Convert quote into array of lines
    const quoteLines = quote
      .split(/\r?\n/) // split by newlines
      .map((line) => line.trim()) // trim whitespace
      .filter((line) => line.length > 0); // remove empty lines

    console.log("Quote lines:", quoteLines);

    const summarizePrompt = `
You are an AI assistant responding to a user's question using a quote from a document.
Include page references like (page ${topPage.page}) and stay concise and factual.
Do not include info from outside the document.

Quote:
${quote}
`;

    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: summarizePrompt },
        latestUserMessage,
      ],
      temperature: 0.5,
    });

    const summary = summaryResponse.choices[0].message?.content || "";

    const assistantContent = JSON.stringify(
      { page: topPage.page, similarity: topPage.similarity, quote, summary },
      null,
      2
    );

    console.log("Assistant content:", assistantContent);

    const tts = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: summary,
    });
    const audioBase64 = Buffer.from(await tts.arrayBuffer()).toString("base64");

    const assistantMessage = {
      userId,
      conversationId: id,
      role: "assistant",
      content: summary,
      vpoce: audioBase64,
    };

    if (userId && id) {
      (async () => {
        try {
          const [userMsgDoc, assistantMsgDoc] = await Promise.all([
            Message.create(latestUserMessage),
            Message.create(assistantMessage),
          ]);
          await Conversation.findByIdAndUpdate(id, {
            $push: {
              messages: { $each: [userMsgDoc._id, assistantMsgDoc._id] },
            },
          });
        } catch (err) {
          console.error("Background save failed:", err);
        }
      })();
    }

    return NextResponse.json({
      reply: assistantMessage,
      page: topPage.page,
      quote: quoteLines,
    });
  } catch (err) {
    console.error("Error in chat route:", err);
    return NextResponse.json({ error: "Chat or TTS failed" }, { status: 500 });
  }
}
