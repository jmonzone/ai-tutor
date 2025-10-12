"use client";

import { useState } from "react";
import Chat from "@/components/chat/Chat";
import PdfViewer from "@/components/pdf-viewer/PdfViewer";

export default function HomePage() {
  const [searchWord, setSearchWord] = useState("");

  return (
    <div className="flex flex-col-reverse md:flex-row h-screen">
      {/* Chat */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-auto md:border-r border-t md:border-t-0 border-gray-300">
        <Chat onSearchWordChange={setSearchWord} />
      </div>

      {/* PDF Viewer */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-auto">
        <PdfViewer url="/sample.pdf" searchWord={searchWord} />
      </div>
    </div>
  );
}
