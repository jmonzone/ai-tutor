"use client";

import React, { useState, useEffect, useRef } from "react";
import { Document, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import PageWrapper from "./PageWrapper";
import type { Highlight } from "@/types/highlight";
import { PdfViewerProps } from "./PdfViewer";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PdfViewerInner({ file, searchWord }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollToPage, setScrollToPage] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<Record<number, Highlight[]>>({});
  const [loadId, setLoadId] = useState(0);

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

  useEffect(() => {
    setNumPages(0);
    setHighlights({});
    setScrollToPage(null);
    setCurrentPage(1);
    setLoadId((prev) => prev + 1);
  }, [file]);

  useEffect(() => {
    if (!searchWord || !pdfRef.current) return;
    const currentId = loadId;

    const findWord = async () => {
      const pdf = pdfRef.current;
      if (!pdf) return;
      const newHighlights: Record<number, Highlight[]> = {};

      for (let i = 1; i <= pdf.numPages; i++) {
        if (loadId !== currentId) return;
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        const matches: Highlight[] = [];

        for (const item of text.items) {
          if (
            "str" in item &&
            item.str.toLowerCase().includes(searchWord.toLowerCase())
          ) {
            matches.push({
              x: item.transform[4],
              y: item.transform[5],
              width: item.width,
              height: item.height || 10,
            });
          }
        }
        if (matches.length > 0) newHighlights[i] = matches;
      }

      if (loadId === currentId) setHighlights(newHighlights);
    };

    findWord();
  }, [searchWord, numPages, loadId]);

  return (
    <div className="flex flex-col w-full h-screen bg-black text-white">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4"
      >
        {file && (
          <Document
            key={`${typeof file === "string" ? file : file.name}-${loadId}`}
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex flex-col items-center gap-4"
          >
            {Array.from({ length: numPages }, (_, index) => (
              <PageWrapper
                key={index}
                pageNumber={index + 1}
                pageWidth={pageWidth}
                scrollTo={scrollToPage === index + 1}
                highlights={highlights[index + 1] || []}
              />
            ))}
          </Document>
        )}
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
