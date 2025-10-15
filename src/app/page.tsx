"use client";

import { useState } from "react";
import Chat from "@/components/chat/Chat";
import PdfViewer from "@/components/pdf/PdfViewer";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";

export default function HomePage() {
  const [searchWord, setSearchWord] = useState("");

  return (
    <div className="flex h-screen">
      <Navigation />
      <div className="flex flex-col flex-1">
        <div className="flex-shrink-0">
          <Header />
        </div>
        <div className="flex flex-col-reverse md:flex-row flex-1 overflow-hidden">
          <div className="w-full md:w-1/2 flex-1 min-h-0 overflow-auto md:border-r border-gray-300">
            <Chat onSearchWordChange={setSearchWord} />
          </div>
          <div className="w-full md:w-1/2 flex-1 min-h-0 overflow-auto">
            <PdfViewer searchWord={searchWord} />
          </div>
        </div>
      </div>
    </div>
  );
}
