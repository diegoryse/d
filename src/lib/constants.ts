/**
 * A value deviating from its reference boundary by more than this fraction
 * of the range's width is escalated from "low"/"high" to "critical-low"/"critical-high".
 *
 * Example: glucose range 70-100 mg/dL (width 30). At 0.2, anything below
 * 70 - 0.2*30 = 64 or above 100 + 0.2*30 = 106 is flagged critical.
 *
 * This is a simple, transparent heuristic for demo purposes — a production
 * system would source clinical escalation thresholds per-biomarker rather
 * than applying one global ratio.
 */
export const CRITICAL_DEVIATION_THRESHOLD = 0.2;
