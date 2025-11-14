'use client';

import { useMemo, useState } from "react";
import type { AggregatedItem } from "@/lib/aggregate";
import clsx from "clsx";

interface ResultsTableProps {
  items: AggregatedItem[];
}

type SortKey = "name" | "quantity";
type SortDir = "asc" | "desc";

export default function ResultsTable({ items }: ResultsTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  const sorted = useMemo(() => {
    const data = [...filtered];
    data.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      } else {
        cmp = a.quantity - b.quantity;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [filtered, sortKey, sortDir]);

  const setSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-sm text-gray-600">
        Results will appear here after uploading a CSV.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          Showing {sorted.length} of {items.length} products
        </div>
        <div className="relative w-full sm:w-72">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386-1.414 1.415-4.387-4.387zM8 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th active={sortKey === "name"} direction={sortDir} onClick={() => setSort("name")} label="Product" />
              <Th align="right" active={sortKey === "quantity"} direction={sortDir} onClick={() => setSort("quantity")} label="Total quantity" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((item) => (
              <tr key={item.name} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-right font-mono text-sm tabular-nums text-gray-900">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ label, onClick, active, direction, align = "left" }: { label: string; onClick: () => void; active: boolean; direction: SortDir; align?: "left" | "right" }) {
  return (
    <th className={clsx("px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600", align === "right" ? "text-right" : "text-left")}>
      <button onClick={onClick} className="group inline-flex items-center gap-1">
        <span>{label}</span>
        <span className={clsx("transition", active ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600")}>
          {active ? (
            direction === "asc" ? (
              <ArrowUp />
            ) : (
              <ArrowDown />
            )
          ) : (
            <SortIcon />
          )}
        </span>
      </button>
    </th>
  );
}

function ArrowUp() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10 4l5 6h-3v6H8v-6H5l5-6z" />
    </svg>
  );
}
function ArrowDown() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10 16l-5-6h3V4h4v6h3l-5 6z" />
    </svg>
  );
}
function SortIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 7h18v2H3V7zm4 8h10v2H7v-2z" />
    </svg>
  );
}


