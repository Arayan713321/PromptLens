import { currentUser } from "@clerk/nextjs/server";
import { canUseDatabase, prisma } from "@/lib/prisma";
import type { Prompt, EvaluationRun, EvaluationResult } from "@/types";
import type { Prisma } from "@prisma/client";

type AppData = {
  usingDatabase: boolean;
  prompts: Prompt[];
  evaluationRuns: EvaluationRun[];
};

export async function getAppData(
  clerkId?: string | null,
  options?: {
    prompts?: boolean;
    evaluationRuns?: boolean;
  }
): Promise<AppData> {
  if (!(await canUseDatabase())) {
    return {
      usingDatabase: false,
      prompts: [],
      evaluationRuns: [],
    };
  }

  let userId: string | undefined = undefined;
  if (clerkId) {
    let user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      try {
        const clerkUser = await currentUser();
        if (clerkUser && clerkUser.id === clerkId) {
          const email = clerkUser.emailAddresses[0]?.emailAddress ?? `${clerkUser.id}@promptlens.ai`;
          const name = clerkUser.fullName ?? clerkUser.firstName ?? "User";
          
          // Find if there is an existing user with the same email
          const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
          if (existingUserByEmail) {
            user = await prisma.user.update({
              where: { id: existingUserByEmail.id },
              data: { clerkId },
            });
          } else {
            user = await prisma.user.create({
              data: { clerkId, email, name },
            });
          }
        }
      } catch (err) {
        console.error("Clerk sync failed in getAppData:", err);
      }
    }
    if (user) {
      userId = user.id;
    }
  }

  const fetchAll = !options;
  const needPrompts = fetchAll || options?.prompts;
  const needRuns = fetchAll || options?.evaluationRuns;

  const [prompts, evaluationRuns] = await Promise.all([
    needPrompts
      ? prisma.prompt.findMany({
          where: userId ? { userId } : undefined,
          orderBy: { updatedAt: "desc" },
        })
      : Promise.resolve([]),
    needRuns
      ? prisma.evaluation.findMany({
          where: userId ? { prompt: { userId } } : undefined,
          include: { results: true },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const normalizedPrompts = prompts.map((p): Prompt => ({
    id: p.id,
    userId: p.userId,
    name: p.name,
    description: p.description,
    systemPrompt: p.systemPrompt,
    userPrompt: p.userPrompt,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  type EvaluationWithResults = Prisma.EvaluationGetPayload<{ include: { results: true } }>;

  const normalizedRuns = (evaluationRuns as EvaluationWithResults[]).map((run): EvaluationRun => ({
    id: run.id,
    promptId: run.promptId,
    averageScore: run.averageScore,
    bestModel: run.bestModel,
    cost: run.cost,
    latency: run.latency,
    recommendation: run.recommendation,
    createdAt: run.createdAt.toISOString(),
    results: run.results.map((r): EvaluationResult => ({
      id: r.id,
      evaluationId: r.evaluationId,
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
      createdAt: r.createdAt.toISOString(),
    })),
  }));

  return {
    usingDatabase: true,
    prompts: normalizedPrompts,
    evaluationRuns: normalizedRuns,
  };
}
