// src/types.ts
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  voiceUrl?: string;
  conversationId?: string;
  userId?: string;
  createdAt?: Date;
}
