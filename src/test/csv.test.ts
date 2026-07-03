import { describe, it, expect } from "vitest";
import { parseCsv, findColumn, csvEscape, isExcelBinary, isExcelFileName } from "@/lib/csv";

describe("parseCsv", () => {
  it("parses a simple unix CSV", () => {
    expect(parseCsv("Name,Car\nScott,S15\n")).toEqual([["Name", "Car"], ["Scott", "S15"]]);
  });

  it("handles CRLF line endings (Excel on Windows)", () => {
    expect(parseCsv("Name,Car\r\nScott,S15\r\n")).toEqual([["Name", "Car"], ["Scott", "S15"]]);
  });

  it("strips a UTF-8 BOM (Excel 'CSV UTF-8' export)", () => {
    const rows = parseCsv("﻿First Name,Last Name\nAlice,Smith");
    expect(rows[0][0]).toBe("First Name");
  });

  it("handles quoted fields containing commas and quotes", () => {
    const rows = parseCsv('Name,Car\n"Smith, Jr.","Silvia ""S15"""\n');
    expect(rows[1]).toEqual(["Smith, Jr.", 'Silvia "S15"']);
  });

  it("handles newlines inside quoted fields", () => {
    const rows = parseCsv('Name,Notes\nScott,"line one\nline two"');
    expect(rows[1][1]).toBe("line one\nline two");
  });

  it("drops blank lines", () => {
    expect(parseCsv("Name,Car\n\nScott,S15\n\n")).toHaveLength(2);
  });
});

describe("findColumn", () => {
  it("matches case-insensitively and across aliases", () => {
    expect(findColumn(["First Name", "LAST NAME"], "first name", "firstname")).toBe(0);
    expect(findColumn(["FirstName", "LastName"], "last name", "lastname")).toBe(1);
  });

  it("normalises extra whitespace", () => {
    expect(findColumn(["  Age   Group "], "age group")).toBe(0);
  });

  it("returns -1 when absent", () => {
    expect(findColumn(["Name"], "car")).toBe(-1);
  });
});

describe("isExcelBinary / isExcelFileName", () => {
  it("detects xlsx zip magic bytes", () => {
    expect(isExcelBinary(new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]))).toBe(true);
  });

  it("detects legacy xls OLE2 header", () => {
    expect(isExcelBinary(new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1]))).toBe(true);
  });

  it("does not flag plain CSV text", () => {
    expect(isExcelBinary(new TextEncoder().encode("Name,Car\nScott,S15"))).toBe(false);
  });

  it("flags Excel file extensions", () => {
    expect(isExcelFileName("customers.xlsx")).toBe(true);
    expect(isExcelFileName("customers.XLS")).toBe(true);
    expect(isExcelFileName("customers.csv")).toBe(false);
  });
});

describe("csvEscape", () => {
  it("quotes and escapes values", () => {
    expect(csvEscape('He said "hi", ok')).toBe('"He said ""hi"", ok"');
    expect(csvEscape(null)).toBe('""');
  });
});
