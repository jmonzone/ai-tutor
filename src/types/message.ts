export interface Message {
  userId: string;
  conversationId: string;
  role: "system" | "user" | "assistant";
  content: string;
  voiceUrl?: string;
}
