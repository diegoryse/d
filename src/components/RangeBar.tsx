import type { BiomarkerAlert } from "@/types/alert";

const SEVERITY_COLOR: Record<BiomarkerAlert["severity"], string> = {
  normal: "#0F6E5D",
  low: "#B7791F",
  high: "#B7791F",
  "critical-low": "#B3261E",
  "critical-high": "#B3261E",
};

const SEVERITY_LABEL: Record<BiomarkerAlert["severity"], string> = {
  normal: "In range",
  low: "Low",
  high: "High",
  "critical-low": "Critical — low",
  "critical-high": "Critical — high",
};

/**
 * Renders the reference range as a horizontal track and plots the
 * measured value as a dot. Values outside the range are clamped to the
 * track edges (5%/95%) so the dot stays visible, with the true
 * deviation communicated via color + the deviationPercent label instead.
 */
export function RangeBar({ alert }: { alert: BiomarkerAlert }) {
  const { value, referenceRange, severity, deviationPercent } = alert;
  const { low, high } = referenceRange;
  const span = high - low || 1;

  const rawPercent = ((value - low) / span) * 100;
  const clampedPercent = Math.min(95, Math.max(5, rawPercent));
  const color = SEVERITY_COLOR[severity];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-mono text-[color:var(--muted)]">{low}</span>
        <span className="font-mono text-[color:var(--muted)]">{high}</span>
      </div>
      <div className="relative h-2 rounded-full bg-[color:var(--line)]">
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full ring-2 ring-[color:var(--paper)]"
          style={{ left: `${clampedPercent}%`, backgroundColor: color }}
          aria-hidden
        />
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs" style={{ color }}>
          {SEVERITY_LABEL[severity]}
          {severity !== "normal" ? ` · ${deviationPercent}% out of range` : ""}
        </span>
      </div>
    </div>
  );
}
