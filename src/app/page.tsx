"use client";

import { useState } from "react";
import { RangeBar } from "@/components/RangeBar";
import { sampleLabResultRaw } from "@/lib/sample-data";
import type { HealthAlertReport } from "@/types/alert";

type ApiResponse =
  | { success: true; data: HealthAlertReport }
  | { success: false; error: string; issues: string[] };

export default function Home() {
  const [input, setInput] = useState(JSON.stringify(sampleLabResultRaw, null, 2));
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAnalyze() {
    setIsLoading(true);
    setResponse(null);

    try {
      const parsedBody = JSON.parse(input);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedBody),
      });
      const json: ApiResponse = await res.json();
      setResponse(json);
    } catch {
      setResponse({
        success: false,
        error: "The text in the input pane is not valid JSON.",
        issues: [],
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen px-6 py-14 sm:px-12"
      style={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ["--paper" as any]: "#F7F6F2",
        ["--ink" as any]: "#12241F",
        ["--line" as any]: "#DAD5C9",
        ["--teal" as any]: "#0F6E5D",
        ["--muted" as any]: "#6B7280",
        backgroundColor: "var(--paper)",
        color: "var(--ink)",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 border-b border-[color:var(--line)] pb-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--teal)]">
            Health Data Parser
          </p>
          <h1 className="mt-2 text-3xl font-medium" style={{ fontFamily: "Newsreader, serif" }}>
            Lab result → health alert report
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[color:var(--muted)]">
            Paste a raw lab-result JSON payload on the left. It's validated against a Zod schema,
            then every biomarker is checked against its own reference range on the right.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          <section>
            <label htmlFor="raw-json" className="mb-2 block text-xs font-mono uppercase tracking-wide text-[color:var(--muted)]">
              Raw lab result JSON
            </label>
            <textarea
              id="raw-json"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              className="h-[420px] w-full rounded-md border border-[color:var(--line)] bg-white/60 p-4 font-mono text-xs leading-relaxed outline-none focus:border-[color:var(--teal)]"
            />
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="mt-4 rounded-md bg-[color:var(--teal)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? "Analyzing…" : "Analyze"}
            </button>
          </section>

          <section>
            <h2 className="mb-2 text-xs font-mono uppercase tracking-wide text-[color:var(--muted)]">
              Report
            </h2>

            {!response && (
              <p className="rounded-md border border-dashed border-[color:var(--line)] p-6 text-sm text-[color:var(--muted)]">
                Run an analysis to see the report here.
              </p>
            )}

            {response && !response.success && (
              <div className="rounded-md border border-[#B3261E]/30 bg-[#B3261E]/5 p-4 text-sm">
                <p className="font-medium text-[#B3261E]">{response.error}</p>
                {response.issues.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-xs text-[color:var(--muted)]">
                    {response.issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {response && response.success && (
              <div className="space-y-6">
                <p className="text-sm">{response.data.summary}</p>
                <div className="space-y-5">
                  {response.data.alerts.map((alert) => (
                    <div key={alert.biomarkerId} className="rounded-md border border-[color:var(--line)] bg-white/60 p-4">
                      <div className="mb-2 flex items-baseline justify-between">
                        <span className="text-sm font-medium">{alert.name}</span>
                        <span className="font-mono text-sm">
                          {alert.value} {alert.unit}
                        </span>
                      </div>
                      <RangeBar alert={alert} />
                    </div>
                  ))}
                  {response.data.alerts.length === 0 && (
                    <p className="text-sm text-[color:var(--teal)]">
                      No flags — every biomarker is within range.
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
