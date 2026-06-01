"use client";

import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { EvaluationRun, Prompt } from "@/types";

export function EvaluationsView({
  prompts,
  evaluationRuns,
}: {
  prompts: Prompt[];
  evaluationRuns: EvaluationRun[];
}) {
  return (
    <>
      <PageHeader
        eyebrow="Results Hub"
        title="Prompt Performance scorecards"
        description="Review high-level benchmarks, costs, latencies, and AI judge recommendations across all draft evaluations."
      />
      <div className="max-w-4xl mx-auto mt-6">
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle>Evaluation scorecards</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {evaluationRuns.length > 0 ? (
              evaluationRuns.map((run) => {
                const prompt = prompts.find((p) => p.id === run.promptId);
                return (
                  <Link
                    href={`/evaluations/${run.id}`}
                    key={run.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card-solid/50 p-5 transition hover:border-accent/40 cursor-pointer shadow-sm md:flex-nowrap"
                  >
                    <div>
                      <p className="font-semibold text-foreground text-base">{prompt?.name || run.name}</p>
                      <p className="text-xs text-muted mt-1 leading-relaxed max-w-lg truncate">
                        {prompt?.description || "Automatic prompt evaluation run."}
                      </p>
                      <p className="text-xs text-muted mt-3 font-medium">
                        Cost: {formatCurrency(run.cost)} · Latency: {(run.latency / 1000).toFixed(1)}s · Best model: {run.bestModel}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <strong className="text-lg rounded-lg bg-accent/8 px-3 py-1.5 text-accent font-bold">
                        {run.averageScore}/100
                      </strong>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="py-12 text-center text-sm text-muted">
                No evaluation scorecards found. Head over to the Home Page and test your first prompt!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
