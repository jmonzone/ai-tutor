"use client";

import { useState } from "react";
import Chat from "@/components/Chat";
import PdfViewer from "@/components/pdf-viewer/PdfViewer";

export default function HomePage() {
  const [searchWord, setSearchWord] = useState("");

  return (
      {/* Left pane: Chat */}
    <div className="flex flex-col md:flex-row h-screen">
        <PdfViewer url="/sample.pdf" searchWord={searchWord} />
      </div>

      {/* Right pane: PDF Viewer */}
      <div className="w-full md:w-1/2 h-1/2 md:h-auto overflow-auto">
        <Chat onSearchWordChange={setSearchWord} />
      </div>
    </div>
  );
}
