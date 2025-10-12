"use client";

import React, { useEffect } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface DictateButtonProps {
  onResult: (text: string) => void;
}

export default function DictateButton({ onResult }: DictateButtonProps) {
  const { isActive, output, startRecognition, stopRecognition } =
    useSpeechRecognition();

  useEffect(() => {
    if (!isActive && output) {
      console.log("DictateButton", output);
      onResult(output);
    }
  }, [isActive, output, onResult]);

  const handleDictate = () => {
    if (isActive) stopRecognition();
    else startRecognition();
  };

  return (
    <button
      onClick={handleDictate}
      className={`p-2 rounded-full ${
        isActive ? "bg-red-500 text-white" : "bg-gray-200"
      }`}
      title="Dictate"
    >
      🎙️
    </button>
  );
}
