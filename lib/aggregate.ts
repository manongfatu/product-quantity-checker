export interface AggregatedItem {
  name: string;
  quantity: number;
}

export function aggregateTotals(rows: Record<string, unknown>[], headers: string[]): AggregatedItem[] {
  const nameKey = headers.find((h) => h.toLowerCase() === "lineitem name") ?? "Lineitem name";
  const qtyKey = headers.find((h) => h.toLowerCase() === "lineitem quantity") ?? "Lineitem quantity";

  const totals = new Map<string, number>();

  for (const row of rows) {
    const nameRaw = row[nameKey];
    const qtyRaw = row[qtyKey];

    if (nameRaw == null) continue;

    const name = String(nameRaw).trim();
    if (!name) continue;

    const qty = typeof qtyRaw === "number" ? qtyRaw : Number(String(qtyRaw ?? "").replace(/,/g, "").trim());
    if (Number.isNaN(qty)) continue;

    totals.set(name, (totals.get(name) ?? 0) + qty);
  }

  return Array.from(totals, ([name, quantity]) => ({ name, quantity })).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}


