// Legacy service — not used by the current simplified product.
// Kept as a stub to satisfy TypeScript compilation.

export async function createEvaluationRun(_input: {
  promptId: string;
  promptVersionId?: string;
  datasetId: string;
  modelIds: string[];
}) {
  throw new Error("createEvaluationRun is not supported in the simplified product.");
}
