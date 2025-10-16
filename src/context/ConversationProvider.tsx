"use client";

import { fetchWithAuth } from "@/lib/auth";
import { Conversation, defaultConversation } from "@/types/conversation";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useUser } from "./UserContext";
import { Message } from "@/types/message";
import { FileMetadata } from "@/types/fileMetadata";

interface ConversationContextValue {
  conversation: Conversation | null;
  conversations: Conversation[];
  createNewConversation: (file: FileMetadata) => Promise<Conversation | null>;
  selectConversation: (conversation: Conversation) => void;
  sendMessage: (message: Message) => void;
  setFileText: (text: string) => void;
}

const ConvseationContext = createContext<ConversationContextValue | undefined>(
  undefined
);

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [fileText, setFileText] = useState<string>("");

  const { user } = useUser();

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    try {
      const data = await fetchWithAuth("/api/chat/conversations", {
        method: "GET",
      });
      const conversations: Conversation[] = data.conversations || [];

      console.log(conversations);
      setConversations(conversations);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  };

  const sendMessage = async (newMessage: Message) => {
    if (!conversation) return;

    const convToUpdate = {
      ...conversation,
      messages: [...(conversation.messages || []), newMessage],
      fileText,
    };

    setConversation(convToUpdate);
    setConversations((prevConvs) =>
      prevConvs.some((c) => c.id === convToUpdate.id)
        ? prevConvs.map((c) => (c.id === convToUpdate.id ? convToUpdate : c))
        : [...prevConvs, convToUpdate]
    );

    updateTitle(convToUpdate);
    fetchAIResponse(convToUpdate);
  };

  const updateTitle = async (conversation: Conversation) => {
    const data = await fetchWithAuth("/api/chat/conversations/title", {
      method: "POST",
      body: JSON.stringify({ conversation }),
    });

    if (data.title) {
      setConversation((prevConv) =>
        prevConv ? { ...prevConv, title: data.title } : prevConv
      );
      setConversations((prevConvs) =>
        prevConvs.map((c) =>
          c.id === conversation.id ? { ...c, title: data.title } : c
        )
      );
    }
  };

  const fetchAIResponse = async (conversation: Conversation) => {
    try {
      const data = await fetchWithAuth("/api/chat/send", {
        method: "POST",
        body: JSON.stringify({
          conversationId: conversation.id,
          messages: conversation.messages,
          fileText: conversation.fileText,
        }),
      });

      if (!data?.reply) return null;

      const assistantMsg: Message = {
        userId: user.id,
        role: "assistant",
        content: data.reply.content,
        voiceUrl: data.reply.voiceBase64,
        conversationId: conversation.id,
      };

      setConversation((prev) =>
        prev ? { ...prev, messages: [...prev.messages, assistantMsg] } : prev
      );
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id
            ? { ...c, messages: [...c.messages, assistantMsg] }
            : c
        )
      );

      return assistantMsg;
    } catch (err) {
      console.error("AI fetch failed:", err);
      return null;
    }
  };

  const createNewConversation = async (
    file: FileMetadata
  ): Promise<Conversation | null> => {
    try {
      const data = await fetchWithAuth("/api/chat/conversations", {
        method: "POST",
        body: JSON.stringify({ title: "New Conversation", fileId: file.id }),
      });

      if (!data?.conversation) return null;

      const newConv: Conversation = data.conversation;
      newConv.file = file;

      setConversation(newConv);
      setConversations((prevConvs) => {
        const hasDefault = prevConvs.some((c) => c.id === "default");
        return hasDefault
          ? prevConvs.map((c) => (c.id === "default" ? newConv : c))
          : [newConv, ...prevConvs];
      });

      return newConv;
    } catch (err) {
      console.error("Failed to create new conversation:", err);
      return null;
    }
  };

  return (
    <ConvseationContext.Provider
      value={{
        conversation,
        conversations,
        createNewConversation,
        selectConversation: setConversation,
        sendMessage,
        setFileText,
      }}
    >
      {children}
    </ConvseationContext.Provider>
  );
};

export const useConversations = () => {
  const context = useContext(ConvseationContext);
  if (!context) {
    throw new Error(
      "useConversations must be used within a ConversationProvider"
    );
  }
  return context;
};
