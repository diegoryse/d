import { LabResultSchema, type LabResult } from "../types/biomarker";
import type { HealthAlertReport } from "../types/alert";
import { evaluateBiomarker } from "./analyzer";

export interface ParseFailure {
  success: false;
  error: string;
  issues: string[];
}

export interface ParseSuccess<T> {
  success: true;
  data: T;
}

export type ParseResult<T> = ParseSuccess<T> | ParseFailure;

/**
 * Validates raw, untrusted input (e.g. a request body) against the
 * LabResult schema. Returns a discriminated union instead of throwing,
 * so callers — API routes, UI forms, batch jobs — can handle failure
 * explicitly rather than wrapping every call in try/catch.
 */
export function parseLabResult(rawInput: unknown): ParseResult<LabResult> {
  const result = LabResultSchema.safeParse(rawInput);

  if (!result.success) {
    return {
      success: false,
      error: "Lab result failed schema validation.",
      issues: result.error.issues.map(
        (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`
      ),
    };
  }

  return { success: true, data: result.data };
}

function buildSummary(flaggedCount: number, total: number): string {
  if (flaggedCount === 0) {
    return `All ${total} biomarker${total === 1 ? "" : "s"} are within their reference ranges.`;
  }
  return `${flaggedCount} of ${total} biomarker${total === 1 ? "" : "s"} fall outside their reference range and require review.`;
}

/**
 * End-to-end pipeline: validate raw JSON, then transform it into a
 * Health Alert Report. This is the primary entry point consumed by
 * the API route and any batch/CLI tooling.
 */
export function generateHealthAlertReport(rawInput: unknown): ParseResult<HealthAlertReport> {
  const parsed = parseLabResult(rawInput);
  if (!parsed.success) return parsed;

  const { patientId, reportDate, biomarkers } = parsed.data;
  const evaluations = biomarkers.map(evaluateBiomarker);
  const alerts = evaluations.filter((alert) => alert.severity !== "normal");

  const report: HealthAlertReport = {
    patientId,
    reportDate,
    generatedAt: new Date().toISOString(),
    totalBiomarkers: biomarkers.length,
    flaggedCount: alerts.length,
    alerts,
    summary: buildSummary(alerts.length, biomarkers.length),
  };

  return { success: true, data: report };
}
