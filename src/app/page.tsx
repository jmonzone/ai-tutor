"use client";

import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import PdfModule from "@/components/pdf/PdfModule";

export default function HomePage() {
  return (
    <div className="flex h-screen">
      <Navigation />
      <div className="flex flex-col flex-1">
        <div className="flex-shrink-0">
          <Header />
        </div>
        <PdfModule />
      </div>
    </div>
  );
}
