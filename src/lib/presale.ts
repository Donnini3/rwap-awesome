// Reads the "Pre-Sale" sheet from the KIR event workbook (.xlsx/.xlsm):
// row 2 lists drivers from column C onward, row 3 is the NAME/PHONE header,
// and customers follow with full name in column A and phone in column B.
import { unzipSync, strFromU8 } from "fflate";

export interface PresaleCustomer {
  first_name: string;
  last_name: string;
  phone: string;
}

export interface PresaleData {
  sheetName: string;
  drivers: string[];
  customers: PresaleCustomer[];
}

const parseXml = (text: string): Document =>
  new DOMParser().parseFromString(text, "application/xml");

const colLetters = (ref: string): string => ref.replace(/\d+$/, "");
const rowNumber = (ref: string): number => parseInt(ref.replace(/^[A-Z]+/, ""), 10);
const colIndex = (letters: string): number =>
  letters.split("").reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0);

/** "Aaron Mercieca" → first "Aaron", last "Mercieca"; single-word names keep last name empty. */
export const splitFullName = (full: string): { first_name: string; last_name: string } => {
  const parts = full.trim().split(/\s+/);
  return { first_name: parts[0] ?? "", last_name: parts.slice(1).join(" ") };
};

/** Excel stores phone numbers as numbers, dropping the leading 0 of AU mobiles. */
export const normalizePhone = (raw: unknown): string => {
  const s = String(raw ?? "").trim().replace(/\.0$/, "");
  if (/^4\d{8}$/.test(s)) return "0" + s;
  return s;
};

/** Parse the workbook bytes and extract drivers + presale customers. Throws on malformed files. */
export const parsePresaleWorkbook = (bytes: Uint8Array): PresaleData => {
  const files = unzipSync(bytes);
  const read = (path: string): string | null => (files[path] ? strFromU8(files[path]) : null);

  const workbookXml = read("xl/workbook.xml");
  const relsXml = read("xl/_rels/workbook.xml.rels");
  if (!workbookXml || !relsXml) throw new Error("Not an Excel workbook");

  const sheets = Array.from(parseXml(workbookXml).getElementsByTagName("sheet")).map((s) => ({
    name: s.getAttribute("name") ?? "",
    rid: s.getAttribute("r:id") ?? "",
  }));
  if (sheets.length === 0) throw new Error("Workbook has no sheets");

  const relTargets = new Map(
    Array.from(parseXml(relsXml).getElementsByTagName("Relationship")).map((r) => [
      r.getAttribute("Id") ?? "",
      r.getAttribute("Target") ?? "",
    ]),
  );

  // Prefer a sheet named like "Pre-Sale"; otherwise assume the second sheet.
  const target = sheets.find((s) => /pre[\s-]?sale/i.test(s.name)) ?? sheets[1] ?? sheets[0];
  const sheetPath = "xl/" + (relTargets.get(target.rid) ?? "").replace(/^\/?(xl\/)?/, "");
  const sheetXml = read(sheetPath);
  if (!sheetXml) throw new Error(`Could not read sheet "${target.name}"`);

  const sharedStrings: string[] = [];
  const ssXml = read("xl/sharedStrings.xml");
  if (ssXml) {
    for (const si of Array.from(parseXml(ssXml).getElementsByTagName("si"))) {
      sharedStrings.push(
        Array.from(si.getElementsByTagName("t")).map((t) => t.textContent ?? "").join(""),
      );
    }
  }

  // cells[row][colLetters] = string value
  const cells = new Map<number, Map<string, string>>();
  for (const c of Array.from(parseXml(sheetXml).getElementsByTagName("c"))) {
    const ref = c.getAttribute("r");
    if (!ref) continue;
    let value = "";
    const v = c.getElementsByTagName("v")[0];
    if (v) {
      value = c.getAttribute("t") === "s" ? sharedStrings[parseInt(v.textContent ?? "0", 10)] ?? "" : v.textContent ?? "";
    } else {
      const inline = c.getElementsByTagName("t")[0];
      value = inline?.textContent ?? "";
    }
    if (value === "") continue;
    const row = rowNumber(ref);
    if (!cells.has(row)) cells.set(row, new Map());
    cells.get(row)!.set(colLetters(ref), value);
  }

  // Drivers: row 2, column C onward, text values only.
  const drivers: string[] = [];
  const row2 = cells.get(2);
  if (row2) {
    for (const [col, value] of Array.from(row2.entries()).sort((a, b) => colIndex(a[0]) - colIndex(b[0]))) {
      if (colIndex(col) >= 3 && value.trim() && !/^\d+(\.\d+)?$/.test(value.trim())) {
        drivers.push(value.trim());
      }
    }
  }

  // Customers: column A full name + column B phone, below the NAME/PHONE header.
  const headerRow = Array.from(cells.entries()).find(
    ([, cols]) => cols.get("A")?.trim().toUpperCase() === "NAME",
  )?.[0];
  const startRow = headerRow != null ? headerRow + 1 : 4;

  const customers: PresaleCustomer[] = [];
  for (const [row, cols] of Array.from(cells.entries()).sort((a, b) => a[0] - b[0])) {
    if (row < startRow) continue;
    const fullName = cols.get("A")?.trim();
    if (!fullName || fullName.toUpperCase() === "NAME" || /^\d+(\.\d+)?$/.test(fullName)) continue;
    customers.push({ ...splitFullName(fullName), phone: normalizePhone(cols.get("B")) });
  }

  return { sheetName: target.name, drivers, customers };
};
