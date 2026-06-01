import { auth } from "@clerk/nextjs/server";
import { EvaluationsView } from "@/features/evaluations/evaluations-view";
import { getAppData } from "@/services/data-service";

export default async function EvaluationsPage() {
  const { userId } = await auth();
  const data = await getAppData(userId, { prompts: true, evaluationRuns: true });
  return (
    <EvaluationsView
      prompts={data.prompts}
      evaluationRuns={data.evaluationRuns}
    />
  );
}
