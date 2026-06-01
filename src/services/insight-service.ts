import { prisma } from "@/lib/prisma";
import type { InsightCategory, InsightImpact } from "@/types";

function impact(score: number): InsightImpact {
  if (score < 72) return "high";
  if (score < 82) return "medium";
  return "low";
}

export async function generateInsightsForRun(runId: string) {
  const run = await prisma.evaluationRun.findUnique({
    where: { id: runId },
    include: { results: true, prompt: true, dataset: true },
  });

  if (!run || run.results.length === 0) {
    return [];
  }

  const userId = run.prompt.userId;
  const averageScore = Math.round(run.averageScore);
  const averageLatency = Math.round(run.latency);
  const totalCost = Number(run.cost.toFixed(4));
  const failureRate = 100 - run.passRate;

  const candidates: Array<{
    title: string;
    body: string;
    category: InsightCategory;
    impact: InsightImpact;
  }> = [
    {
      title: "Evaluation quality signal",
      body: `${run.prompt.name} scored ${averageScore}/100 on ${run.dataset.name}. Focus review on failed cases before promotion.`,
      category: "quality",
      impact: impact(averageScore),
    },
    {
      title: "Failure cluster detected",
      body: `${failureRate}% of evaluated cases failed. Add examples that mirror the failed inputs and tighten expected output constraints.`,
      category: "quality",
      impact: failureRate > 25 ? "high" : "medium",
    },
    {
      title: "Latency baseline recorded",
      body: `Average latency is ${averageLatency}ms across selected models. Use this as the deployment baseline for future regressions.`,
      category: "latency",
      impact: averageLatency > 2500 ? "high" : averageLatency > 1200 ? "medium" : "low",
    },
    {
      title: "Cost baseline recorded",
      body: `This run cost $${totalCost}. Compare future prompt versions against this amount before moving candidates to production.`,
      category: "cost",
      impact: totalCost > 1 ? "medium" : "low",
    },
  ];

  await prisma.insight.createMany({
    data: candidates.map((item) => ({
      userId,
      title: item.title,
      body: item.body,
      category: item.category,
      impact: item.impact,
    })),
  });

  return candidates;
}
