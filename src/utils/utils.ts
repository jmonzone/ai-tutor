/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Types } from "mongoose";

function convertObjectIdsToStringsAndIds(obj: any): any {
  if (obj instanceof Types.ObjectId) {
    return obj.toString();
  } else if (Array.isArray(obj)) {
    return obj.map(convertObjectIdsToStringsAndIds);
  } else if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        const newValue = convertObjectIdsToStringsAndIds(value);
        // Convert _id to id
        if (key === "_id") return ["id", newValue];
        return [key, newValue];
      })
    );
  } else {
    return obj;
  }
}

export function toFrontend<T extends Document>(doc: T): Record<string, any> {
  const obj = doc.toObject();
  return convertObjectIdsToStringsAndIds(obj); // recursive conversion
}

export function toFrontendArray<T extends Document>(
  docs: T[]
): Record<string, any>[] {
  return docs.map(toFrontend);
}
