import type {
  Dataset,
  EvaluationResult,
  EvaluationRun,
  Insight,
  Model,
  Prompt,
  Report,
  ScoreBreakdown,
  TestCase,
} from "@/types";

export const models: Model[] = [
  { id: "gpt-4.1", name: "GPT-4.1", provider: "OpenAI", contextWindow: 128000, inputCostPer1K: 0.005, outputCostPer1K: 0.015 },
  { id: "gpt-4.1-mini", name: "GPT-4.1 mini", provider: "OpenAI", contextWindow: 128000, inputCostPer1K: 0.0004, outputCostPer1K: 0.0016 },
  { id: "claude-sonnet-4", name: "Claude Sonnet 4", provider: "Anthropic", contextWindow: 200000, inputCostPer1K: 0.003, outputCostPer1K: 0.015 },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", contextWindow: 1000000, inputCostPer1K: 0.00125, outputCostPer1K: 0.01 },
];

const promptNames = [
  "Support Triage Classifier",
  "Incident Summary Writer",
  "SQL Safety Reviewer",
  "Product Copy Generator",
  "Contract Clause Extractor",
  "Medical Intake Normalizer",
  "FinOps Cost Explainer",
  "Code Review Assistant",
  "Customer Churn Predictor",
  "Knowledge Base Answerer",
];

export const prompts: Prompt[] = promptNames.map((name, index) => {
  const id = `prompt-${index + 1}`;
  return {
    id,
    name,
    description: `Evaluation-ready prompt for ${name.toLowerCase()} workflows with measurable scoring criteria.`,
    owner: index % 2 === 0 ? "Maya Chen" : "Arjun Patel",
    tags: ["evals", index % 3 === 0 ? "production" : "candidate", index % 2 === 0 ? "support" : "ops"],
    updatedAt: `2026-05-${String(22 - index).padStart(2, "0")}T10:15:00.000Z`,
    versions: [1, 2, 3].map((version) => ({
      id: `${id}-v${version}`,
      promptId: id,
      version,
      status: version === 1 ? "baseline" : version === 2 ? "candidate" : "production",
      systemPrompt: "You are a precise AI assistant. Follow the rubric, cite uncertainty, and prefer structured output.",
      userPrompt: `Evaluate {{input}} for ${name.toLowerCase()} and return a concise JSON response with reasoning.`,
      variables: ["input", "expected_output", "rubric"],
      temperature: version === 1 ? 0.2 : 0.35,
      maxTokens: 900 + version * 120,
      modelId: models[(index + version) % models.length].id,
      score: 72 + index + version * 4,
      createdAt: `2026-05-${String(10 + version + index).padStart(2, "0")}T12:00:00.000Z`,
    })),
  };
});

const datasetNames = [
  "Support Tickets Golden Set",
  "Legal Extraction Benchmark",
  "Agentic QA Regression",
  "Product Messaging Suite",
  "Safety and Refusal Cases",
];

const taskTypes = ["classification", "extraction", "summarization", "reasoning", "generation"] as const;
const difficulties = ["easy", "medium", "hard"] as const;

function makeTestCases(datasetId: string, datasetIndex: number): TestCase[] {
  return Array.from({ length: 20 }, (_, index) => ({
    id: `${datasetId}-case-${index + 1}`,
    datasetId,
    input: `Case ${index + 1}: customer asks about ${["refunds", "security", "billing", "latency", "handoff"][index % 5]} with context window ${datasetIndex + index}.`,
    expectedOutput: `Expected structured answer with ${taskTypes[(datasetIndex + index) % taskTypes.length]} rubric coverage.`,
    taskType: taskTypes[(datasetIndex + index) % taskTypes.length],
    tags: [index % 2 === 0 ? "regression" : "golden", index % 4 === 0 ? "edge-case" : "standard"],
    difficulty: difficulties[(datasetIndex + index) % difficulties.length],
  }));
}

export const datasets: Dataset[] = datasetNames.map((name, index) => {
  const id = `dataset-${index + 1}`;
  return {
    id,
    name,
    description: `Curated benchmark dataset for ${name.toLowerCase()} with tagged test cases and expected outputs.`,
    testCases: makeTestCases(id, index),
    createdAt: `2026-04-${String(11 + index).padStart(2, "0")}T09:00:00.000Z`,
  };
});

function breakdown(seed: number): ScoreBreakdown {
  return {
    correctness: 70 + (seed % 24),
    relevance: 74 + (seed % 21),
    completeness: 69 + (seed % 26),
    clarity: 76 + (seed % 19),
    llmJudge: 72 + (seed % 23),
  };
}

