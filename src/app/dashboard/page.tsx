import { auth } from "@clerk/nextjs/server";
import { DashboardView } from "@/features/dashboard/dashboard-view";
import { getAppData } from "@/services/data-service";

export default async function DashboardPage() {
  const { userId } = await auth();
  const data = await getAppData(userId, { prompts: true, evaluationRuns: true });
  return (
    <DashboardView
      prompts={data.prompts}
      evaluationRuns={data.evaluationRuns}
    />
  );
}
