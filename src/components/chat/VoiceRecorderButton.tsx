"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface VoiceRecorderButtonProps {
  onRecordComplete: (audioBlob: Blob, transcript: string) => void;
}

export default function VoiceRecorderButton({
  onRecordComplete,
}: VoiceRecorderButtonProps) {
  const {
    isActive,
    output,
    startRecognition,
    stopRecognition,
    resetTranscript,
  } = useSpeechRecognition();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob>();
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (output && audioBlob && !isRecording) {
      // console.log("VoiceRecorderButton", output);
      onRecordComplete(audioBlob, output);
      setAudioBlob(undefined);
      resetTranscript();
    }
  }, [output, isRecording, audioBlob, onRecordComplete, resetTranscript]);

  const handleRecord = () => {
    if (!isRecording) startRecording();
    else if (isRecording) stopRecording();
  };

  const startRecording = async () => {
    try {
      resetTranscript();
      startRecognition();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);
        stopRecognition();
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <button
      onClick={handleRecord}
      className={`p-2 rounded-full ${
        isActive ? "bg-red-500 text-white" : "bg-gray-200"
      }`}
      title="Record Voice"
    >
      🎧
    </button>
  );
}
