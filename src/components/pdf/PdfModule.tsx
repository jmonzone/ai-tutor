"use client";

import React, { useEffect, useRef } from "react";
import FileDrop from "../ui/Filedrop";
import { useUser } from "@/context/UserContext";
import { fetchWithAuth } from "@/lib/auth";
import Chat from "../chat/Chat";
import { useConversations } from "@/context/ConversationContext";
import { Conversation } from "@/types/conversation";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });

export default function PdfModule() {
  const { user } = useUser();
  const { conversation, createNewConversation, fileLoaded, file, setFile } =
    useConversations();
  const lastConversationId = useRef<string | null>(null);

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

    const newConversation = await createNewConversation(data);
    if (newConversation?.id) lastConversationId.current = newConversation.id;
  };

  useEffect(() => {
    const conv = conversation;
    if (!conv || conv.id === lastConversationId.current) return;

    lastConversationId.current = conv.id;

    const fetchFile = async (conversation: Conversation) => {
      const s3Key = conversation.file?.s3Key;
      if (!s3Key) return;

      const encodedKey = encodeURIComponent(s3Key);
      const response = await fetchWithAuth(
        `/api/conversations/file?file=${encodedKey}`
      );
      if (!response.url) return;

      setFile(response.url);
    };

    fetchFile(conv);
  }, [conversation]);

  if (!file) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        <FileDrop onFileUploaded={onFileUploaded} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col-reverse md:flex-row overflow-hidden relative">
      {/* Chat Section */}
      <div className="flex-1 md:w-1/2 h-1/2 md:h-full overflow-auto border-t md:border-t-0 md:border-l border-gray-300">
        <Chat />
      </div>

      {/* PDF Section */}
      <div className="flex-1 md:w-1/2 h-1/2 md:h-full overflow-auto border-b md:border-b-0 md:border-l border-gray-300">
        <PdfViewer file={file} />
      </div>

      {/* Loading overlay */}
      {!fileLoaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-white pointer-events-auto">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
          <span className="text-lg tracking-wide animate-pulse">
            Loading PDF…
          </span>
        </div>
      )}
    </div>
  );
}
