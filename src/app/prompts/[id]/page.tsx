import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData } from "@/services/data-service";
import { TerminalSquare } from "lucide-react";

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  const { prompts } = await getAppData(userId, { prompts: true });
  const prompt = prompts.find((item) => item.id === id);
  if (!prompt) notFound();

  return (
    <div className="mx-auto max-w-3xl py-4 space-y-6">
      <PageHeader
        eyebrow="Prompt Configuration"
        title={prompt.name}
        description={prompt.description}
      />

      <div className="grid gap-5">
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TerminalSquare className="h-4.5 w-4.5 text-accent" />
              System Prompt (Instructions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-xl bg-foreground/5 p-5 text-sm leading-relaxed font-mono text-foreground select-all whitespace-pre-wrap">
              {prompt.systemPrompt}
            </pre>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TerminalSquare className="h-4.5 w-4.5 text-accent" />
              User Prompt Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-xl bg-foreground/5 p-5 text-sm leading-relaxed font-mono text-foreground select-all whitespace-pre-wrap">
              {prompt.userPrompt}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
