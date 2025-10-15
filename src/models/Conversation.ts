import mongoose, { Schema, Document, models } from "mongoose";

export interface ConversationDocument extends Document {
  userId: string;
  title: string;
  file: string;
  messages: string[];
}

const ConversationSchema = new Schema<ConversationDocument>(
  {
    userId: { type: String, ref: "User", required: true },
    title: { type: String, default: "New Conversation" },
    file: { type: String, ref: "File", default: null },
    messages: [{ type: String, ref: "Message" }],
  },
  { timestamps: true }
);

export const Conversation =
  models.Conversation ||
  mongoose.model<ConversationDocument>("Conversation", ConversationSchema);
