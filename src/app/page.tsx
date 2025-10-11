"use client";

import { useState } from "react";
import Chat from "@/components/Chat";
import PdfViewer from "@/components/pdf-viewer/PdfViewer";

export default function HomePage() {
  const [searchWord, setSearchWord] = useState("");

  return (
    <div className="flex h-screen">
      {/* Left pane: Chat */}
      <div className="w-1/2 border-r border-gray-300 overflow-auto">
        <Chat onSearchWordChange={setSearchWord} />
      </div>

      {/* Right pane: PDF Viewer */}
      <div className="w-1/2 overflow-auto">
        <PdfViewer url="/sample.pdf" searchWord={searchWord} />
      </div>
    </div>
  );
}
