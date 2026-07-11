# Health Data Parser

A small, production-shaped TypeScript service that turns a raw lab-result JSON
payload into a validated **Health Alert Report** — flagging any biomarker
that falls outside its own reference range, with a severity tier and a
human-readable explanation for each flag.

Built as a portfolio piece for preventative-health-tech roles: the interesting
part isn't the CRUD, it's the validation boundary and the clinical logic
sitting behind it.

## What it does

1. **Validates** untrusted input against a strict [Zod](https://zod.dev)
   schema (`LabResultSchema`) — malformed payloads are rejected with
   field-level error messages, never silently coerced.
2. **Evaluates** each biomarker against its own `referenceRange`, classifying
   it as `normal`, `low`, `high`, `critical-low`, or `critical-high` based on
   how far outside the range it falls.
3. **Reports**: returns a `HealthAlertReport` — total biomarkers checked, how
   many were flagged, and a plain-English summary — ready to render in a UI
   or hand to a downstream alerting system.

## Project structure

```
src/
├── types/
│   ├── biomarker.ts     # Zod schemas + inferred types (Biomarker, LabResult)
│   └── alert.ts         # Output types (BiomarkerAlert, HealthAlertReport)
├── lib/
│   ├── constants.ts      # Tunable clinical thresholds
│   ├── analyzer.ts       # Pure function: single biomarker -> severity + message
│   ├── parser.ts         # Validation + orchestration: raw JSON -> report
│   ├── sample-data.ts     # Example payloads used by tests and the demo UI
│   └── __tests__/         # Vitest unit tests for analyzer.ts and parser.ts
├── app/
│   ├── api/analyze/route.ts   # POST endpoint exposing generateHealthAlertReport
│   └── page.tsx                 # Demo UI: paste JSON, see the report rendered
└── components/
    └── RangeBar.tsx        # Visualizes a value's position within its range
```

The logic layer (`lib/`) has no dependency on Next.js — `parser.ts` and
`analyzer.ts` are plain TypeScript functions you could drop into a CLI,
a queue worker, or a different framework without changes.

## Design decisions

- **Discriminated-union results, not exceptions.** `parseLabResult` and
  `generateHealthAlertReport` return `{ success: true, data }` or
  `{ success: false, error, issues }` instead of throwing. Callers (the API
  route, the UI, a future batch job) handle failure as data, not control flow.
- **Deviation is relative, not absolute.** Severity escalates to "critical"
  once a value crosses the boundary by more than a configurable fraction
  (`CRITICAL_DEVIATION_THRESHOLD`) of the range's own width — so a tight
  range (e.g. TSH) and a wide one (e.g. LDL) are judged proportionally
  rather than against one fixed unit delta.
- **No implicit unit conversion.** `unit` is validated on both the value and
  the reference range on purpose; if a lab integration ever sends mismatched
  units, that should surface as a data-quality problem, not get silently
  normalized.

## Getting started

```bash
npm install
npm run dev       # demo UI at http://localhost:3000
npm run test       # runs the Vitest suite
```

### Try the API directly

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d @- <<'EOF'
{
  "patientId": "patient_8842",
  "reportDate": "2026-07-01T09:00:00Z",
  "biomarkers": [
    {
      "id": "glucose_fasting",
      "name": "Fasting Glucose",
      "value": 118,
      "unit": "mg/dL",
      "referenceRange": { "low": 70, "high": 100, "unit": "mg/dL" }
    }
  ]
}
EOF
```

## Built with an Agentic-First workflow

This project was built using an **Agentic-First** development process: an AI
coding agent handled the scaffolding, boilerplate, and repetitive
plumbing — project structure, Next.js routing, test file setup, Tailwind
wiring — while I drove the parts that actually determine whether the tool is
correct:

- Defining what a "biomarker" and a "flag" mean, and what data has to be
  present for a result to be trustworthy (the Zod schemas and their
  validation rules).
- Deciding the severity model — proportional deviation against the range's
  own width, rather than an arbitrary fixed threshold — and the escalation
  cutoff for "critical."
- Reviewing and tightening the agent's output: forcing a Result-type pattern
  instead of exceptions, closing edge cases (zero-width ranges, unit
  mismatches, malformed dates), and writing the test cases that pin down
  the intended behavior at the boundaries (in-range edges, just-outside,
  far-outside).
- Integration: wiring the validated pipeline into an API route and a demo
  UI, and deciding what a caller should see on both success and failure.

The premise: an agent is a fast, tireless typist for structure it's seen a
thousand times. It is not a substitute for deciding what "flagged" should
mean for a patient's data, or for reading its output skeptically before
shipping it. That division of labor — agent for scaffolding, engineer for
judgment and correctness — is what this repo is meant to demonstrate.

## Possible extensions

- Per-biomarker clinical thresholds (instead of one global deviation ratio)
- Trend detection across multiple historical `LabResult`s for the same patient
- Persisting reports and wiring real alerting (email/SMS/webhook) for
  `critical-*` severities
- Auth + patient-scoped access control on the API route
