"use client";

import React from "react";
import { useDropzone } from "react-dropzone";

interface FileDropProps {
  onFileUploaded: (file: File) => void;
}

export default function FileDrop({ onFileUploaded }: FileDropProps) {
  const onDrop = (acceptedFiles: File[]) => {
    if (!acceptedFiles || !acceptedFiles[0]) return;

    const targetFile = acceptedFiles[0];

    onFileUploaded(targetFile);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  return (
    <div className="flex flex-col items-start justify-start w-full max-w-lg px-6 py-4">
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
