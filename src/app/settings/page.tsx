import { KeyRound, Shield, SlidersHorizontal, UserRound } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Settings" title="Workspace configuration" description="Clerk authentication, provider keys, scoring defaults, and model routing controls for the PromptLens workspace." />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="h-4 w-4" />Authentication</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <Input defaultValue="PromptLens Demo Workspace" readOnly />
            <Input defaultValue="Clerk organization sync enabled" readOnly />
            <Button variant="secondary">Manage Clerk settings</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4" />Provider keys</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {["OPENAI_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY"].map((key) => (
              <Input key={key} type="password" value="••••••••••••••••••••••••••••••••" readOnly />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" />Available Models</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {["GPT-4o-mini (OpenAI)", "Gemini 1.5 Flash (Google)"].map((model) => (
              <label key={model} className="flex items-center justify-between rounded-md border border-border bg-card-solid/60 p-3 text-sm">
                <span>{model}</span>
                <input type="checkbox" defaultChecked disabled />
              </label>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" />Scoring policy</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted">
            <p>Rubric checks: correctness, relevance, completeness, clarity.</p>
            <p>LLM judge architecture: GPT-4o-mini automated judge.</p>
            <Button disabled>Save scoring policy</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
