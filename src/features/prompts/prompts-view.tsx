"use client";

import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import type { Prompt } from "@/types";

export function PromptsView({ prompts }: { prompts: Prompt[] }) {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Workspace Registry"
        title="My Prompts"
        description="A list of your optimized prompts, instruction templates, and goal definitions."
      />
      <div className="grid gap-4 mt-6">
        {prompts.length > 0 ? (
          prompts.map((prompt) => {
            return (
              <Card key={prompt.id} className="border border-border bg-card shadow-sm hover:border-accent/30 transition">
                <CardContent className="py-5">
                  <Link href={`/prompts/${prompt.id}`}>
                    <h2 className="text-lg font-bold text-foreground">{prompt.name}</h2>
                    <p className="mt-2 text-sm text-muted leading-relaxed">{prompt.description}</p>
                    <div className="mt-4 border-t border-border/40 pt-3 grid gap-2 md:grid-cols-2 text-xs">
                      <p className="truncate"><strong className="text-muted font-semibold">System Prompt:</strong> {prompt.systemPrompt}</p>
                      <p className="truncate"><strong className="text-muted font-semibold font-mono">User Prompt:</strong> {prompt.userPrompt}</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="py-12 text-center text-sm text-muted">
            No prompt configurations drafted yet. Let&apos;s create your first on the Home Page!
          </div>
        )}
      </div>
    </div>
  );
}
