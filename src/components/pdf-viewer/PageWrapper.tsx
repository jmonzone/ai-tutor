"use client";

import React, { useState, useEffect, useRef } from "react";
import { Page } from "react-pdf";

interface PageWrapperProps {
  pageNumber: number;
  pageWidth: number;
  scrollTo?: boolean;
}

export default function PageWrapper({
  pageNumber,
  pageWidth,
  scrollTo,
}: PageWrapperProps) {
  const [loaded, setLoaded] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loaded && scrollTo && pageRef.current) {
      pageRef.current.scrollIntoView({ behavior: "smooth" });
      console.log(`Scrolled to page ${pageNumber}`);
    }
  }, [loaded, scrollTo, pageNumber]);

  return (
    <div ref={pageRef} className="relative w-full flex justify-center bg-black">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white z-10">
          Loading page {pageNumber}...
        </div>
      )}
      <Page
        pageNumber={pageNumber}
        width={pageWidth}
        renderMode="canvas"
        renderTextLayer={false}
        renderAnnotationLayer={false}
        className="bg-black"
        onRenderSuccess={() => setLoaded(true)}
      />
    </div>
  );
}
