"use client";

import { useState } from "react";
import { Sparkles, TerminalSquare, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Prompt, EvaluationRun } from "@/types";

export function DashboardView({
  prompts,
  evaluationRuns,
}: {
  prompts: Prompt[];
  evaluationRuns: EvaluationRun[];
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [optionalPrompt, setOptionalPrompt] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  const handleGenerateAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError("Please fill out the prompt name and the goal/scope.");
      return;
    }

    setLoading(true);
    setError("");

    const messages = [
      "Analyzing prompt scope...",
      "Generating system and user instructions...",
      "Synthesizing 15 balanced benchmark test cases...",
      "Executing queries concurrently on OpenAI GPT-4o-mini...",
      "Executing queries concurrently on Google Gemini 1.5 Flash...",
      "Running LLM-as-a-judge quality evaluations...",
      "Creating actionable AI recommendations...",
      "Finalizing scorecard details..."
    ];

    let messageIndex = 0;
    setStatusMessage(messages[0]);
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setStatusMessage(messages[messageIndex]);
    }, 2800);

    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, optionalPrompt }),
      });

      clearInterval(interval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate and test prompt.");
      }

      const data = await res.json();
      // Redirect to the evaluation scorecard page
      window.location.href = `/evaluations/${data.evaluation.id}`;
    } catch (err: unknown) {
      const errorObject = err as Error;
      clearInterval(interval);
      setLoading(false);
      setError(errorObject.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl py-4">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          What prompt are we building?
        </h1>
        <p className="mt-3 text-lg text-muted">
          Enter a name and scope. We will generate instructions, test cases, run live models, and judge the outputs automatically.
        </p>
      </div>

      {/* Main ChatGPT-like input card */}
      <Card className="border border-border bg-card shadow-md">
        <CardContent className="pt-6">
          {loading ? (
            <div className="py-12 px-6 text-center flex flex-col items-center justify-center">
              <div className="relative mb-8 flex items-center justify-center">
                <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-accent/20 blur-md" />
                <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-accent to-accent-2 p-0.5 shadow-lg shadow-accent/25 flex items-center justify-center animate-pulse">
                  <Sparkles className="h-7 w-7 text-white animate-spin [animation-duration:8s]" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground tracking-tight transition-all duration-500">
                {statusMessage}
              </h3>
              <p className="text-sm text-muted mt-2 max-w-md mx-auto leading-relaxed">
                PromptLens is currently running live benchmark scenarios on both GPT-4o-mini and Gemini 1.5 Flash in parallel.
              </p>
              
              {/* Micro-animated visual pipeline tracker */}
              <div className="mt-8 w-full max-w-md mx-auto space-y-4 rounded-xl border border-border bg-card-solid/40 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-accent">Live Execution Status</span>
                  <span className="text-muted animate-pulse">Running...</span>
                </div>
                <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent to-accent-2 rounded-full animate-[shimmer_2s_infinite] bg-[length:200%_100%] bg-gradient-to-r from-accent via-accent-2 to-accent" style={{ width: "100%" }}></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-muted font-medium">
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-accent animate-ping" />
                    <span>1. Synthesize Cases</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-accent-2 animate-pulse" />
                    <span>2. Dual Provider Run</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-muted" />
                    <span>3. LLM-as-a-judge</span>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-muted/80 mt-6 italic">This takes about 15-20 seconds to complete full live multi-model testing.</p>
            </div>
          ) : (
            <form onSubmit={handleGenerateAndTest} className="space-y-6">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  1. Prompt Name
                  <span className="text-xs font-normal text-muted/80">(e.g., Support Bot, Email Assistant)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Customer Support Assistant..."
                  className="h-11 rounded-xl border border-border bg-card-solid px-4 text-sm text-foreground transition focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  2. Prompt Goal / Scope
                  <span className="text-xs font-normal text-muted/80">(Describe what this assistant should excel at)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Handle customer complaints professionally, prioritize refunds, and answer FAQs using billing registry guidelines."
                  rows={3}
                  className="rounded-xl border border-border bg-card-solid p-4 text-sm text-foreground transition focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  3. Optional Custom Prompt 
                  <span className="text-xs font-normal text-muted/80">(Leave empty to let AI design your instructions)</span>
                </label>
                <textarea
                  value={optionalPrompt}
                  onChange={(e) => setOptionalPrompt(e.target.value)}
                  placeholder="You are a professional support agent. You always speak politely and never share internal database IDs."
                  rows={2}
                  className="rounded-xl border border-border bg-card-solid p-4 text-sm text-foreground transition focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2.5 rounded-xl bg-danger/8 p-3.5 text-sm text-danger border border-danger/15 animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full gap-2.5 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-[0.98] shadow-md shadow-accent/10 hover:shadow-lg hover:shadow-accent/20">
                <Sparkles className="h-4.5 w-4.5" />
                Generate & Test
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Recents list */}
      {!loading && prompts.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-3.5 flex items-center gap-2">
            <TerminalSquare className="h-4.5 w-4.5 text-muted" />
            Recent Prompt Drafts
          </h2>
          <div className="grid gap-3">
            {prompts.slice(0, 4).map((prompt) => {
              const matchingRuns = evaluationRuns.filter((r) => r.promptId === prompt.id);
              const latestRun = matchingRuns[0];
              return (
                <div
                  key={prompt.id}
                  onClick={() => {
                    if (latestRun) {
                      window.location.href = `/evaluations/${latestRun.id}`;
                    } else {
                      window.location.href = `/prompts/${prompt.id}`;
                    }
                  }}
                  className="flex items-center justify-between rounded-xl border border-border bg-card-solid/60 p-4 transition hover:border-accent/30 cursor-pointer shadow-sm"
                >
                  <div>
                    <h3 className="text-sm font-semibold">{prompt.name}</h3>
                    <p className="text-xs text-muted mt-1 max-w-md truncate">{prompt.description}</p>
                  </div>
                  {latestRun && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted">Best model: {latestRun.bestModel}</span>
                      <strong className="text-sm rounded-lg bg-accent/8 px-2.5 py-1 text-accent">
                        {latestRun.averageScore}/100
                      </strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
