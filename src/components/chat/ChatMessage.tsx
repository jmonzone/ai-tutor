// ChatMessage.tsx
"use client";

import { Message } from "@/types/message";
import React from "react";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const playVoice = () => {
    if (message.voiceUrl) {
      const audio = new Audio(`data:audio/mp3;base64,${message.voiceUrl}`);
      audio.play();
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div className={message.role === "user" ? "text-right" : "text-left"}>
      <span className="inline-block max-w-[85%] sm:max-w-[75%] bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2 break-words cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
        {message.content}
      </span>
      {message.role == "assistant" && (
        <div className="flex gap-2 mt-1 justify-start md:justify-start text-xs sm:text-sm">
          <button
            onClick={copyText}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Copy
          </button>

          {message.voiceUrl && (
            <button
              onClick={playVoice}
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Play Voice
            </button>
          )}
        </div>
      )}
    </div>
  );
}
