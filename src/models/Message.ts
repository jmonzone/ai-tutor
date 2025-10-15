import mongoose, { Schema, Document, models } from "mongoose";
import { Message as IMessage } from "@/types/message";

export interface MessageDocument extends IMessage, Document {}

const MessageSchema = new Schema<MessageDocument>(
  {
    userId: { type: String, required: true },
    conversationId: { type: String, required: true },
    role: {
      type: String,
      enum: ["system", "user", "assistant"],
      required: true,
    },
    content: { type: String, required: true },
    voiceUrl: { type: String },
  },
  { timestamps: true }
);

export const Message =
  models.Message || mongoose.model<MessageDocument>("Message", MessageSchema);
