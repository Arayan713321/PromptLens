// Legacy service — not used by the current simplified product.
// Kept as a stub to satisfy TypeScript compilation.

type ScoreBreakdown = {
  correctness: number;
  relevance: number;
  completeness: number;
  clarity: number;
  llmJudge: number;
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function heuristicJudge(output: string, expectedOutput: string): ScoreBreakdown {
  const outputLower = output.toLowerCase();
  const expectedWords = expectedOutput.toLowerCase().split(/\W+/).filter(Boolean);
  const overlap = expectedWords.length
    ? expectedWords.filter((word) => outputLower.includes(word)).length / expectedWords.length
    : 0.7;
  const jsonBonus = output.trim().startsWith("{") || output.includes(":") ? 8 : 0;
  const completeness = output.length > 160 ? 84 : 68;
  const correctness = clampScore(55 + overlap * 35 + jsonBonus);

  return {
    correctness,
    relevance: clampScore(70 + overlap * 24),
    completeness: clampScore(completeness),
    clarity: clampScore(output.split(/\s+/).length < 220 ? 86 : 74),
    llmJudge: clampScore((correctness + completeness + 82) / 3),
  };
}

export async function scoreWithJudge(input: {
  input: string;
  expectedOutput: string;
  output: string;
}): Promise<ScoreBreakdown> {
  return heuristicJudge(input.output, input.expectedOutput);
}

export function aggregateScore(breakdown: ScoreBreakdown) {
  return clampScore(
    breakdown.correctness * 0.35 +
      breakdown.relevance * 0.2 +
      breakdown.completeness * 0.2 +
      breakdown.clarity * 0.1 +
      breakdown.llmJudge * 0.15,
  );
}
