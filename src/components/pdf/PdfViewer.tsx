"use client";

import dynamic from "next/dynamic";
import React from "react";

const PdfViewerInner = dynamic(() => import("./PdfViewerInner"), {
  ssr: false, // disable server-side rendering
});

export interface PdfViewerProps {
  file: File;
  searchWord?: string;
  onTextLoaded: (text: string) => void;
}

export default function PdfViewer(props: PdfViewerProps) {
  return <PdfViewerInner {...props} />;
}
