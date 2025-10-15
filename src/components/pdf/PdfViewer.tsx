"use client";

import { useUser } from "@/context/UserContext";
import { fetchWithAuth } from "@/lib/auth";
import dynamic from "next/dynamic";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

const PdfViewerInner = dynamic(() => import("./PdfViewerInner"), {
  ssr: false, // disable server-side rendering
});

interface PdfViewerProps {
  searchWord?: string;
}

export default function PdfViewer(props: PdfViewerProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const { user } = useUser();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || !acceptedFiles[0]) return;

      const targetFile = acceptedFiles[0];

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

      setPdfFile(targetFile);
    },
    [user]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  if (!pdfFile) {
    return (
      <div className="flex flex-col items-start justify-between w-full h-full px-6 py-4">
        <h2 className="text-lg font-semibold text-white-800 mb-4">
          Upload a PDF to Get Started
        </h2>
        <div
          {...getRootProps()}
          className={`relative w-full aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition 
            ${
              isDragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-600 text-center px-4">
            {isDragActive
              ? "Drop your PDF here..."
              : "Drag & drop a PDF here, or click to upload"}
          </p>
        </div>
        <div className="w-full flex justify-between text-sm text-white-500 mt-4 px-1">
          <span>supported formats: pdf</span>
          <span>maximum size: 25MB</span>
        </div>
      </div>
    );
  }

  return <PdfViewerInner file={pdfFile} {...props} />;
}
