"use client";

import React, { useState, useEffect, useRef } from "react";
import { Document, pdfjs, TextItem } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import PageWrapper from "./PageWrapper";
import type { Highlight } from "@/types/highlight";
import { PdfViewerProps } from "./PdfViewer";
import { useConversations } from "@/context/ConversationProvider";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PdfViewerInner({ file }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollToPage, setScrollToPage] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<Record<number, Highlight[]>>({});
  const [loadId, setLoadId] = useState(0);

  const { searchWord, page, setPages } = useConversations();

  useEffect(() => {
    const onResize = () => {
      if (containerRef.current) {
        setPageWidth(containerRef.current.clientWidth);
        // setPageHeight(containerRef.current.clientHeight - 32);
      }
    };
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

      const pageText = content.items
        .map((item) => (item as TextItem).str)
        .join(" ");
      pageTexts.push(pageText);
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
    const currentId = loadId;

    const normalize = (s: string) =>
      s
        .replace(/-\n/g, "") // join hyphenated linebreaks
        .replace(/[^\p{L}\p{N}\s]/gu, " ") // remove punctuation (unicode-safe)
        .replace(/\s+/g, " ") // collapse whitespace
        .trim()
        .toLowerCase();

    const hasContiguousWordSeq = (
      haystack: string,
      needle: string,
      minWords = 3
    ) => {
      const needleWords = needle.split(" ").filter(Boolean);
      if (needleWords.length < minWords) return false;

      for (let len = needleWords.length; len >= minWords; len--) {
        for (let start = 0; start + len <= needleWords.length; start++) {
          const seq = needleWords.slice(start, start + len).join(" ");
          if (haystack.includes(seq)) return true;
        }
      }
      return false;
    };

    const findWordOnPage = async () => {
      const pdf = pdfRef.current;
      if (!pdf) return;
      const newHighlights: Record<number, Highlight[]> = {};

      const highlightPage = await pdf.getPage(page);
      const textContent = await highlightPage.getTextContent();
      const items = textContent.items.filter((it) => "str" in it) as any[];

      const searchNormalized = normalize(searchWord);
      console.log("searchNormalized:", searchNormalized);

      const matches: Highlight[] = [];

      for (const item of items) {
        const raw = (item as any).str;
        if (!raw) continue;

        const itemNorm = normalize(raw);
        if (!itemNorm) continue;

        if (itemNorm.split(" ").length === 1) continue;

        const directMatch =
          itemNorm.includes(searchNormalized) ||
          searchNormalized.includes(itemNorm);

        const seqMatch =
          hasContiguousWordSeq(searchNormalized, itemNorm, 3) ||
          hasContiguousWordSeq(itemNorm, searchNormalized, 3);

        if (directMatch || seqMatch) {
          const tx = item.transform;

          console.log("match", item);
          matches.push({
            x: tx[4],
            y: tx[5],
            width: item.width,
            height: item.height,
          });
          // console.log("MATCH item:", { raw, itemNorm, directMatch, seqMatch });
        } else {
          // console.log("no match:", { raw, itemNorm });
        }
      }

      if (matches.length > 0) newHighlights[page] = matches;
      if (loadId === currentId) setHighlights(newHighlights);
    };

    findWordOnPage();
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
            {Array.from({ length: numPages }, (_, index) => (
              <PageWrapper
                key={index}
                pageNumber={index + 1}
                pageWidth={pageWidth}
                pageHeight={pageHeight}
                scrollTo={scrollToPage === index + 1}
                highlights={highlights[index + 1] || []}
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
