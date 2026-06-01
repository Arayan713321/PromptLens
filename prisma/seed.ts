import { PrismaClient } from "@prisma/client";
import { datasets, evaluationRuns, insights, models, prompts, reports } from "../src/lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { clerkId: "user_promptlens_demo" },
    update: {},
    create: {
      clerkId: "user_promptlens_demo",
      email: "demo@promptlens.ai",
      name: "PromptLens Demo",
    },
  });

  for (const model of models) {
    await prisma.model.upsert({
      where: { id: model.id },
      update: model,
      create: model,
    });
  }

  for (const prompt of prompts) {
    await prisma.prompt.upsert({
      where: { id: prompt.id },
      update: {},
      create: {
        id: prompt.id,
        userId: user.id,
        name: prompt.name,
        description: prompt.description,
        tags: prompt.tags,
        versions: {
          create: prompt.versions.map((version) => ({
            id: version.id,
            version: version.version,
            status: version.status,
            systemPrompt: version.systemPrompt,
            userPrompt: version.userPrompt,
            variables: version.variables,
            temperature: version.temperature,
            maxTokens: version.maxTokens,
            modelId: version.modelId,
          })),
        },
      },
    });
  }

  for (const dataset of datasets) {
    await prisma.dataset.upsert({
      where: { id: dataset.id },
      update: {},
      create: {
        id: dataset.id,
        name: dataset.name,
        description: dataset.description,
        testCases: {
          create: dataset.testCases.map((testCase) => ({
            id: testCase.id,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            taskType: testCase.taskType,
            tags: testCase.tags,
            difficulty: testCase.difficulty,
          })),
        },
      },
    });
  }

  for (const run of evaluationRuns) {
    await prisma.evaluationRun.upsert({
      where: { id: run.id },
      update: {},
      create: {
        id: run.id,
        name: run.name,
        status: run.status,
        promptId: run.promptId,
        promptVersionId: run.promptVersionId,
        datasetId: run.datasetId,
        modelIds: run.modelIds,
        averageScore: run.averageScore,
        passRate: run.passRate,
        cost: run.cost,
        latency: run.latency,
        results: {
          create: run.results.map((result) => ({
            id: result.id,
            testCaseId: result.testCaseId,
            promptVersionId: result.promptVersionId,
            modelId: result.modelId,
            output: result.output,
            score: result.score,
            tokens: result.tokens,
            cost: result.cost,
            latency: result.latency,
            hallucinationRisk: result.hallucinationRisk,
            passed: result.passed,
            error: result.error,
            correctness: result.breakdown.correctness,
            relevance: result.breakdown.relevance,
            completeness: result.breakdown.completeness,
            clarity: result.breakdown.clarity,
            llmJudge: result.breakdown.llmJudge,
          })),
        },
      },
    });
  }

  for (const report of reports) {
    await prisma.report.upsert({
      where: { id: report.id },
      update: {},
      create: {
        id: report.id,
        userId: user.id,
        runId: report.runId,
        title: report.title,
        summary: report.summary,
      },
    });
  }

  for (const insight of insights) {
    await prisma.insight.upsert({
      where: { id: insight.id },
      update: {},
      create: {
        id: insight.id,
        userId: user.id,
        title: insight.title,
        body: insight.body,
        impact: insight.impact,
        category: insight.category,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
