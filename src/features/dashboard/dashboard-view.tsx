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
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent mb-5" />
              <p className="text-lg font-medium text-foreground animate-pulse">{statusMessage}</p>
              <p className="text-xs text-muted mt-2">This will take about 15-20 seconds to complete full live multi-model testing.</p>
            </div>
          ) : (
            <form onSubmit={handleGenerateAndTest} className="space-y-5">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                  1. Prompt Name
                  <span className="text-xs font-normal text-muted">(e.g., Support Bot, Email Assistant)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Customer Support Assistant..."
                  className="h-11 rounded-lg border border-border bg-card-solid px-3.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                  2. Prompt Goal / Scope
                  <span className="text-xs font-normal text-muted">(Describe what this assistant should excel at)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Handle customer complaints professionally, prioritize refunds, and answer FAQs using billing registry guidelines."
                  rows={3}
                  className="rounded-lg border border-border bg-card-solid p-3.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  3. Optional Custom Prompt 
                  <span className="text-xs font-normal text-muted">(Leave empty to let AI design your instructions)</span>
                </label>
                <textarea
                  value={optionalPrompt}
                  onChange={(e) => setOptionalPrompt(e.target.value)}
                  placeholder="You are a professional support agent. You always speak politely and never share internal database IDs."
                  rows={2}
                  className="rounded-lg border border-border bg-card-solid p-3.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-danger/8 p-3 text-sm text-danger border border-danger/12">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full gap-2 text-sm font-semibold tracking-wide">
                <Sparkles className="h-4 w-4" />
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
