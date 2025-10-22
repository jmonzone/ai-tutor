"use client";

import React, { useState, useEffect, useRef } from "react";
import { Page } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import type { PageViewport } from "pdfjs-dist/types/src/display/display_utils";
import type { Highlight } from "@/types/highlight";
import HighlightComponent from "./Highlight";
import CircleHighlight from "./CircleHighlight";
import "./PageWrapper.css";

interface PageWrapperProps {
  pageNumber: number;
  pageWidth: number;
  scrollTo?: boolean;
  highlights?: Highlight[];
}

export default function PageWrapper({
  pageNumber,
  pageWidth,
  scrollTo = false,
  highlights = [],
}: PageWrapperProps) {
  const [loaded, setLoaded] = useState(false);
  const [viewport, setViewport] = useState<PageViewport | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loaded && scrollTo && pageRef.current) {
      pageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [loaded, scrollTo]);

  return (
    <div ref={pageRef} className="relative w-full bg-black">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white z-10">
          Loading page {pageNumber}...
        </div>
      )}

      <div className="relative" style={{ width: pageWidth }}>
        <Page
          pageNumber={pageNumber}
          width={pageWidth}
          renderMode="canvas"
          renderTextLayer={true}
          renderAnnotationLayer={false}
          className="bg-black"
          onRenderSuccess={(page) => {
            const scale = pageWidth / page.view[2];
            setViewport(page.getViewport({ scale }));
            setLoaded(true);
          }}
        />

        {loaded && viewport && highlights.length > 0 && (
          <>
            {highlights.map((hl, idx) => (
              <HighlightComponent
                key={idx}
                highlight={hl}
                viewport={viewport}
              />
            ))}

            <CircleHighlight highlights={highlights} viewport={viewport} />
          </>
        )}
      </div>
    </div>
  );
}
