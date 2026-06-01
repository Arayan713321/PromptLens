"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { BarChart3, Brain, Database, FileText, GitCompare, History, Search, Settings, TerminalSquare } from "lucide-react";
import { useWorkspaceStore } from "@/stores/use-workspace-store";

const commands = [
  { href: "/dashboard", label: "Open dashboard", icon: BarChart3 },
  { href: "/prompts/new", label: "Create prompt", icon: TerminalSquare },
  { href: "/datasets", label: "Manage datasets", icon: Database },
  { href: "/evaluations", label: "Run evaluation", icon: Brain },
  { href: "/comparisons", label: "Compare prompt versions", icon: GitCompare },
  { href: "/history", label: "View run history", icon: History },
  { href: "/reports", label: "Generate report", icon: FileText },
  { href: "/settings", label: "Open settings", icon: Settings },
];

export function CommandPalette() {
  const open = useWorkspaceStore((state) => state.commandOpen);
  const setOpen = useWorkspaceStore((state) => state.setCommandOpen);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="glass fixed left-1/2 top-24 z-50 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 rounded-lg p-3">
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <div className="flex h-11 items-center gap-3 border-b border-border px-3">
            <Search className="h-4 w-4 text-muted" />
            <input className="w-full bg-transparent text-sm outline-none placeholder:text-muted" placeholder="Search commands, prompts, runs..." autoFocus />
          </div>
          <div className="mt-3 grid gap-1">
            {commands.map((command) => {
              const Icon = command.icon;
              return (
                <Dialog.Close asChild key={command.href}>
                  <Link className="flex items-center gap-3 rounded-md px-3 py-3 text-sm hover:bg-foreground/8" href={command.href}>
                    <Icon className="h-4 w-4 text-accent" />
                    {command.label}
                  </Link>
                </Dialog.Close>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
