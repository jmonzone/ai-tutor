"use client";

import React, { useState } from "react";
import FileDrop from "../ui/Filedrop";
import { useUser } from "@/context/UserContext";
import { fetchWithAuth } from "@/lib/auth";
import Chat from "../chat/Chat";
import PdfViewer from "./PdfViewer";

export default function PdfModule() {
  const [file, setFile] = useState<File | null>(null);
  const [searchWord, setSearchWord] = useState("");

  const { user } = useUser();

  const onFileUploaded = async (targetFile: File) => {
    setFile(targetFile);
    if (user.role == "student") {
      const { uploadUrl, id } = await fetchWithAuth("/api/chat/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: targetFile.name,
          fileType: targetFile.type,
        }),
      });

      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": targetFile.type }, // must match exactly
        body: targetFile,
      });

      console.log("PDF uploaded! Mongo ID:", id);
    }
  };

  return file == null ? (
    <div className="flex flex-col-reverse md:flex-row items-center justify-center flex-1 overflow-hidden">
      <FileDrop onFileUploaded={onFileUploaded} />
    </div>
  ) : (
    <div className="flex flex-col-reverse md:flex-row flex-1 overflow-hidden">
      <div className="w-full md:w-1/2 flex-1 min-h-0 overflow-auto md:border-r border-gray-300">
        <Chat onSearchWordChange={setSearchWord} />
      </div>
      <div className="w-full md:w-1/2 flex-1 min-h-0 overflow-auto">
        <PdfViewer file={file} searchWord={searchWord} />
      </div>
    </div>
  );
}
