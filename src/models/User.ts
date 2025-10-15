import mongoose, { Schema, Document, models } from "mongoose";
import bcrypt from "bcrypt";

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User =
  models.User || mongoose.model<UserDocument>("User", UserSchema);
