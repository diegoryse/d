import type { ReferenceRange } from "./biomarker";

/**
 * "normal"        — within the reference range
 * "low" / "high"  — outside the range, but not by a critical margin
 * "critical-low" / "critical-high" — outside the range by more than
 *                    CRITICAL_DEVIATION_THRESHOLD (see lib/constants.ts)
 */
export type AlertSeverity = "normal" | "low" | "high" | "critical-low" | "critical-high";

export interface BiomarkerAlert {
  biomarkerId: string;
  name: string;
  value: number;
  unit: string;
  referenceRange: ReferenceRange;
  severity: AlertSeverity;
  /** How far outside the range the value falls, as a % of the range width. 0 when normal. */
  deviationPercent: number;
  message: string;
}

export interface HealthAlertReport {
  patientId: string;
  reportDate: string;
  generatedAt: string;
  totalBiomarkers: number;
  flaggedCount: number;
  /** Only biomarkers with severity !== "normal" appear here. */
  alerts: BiomarkerAlert[];
  summary: string;
}
