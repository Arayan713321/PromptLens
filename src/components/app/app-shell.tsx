"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { UserButton } from "@clerk/nextjs";
import {
  BarChart3,
  Brain,
  LayoutDashboard,
  Moon,
  Settings,
  Sun,
  TerminalSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/use-workspace-store";
import { CommandPalette } from "./command-palette";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/prompts", label: "My Prompts", icon: TerminalSquare },
  { href: "/evaluations", label: "Results", icon: Brain },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const setCommandOpen = useWorkspaceStore((state) => state.setCommandOpen);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setCommandOpen]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 z-30 hidden h-screen border-r border-border bg-card/45 backdrop-blur-xl p-6 lg:flex lg:flex-col justify-between shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="space-y-8">
          <Link href="/dashboard" className="flex items-center gap-3.5 px-1.5 transition-all hover:opacity-90">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-accent-2 text-white shadow-md shadow-accent/15">
              <BarChart3 className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="font-bold text-foreground tracking-tight text-base">PromptLens</p>
              <p className="text-[10px] font-semibold text-accent uppercase tracking-wider">AI testing lab</p>
            </div>
          </Link>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold tracking-wide transition-all duration-200 border border-transparent",
                    active 
                      ? "bg-gradient-to-r from-accent/12 to-accent-2/6 text-accent border-accent/15 shadow-sm shadow-accent/5 font-bold" 
                      : "text-muted hover:bg-foreground/5 hover:text-foreground hover:translate-x-1"
                  )}
                >
                  <Icon className={cn(
                    "h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110",
                    active ? "text-accent" : "text-muted group-hover:text-foreground"
                  )} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-border bg-background/78 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 md:px-8">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold lg:hidden">
              <BarChart3 className="h-5 w-5" />
              PromptLens
            </Link>
            <div className="ml-auto flex items-center gap-3">
              <Button variant="secondary" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
                <Sun className="hidden h-4 w-4 dark:block" />
                <Moon className="h-4 w-4 dark:hidden" />
              </Button>
              <div className="flex h-9 w-9 items-center justify-center">
                <UserButton />
              </div>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8 md:py-8 animate-fade-in">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
