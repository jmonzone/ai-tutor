import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

declare global {
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI, {
      dbName: "ai-study-tutor",
      bufferCommands: false,
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (err) {
    cached!.promise = null;
    throw err;
  }

  return cached!.conn;
}

import { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";

export async function getUserAndConnect(req: NextRequest) {
  let userId: string | null = null;

  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (token) {
    try {
      const payload = verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };
      userId = payload.userId;
    } catch {
      console.warn("Invalid token, proceeding as guest");
    }
  }

  if (userId) {
    await connectToDatabase();
  }

  return userId;
}
