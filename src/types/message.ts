// src/types.ts
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  voiceUrl?: string;
  conversationId?: string;
  senderId?: string;
  createdAt?: Date;
}
