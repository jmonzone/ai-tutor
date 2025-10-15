import { Message } from "./message";

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  file: File | null;
}

export const defaultConversation: Conversation = {
  id: "default",
  title: "New Conversation",
  messages: [],
  userId: "default",
  file: null,
};
