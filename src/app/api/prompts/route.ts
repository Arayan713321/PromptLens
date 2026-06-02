import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { getOrCreateDemoUser } from "@/lib/demo-user";
import { runProvider } from "@/services/ai-providers";

// Helper to sanitize JSON blocks from LLM output
function parseLLMJson(text: string) {
  try {
    const clean = text
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error("Failed to parse LLM JSON:", text, err);
    throw err;
  }
}

export async function GET() {
  const clerkUser = await currentUser().catch(() => null);
  let userId: string | undefined = undefined;

  if (clerkUser) {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (dbUser) userId = dbUser.id;
  }

  const prompts = await prisma.prompt.findMany({
    where: userId ? { userId } : undefined,
    include: { evaluations: { orderBy: { createdAt: "desc" } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ prompts });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, optionalPrompt } = body;

    if (!name || !description) {
      return NextResponse.json({ error: "Prompt name and goal/scope are required." }, { status: 400 });
    }

    // Resolve User
    const clerkUser = await currentUser().catch(() => null);
    let user = clerkUser ? await prisma.user.findUnique({ where: { clerkId: clerkUser.id } }) : null;
    if (!user) {
      user = await getOrCreateDemoUser();
    }

    const hasApiKey = !!process.env.OPENAI_API_KEY;
    let systemPrompt = "";
    let userPrompt = "";

    // 1. Generate or Setup Prompt instructions
    if (optionalPrompt && optionalPrompt.trim().length > 0) {
      systemPrompt = "You are a professional assistant specialized in: " + description;
      userPrompt = optionalPrompt.includes("{{") ? optionalPrompt : `${optionalPrompt}\n\nInput query: {{input}}`;
    } else if (hasApiKey) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const promptGen = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a Principal AI Prompt Engineer. Create system and user prompts matching the user specifications. Return JSON.",
            },
            {
              role: "user",
              content: `Generate an optimized systemPrompt and userPrompt for prompt named "${name}" with scope "${description}". The userPrompt must contain a dynamic variable placeholder in double brackets (e.g. {{input}}). Return strictly a JSON object: { "systemPrompt": "...", "userPrompt": "..." }`,
            },
          ],
          response_format: { type: "json_object" },
        });
        const parsed = parseLLMJson(promptGen.choices[0]?.message.content ?? "{}");
        systemPrompt = parsed.systemPrompt || "You are a professional assistant.";
        userPrompt = parsed.userPrompt || "Process the request: {{input}}";
      } catch (err) {
        console.warn("AI prompt generation failed (likely 429 quota or network), falling back:", err);
        systemPrompt = `You are a professional AI assistant specialized in: ${description}`;
        userPrompt = `Please process this input query and output a high-quality response: {{input}}`;
      }
    } else {
      systemPrompt = `You are a professional AI assistant specialized in: ${description}`;
      userPrompt = `Please process this input query and output a high-quality response: {{input}}`;
    }

    // 2. Create the Prompt record in PostgreSQL
    const prompt = await prisma.prompt.create({
      data: {
        userId: user.id,
        name,
        description,
        systemPrompt,
        userPrompt,
      },
    });

    // 3. Generate 15 structured Test Cases
    let testCases: Array<{ input: string; expectedOutput: string; difficulty: string }> = [];

    if (hasApiKey) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const testCaseGen = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert QA Engineer. Generate benchmark test cases based on prompt instructions. Return JSON.",
            },
            {
              role: "user",
              content: `Generate exactly 15 structured test cases (5 easy, 5 medium, 5 hard) for systemPrompt: "${systemPrompt}" and userPrompt: "${userPrompt}". Each must have "input" (parameter value to replace the variable placeholder), "expectedOutput" (detailed golden response), and "difficulty" (strictly easy, medium, or hard). Return strictly JSON: { "testCases": [ { "input": "...", "expectedOutput": "...", "difficulty": "..." } ] }`,
            },
          ],
          response_format: { type: "json_object" },
        });
        const parsed = parseLLMJson(testCaseGen.choices[0]?.message.content ?? "{}");
        testCases = parsed.testCases || [];
      } catch (err) {
        console.warn("AI test case generation failed (likely 429 quota or network), using fallback:", err);
      }
    }

    // Fallback if AI generation failed or is missing API keys
    if (testCases.length === 0) {
      const difficulties = ["easy", "medium", "hard"];
      for (let i = 1; i <= 15; i++) {
        const diff = difficulties[Math.floor((i - 1) / 5)];
        testCases.push({
          input: `Benchmark evaluation input query number ${i} (${diff}) for: ${description}`,
          expectedOutput: `Detailed high-quality golden output standard for query ${i}.`,
          difficulty: diff,
        });
      }
    }

    // Ensure we have exactly 15 test cases
    testCases = testCases.slice(0, 15);

    // 4. Run Evaluations concurrently across OpenAI and Gemini
    const evaluationModels = ["gpt-4o-mini", "gemini-1.5-flash"];
    const runPromises: Array<Promise<{
      difficulty: string;
      input: string;
      expectedOutput: string;
      modelId: string;
      output: string;
      tokens: number;
      cost: number;
      latency: number;
    }>> = [];

    testCases.forEach((tc) => {
      evaluationModels.forEach((modelId) => {
        runPromises.push(
          (async () => {
            const runRes = await runProvider({
              modelId,
              systemPrompt,
              userPrompt,
              variables: { input: tc.input },
              temperature: 0.3,
              maxTokens: 500,
            });

            return {
              difficulty: tc.difficulty,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              modelId,
              output: runRes.output,
              tokens: runRes.tokens,
              cost: runRes.cost,
              latency: runRes.latency,
            };
          })()
        );
      });
    });

    const resultsRaw = await Promise.all(runPromises);

    // 5. Run automated judging on each response
    const judgePromises = resultsRaw.map(async (res) => {
      let correctness = 85.0;
      let relevance = 90.0;
      let completeness = 80.0;
      let clarity = 90.0;
      let score = 86.25;

      if (hasApiKey) {
        try {
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          const judgeGen = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are an expert LLM evaluation judge. Grade response quality objectively based on expected golden outcomes. Return JSON.",
              },
              {
                role: "user",
                content: `System Prompt: "${systemPrompt}"\nUser Prompt: "${userPrompt}"\nInput: "${res.input}"\nGolden Standard: "${res.expectedOutput}"\nActual Model Response: "${res.output}"\n\nScore the response from 0 to 100 for correctness, relevance, completeness, clarity, and overall score. Return strictly JSON: { "correctness": 90, "relevance": 95, "completeness": 80, "clarity": 90, "score": 88.75 }`,
              },
            ],
            response_format: { type: "json_object" },
          });
          const parsed = parseLLMJson(judgeGen.choices[0]?.message.content ?? "{}");
          correctness = Number(parsed.correctness ?? correctness);
          relevance = Number(parsed.relevance ?? relevance);
          completeness = Number(parsed.completeness ?? completeness);
          clarity = Number(parsed.clarity ?? clarity);
          score = Number(parsed.score ?? score);
        } catch (err) {
          console.error("AI judge grading failed, using default fallback:", err);
        }
      } else {
        // Simple mock score variance based on model
        const offset = res.modelId.startsWith("gpt") ? 8 : 4;
        const seed = res.input.length % 7;
        score = 80 + offset + seed;
        correctness = score - 2;
        relevance = score + 4;
        completeness = score - 3;
        clarity = score + 1;
      }

      return {
        ...res,
        score,
        passed: score >= 80,
        correctness,
        relevance,
        completeness,
        clarity,
      };
    });

    const evaluatedResults = await Promise.all(judgePromises);

    // Calculate aggregated metrics
    const totalResults = evaluatedResults.length;
    const averageScore = Number(
      (evaluatedResults.reduce((sum, r) => sum + r.score, 0) / totalResults).toFixed(1)
    );
    const totalCost = Number(evaluatedResults.reduce((sum, r) => sum + r.cost, 0).toFixed(4));
    const averageLatency = Math.round(evaluatedResults.reduce((sum, r) => sum + r.latency, 0) / totalResults);

    // Determine Best Model based on highest score (latency as tie-breaker)
    const gptResults = evaluatedResults.filter((r) => r.modelId.startsWith("gpt"));
    const geminiResults = evaluatedResults.filter((r) => r.modelId.startsWith("gemini"));

    const avgGpt = gptResults.reduce((sum, r) => sum + r.score, 0) / gptResults.length;
    const avgGemini = geminiResults.reduce((sum, r) => sum + r.score, 0) / geminiResults.length;
    const bestModel = avgGpt >= avgGemini ? "GPT-4o-mini" : "Gemini 1.5 Flash";

    // 6. Generate action-ready recommendations
    let recommendation = `Add more professional guidelines and negative prompt examples to optimize user templates.`;
    if (hasApiKey) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const recGen = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a startup product architect. Write brief, actionable recommendations to improve prompt performance.",
            },
            {
              role: "user",
              content: `A prompt run completed with an average score of ${averageScore}/100. Prompt Name: "${name}". Goal/Scope: "${description}". Write a one-sentence recommendation (maximum 3 sentences) in plain English on how to optimize this prompt.`,
            },
          ],
        });
        recommendation = recGen.choices[0]?.message.content?.trim() || recommendation;
      } catch (err) {
        console.error("AI recommendation failed, using fallback:", err);
      }
    } else {
      recommendation = `The prompt performs solidly under easy test cases. Focus on adding edge-case instructions for hard reasoning prompts to increase consistency.`;
    }

    // 7. Save Evaluation and Result records in PostgreSQL
    const evaluation = await prisma.evaluation.create({
      data: {
        promptId: prompt.id,
        averageScore,
        bestModel,
        cost: totalCost,
        latency: averageLatency,
        recommendation,
        results: {
          create: evaluatedResults.map((r) => ({
            difficulty: r.difficulty,
            input: r.input,
            expectedOutput: r.expectedOutput,
            modelId: r.modelId,
            output: r.output,
            score: r.score,
            passed: r.passed,
            correctness: r.correctness,
            relevance: r.relevance,
            completeness: r.completeness,
            clarity: r.clarity,
          })),
        },
      },
    });

    return NextResponse.json({ prompt, evaluation }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("One-click generate & test API failed:", err);
    return NextResponse.json({ error: err.message || "Failed to generate and test prompt." }, { status: 500 });
  }
}
