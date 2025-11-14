'use client';

import { useCallback, useRef, useState } from "react";
import { parseCsvFile } from "@/lib/parseCsv";
import { aggregateTotals, type AggregatedItem } from "@/lib/aggregate";
import Papa from "papaparse";

interface UploadAreaProps {
  onData: (data: AggregatedItem[]) => void;
  onError: (message: string) => void;
}

export default function UploadArea({ onData, onError }: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);

  const onFiles = useCallback(async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      onError("Please upload a .csv file.");
      return;
    }
    setIsParsing(true);
    try {
      const { rows, headers } = await parseCsvFile(file, Papa);
      const lower = headers.map((h) => h.toLowerCase().trim());
      const hasExplicit = ["product name", "container", "scent", "quantity"].every((c) => lower.includes(c));
      const hasShopify = ["lineitem name", "lineitem quantity"].every((c) => lower.includes(c));
      if (!hasExplicit && !hasShopify) {
        onError("CSV is missing required columns. Provide either: Product Name, Container, Scent, Quantity OR Lineitem name, Lineitem quantity");
        return;
      }
      const data = aggregateTotals(rows, headers);
      onData(data);
    } catch (e) {
      console.error(e);
      onError("Failed to parse CSV. Please check the file format.");
    } finally {
      setIsParsing(false);
    }
  }, [onData, onError]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      onFiles(file);
    },
    [onFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      onFiles(file);
    },
    [onFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 shadow-sm">
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg p-6 text-center transition hover:bg-gray-50"
        htmlFor="file"
      >
        <svg className="h-8 w-8 text-gray-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 16l4-5h-3V4h-2v7H8l4 5z" />
          <path d="M20 18H4v2h16v-2z" />
        </svg>
        <div className="text-sm text-gray-700">
          <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
        </div>
        <div className="text-xs text-gray-500">CSV with Product Name, Container, Scent, Quantity OR Lineitem name, Lineitem quantity</div>
        <input
          ref={inputRef}
          id="file"
          type="file"
          accept=".csv,text/csv"
          onChange={handleChange}
          className="hidden"
        />
      </label>
      {isParsing && (
        <div className="mt-4 text-sm text-gray-600">Parsing file...</div>
      )}
    </div>
  );
}


