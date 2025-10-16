import { defaultMetaData, FileMetadata } from "./fileMetadata";
import { Message } from "./message";

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  file: FileMetadata;
  fileText: string;
  messages: Message[];
}

export const defaultConversation: Conversation = {
  id: "default",
  userId: "default",
  title: "New Conversation",
  file: defaultMetaData,
  fileText: "",
  messages: [],
};
