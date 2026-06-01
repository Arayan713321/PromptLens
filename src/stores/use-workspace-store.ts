"use client";

import { create } from "zustand";

type WorkspaceState = {
  search: string;
  commandOpen: boolean;
  setSearch: (search: string) => void;
  setCommandOpen: (open: boolean) => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  search: "",
  commandOpen: false,
  setSearch: (search) => set({ search }),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
}));
