"use client";

import { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition as useReactSpeechRecognition,
} from "react-speech-recognition";

/**
 * Centralized speech recognition hook.
 * Provides start/stop controls and transcript output.
 */
export function useSpeechRecognition() {
  const { transcript, resetTranscript } = useReactSpeechRecognition();
  const [isActive, setIsActive] = useState(false);
  const [output, setOutput] = useState<string>("");

  useEffect(() => {
    if (isActive && transcript) setOutput(transcript);
  }, [isActive, transcript, output]);

  const startRecognition = () => {
    // console.log("startRecognition", isActive);

    resetTranscript();
    SpeechRecognition.startListening({
      continuous: true,
      language: "en-US",
    });
    setIsActive(true);
  };

  const stopRecognition = () => {
    // console.log("stopRecognition", isActive);
    SpeechRecognition.stopListening();
    setIsActive(false);
  };

  return {
    isActive,
    output,
    startRecognition,
    stopRecognition,
    resetTranscript,
  };
}
