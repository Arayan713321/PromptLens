import { auth } from "@clerk/nextjs/server";
import { PromptsView } from "@/features/prompts/prompts-view";
import { getAppData } from "@/services/data-service";

export default async function PromptsPage() {
  const { userId } = await auth();
  const data = await getAppData(userId, { prompts: true });
  return <PromptsView prompts={data.prompts} />;
}
