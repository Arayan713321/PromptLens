import { prisma } from "@/lib/prisma";
import { models } from "@/lib/mock-data";

export async function ensureModels() {
  await Promise.all(
    models.map((model) =>
      prisma.model.upsert({
        where: { id: model.id },
        update: model,
        create: model,
      }),
    ),
  );
}
