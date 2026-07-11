import { describe, it, expect } from "vitest";
import { evaluateBiomarker } from "../analyzer";
import type { Biomarker } from "../../types/biomarker";

function biomarker(overrides: Partial<Biomarker> = {}): Biomarker {
  return {
    id: "glucose_fasting",
    name: "Fasting Glucose",
    value: 90,
    unit: "mg/dL",
    referenceRange: { low: 70, high: 100, unit: "mg/dL" },
    ...overrides,
  };
}

describe("evaluateBiomarker", () => {
  it("flags an in-range value as normal", () => {
    const alert = evaluateBiomarker(biomarker({ value: 90 }));
    expect(alert.severity).toBe("normal");
    expect(alert.deviationPercent).toBe(0);
  });

  it("flags a value just below range as low", () => {
    const alert = evaluateBiomarker(biomarker({ value: 65 })); // 5/30 = 16.7% below
    expect(alert.severity).toBe("low");
  });

  it("flags a value far below range as critical-low", () => {
    const alert = evaluateBiomarker(biomarker({ value: 40 })); // 30/30 = 100% below
    expect(alert.severity).toBe("critical-low");
  });

  it("flags a value just above range as high", () => {
    const alert = evaluateBiomarker(biomarker({ value: 104 })); // 4/30 = 13.3% above
    expect(alert.severity).toBe("high");
  });

  it("flags a value far above range as critical-high", () => {
    const alert = evaluateBiomarker(biomarker({ value: 205, referenceRange: { low: 0, high: 130, unit: "mg/dL" } }));
    expect(alert.severity).toBe("critical-high");
  });

  it("treats boundary values as normal (inclusive range)", () => {
    expect(evaluateBiomarker(biomarker({ value: 70 })).severity).toBe("normal");
    expect(evaluateBiomarker(biomarker({ value: 100 })).severity).toBe("normal");
  });

  it("does not crash on a zero-width range", () => {
    const alert = evaluateBiomarker(
      biomarker({ value: 50, referenceRange: { low: 50, high: 50, unit: "mg/dL" } })
    );
    expect(alert.severity).toBe("normal");
  });
});
