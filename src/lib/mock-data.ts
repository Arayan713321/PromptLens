// Model pricing registry used by ai-providers.ts for cost calculations.

export type Model = {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  inputCostPer1K: number;
  outputCostPer1K: number;
};

export const models: Model[] = [
  { id: "gpt-4o-mini",      name: "GPT-4o mini",      provider: "OpenAI",    contextWindow: 128000,   inputCostPer1K: 0.00015, outputCostPer1K: 0.0006  },
  { id: "gpt-4o",           name: "GPT-4o",            provider: "OpenAI",    contextWindow: 128000,   inputCostPer1K: 0.005,   outputCostPer1K: 0.015   },
  { id: "gpt-4.1",          name: "GPT-4.1",           provider: "OpenAI",    contextWindow: 128000,   inputCostPer1K: 0.005,   outputCostPer1K: 0.015   },
  { id: "gpt-4.1-mini",     name: "GPT-4.1 mini",      provider: "OpenAI",    contextWindow: 128000,   inputCostPer1K: 0.0004,  outputCostPer1K: 0.0016  },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash",  provider: "Google",    contextWindow: 1000000,  inputCostPer1K: 0.000075, outputCostPer1K: 0.0003 },
  { id: "gemini-1.5-pro",   name: "Gemini 1.5 Pro",    provider: "Google",    contextWindow: 1000000,  inputCostPer1K: 0.00125, outputCostPer1K: 0.005   },
  { id: "gemini-2.5-pro",   name: "Gemini 2.5 Pro",    provider: "Google",    contextWindow: 1000000,  inputCostPer1K: 0.00125, outputCostPer1K: 0.01    },
];
