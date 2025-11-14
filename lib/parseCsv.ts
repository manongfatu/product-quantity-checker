export interface CsvParseResult {
  headers: string[];
  rows: Record<string, unknown>[];
}

export async function parseCsvFile(file: File, Papa: typeof import("papaparse")): Promise<CsvParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      dynamicTyping: (field) => field.toLowerCase() === "lineitem quantity",
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const headers = (results.meta.fields ?? []).map((h) => h.trim());
        const rows = (results.data as unknown[]).filter(Boolean) as Record<string, unknown>[];
        resolve({ headers, rows });
      },
      error: (err) => reject(err)
    });
  });
}


