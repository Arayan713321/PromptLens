import { prisma } from "@/lib/prisma";

export const DEMO_USER = {
  clerkId: "user_promptlens_demo",
  email: "demo@promptlens.ai",
  name: "PromptLens Demo",
};

export async function getOrCreateDemoUser() {
  return prisma.user.upsert({
    where: { clerkId: DEMO_USER.clerkId },
    update: {},
    create: DEMO_USER,
  });
}
