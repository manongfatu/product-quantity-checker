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
  const [copied, setCopied] = useState(false);

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

  const sanitizeCell = (value: string) => value.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
  const splitName = (full: string) => {
    const parts = full.split(" - ").map((p) => p.trim());
    const name = parts[0] ?? "";
    const container = parts[1] ?? "";
    const scent = parts.length > 3 ? parts.slice(2).join(" - ") : (parts[2] ?? "");
    return [name, container, scent] as const;
  };
  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const copyHtmlFallback = (html: string) => {
    const container = document.createElement("div");
    container.innerHTML = html;
    container.style.position = "fixed";
    container.style.pointerEvents = "none";
    container.style.opacity = "0";
    document.body.appendChild(container);
    const range = document.createRange();
    range.selectNodeContents(container);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    document.execCommand("copy");
    sel?.removeAllRanges();
    document.body.removeChild(container);
  };

  const handleCopy = async () => {
    const headers = ["Product Name", "Container", "Scent", "Quantity"];
    const rows = sorted.map((item) => {
      const [name, container, scent] = splitName(item.name);
      return [sanitizeCell(name), sanitizeCell(container), sanitizeCell(scent), String(item.quantity)].join("\t");
    });
    const tsv = [headers.join("\t"), ...rows].join("\n");
    const html =
      `<table><thead><tr>` +
      headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("") +
      `</tr></thead><tbody>` +
      sorted
        .map((item) => {
          const [name, container, scent] = splitName(item.name);
          return `<tr><td>${escapeHtml(name)}</td><td>${escapeHtml(container)}</td><td>${escapeHtml(
            scent
          )}</td><td style="text-align:right">${escapeHtml(String(item.quantity))}</td></tr>`;
        })
        .join("") +
      `</tbody></table>`;
    try {
      if ("clipboard" in navigator && "write" in navigator.clipboard && "ClipboardItem" in window) {
        const item = new (window as unknown as { ClipboardItem: typeof ClipboardItem }).ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([tsv], { type: "text/plain" })
        });
        await navigator.clipboard.write([item]);
      } else {
        copyHtmlFallback(html);
      }
    } catch {
      try {
        copyHtmlFallback(html);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = tsv;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          Showing {sorted.length} of {items.length} products
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
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
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-gray-50"
            aria-label="Copy table for Notion"
          >
            <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1z" />
              <path d="M20 5H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h12v14z" />
            </svg>
            <span>{copied ? "Copied!" : "Copy table"}</span>
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th active={sortKey === "name"} direction={sortDir} onClick={() => setSort("name")} label="Product Name" />
              <Th active={false} direction={"asc"} onClick={() => {}} label="Container" />
              <Th active={false} direction={"asc"} onClick={() => {}} label="Scent" />
              <Th align="right" active={sortKey === "quantity"} direction={sortDir} onClick={() => setSort("quantity")} label="Quantity" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((item) => {
              const [name, container, scent] = splitName(item.name);
              return (
                <tr key={item.name} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{container}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{scent}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm tabular-nums text-gray-900">{item.quantity}</td>
                </tr>
              );
            })}
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


