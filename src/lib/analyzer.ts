import type { Biomarker } from "../types/biomarker";
import type { AlertSeverity, BiomarkerAlert } from "../types/alert";
import { CRITICAL_DEVIATION_THRESHOLD } from "./constants";

/**
 * How far outside the reference range a value falls, as a fraction of the
 * range's width. 0 means "at or inside the boundary". Guards against a
 * zero/negative-width range (which Zod should already reject upstream,
 * but this keeps the function safe if called directly).
 */
function calculateDeviation(value: number, low: number, high: number): number {
  const rangeWidth = high - low;
  if (rangeWidth <= 0) return 0;

  if (value < low) return (low - value) / rangeWidth;
  if (value > high) return (value - high) / rangeWidth;
  return 0;
}

function resolveSeverity(value: number, low: number, high: number): AlertSeverity {
  if (value >= low && value <= high) return "normal";

  const deviation = calculateDeviation(value, low, high);
  const isLow = value < low;

  if (deviation >= CRITICAL_DEVIATION_THRESHOLD) {
    return isLow ? "critical-low" : "critical-high";
  }
  return isLow ? "low" : "high";
}

function buildMessage(
  name: string,
  severity: AlertSeverity,
  value: number,
  unit: string,
  low: number,
  high: number
): string {
  if (severity === "normal") {
    return `${name} is within the normal reference range (${low}-${high} ${unit}).`;
  }

  const direction = severity.includes("low") ? "below" : "above";
  const prefix = severity.startsWith("critical") ? "significantly " : "";
  return `${name} (${value} ${unit}) is ${prefix}${direction} the reference range of ${low}-${high} ${unit}.`;
}

/**
 * Evaluates a single biomarker against its own reference range.
 * Pure function, never throws — a malformed range degrades to "normal"
 * rather than crashing the whole report.
 */
export function evaluateBiomarker(biomarker: Biomarker): BiomarkerAlert {
  const { id, name, value, unit, referenceRange } = biomarker;
  const { low, high } = referenceRange;

  const severity = resolveSeverity(value, low, high);
  const deviationPercent = Math.round(calculateDeviation(value, low, high) * 100);

  return {
    biomarkerId: id,
    name,
    value,
    unit,
    referenceRange,
    severity,
    deviationPercent,
    message: buildMessage(name, severity, value, unit, low, high),
  };
}
