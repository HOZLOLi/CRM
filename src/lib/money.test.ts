import { describe, it, expect } from "vitest";
import {
  dec,
  add,
  sub,
  mul,
  div,
  round,
  sum,
  percentOf,
  applyDiscount,
  lineTotals,
  documentTotals,
  weightedValue,
  formatMoney,
  parseMoney,
  percentChange,
  compactNumber,
  toPersianDigits,
  toLatinDigits,
} from "@/lib/money";

describe("decimal arithmetic", () => {
  it("does not lose precision the way floats do", () => {
    // 0.1 + 0.2 === 0.30000000000000004 in float math
    expect(add("0.1", "0.2").toString()).toBe("0.3");
    expect(add(0.1, 0.2).toString()).toBe("0.3");
  });

  it("adds large IRR amounts exactly", () => {
    expect(add("1850000000", "320000000").toString()).toBe("2170000000");
  });

  it("subtracts without drift", () => {
    expect(sub("1000000", "0.01").toString()).toBe("999999.99");
  });

  it("multiplies quantity by unit price", () => {
    expect(mul("3", "1250000").toString()).toBe("3750000");
  });

  it("returns zero instead of Infinity on division by zero", () => {
    expect(div("100", "0").toString()).toBe("0");
  });

  it("rounds half-up, the invoice convention", () => {
    expect(round("2.345", 2).toString()).toBe("2.35");
    expect(round("2.344", 2).toString()).toBe("2.34");
    expect(round("-2.345", 2).toString()).toBe("-2.35");
  });

  it("sums a list of mixed inputs", () => {
    expect(sum(["100", 200, dec("300")]).toString()).toBe("600");
    expect(sum([]).toString()).toBe("0");
  });

  it("treats null and empty as zero", () => {
    expect(dec(null).toString()).toBe("0");
    expect(dec(undefined).toString()).toBe("0");
    expect(dec("").toString()).toBe("0");
    expect(dec("not a number").toString()).toBe("0");
  });
});

describe("percentages", () => {
  it("computes a percentage of an amount", () => {
    expect(percentOf("1000000", "9").toString()).toBe("90000");
  });

  it("applies a discount", () => {
    expect(applyDiscount("1000000", "10").toString()).toBe("900000");
  });

  it("weights a deal by its probability", () => {
    expect(weightedValue("1850000000", "75").toString()).toBe("1387500000");
  });

  it("computes percent change", () => {
    expect(percentChange("100", "150").toString()).toBe("50");
    expect(percentChange("100", "50").toString()).toBe("-50");
    expect(percentChange("0", "50").toString()).toBe("0");
  });
});

describe("line totals", () => {
  it("computes net, tax and gross for a line", () => {
    const totals = lineTotals({ quantity: "2", unitPrice: "500000", taxRate: "9" });
    expect(totals.net.toString()).toBe("1000000");
    expect(totals.tax.toString()).toBe("90000");
    expect(totals.gross.toString()).toBe("1090000");
  });

  it("applies an absolute discount before tax", () => {
    const totals = lineTotals({
      quantity: "1",
      unitPrice: "1000000",
      discount: "100000",
      taxRate: "9",
    });
    expect(totals.net.toString()).toBe("900000");
    expect(totals.tax.toString()).toBe("81000");
    expect(totals.gross.toString()).toBe("981000");
  });

  it("never lets a discount push a line below zero", () => {
    const totals = lineTotals({ quantity: "1", unitPrice: "100", discount: "500" });
    expect(totals.net.toString()).toBe("0");
  });
});

describe("document totals", () => {
  it("sums multiple lines with per-line tax", () => {
    const totals = documentTotals([
      { quantity: "1", unitPrice: "1000000", taxRate: "9" },
      { quantity: "2", unitPrice: "250000", taxRate: "9" },
    ]);
    expect(totals.subtotal.toString()).toBe("1500000");
    expect(totals.tax.toString()).toBe("135000");
    expect(totals.total.toString()).toBe("1635000");
  });

  it("handles an empty document", () => {
    const totals = documentTotals([]);
    expect(totals.total.toString()).toBe("0");
  });

  it("keeps totals exact across many lines", () => {
    const lines = Array.from({ length: 100 }, () => ({
      quantity: "1",
      unitPrice: "0.01",
    }));
    expect(documentTotals(lines).total.toString()).toBe("1");
  });
});

describe("formatting", () => {
  it("formats IRR with Persian digits and thousands separators", () => {
    expect(formatMoney("1850000000", { currency: "IRR" })).toBe("۱٬۸۵۰٬۰۰۰٬۰۰۰ ریال");
  });

  it("formats USD with two decimals", () => {
    expect(formatMoney("1234.5", { currency: "USD", persian: false })).toBe("1,234.50 $");
  });

  it("formats compact values", () => {
    expect(compactNumber("12400000")).toBe("۱۲٫۴ میلیون");
    expect(compactNumber("1500")).toBe("۱٫۵ هزار");
  });

  it("shows a negative sign for losses", () => {
    expect(formatMoney("-500", { currency: "IRR", persian: false })).toBe("−500 ریال");
  });

  it("converts digits both ways", () => {
    expect(toPersianDigits("1405")).toBe("۱۴۰۵");
    expect(toLatinDigits("۱۴۰۵")).toBe("1405");
  });
});

describe("parsing user input", () => {
  it("accepts Persian digits and separators", () => {
    expect(parseMoney("۱٬۸۵۰٬۰۰۰").toString()).toBe("1850000");
  });

  it("strips currency symbols and spaces", () => {
    expect(parseMoney("1 850 000 ریال").toString()).toBe("1850000");
  });

  it("accepts a Persian decimal separator", () => {
    expect(parseMoney("۱۲٫۵").toString()).toBe("12.5");
  });

  it("returns zero for empty input", () => {
    expect(parseMoney("").toString()).toBe("0");
  });
});
