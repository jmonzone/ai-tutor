"use client";

import { useState } from "react";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "You are a helpful assistant." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user" as const, content: input },
    ];

    setMessages(newMessages);
    setMessages(newMessages);
    setInput("");
    setLoading(true);

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
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <div className="space-y-2">
        {messages
          .filter((m) => m.role !== "system")
          .map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "text-right" : "text-left"}
            >
              <span className="block bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2 inline-block">
                {m.content}
              </span>
            </div>
          ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
