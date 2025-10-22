"use client";

import React, { useState, useEffect, useRef } from "react";
import { Page } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import type { PageViewport } from "pdfjs-dist/types/src/display/display_utils";
import type { Highlight } from "@/types/highlight";

interface PageWrapperProps {
  pageNumber: number;
  pageWidth: number;
  scrollTo?: boolean;
  highlights?: Highlight[];
}

export default function PageWrapper({
  pageNumber,
  pageWidth,
  scrollTo,
  highlights = [],
}: PageWrapperProps) {
  const [loaded, setLoaded] = useState(false);
  const [viewport, setViewport] = useState<PageViewport | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loaded && scrollTo && pageRef.current)
      pageRef.current.scrollIntoView({ behavior: "smooth" });
  }, [loaded, scrollTo]);

  return (
    <div
      ref={pageRef}
      className="relative w-full bg-black flex flex-col items-center"
    >
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
            const vp = page.getViewport({ scale });

            setViewport(vp);
            setLoaded(true);
          }}
        />

        {loaded &&
          viewport &&
          highlights.map((hl, idx) => {
            const [x1, y1, x2, y2] = viewport.convertToViewportRectangle([
              hl.x,
              hl.y,
              hl.x + hl.width,
              hl.y + hl.height,
            ]);

            const left = Math.min(x1, x2);
            const top = Math.min(y1, y2);
            const width = Math.abs(x2 - x1);
            const height = Math.abs(y2 - y1);

            return (
              <div
                key={idx}
                className="absolute bg-yellow-400/40 pointer-events-none"
                style={{
                  left,
                  top,
                  width,
                  height,
                  borderRadius: 2,
                  mixBlendMode: "multiply",
                }}
              />
            );
          })}
      </div>
    </div>
  );
}
