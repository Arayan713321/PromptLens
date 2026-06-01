import { prisma } from "@/lib/prisma";
import { ensureModels } from "@/lib/model-registry";
import { aggregateScore, scoreWithJudge } from "@/services/judge-service";
import { runProvider } from "@/services/ai-providers";
import { generateInsightsForRun } from "@/services/insight-service";

export async function createEvaluationRun(input: {
  promptId: string;
  promptVersionId?: string;
  datasetId: string;
  modelIds: string[];
}) {
  await ensureModels();

  const prompt = await prisma.prompt.findUnique({
    where: { id: input.promptId },
    include: { versions: { orderBy: { version: "desc" } } },
  });
  if (!prompt) {
    throw new Error("Prompt not found");
  }

  const version =
    prompt.versions.find((item) => item.id === input.promptVersionId) ??
    prompt.versions[0];
  if (!version) {
    throw new Error("Prompt has no versions");
  }

  const dataset = await prisma.dataset.findUnique({
    where: { id: input.datasetId },
    include: { testCases: true },
  });
  if (!dataset || dataset.testCases.length === 0) {
    throw new Error("Dataset not found or empty");
  }

  const modelIds = input.modelIds.length > 0 ? input.modelIds : [version.modelId];
  const run = await prisma.evaluationRun.create({
    data: {
      name: `${prompt.name} evaluation`,
      status: "running",
      promptId: prompt.id,
      promptVersionId: version.id,
      datasetId: dataset.id,
      modelIds,
      averageScore: 0,
      passRate: 0,
      cost: 0,
      latency: 0,
    },
  });

  const results = [];

  for (const [index, testCase] of dataset.testCases.entries()) {
    const modelId = modelIds[index % modelIds.length];
    try {
      const providerResult = await runProvider({
        modelId,
        systemPrompt: version.systemPrompt,
        userPrompt: version.userPrompt,
        variables: {
          input: testCase.input,
          expected_output: testCase.expectedOutput,
          rubric: "Score correctness, relevance, completeness, clarity, and hallucination risk.",
        },
        temperature: version.temperature,
        maxTokens: version.maxTokens,
      });
      const breakdown = await scoreWithJudge({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        output: providerResult.output,
      });
      const score = aggregateScore(breakdown);
      const hallucinationRisk = score > 86 ? "low" : score > 76 ? "medium" : "high";

      const result = await prisma.evaluationResult.create({
        data: {
          runId: run.id,
          testCaseId: testCase.id,
          promptVersionId: version.id,
          modelId,
          output: providerResult.output,
          score,
          tokens: providerResult.tokens,
          cost: providerResult.cost,
          latency: providerResult.latency,
          hallucinationRisk,
          passed: score >= 78,
          correctness: breakdown.correctness,
          relevance: breakdown.relevance,
          completeness: breakdown.completeness,
          clarity: breakdown.clarity,
          llmJudge: breakdown.llmJudge,
        },
      });
      results.push(result);
    } catch (error) {
      const result = await prisma.evaluationResult.create({
        data: {
          runId: run.id,
          testCaseId: testCase.id,
          promptVersionId: version.id,
          modelId,
          output: "",
          score: 0,
          tokens: 0,
          cost: 0,
          latency: 0,
          hallucinationRisk: "high",
          passed: false,
          error: error instanceof Error ? error.message : "Unknown evaluation error",
          correctness: 0,
          relevance: 0,
          completeness: 0,
          clarity: 0,
          llmJudge: 0,
        },
      });
      results.push(result);
    }
  }

  const averageScore = results.length
    ? results.reduce((sum, result) => sum + result.score, 0) / results.length
    : 0;
  const passRate = results.length
    ? (results.filter((result) => result.passed).length / results.length) * 100
    : 0;
  const cost = results.reduce((sum, result) => sum + result.cost, 0);
  const latency = results.length
    ? Math.round(results.reduce((sum, result) => sum + result.latency, 0) / results.length)
    : 0;

  const completed = await prisma.evaluationRun.update({
    where: { id: run.id },
    data: {
      status: "completed",
      averageScore,
      passRate,
      cost,
      latency,
    },
    include: { results: true },
  });

  await generateInsightsForRun(completed.id);
  return completed;
}