export const evaluationRuns: EvaluationRun[] = Array.from({ length: 20 }, (_, index) => {
  const prompt = prompts[index % prompts.length];
  const version = prompt.versions[index % prompt.versions.length];
  const dataset = datasets[index % datasets.length];
  const selectedModels = [models[index % models.length].id, models[(index + 1) % models.length].id];
  const resultCount = 8;
  const results = Array.from({ length: resultCount }, (_, resultIndex) => {
    const score = 68 + ((index * 7 + resultIndex * 5) % 29);
    const tokens = 820 + index * 34 + resultIndex * 19;
    const latency = 720 + ((index + resultIndex) % 8) * 145;
    const cost = Number((tokens * 0.000009 + resultIndex * 0.0007).toFixed(4));
    const hallucinationRisk: EvaluationResult["hallucinationRisk"] = score > 86 ? "low" : score > 76 ? "medium" : "high";
    return {
      id: `result-${index + 1}-${resultIndex + 1}`,
      runId: `run-${index + 1}`,
      testCaseId: dataset.testCases[resultIndex].id,
      promptVersionId: version.id,
      modelId: selectedModels[resultIndex % selectedModels.length],
      output: `Structured answer for ${dataset.testCases[resultIndex].input} with cited assumptions and rubric-aligned reasoning.`,
      score,
      tokens,
      cost,
      latency,
      hallucinationRisk,
      passed: score >= 78,
      breakdown: breakdown(index + resultIndex),
    };
  });
  const averageScore = Math.round(results.reduce((sum, result) => sum + result.score, 0) / resultCount);
  return {
    id: `run-${index + 1}`,
    name: `${prompt.name} regression ${index + 1}`,
    status: index === 0 ? "running" : index === 3 ? "queued" : "completed",
    timestamp: `2026-05-${String(30 - (index % 18)).padStart(2, "0")}T${String(8 + (index % 10)).padStart(2, "0")}:30:00.000Z`,
    promptId: prompt.id,
    promptVersionId: version.id,
    datasetId: dataset.id,
    modelIds: selectedModels,
    averageScore,
    passRate: Math.round((results.filter((result) => result.passed).length / resultCount) * 100),
    cost: Number(results.reduce((sum, result) => sum + result.cost, 0).toFixed(3)),
    latency: Math.round(results.reduce((sum, result) => sum + result.latency, 0) / resultCount),
    results,
  };
});

export const insights: Insight[] = [
  { id: "insight-1", title: "Version 4 is outperforming the baseline", body: "Prompt version 4 performs 17% better than version 3 on hard reasoning cases while keeping cost within 4%.", impact: "high", category: "quality" },
  { id: "insight-2", title: "Ambiguous instruction detected", body: "Several prompts ask the model to be concise and exhaustive at the same time. Split those goals into prioritized rubric criteria.", impact: "medium", category: "quality" },
  { id: "insight-3", title: "Few-shot examples could stabilize outputs", body: "Add two positive and one negative example to improve JSON validity and reduce evaluator variance.", impact: "high", category: "quality" },
  { id: "insight-4", title: "Latency spike on Gemini runs", body: "Gemini 2.5 Pro runs are 28% slower on extraction workloads. Route low-risk extraction jobs to GPT-4.1 mini.", impact: "medium", category: "latency" },
  { id: "insight-5", title: "Cost savings available", body: "Candidate prompts under 900 output tokens can move to smaller models for an estimated monthly savings of $1,240.", impact: "high", category: "cost" },
  { id: "insight-6", title: "Safety rubric coverage is thin", body: "Refusal and policy boundary cases only represent 8% of the current test set. Add more adversarial cases before production rollout.", impact: "medium", category: "safety" },
];

export const reports: Report[] = evaluationRuns.slice(0, 6).map((run, index) => ({
  id: `report-${index + 1}`,
  title: `${run.name} report`,
  runId: run.id,
  createdAt: run.timestamp,
  summary: `Run achieved ${run.averageScore}/100 average score with ${run.passRate}% pass rate across ${run.results.length} sampled cases.`,
}));

export const performanceSeries = [
  { month: "Jan", score: 72, passRate: 70, cost: 920, latency: 1240 },
  { month: "Feb", score: 75, passRate: 73, cost: 980, latency: 1180 },
  { month: "Mar", score: 79, passRate: 78, cost: 1120, latency: 1090 },
  { month: "Apr", score: 82, passRate: 81, cost: 1260, latency: 1010 },
  { month: "May", score: 86, passRate: 84, cost: 1190, latency: 970 },
  { month: "Jun", score: 88, passRate: 87, cost: 1325, latency: 930 },
];

export const comparisonRows = datasets[0].testCases.slice(0, 8).map((testCase, index) => ({
  testCase,
  versions: prompts[0].versions.map((version, versionIndex) => ({
    version,
    output: `V${version.version} response: ${versionIndex === 2 ? "precise, schema-valid answer" : "partially complete answer"} for ${testCase.input}`,
    score: 72 + index * 2 + versionIndex * 7,
    cost: Number((0.007 + index * 0.001 + versionIndex * 0.002).toFixed(3)),
    latency: 840 + index * 42 + versionIndex * 80,
  })),
}));
