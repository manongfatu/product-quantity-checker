import { normalizeForKey, parseNameParts, cleanExplicitContainerAndScent } from "@/lib/catalog";

export interface AggregatedItem {
  name: string;
  quantity: number;
}

export function aggregateTotals(rows: Record<string, unknown>[], headers: string[]): AggregatedItem[] {
  const lower = headers.map((h) => h.toLowerCase().trim());
  const isExplicit = lower.includes("product name") && lower.includes("container") && lower.includes("scent") && lower.includes("quantity");
  const nameKey = isExplicit ? (headers.find((h) => h.toLowerCase().trim() === "product name") as string) : (headers.find((h) => h.toLowerCase() === "lineitem name") ?? "Lineitem name");
  const qtyKey = isExplicit ? (headers.find((h) => h.toLowerCase().trim() === "quantity") as string) : (headers.find((h) => h.toLowerCase() === "lineitem quantity") ?? "Lineitem quantity");
  const containerKey = isExplicit ? (headers.find((h) => h.toLowerCase().trim() === "container") as string) : null;
  const scentKey = isExplicit ? (headers.find((h) => h.toLowerCase().trim() === "scent") as string) : null;

  type Bucket = { baseName: string; container: string; scent: string; quantity: number };
  const totals = new Map<string, Bucket>();

  for (const row of rows) {
    const qtyRaw = row[qtyKey];
    const qty = typeof qtyRaw === "number" ? qtyRaw : Number(String(qtyRaw ?? "").replace(/,/g, "").trim());
    if (Number.isNaN(qty)) continue;

    if (isExplicit) {
      const nameRaw = row[nameKey];
      if (nameRaw == null) continue;
      const productName = String(nameRaw ?? "").trim();
      if (!productName) continue;
      const fixed = cleanExplicitContainerAndScent(String(row[containerKey as string] ?? ""), String(row[scentKey as string] ?? ""));
      const container = fixed.container;
      const scent = fixed.scent;
      const key = `${normalizeForKey(container)}||${normalizeForKey(scent)}`;
      const prev = totals.get(key);
      if (prev) {
        prev.quantity += qty;
      } else {
        totals.set(key, { baseName: productName, container, scent, quantity: qty });
      }
    } else {
      const nameRaw = row[nameKey];
      if (nameRaw == null) continue;
      const name = String(nameRaw).trim();
      if (!name) continue;
      const { baseName, container, scent } = parseNameParts(name);
      const key = `${normalizeForKey(container)}||${normalizeForKey(scent)}`;
      const prev = totals.get(key);
      if (prev) {
        prev.quantity += qty;
      } else {
        totals.set(key, { baseName, container, scent, quantity: qty });
      }
    }
  }

  return Array.from(totals.values())
    .map(({ baseName, container, scent, quantity }) => ({
      name: [baseName, container, scent].filter(Boolean).join(" - "),
      quantity
    }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}


