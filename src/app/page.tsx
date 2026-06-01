import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  LayoutDashboard,
  Lightbulb,
  Sparkles,
  TerminalSquare,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ─── "How it Works" steps ───────────────────────────────────────────────────
const steps = [
  {
    step: "01",
    icon: TerminalSquare,
    title: "Describe Your Prompt",
    body: "Give your AI assistant a name and explain what it should do in plain English. No coding required — just type what you want.",
    example: "e.g. \"Customer Support Bot that handles refunds politely.\"",
    color: "text-accent",
    bg: "bg-accent/8",
    border: "border-accent/20",
  },
  {
    step: "02",
    icon: FlaskConical,
    title: "We Test It Automatically",
    body: "PromptLens generates 15 real-world test questions and runs them through GPT-4o-mini and Gemini 1.5 Flash simultaneously.",
    example: "Runs in ~15-20 seconds. Zero setup needed.",
    color: "text-accent-2",
    bg: "bg-accent-2/8",
    border: "border-accent-2/20",
  },
  {
    step: "03",
    icon: Trophy,
    title: "Get Your Scorecard",
    body: "See which AI model performed best, your prompt's quality score out of 100, and one actionable tip to make it even better.",
    example: "Plain English results — no technical jargon.",
    color: "text-accent",
    bg: "bg-accent/8",
    border: "border-accent/20",
  },
];

// ─── Why PromptLens ──────────────────────────────────────────────────────────
const benefits = [
  {
    icon: Zap,
    title: "One click. Full evaluation.",
    body: "No datasets to upload, no pipeline to configure. Enter a description and get full multi-model test results automatically.",
  },
  {
    icon: Lightbulb,
    title: "Beginner friendly.",
    body: "Results are written in plain English. You'll always know exactly what your score means and what to improve next.",
  },
  {
    icon: Sparkles,
    title: "Powered by real AI models.",
    body: "Your prompt is tested on OpenAI GPT-4o-mini and Google Gemini 1.5 Flash — not simulations.",
  },
];

// ─── Social proof numbers ────────────────────────────────────────────────────
const stats = [
  { value: "15", label: "Test cases per run" },
  { value: "2", label: "AI models compared" },
  { value: "100", label: "Quality score out of" },
  { value: "< 20s", label: "Average time to results" },
];

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-20 py-12 md:py-20">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card-solid/70 px-4 py-1.5 text-xs font-medium text-muted">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          AI-powered prompt testing, made simple
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
          Build better AI{" "}
          <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
            in 30 seconds.
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted">
          PromptLens automatically tests your AI prompt against 15 benchmark scenarios, runs it
          on both GPT-4o-mini and Gemini, then gives you a plain-English quality score and
          one specific tip to improve it.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button asChild size="lg" className="gap-2 px-7 text-base font-semibold">
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Try it free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="gap-2 px-7 text-base">
            <Link href="#how-it-works">
              See how it works
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Quick trust row */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-muted">
          {["No credit card required", "No setup needed", "Results in under 20 seconds"].map(
            (item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent-2" />
                {item}
              </span>
            )
          )}
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ value, label }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card-solid/60 p-5 text-center shadow-sm"
          >
            <p className="text-3xl font-extrabold text-accent">{value}</p>
            <p className="mt-1 text-xs text-muted">{label}</p>
          </div>
        ))}
      </section>

      {/* ── How it Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-20 space-y-10">
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            How it works
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Three steps. No technical knowledge needed.
          </h2>
          <p className="mx-auto max-w-xl text-base text-muted">
            From idea to quality scorecard in under a minute.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map(({ step, icon: Icon, title, body, example, color, bg, border }) => (
            <Card
              key={step}
              className={`relative overflow-hidden border ${border} shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
            >
              <CardContent className="pt-6 space-y-4">
                {/* Step badge */}
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${border} border`}
                >
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>

                {/* Step number watermark */}
                <span className="absolute right-4 top-4 text-5xl font-black text-foreground/5 select-none">
                  {step}
                </span>

                <div>
                  <h3 className="font-bold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
                  <p className="mt-3 rounded-md bg-foreground/5 px-3 py-2 text-xs text-muted italic border border-border/60">
                    {example}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Connector arrow (desktop only) */}
        <div className="hidden md:flex items-center justify-center gap-2 -mt-2 text-xs text-muted">
          <span className="rounded-full border border-border px-3 py-1">Describe</span>
          <ChevronRight className="h-4 w-4" />
          <span className="rounded-full border border-border px-3 py-1">Auto-test</span>
          <ChevronRight className="h-4 w-4" />
          <span className="rounded-full border border-accent/40 bg-accent/5 px-3 py-1 text-accent">
            Get results
          </span>
        </div>
      </section>

      {/* ── Why PromptLens ───────────────────────────────────────────────── */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-2">
            Why PromptLens
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Designed for everyone.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="border border-border shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <CardContent className="pt-6 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/6 border border-border">
                  <Icon className="h-4.5 w-4.5 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/8 via-transparent to-accent-2/8 p-10 text-center space-y-5 shadow-sm">
        <Sparkles className="mx-auto h-8 w-8 text-accent animate-pulse" />
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Ready to test your first prompt?
        </h2>
        <p className="mx-auto max-w-md text-muted">
          No sign-up friction. Open the workspace and describe what your AI should do.
          Results arrive in under 20 seconds.
        </p>
        <Button asChild size="lg" className="mt-2 gap-2 px-8 text-base font-semibold">
          <Link href="/dashboard">
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
