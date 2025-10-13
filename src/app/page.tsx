"use client";

import { useState } from "react";
import Chat from "@/components/chat/Chat";
import PdfViewer from "@/components/pdf/PdfViewer";
import Header from "@/components/layout/Header";

export default function HomePage() {
  const [searchWord, setSearchWord] = useState("");

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0">
        <Header />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat */}
        <div className="w-full md:w-1/2 h-full overflow-auto md:border-r border-gray-300">
          <Chat onSearchWordChange={setSearchWord} />
        </div>

        {/* PDF Viewer */}
        <div className="w-full md:w-1/2 h-full overflow-auto">
          <PdfViewer url="/sample.pdf" searchWord={searchWord} />
        </div>
      </div>
    </div>
  );
}
