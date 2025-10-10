"use client";

import React, { useState, useEffect, useRef } from "react";
import { Document, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import PageWrapper from "./PageWrapper";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfViewerProps {
  url: string;
  searchWord?: string;
}

export default function PdfViewerInner({ url, searchWord }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollToPage, setScrollToPage] = useState<number | null>(null);

  // Update page width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setPageWidth(containerRef.current.clientWidth - 32);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const onDocumentLoadSuccess = (pdf: PDFDocumentProxy) => {
    pdfRef.current = pdf;
    setNumPages(pdf.numPages);
  };

  // Search for the word
  useEffect(() => {
    if (!searchWord || !pdfRef.current) return;

    const findWord = async () => {
      if (!pdfRef.current) return;

      let firstMatch: number | null = null;

      for (let i = 1; i <= pdfRef.current.numPages; i++) {
        const page = await pdfRef.current.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");

        if (text.toLowerCase().includes(searchWord.toLowerCase())) {
          if (firstMatch === null) firstMatch = i;
        }
      }

      if (firstMatch !== null) {
        setCurrentPage(firstMatch);
        setScrollToPage(firstMatch); // trigger scroll
      }
    };

    findWord();
  }, [searchWord, numPages]);

  return (
    <div className="flex flex-col w-full h-screen bg-black text-white">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4"
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex flex-col items-center gap-4"
        >
          {Array.from({ length: numPages }, (_, index) => (
            <PageWrapper
              key={index}
              pageNumber={index + 1}
              pageWidth={pageWidth}
              scrollTo={scrollToPage === index + 1}
            />
          ))}
        </Document>
      </div>

      {numPages > 0 && (
        <div className="flex items-center justify-center gap-4 p-4 bg-gray-900 text-white">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {numPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
