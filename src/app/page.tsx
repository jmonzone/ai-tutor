"use client";

import Header from "@/components/layout/Header";
import NavigationDesktop from "@/components/layout/NavigationDesktop";
import NavigationMobile from "@/components/layout/NavigationMobile";
import PdfModule from "@/components/pdf/PdfModule";

export default function HomePage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <NavigationDesktop />

      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        <div className="sm:hidden">
          <NavigationMobile />
        </div>

        <div className="flex-shrink-0">
          <Header />
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <PdfModule />
        </div>
      </div>
    </div>
  );
}
