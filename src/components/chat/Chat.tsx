"use client";

import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  voiceUrl?: string;
}

interface ChatProps {
  onSearchWordChange: (word: string) => void;
}

export default function Chat({ onSearchWordChange }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "You are a helpful assistant." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user" as const, content: input }, // <-- add "as const"
    ];
    setMessages(newMessages);

    setInput("");
    setLoading(true);

    // console.log("input", input);
    // update the PDF search word immediately
    onSearchWordChange(input);
    // return;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            ...data.reply,
            voiceUrl: `data:audio/mpeg;base64,${data.reply.voiceBase64}`,
          },
        ]);

        // Auto-play voice
        // new Audio(`data:audio/mpeg;base64,${data.reply.voiceBase64}`).play();
      }
    } catch (err) {
      console.error("Chat API error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleVoiceRecord = async (audioBlob: Blob, transcript: string) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const trimmedTranscript = transcript?.trim();

    console.log("handleVoiceRecord", trimmedTranscript);

    // Play audio
    new Audio(audioUrl).play();

    // Prepare new message
    const newMessage: Message = {
      role: "user",
      content: trimmedTranscript || "🎤 Voice memo sent.",
      voiceUrl: audioUrl,
    };

    // Update state first
    setMessages((prev) => [...prev, newMessage]);

    // Send to OpenAI if transcript exists
    if (trimmedTranscript) {
      // get the latest messages including the new one
      const currentMessages = [...messages, newMessage]; // OR use functional update if messages might be stale
      postMessages(currentMessages);
    }
  };

  const postMessages = async (messages: Message[]) => {
    console.log("posting messages to openAI");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev: Message[]) => [...prev, data.reply]);
      }
    } catch (err) {
      console.error("Chat API error:", err);
    }
  };

  const handleDictate = (text: string) => {
    console.log("handleDictate", text);

    setInput(text);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Message list */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 mb-20"
      >
        {messages
          .filter((m) => m.role !== "system")
          .map((m, i) => (
            <ChatMessage key={i} message={m} />
          ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        loading={loading}
        onVoiceRecord={handleVoiceRecord}
        onDictate={handleDictate}
      />
    </div>
  );
}
