"use client";

import dynamic from "next/dynamic";
import React from "react";

const PdfViewerInner = dynamic(() => import("./PdfViewerInner"), {
  ssr: false, // disable server-side rendering
});

interface PdfViewerProps {
  url: string;
  searchWord?: string;
}

export default function PdfViewer(props: PdfViewerProps) {
  return <PdfViewerInner {...props} />;
}
