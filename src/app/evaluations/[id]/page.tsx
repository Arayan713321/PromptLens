import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { getAppData } from "@/services/data-service";
import { Sparkles, TerminalSquare } from "lucide-react";

export default async function EvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  const { evaluationRuns } = await getAppData(userId, { evaluationRuns: true });
  const run = evaluationRuns.find((item) => item.id === id);
  if (!run) notFound();

  // Score dimensions helper
  const easyCases = run.results.filter(r => r.difficulty === "easy");
  const medCases = run.results.filter(r => r.difficulty === "medium");
  const hardCases = run.results.filter(r => r.difficulty === "hard");

  return (
    <div className="mx-auto max-w-4xl py-4 space-y-6">
      <PageHeader
        eyebrow="Evaluation Scorecard"
        title="Testing Results Overview"
        description="Detailed plain-English scorecard tracking quality scores, pricing indexes, latencies, and actionable AI instructions."
      />

      {/* Main Scorecard Results Panel */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card className="border border-border shadow-sm">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted tracking-wider uppercase">Prompt Score</p>
            <p className="mt-2 text-3xl font-extrabold text-accent">{run.averageScore}/100</p>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted tracking-wider uppercase">Best Model</p>
            <p className="mt-2 text-3xl font-extrabold text-foreground">{run.bestModel}</p>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted tracking-wider uppercase">Cost</p>
            <p className="mt-2 text-3xl font-extrabold text-foreground">{formatCurrency(run.cost)}</p>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted tracking-wider uppercase">Latency</p>
            <p className="mt-2 text-3xl font-extrabold text-foreground">{(run.latency / 1000).toFixed(1)}s</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendation card */}
      <Card className="border border-accent/20 bg-accent/5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-accent flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            AI Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-foreground leading-relaxed font-medium italic">
            &ldquo;{run.recommendation}&rdquo;
          </p>
        </CardContent>
      </Card>

      {/* Structured Test Cases Inspector */}
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <TerminalSquare className="h-5 w-5 text-muted" />
            Automated Benchmark Test Cases
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3 text-center mb-2">
            <div className="rounded-xl border border-border bg-card-solid/40 p-3">
              <p className="text-xs text-muted uppercase font-semibold">Easy Cases (0-5)</p>
              <strong className="text-lg mt-1 block text-foreground">{easyCases.length > 0 ? `${Math.round(easyCases.reduce((sum, r) => sum + r.score, 0) / easyCases.length)}/100` : "-"}</strong>
            </div>
            <div className="rounded-xl border border-border bg-card-solid/40 p-3">
              <p className="text-xs text-muted uppercase font-semibold">Medium Cases (5-10)</p>
              <strong className="text-lg mt-1 block text-foreground">{medCases.length > 0 ? `${Math.round(medCases.reduce((sum, r) => sum + r.score, 0) / medCases.length)}/100` : "-"}</strong>
            </div>
            <div className="rounded-xl border border-border bg-card-solid/40 p-3">
              <p className="text-xs text-muted uppercase font-semibold">Hard Cases (10-15)</p>
              <strong className="text-lg mt-1 block text-foreground">{hardCases.length > 0 ? `${Math.round(hardCases.reduce((sum, r) => sum + r.score, 0) / hardCases.length)}/100` : "-"}</strong>
            </div>
          </div>

          <div className="space-y-3">
            {run.results.slice(0, 6).map((result, idx) => (
              <div key={result.id} className="rounded-xl border border-border bg-card-solid/60 p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs font-semibold text-muted">Case {idx + 1}</span>
                    <Badge variant="secondary" className="capitalize text-[10px] py-0">{result.difficulty}</Badge>
                    <Badge variant="secondary" className="text-[10px] py-0">Model: {result.modelId.startsWith("gpt") ? "GPT-4o-mini" : "Gemini 1.5 Flash"}</Badge>
                  </div>
                  <strong className="text-sm text-accent">{Math.round(result.score)}/100</strong>
                </div>
                <div className="grid gap-2 border-t border-border pt-2 text-xs">
                  <p className="leading-relaxed"><strong className="text-muted font-semibold">Input query:</strong> {result.input}</p>
                  <p className="leading-relaxed"><strong className="text-muted font-semibold font-mono">Expected Golden:</strong> {result.expectedOutput}</p>
                  <p className="leading-relaxed bg-foreground/5 rounded p-2.5 mt-1 border border-border/10 text-foreground"><strong className="text-muted font-semibold">Actual Model Response:</strong> {result.output}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
