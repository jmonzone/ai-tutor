"use client";

import React, { useEffect, useRef } from "react";
import FileDrop from "../ui/Filedrop";
import { useUser } from "@/context/UserContext";
import { fetchWithAuth } from "@/lib/auth";
import Chat from "../chat/Chat";
import PdfViewer from "./PdfViewer";
import { useConversations } from "@/context/ConversationContext";
import { Conversation } from "@/types/conversation";

export default function PdfModule() {
  const { user } = useUser();

  const { conversation, createNewConversation, fileLoaded, file, setFile } =
    useConversations();
  const lastConversationId = useRef<string | null>(null); // useRef avoids re-renders

  const onFileUploaded = async (targetFile: File) => {
    setFile(targetFile);

    if (user.role !== "student") return;

    const data = await fetchWithAuth("/api/conversations/file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: targetFile.name,
        fileType: targetFile.type,
      }),
    });

    await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": targetFile.type },
      body: targetFile,
    });

    console.log("PDF uploaded! Mongo:", data);

    const newConversation = await createNewConversation(data);
    if (newConversation?.id) {
      lastConversationId.current = newConversation.id; // skip fetch for this conversation
    }
  };

  useEffect(() => {
    const conv = conversation;
    if (!conv || conv.id === lastConversationId.current) return;

    lastConversationId.current = conv.id;

    const fetchFile = async (conversation: Conversation) => {
      const s3Key = conversation.file?.s3Key;
      if (!s3Key) return;

      console.log("Fetching remote file...");
      const encodedKey = encodeURIComponent(s3Key);

      const response = await fetchWithAuth(
        `/api/conversations/file?file=${encodedKey}`
      );
      if (!response.url) {
        console.error("Failed to fetch file:", response.statusText);
        return;
      }

      setFile(response.url);
    };

    fetchFile(conv);
  }, [conversation]);

  return file == null ? (
    <div className="flex flex-col-reverse md:flex-row items-center justify-center flex-1 overflow-hidden">
      <FileDrop onFileUploaded={onFileUploaded} />
    </div>
  ) : (
    <div className="flex flex-col-reverse md:flex-row flex-1 overflow-hidden relative">
      <div className="w-full md:w-1/2 flex-1 min-h-0 overflow-auto md:border-r border-gray-300">
        <Chat />
      </div>

      <div className="relative w-full md:w-1/2 flex-1 min-h-0 overflow-auto">
        <PdfViewer file={file} />
      </div>

      {!fileLoaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-white pointer-events-auto">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>

          <span className="text-lg tracking-wide animate-pulse">
            Loading PDF…
          </span>
        </div>
      )}
    </div>
  );
}
