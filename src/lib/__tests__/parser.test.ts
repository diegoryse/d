import { describe, it, expect } from "vitest";
import { parseLabResult, generateHealthAlertReport } from "../parser";
import { sampleLabResultRaw, sampleLabResultInvalid } from "../sample-data";

describe("parseLabResult", () => {
  it("accepts a well-formed lab result", () => {
    const result = parseLabResult(sampleLabResultRaw);
    expect(result.success).toBe(true);
  });

  it("rejects malformed input with readable issues", () => {
    const result = parseLabResult(sampleLabResultInvalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });

  it("rejects non-object input without throwing", () => {
    const result = parseLabResult("not even json");
    expect(result.success).toBe(false);
  });
});

describe("generateHealthAlertReport", () => {
  it("flags out-of-range biomarkers and leaves normal ones out of the alert list", () => {
    const result = generateHealthAlertReport(sampleLabResultRaw);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const { data: report } = result;
    expect(report.totalBiomarkers).toBe(4);
    // glucose_fasting, ldl_cholesterol, tsh are out of range; hemoglobin is normal
    expect(report.flaggedCount).toBe(3);
    expect(report.alerts.map((a) => a.biomarkerId).sort()).toEqual(
      ["glucose_fasting", "ldl_cholesterol", "tsh"].sort()
    );
  });

  it("propagates validation failures instead of producing a partial report", () => {
    const result = generateHealthAlertReport(sampleLabResultInvalid);
    expect(result.success).toBe(false);
  });

  it("reports all-clear when every biomarker is in range", () => {
    const clean = {
      ...sampleLabResultRaw,
      biomarkers: [sampleLabResultRaw.biomarkers[2]], // hemoglobin only, in range
    };
    const result = generateHealthAlertReport(clean);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.flaggedCount).toBe(0);
      expect(result.data.summary).toMatch(/within their reference ranges/);
    }
  });
});
