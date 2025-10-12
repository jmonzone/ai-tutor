"use client";

import React, { useEffect, useState } from "react";
import DictateButton from "./DictateButton";
import VoiceRecorderButton from "./VoiceRecorderButton";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
  loading: boolean;
  onVoiceRecord: (audioBlob: Blob, transcript: string) => void;
  onDictate: (text: string) => void;
}

export default function ChatInput({
  input,
  setInput,
  sendMessage,
  loading,
  onVoiceRecord,
  onDictate,
}: ChatInputProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex gap-2 max-w-2xl mx-auto">
      <input
        className="flex-1 border rounded-xl px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message..."
      />

      {input.trim() ? (
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-xl text-sm sm:text-base hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      ) : (
        mounted && (
          <div className="flex gap-2">
            <DictateButton onResult={onDictate} />
            <VoiceRecorderButton onRecordComplete={onVoiceRecord} />
          </div>
        )
      )}
    </div>
  );
}
