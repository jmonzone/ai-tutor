import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getUserAndConnect } from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";

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

    const cosineSimilarity = (a: number[], b: number[]) => {
      const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
      return dot / (magA * magB);
    };

    console.log("Calculating page embeddings...");
    const pageEmbeddings = await Promise.all(
      pages.map((text: string) =>
        openai.embeddings
          .create({ model: "text-embedding-3-small", input: text })
          .then((res) => res.data[0].embedding as number[])
      )
    );
    console.log("Page embeddings complete.");

    const questionEmbedding = (
      await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: latestUserMessage.content,
      })
    ).data[0].embedding as number[];

    const MIN_LENGTH = 50;
    const LENGTH_PENALTY = 0.5;
    const RELEVENCE_THRESHOLD = 0.3;

    const scoredPages = pageEmbeddings
      .map((emb, i) => {
        const similarity = cosineSimilarity(emb, questionEmbedding);
        const length = pages[i].length;
        const penalty = length < MIN_LENGTH ? LENGTH_PENALTY : 1.0;
        return { index: i + 1, sim: similarity * penalty, text: pages[i] };
      })
      .sort((a, b) => b.sim - a.sim);

    console.log(
      "scored pages:",
      scoredPages.map((page) => ({
        index: page.index,
        sim: page.sim,
      }))
    );
    const topPage = scoredPages[0];
    const pageText = topPage.text.slice(0, 120000);

    console.log(pageText);
    const systemPrompt = `
You are an assistant helping the user understand a PDF document.
Use ONLY the provided text to answer the user's question.

Document:
${pageText}

Respond ONLY in valid JSON like:
{ "quote": "<relevant text>" }
`;

    const relevance = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, latestUserMessage],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(relevance.choices[0].message?.content || "{}");
    const { quote } = result;

    console.log("Quote:", quote);

    let summarizePrompt = `
You are an AI assistant responding to a user's prompts referencing a quote from an uploaded pdf.
`;

    const isRelevant = topPage.sim > RELEVENCE_THRESHOLD;
    if (isRelevant) {
      summarizePrompt += `mention a shortened version of the quote ${quote} in quotation marks,
then explain the quote in an easier to understand way. The answer must be very short and concise.`;

      if (pages.length > 1) {
        summarizePrompt += `Include a page reference (page ${topPage.index}) with the quote`;
      }
    } else {
      summarizePrompt += `However the pdf is not relevant to the user's questions.
      Let them know that the uploaded pdf does not contain anything related.`;
    }

    const N = 3;
    const lastMessages = messages.slice(-N);

    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: summarizePrompt }, ...lastMessages],
      temperature: 0.5,
    });

    const summary = summaryResponse.choices[0].message?.content || "";

    const assistantContent = {
      page: topPage.index,
      similarity: topPage.sim,
      quote,
      summary,
    };

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
      voiceBase64: audioBase64,
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
      isRelevant,
      page: assistantContent.page,
      quote: assistantContent.quote,
    });
  } catch (err) {
    console.error("Error in chat route:", err);
    return NextResponse.json({ error: "Chat or TTS failed" }, { status: 500 });
  }
}
