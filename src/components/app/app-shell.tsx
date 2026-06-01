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
      <aside className="glass sticky top-0 z-30 hidden h-screen rounded-none border-y-0 border-l-0 p-4 lg:flex lg:flex-col">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-foreground text-background">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">PromptLens</p>
            <p className="text-xs text-muted">AI testing simplified</p>
          </div>
        </Link>
        <nav className="grid gap-1 flex-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted transition hover:bg-foreground/8 hover:text-foreground",
                  active && "bg-foreground/10 text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
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
        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
