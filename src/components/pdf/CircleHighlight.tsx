"use client";

import React from "react";
import type { PageViewport } from "pdfjs-dist/types/src/display/display_utils";
import type { Highlight } from "@/types/highlight";
import "./PageWrapper.css";

interface CircleHighlightProps {
  highlights: Highlight[];
  viewport: PageViewport;
  padding?: number;
  color?: string;
}

export default function CircleHighlight({
  highlights,
  viewport,
  padding = 45,
  color = "rgba(255,0,0,0.75)",
}: CircleHighlightProps) {
  if (!highlights.length) return null;

  let xMin = Infinity,
    yMin = Infinity,
    xMax = -Infinity,
    yMax = -Infinity;

  highlights.forEach((hl) => {
    const [x1, y1, x2, y2] = viewport.convertToViewportRectangle([
      hl.x,
      hl.y,
      hl.x + hl.width,
      hl.y + hl.height,
    ]);

    xMin = Math.min(xMin, x1, x2);
    yMin = Math.min(yMin, y1, y2);
    xMax = Math.max(xMax, x1, x2);
    yMax = Math.max(yMax, y1, y2);
  });

  const cx = (xMin + xMax) / 2;
  const cy = (yMin + yMax) / 2;
  const rx = (xMax - xMin) / 2 + padding;
  const ry = (yMax - yMin) / 2 + padding * 0.75;

  const circumference = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2);

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        stroke={color}
        strokeWidth={3}
        fill="transparent"
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: circumference,
          animation: "drawEllipse 1s ease-out forwards",
        }}
      />
    </svg>
  );
}
