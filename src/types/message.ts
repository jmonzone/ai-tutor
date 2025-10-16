export interface Message extends OpenAIMessage {
  userId: string;
  conversationId: string;
  voiceUrl?: string;
}

export interface OpenAIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
