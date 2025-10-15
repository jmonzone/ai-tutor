import mongoose, { Schema, Document, models } from "mongoose";

export interface FileDocument extends Document {
  userId: string;
  filename: string;
  s3Key: string;
}

const FileSchema = new Schema<FileDocument>(
  {
    userId: { type: String, required: true },
    filename: { type: String, required: true },
    s3Key: { type: String, required: true },
  },
  { timestamps: true }
);

export const File =
  models.File || mongoose.model<FileDocument>("File", FileSchema);
