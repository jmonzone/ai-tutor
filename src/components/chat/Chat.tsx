"use client";

import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Message } from "@/types/message";
import { useUser } from "@/context/UserContext";
import { useConversations } from "@/context/ConversationProvider";

interface ChatProps {
  onSearchWordChange: (word: string) => void;
}

export default function Chat({ onSearchWordChange }: ChatProps) {
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
      setLoading(false);
    } else {
      setMessages([]);
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  const sendMessageWrapper = (message: Message) => {
    const newMessages = [...messages, message];
    setMessages(newMessages);
    sendMessage(message);
    setInput("");
    setLoading(true);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    if (!conversation) return;

    const newMessage = {
      userId: user.id,
      conversationId: conversation.id,
      role: "user" as const,
      content: input,
    };

    sendMessageWrapper(newMessage);
    onSearchWordChange(input);
  };

  const handleVoiceRecord = async (audioBlob: Blob, transcript: string) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const trimmedTranscript = transcript?.trim();

    console.log("handleVoiceRecord", trimmedTranscript);

    new Audio(audioUrl).play();

    const newMessage: Message = {
      userId: user.id,
      conversationId: conversation.id,
      role: "user",
      content: trimmedTranscript || "🎤 Voice memo sent.",
      voiceUrl: audioUrl,
    };

    sendMessageWrapper(newMessage);
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
        sendMessage={handleSendMessage}
        loading={loading}
        onVoiceRecord={handleVoiceRecord}
        onDictate={handleDictate}
      />
    </div>
  );
}
