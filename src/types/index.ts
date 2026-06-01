export type Prompt = {
  id: string;
  userId: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  createdAt: string;
  updatedAt: string;
};

export type EvaluationResult = {
  id: string;
  evaluationId: string;
  difficulty: string;
  input: string;
  expectedOutput: string;
  modelId: string;
  output: string;
  score: number;
  passed: boolean;
  correctness: number;
  relevance: number;
  completeness: number;
  clarity: number;
  createdAt: string;
};

export type EvaluationRun = {
  id: string;
  promptId: string;
  averageScore: number;
  bestModel: string;
  cost: number;
  latency: number;
  recommendation: string;
  results: EvaluationResult[];
  createdAt: string;
};
