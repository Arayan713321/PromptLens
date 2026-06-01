import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getOrCreateCurrentUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? `${clerkUser.id}@promptlens.ai`;
  const name = clerkUser.fullName ?? clerkUser.firstName ?? "User";

  return prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email,
      name,
    },
    create: {
      clerkId: clerkUser.id,
      email,
      name,
    },
  });
}
