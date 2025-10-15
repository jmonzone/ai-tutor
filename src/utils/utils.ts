/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Types } from "mongoose";

function convertObjectIdsToStrings(obj: any): any {
  if (obj instanceof Types.ObjectId) {
    return obj.toString();
  } else if (Array.isArray(obj)) {
    return obj.map(convertObjectIdsToStrings);
  } else if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        convertObjectIdsToStrings(value),
      ])
    );
  } else {
    return obj;
  }
}

export function toFrontend<T extends Document>(doc: T): Record<string, any> {
  const obj = doc.toObject();
  const { _id, ...rest } = obj;
  const converted = convertObjectIdsToStrings(rest);
  return { id: _id.toString(), ...converted }; // id at top
}

export function toFrontendArray<T extends Document>(
  docs: T[]
): Record<string, any>[] {
  return docs.map(toFrontend);
}
