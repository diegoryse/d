/**
 * Example payloads for local testing and the demo UI.
 * Mirrors the kind of JSON a lab/EHR integration would send.
 */
export const sampleLabResultRaw = {
  patientId: "patient_8842",
  labName: "Quest Diagnostics",
  reportDate: "2026-07-01T09:00:00Z",
  biomarkers: [
    {
      id: "glucose_fasting",
      name: "Fasting Glucose",
      value: 118,
      unit: "mg/dL",
      referenceRange: { low: 70, high: 100, unit: "mg/dL" },
    },
    {
      id: "ldl_cholesterol",
      name: "LDL Cholesterol",
      value: 205,
      unit: "mg/dL",
      referenceRange: { low: 0, high: 130, unit: "mg/dL" },
    },
    {
      id: "hemoglobin",
      name: "Hemoglobin",
      value: 14.2,
      unit: "g/dL",
      referenceRange: { low: 13.5, high: 17.5, unit: "g/dL" },
    },
    {
      id: "tsh",
      name: "Thyroid Stimulating Hormone",
      value: 0.2,
      unit: "mIU/L",
      referenceRange: { low: 0.4, high: 4.0, unit: "mIU/L" },
    },
  ],
};

/** Intentionally invalid: negative value on a required field, missing unit. */
export const sampleLabResultInvalid = {
  patientId: "",
  reportDate: "not-a-date",
  biomarkers: [{ id: "x", name: "Glucose", value: "high", referenceRange: { low: 70, high: 100 } }],
};
