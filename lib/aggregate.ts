export interface AggregatedItem {
  name: string;
  quantity: number;
}

function normalizeName(original: string): string {
  const tokens = original.split(" - ").map((t) => t.trim()).filter(Boolean);
  const cleaned = tokens
    .map((t) =>
      t
        .replace(/\(\s*limited\s*release\s*\)/gi, "")
        .replace(/\blimited\s*release\b/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim()
    )
    .filter(Boolean);
  return cleaned.join(" - ");
}

function normalizeForKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(\s*limited\s*release\s*\)/g, "")
    .replace(/\blimited\s*release\b/g, "")
    .replace(/\s*-\s*\*+\s*$/g, "") // strip trailing "- **"
    .replace(/\*+/g, "") // strip stray asterisks
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function aggregateTotals(rows: Record<string, unknown>[], headers: string[]): AggregatedItem[] {
  const nameKey = headers.find((h) => h.toLowerCase() === "lineitem name") ?? "Lineitem name";
  const qtyKey = headers.find((h) => h.toLowerCase() === "lineitem quantity") ?? "Lineitem quantity";

  type Bucket = { baseName: string; container: string; scent: string; quantity: number };
  const totals = new Map<string, Bucket>();

  for (const row of rows) {
    const nameRaw = row[nameKey];
    const qtyRaw = row[qtyKey];

    if (nameRaw == null) continue;

    const name = normalizeName(String(nameRaw).trim());
    if (!name) continue;

    const qty = typeof qtyRaw === "number" ? qtyRaw : Number(String(qtyRaw ?? "").replace(/,/g, "").trim());
    if (Number.isNaN(qty)) continue;

    const parts = name.split(" - ").map((p) => p.trim());
    const baseName = parts[0] ?? "";
    const container = parts[1] ?? "";
    const scent = parts.length > 3 ? parts.slice(2).join(" - ") : (parts[2] ?? "");
    const key = `${normalizeForKey(container)}||${normalizeForKey(scent)}`;
    const prev = totals.get(key);
    if (prev) {
      prev.quantity += qty;
    } else {
      totals.set(key, { baseName, container, scent, quantity: qty });
    }
  }

  return Array.from(totals.values())
    .map(({ baseName, container, scent, quantity }) => ({
      name: [baseName, container, scent].filter(Boolean).join(" - "),
      quantity
    }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}


