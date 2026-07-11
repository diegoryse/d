import { NextResponse } from "next/server";
import { generateHealthAlertReport } from "@/lib/parser";

/**
 * POST /api/analyze
 * Body: raw LabResult JSON (see src/types/biomarker.ts)
 * Returns: { success: true, data: HealthAlertReport } | { success: false, error, issues }
 */
export async function POST(request: Request) {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Request body must be valid JSON.", issues: [] },
      { status: 400 }
    );
  }

  const result = generateHealthAlertReport(rawBody);

  if (!result.success) {
    return NextResponse.json(result, { status: 422 });
  }

  return NextResponse.json(result, { status: 200 });
}
