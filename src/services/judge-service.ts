import OpenAI from "openai";
import type { ScoreBreakdown } from "@/types";

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
  if (!process.env.OPENAI_API_KEY) {
    return heuristicJudge(input.output, input.expectedOutput);
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_JUDGE_MODEL ?? "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an LLM evaluation judge. Return JSON with numeric 0-100 keys: correctness, relevance, completeness, clarity, llmJudge.",
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
    });
    const parsed = JSON.parse(response.choices[0]?.message.content ?? "{}");
    return {
      correctness: clampScore(Number(parsed.correctness)),
      relevance: clampScore(Number(parsed.relevance)),
      completeness: clampScore(Number(parsed.completeness)),
      clarity: clampScore(Number(parsed.clarity)),
      llmJudge: clampScore(Number(parsed.llmJudge)),
    };
  } catch {
    return heuristicJudge(input.output, input.expectedOutput);
  }
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
