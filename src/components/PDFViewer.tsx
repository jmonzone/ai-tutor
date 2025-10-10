"use client";

import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type {
  PDFDocumentProxy,
  TextItem,
} from "pdfjs-dist/types/src/display/api";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfViewerProps {
  url: string;
  searchWord?: string;
}

export default function PdfViewer({ url, searchWord }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollToPage, setScrollToPage] = useState<number | null>(null);

  // Dynamically update page width
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

  // Search PDF when searchWord changes
  useEffect(() => {
    if (!searchWord || !pdfRef.current) return;

    const findWord = async () => {
      if (!pdfRef.current) return;

      console.log(`Starting search for "${searchWord}"...`);
      let firstMatch: number | null = null;

      for (let i = 1; i <= pdfRef.current.numPages; i++) {
        console.log(`Checking page ${i}...`);
        const page = await pdfRef.current.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");

        if (text.toLowerCase().includes(searchWord.toLowerCase())) {
          console.log(`Page ${i} contains "${searchWord}"`);
          if (firstMatch === null) firstMatch = i;
        }
      }

      if (firstMatch !== null) {
        setCurrentPage(firstMatch);
        setScrollToPage(firstMatch); // will trigger PageWrapper to scroll after render
      }

      console.log(`Search completed.`);
    };

    findWord();
  }, [searchWord, numPages]);

  // Scroll to the page after it is rendered
  useEffect(() => {
    if (scrollToPage !== null && containerRef.current) {
      const pageEl = containerRef.current.children[
        scrollToPage - 1
      ] as HTMLElement;
      if (pageEl) {
        pageEl.scrollIntoView({ behavior: "smooth" });
        setScrollToPage(null); // reset
        console.log(`Scrolled to page ${scrollToPage}`);
      }
    }
  }, [scrollToPage]);

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
              scrollTo={scrollToPage === index + 1} // scroll only first match
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

interface PageWrapperProps {
  pageNumber: number;
  pageWidth: number;
  scrollTo?: boolean; // scroll this page if true
}

function PageWrapper({ pageNumber, pageWidth, scrollTo }: PageWrapperProps) {
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
