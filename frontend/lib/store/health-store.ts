"use client";

import { create } from "zustand";

import { fetchHealth } from "@/lib/api";

type HealthStore = {
  statusMessage: string | null;
  isLoading: boolean;
  error: string | null;
  checkHealth: () => Promise<void>;
};

export const useHealthStore = create<HealthStore>((set) => ({
  statusMessage: null,
  isLoading: false,
  error: null,
  checkHealth: async () => {
    set({ isLoading: true, error: null, statusMessage: null });

    try {
      const payload = await fetchHealth();
      set({ isLoading: false, statusMessage: payload.status });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to connect to SentryWall backend.";

      set({ isLoading: false, error: message });
    }
  },
}));
