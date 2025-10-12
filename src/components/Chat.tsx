"use client";

import { useEffect, useRef, useState } from "react";
import VoiceRecorder from "./VoiceRecorder";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
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

    console.log("input", input);
    // update the PDF search word immediately
    onSearchWordChange(input);
    return;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.reply) setMessages([...newMessages, data.reply]);
    } catch (err) {
      console.error("Chat API error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      {" "}
      {/* relative parent */}
      {/* Message list */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 mb-20" // reserve space for input bar
      >
        {messages
          .filter((m) => m.role !== "system")
          .map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "text-right" : "text-left"}
            >
              <span className="inline-block max-w-[85%] sm:max-w-[75%] bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2 break-words">
                {m.content}
              </span>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Input bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-xl text-sm sm:text-base hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
        <VoiceRecorder
          onRecordComplete={(audioBlob) => {
            // Example: Play the recorded message
            const audioUrl = URL.createObjectURL(audioBlob);
            new Audio(audioUrl).play();

            // Add a message to the chat UI
            setMessages((prev) => [
              ...prev,
              { role: "user", content: "🎤 Voice memo sent." },
            ]);

            // Optionally: send to backend
            // const formData = new FormData();
            // formData.append("audio", audioBlob);
            // await fetch("/api/transcribe", { method: "POST", body: formData });
          }}
        />{" "}
      </div>
    </div>
  );
}
