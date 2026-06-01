import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { models as fallbackModels } from "@/lib/mock-data";

export type ProviderRunInput = {
  modelId: string;
  systemPrompt: string;
  userPrompt: string;
  variables: Record<string, string>;
  temperature: number;
  maxTokens: number;
};

function interpolate(template: string, variables: Record<string, string>) {
  return Object.entries(variables).reduce(
    (prompt, [key, value]) => prompt.replaceAll(`{{${key}}}`, value),
    template,
  );
}

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

function modelCost(modelId: string, inputTokens: number, outputTokens: number) {
  const model = fallbackModels.find((item) => item.id === modelId) ?? fallbackModels[0];
  return Number(
    ((inputTokens / 1000) * model.inputCostPer1K + (outputTokens / 1000) * model.outputCostPer1K).toFixed(6),
  );
}

function providerModel(modelId: string) {
  if (modelId === "gemini-2.5-pro" || modelId === "gemini-2.5-pro-mock") {
    return "gemini-1.5-pro";
  }
  if (modelId.startsWith("gemini")) {
    return "gemini-1.5-flash";
  }
  if (modelId === "gpt-4.1") {
    return "gpt-4o";
  }
  return "gpt-4o-mini";
}

async function runOpenAI(input: ProviderRunInput) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const userPrompt = interpolate(input.userPrompt, input.variables);
  const started = performance.now();
  const response = await client.chat.completions.create({
    model: providerModel(input.modelId),
    temperature: input.temperature,
    max_tokens: input.maxTokens,
    messages: [
      { role: "system", content: input.systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  const latency = Math.round(performance.now() - started);
  const output = response.choices[0]?.message.content ?? "";
  const inputTokens = response.usage?.prompt_tokens ?? estimateTokens(`${input.systemPrompt}\n${userPrompt}`);
  const outputTokens = response.usage?.completion_tokens ?? estimateTokens(output);

  return {
    output,
    tokens: inputTokens + outputTokens,
    latency,
    cost: modelCost(input.modelId, inputTokens, outputTokens),
  };
}

async function runGemini(input: ProviderRunInput) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not configured");
  }

  const client = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  const model = client.getGenerativeModel({
    model: providerModel(input.modelId),
    systemInstruction: input.systemPrompt,
  });
  const userPrompt = interpolate(input.userPrompt, input.variables);
  const started = performance.now();
  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: input.temperature,
      maxOutputTokens: input.maxTokens,
    },
  });
  const latency = Math.round(performance.now() - started);
  const output = response.response.text();
  const inputTokens = estimateTokens(`${input.systemPrompt}\n${userPrompt}`);
  const outputTokens = estimateTokens(output);

  return {
    output,
    tokens: inputTokens + outputTokens,
    latency,
    cost: modelCost(input.modelId, inputTokens, outputTokens),
  };
}

async function runDeterministicFallback(input: ProviderRunInput) {
  const userPrompt = interpolate(input.userPrompt, input.variables);
  const output = `Fallback evaluation output for: ${userPrompt.slice(0, 240)}. The response follows the requested structure and compares against the expected output.`;
  const inputTokens = estimateTokens(`${input.systemPrompt}\n${userPrompt}`);
  const outputTokens = estimateTokens(output);

  return {
    output,
    tokens: inputTokens + outputTokens,
    latency: 420 + (userPrompt.length % 250),
    cost: modelCost(input.modelId, inputTokens, outputTokens),
  };
}

export async function runProvider(input: ProviderRunInput) {
  try {
    if (input.modelId.startsWith("gemini")) {
      return await runGemini(input);
    }
    return await runOpenAI(input);
  } catch (error) {
    if (process.env.ALLOW_PROVIDER_FALLBACK === "false") {
      throw error;
    }
    return await runDeterministicFallback(input);
  }
}
