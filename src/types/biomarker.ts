import { z } from "zod";

/**
 * A biomarker's healthy reference range, as provided by the lab.
 * `unit` is duplicated here (rather than only on the biomarker) because
 * some labs report the range in a different unit than the result value,
 * and we want that mismatch to be visible rather than silently assumed.
 */
export const ReferenceRangeSchema = z
  .object({
    low: z.number(),
    high: z.number(),
    unit: z.string().min(1, "Reference range unit is required"),
  })
  .refine((range) => range.low <= range.high, {
    message: "Reference range 'low' must be less than or equal to 'high'",
  });

/**
 * A single measured value from a lab panel (e.g. "Fasting Glucose").
 */
export const BiomarkerSchema = z.object({
  id: z.string().min(1, "Biomarker id is required"),
  name: z.string().min(1, "Biomarker name is required"),
  value: z.number({ invalid_type_error: "Biomarker value must be numeric" }),
  unit: z.string().min(1, "Biomarker unit is required"),
  referenceRange: ReferenceRangeSchema,
  collectedAt: z.string().datetime().optional(),
});

/**
 * A full lab report for a single patient, containing one or more biomarkers.
 * This is the shape of the raw, untrusted JSON we accept as input.
 */
export const LabResultSchema = z.object({
  patientId: z.string().min(1, "patientId is required"),
  labName: z.string().optional(),
  reportDate: z.string().datetime({ message: "reportDate must be an ISO 8601 datetime string" }),
  biomarkers: z.array(BiomarkerSchema).min(1, "At least one biomarker is required"),
});

export type ReferenceRange = z.infer<typeof ReferenceRangeSchema>;
export type Biomarker = z.infer<typeof BiomarkerSchema>;
export type LabResult = z.infer<typeof LabResultSchema>;
