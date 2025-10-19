"use client";

import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Message } from "@/types/message";
import { useUser } from "@/context/UserContext";
import { useConversations } from "@/context/ConversationProvider";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  const { conversation, sendMessage } = useConversations();

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages);
    } else {
      setMessages([]);
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === "assistant") {
        setLoading(false);
      }
    }
  }, [messages]);

  const sendMessageWrapper = (message: Message) => {
    const newMessages = [...messages, message];
    setMessages(newMessages);
    sendMessage(message);
    setInput("");
    setLoading(true);
  };

  const handleSendMessage = () => {
    if (!input.trim() || !conversation) return;

    const newMessage = {
      userId: user.id,
      conversationId: conversation.id,
      role: "user" as const,
      content: input,
    };

    sendMessageWrapper(newMessage);
  };

  const handleVoiceRecord = async (audioBlob: Blob, transcript: string) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const trimmedTranscript = transcript?.trim();

    new Audio(audioUrl).play();

    const newMessage: Message = {
      userId: user.id,
      conversationId: conversation?.id || "",
      role: "user",
      content: trimmedTranscript || "🎤 Voice memo sent.",
      voiceUrl: audioUrl,
    };

    sendMessageWrapper(newMessage);
  };

  const handleDictate = (text: string) => {
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

        {loading && (
          <div className="flex items-center space-x-2 mt-2 text-gray-500 text-sm">
            <span>Thinking</span>
            <div className="flex space-x-1">
              <span className="animate-bounce [animation-delay:-0.3s]">.</span>
              <span className="animate-bounce [animation-delay:-0.15s]">.</span>
              <span className="animate-bounce">.</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      <ChatInput
        input={input}
        setInput={setInput}
        sendMessage={handleSendMessage}
        loading={loading}
        onVoiceRecord={handleVoiceRecord}
        onDictate={handleDictate}
      />
    </div>
  );
}
