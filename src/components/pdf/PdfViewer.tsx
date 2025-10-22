"use client";

import React, { useState, useEffect, useRef } from "react";
import { Document, pdfjs, TextItem } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import PageWrapper from "./PageWrapper";
import type { Highlight } from "@/types/highlight";
import { useConversations } from "@/context/ConversationContext";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export interface PdfViewerProps {
  file: File;
}

const normalize = (s: string) =>
  s
    .replace(/-\n/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const hasContiguousWordSeq = (
  haystack: string,
  needle: string,
  minWords = 5
) => {
  const words = needle.split(" ").filter(Boolean);
  if (words.length < minWords) return false;

  for (let len = words.length; len >= minWords; len--) {
    for (let start = 0; start + len <= words.length; start++) {
      if (haystack.includes(words.slice(start, start + len).join(" ")))
        return true;
    }
  }
  return false;
};

export default function PdfViewer({ file }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollToPage, setScrollToPage] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<Record<number, Highlight[]>>({});
  const [loadId, setLoadId] = useState(0);

  const { searchWord, page, setPages } = useConversations();

  useEffect(() => {
    const onResize = () => setPageWidth(containerRef.current?.clientWidth ?? 0);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onDocumentLoadSuccess = async (pdf: PDFDocumentProxy) => {
    pdfRef.current = pdf;
    setNumPages(pdf.numPages);

    const pageTexts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const pg = await pdf.getPage(i);
      const content = await pg.getTextContent();
      pageTexts.push(
        content.items.map((item) => (item as TextItem).str).join(" ")
      );
    }

    setPages(pageTexts);
  };

  useEffect(() => {
    setNumPages(0);
    setHighlights({});
    setScrollToPage(null);
    setCurrentPage(1);
    setLoadId((prev) => prev + 1);
  }, [file]);

  useEffect(() => {
    if (page) setCurrentPage(page);
  }, [page]);

  useEffect(() => {
    setScrollToPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (!searchWord || !pdfRef.current || !page) return;
    const currentLoadId = loadId;

    const findHighlights = async () => {
      const pdf = pdfRef.current;
      if (!pdf) return;

      const newHighlights: Record<number, Highlight[]> = {};
      const pg = await pdf.getPage(page);
      const content = await pg.getTextContent();
      const items = content.items.filter((it) => "str" in it) as TextItem[];

      const normalizedSearch = normalize(searchWord);
      const matches: Highlight[] = [];

      for (const item of items) {
        const itemNorm = normalize(item.str || "");
        if (!itemNorm || itemNorm.split(" ").length === 1) continue;

        const directMatch =
          itemNorm.includes(normalizedSearch) ||
          normalizedSearch.includes(itemNorm);
        const seqMatch =
          hasContiguousWordSeq(normalizedSearch, itemNorm) ||
          hasContiguousWordSeq(itemNorm, normalizedSearch);

        if (directMatch || seqMatch) {
          const tx = item.transform;
          matches.push({
            x: tx[4],
            y: tx[5],
            width: item.width,
            height: item.height,
          });
        }
      }

      if (matches.length > 0) newHighlights[page] = matches;
      if (currentLoadId === loadId) setHighlights(newHighlights);
    };

    findHighlights();
  }, [searchWord, page, loadId]);

  return (
    <div className="flex flex-col w-full h-full bg-black text-white">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4"
      >
        {file && containerRef.current && (
          <Document
            key={`${typeof file === "string" ? file : file.name}-${loadId}`}
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex flex-col items-center gap-4"
          >
            {Array.from({ length: numPages }, (_, idx) => (
              <PageWrapper
                key={idx}
                pageNumber={idx + 1}
                pageWidth={pageWidth}
                scrollTo={scrollToPage === idx + 1}
                highlights={highlights[idx + 1] || []}
              />
            ))}
          </Document>
        )}
      </div>

      {numPages > 1 && (
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
