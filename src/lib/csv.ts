// Minimal RFC 4180-style CSV helpers for the admin import/export tools.

/** True when the file content is an Excel workbook (or other binary), not CSV text. */
export const isExcelBinary = (bytes: Uint8Array): boolean => {
  // .xlsx/.xlsm are zip archives ("PK\x03\x04"); legacy .xls uses the OLE2 header.
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) return true;
  if (bytes.length >= 4 && bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) return true;
  return false;
};

export const isExcelFileName = (name: string): boolean => /\.xlsx?$|\.xlsm$/i.test(name);

/** Parse CSV text into rows of fields. Handles BOM, CRLF, and quoted fields with commas/quotes. */
export const parseCsv = (text: string): string[][] => {
  const src = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field); field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field); field = "";
      rows.push(row); row = [];
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }

  return rows.filter((r) => r.some((f) => f.trim() !== ""));
};

/** Case-insensitive header lookup; returns the index of the first matching alias or -1. */
export const findColumn = (headers: string[], ...aliases: string[]): number => {
  const normalized = headers.map((h) => h.trim().toLowerCase().replace(/\s+/g, " "));
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias);
    if (idx !== -1) return idx;
  }
  return -1;
};

/** Quote a value for CSV output, escaping embedded quotes. */
export const csvEscape = (value: unknown): string =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;
