"use client";

import { Loader2, ShieldCheck, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHealthStore } from "@/lib/store/health-store";

export function HealthCheckCard() {
  const { statusMessage, isLoading, error, checkHealth } = useHealthStore();

  return (
    <div className="rounded-xl border border-border/75 bg-card/70 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Gateway Status Probe</p>
          <h2 className="text-lg font-semibold tracking-tight">
            Backend Connectivity
          </h2>
        </div>
        <ShieldCheck className="size-5 text-muted-foreground" />
      </div>

      <div className="rounded-lg border border-border/70 bg-background/60 p-4 text-sm">
        {!statusMessage && !error && (
          <p className="text-muted-foreground">
            Run a health check to verify FastAPI connectivity from the UI.
          </p>
        )}

        {statusMessage && (
          <p className="text-foreground">
            <span className="font-medium">Response:</span> {statusMessage}
          </p>
        )}

        {error && (
          <p className="flex items-center gap-2 text-destructive">
            <TriangleAlert className="size-4" />
            {error}
          </p>
        )}
      </div>

      <Button
        className="mt-4 w-full"
        variant="outline"
        onClick={checkHealth}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Checking Secure Gateway...
          </>
        ) : (
          "Check Gateway Health"
        )}
      </Button>
    </div>
  );
}
