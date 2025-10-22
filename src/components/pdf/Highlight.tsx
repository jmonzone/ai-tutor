"use client";

import React from "react";
import type { PageViewport } from "pdfjs-dist/types/src/display/display_utils";
import type { Highlight as HighlightType } from "@/types/highlight";

interface HighlightProps {
  highlight: HighlightType;
  viewport: PageViewport;
}

export default function Highlight({ highlight, viewport }: HighlightProps) {
  const [x1, y1, x2, y2] = viewport.convertToViewportRectangle([
    highlight.x,
    highlight.y,
    highlight.x + highlight.width,
    highlight.y + highlight.height,
  ]);

  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  return (
    <div
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
}
