import { describe, it, expect } from "vitest";
import { zipSync, strToU8 } from "fflate";
import { parsePresaleWorkbook, splitFullName, normalizePhone } from "@/lib/presale";

// Minimal workbook mirroring the event .xlsm: sheet 2 is "Pre-Sale" with
// drivers on row 2 from column C, a NAME/PHONE header on row 3, and
// customers (full name in A, numeric phone in B) from row 4.
const buildWorkbook = (): Uint8Array => {
  const strings = [
    "Matt Bourke", "Anth Romano", // 0-1 drivers
    "NAME", "PHONE",              // 2-3 header
    "Aaron Mercieca", "Amelie Rose Nickels", "Sharky", // 4-6 customers
  ];
  const sharedStrings =
    `<?xml version="1.0"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    strings.map((s) => `<si><t>${s}</t></si>`).join("") + `</sst>`;

  const sheet2 =
    `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>` +
    `<row r="2"><c r="C2" t="s"><v>0</v></c><c r="D2" t="s"><v>1</v></c></row>` +
    `<row r="3"><c r="A3" t="s"><v>2</v></c><c r="B3" t="s"><v>3</v></c><c r="C3"><v>0</v></c></row>` +
    `<row r="4"><c r="A4" t="s"><v>4</v></c><c r="B4"><v>409180847</v></c></row>` +
    `<row r="5"><c r="A5" t="s"><v>5</v></c><c r="B5"><v>402106417</v></c></row>` +
    `<row r="7"><c r="A7" t="s"><v>6</v></c></row>` +
    `</sheetData></worksheet>`;

  const sheet1 =
    `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData/></worksheet>`;

  const workbook =
    `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<sheets><sheet name="ON THE DAY" sheetId="1" r:id="rId1"/><sheet name="Pre-Sale" sheetId="2" r:id="rId2"/></sheets></workbook>`;

  const rels =
    `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="t" Target="worksheets/sheet1.xml"/>` +
    `<Relationship Id="rId2" Type="t" Target="worksheets/sheet2.xml"/></Relationships>`;

  return zipSync({
    "xl/workbook.xml": strToU8(workbook),
    "xl/_rels/workbook.xml.rels": strToU8(rels),
    "xl/sharedStrings.xml": strToU8(sharedStrings),
    "xl/worksheets/sheet1.xml": strToU8(sheet1),
    "xl/worksheets/sheet2.xml": strToU8(sheet2),
  });
};

describe("parsePresaleWorkbook", () => {
  const data = parsePresaleWorkbook(buildWorkbook());

  it("picks the Pre-Sale sheet by name", () => {
    expect(data.sheetName).toBe("Pre-Sale");
  });

  it("reads drivers from row 2, column C onward", () => {
    expect(data.drivers).toEqual(["Matt Bourke", "Anth Romano"]);
  });

  it("reads customers below the NAME header with restored phone numbers", () => {
    expect(data.customers).toEqual([
      { first_name: "Aaron", last_name: "Mercieca", phone: "0409180847" },
      { first_name: "Amelie", last_name: "Rose Nickels", phone: "0402106417" },
      { first_name: "Sharky", last_name: "", phone: "" },
    ]);
  });

  it("throws on non-workbook bytes", () => {
    expect(() => parsePresaleWorkbook(new TextEncoder().encode("Name,Car\nfoo,bar"))).toThrow();
  });
});

describe("splitFullName", () => {
  it("splits first word from the rest", () => {
    expect(splitFullName("Aaron Mercieca")).toEqual({ first_name: "Aaron", last_name: "Mercieca" });
    expect(splitFullName("  Amelie  Rose  Nickels ")).toEqual({ first_name: "Amelie", last_name: "Rose Nickels" });
    expect(splitFullName("Sharky")).toEqual({ first_name: "Sharky", last_name: "" });
  });
});

describe("normalizePhone", () => {
  it("restores the leading zero Excel strips from AU mobiles", () => {
    expect(normalizePhone(409180847)).toBe("0409180847");
    expect(normalizePhone("409180847")).toBe("0409180847");
  });
  it("leaves other values alone", () => {
    expect(normalizePhone("0409 180 847")).toBe("0409 180 847");
    expect(normalizePhone("")).toBe("");
    expect(normalizePhone(undefined)).toBe("");
  });
});
