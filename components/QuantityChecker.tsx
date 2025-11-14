'use client';

import { useState } from "react";
import UploadArea from "@/components/UploadArea";
import ResultsTable from "@/components/ResultsTable";
import type { AggregatedItem } from "@/lib/aggregate";

export default function QuantityChecker() {
  const [items, setItems] = useState<AggregatedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleData = (data: AggregatedItem[]) => {
    setItems(data);
    setError(null);
  };

  const handleError = (message: string) => {
    setItems([]);
    setError(message);
  };

  return (
    <section className="space-y-6">
      <UploadArea onData={handleData} onError={handleError} />
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}
      <ResultsTable items={items} />
    </section>
  );
}


