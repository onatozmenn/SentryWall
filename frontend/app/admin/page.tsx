"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

import {
  getAdminLogs,
  getAdminStats,
  type AdminLog,
  type AdminStatsResponse,
  type RiskLevel,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ClientTrafficChart = dynamic(
  () =>
    import("@/components/admin/traffic-chart").then(
      (module) => module.TrafficChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full rounded-lg border border-zinc-800 bg-zinc-900/70" />
    ),
  }
);

const EMPTY_STATS: AdminStatsResponse = {
  total_requests: 0,
  threats_blocked: 0,
  data_saved_label: "0 Sensitive Items",
  daily_counts: [],
};

function getRiskBadgeClass(riskLevel: RiskLevel): string {
  if (riskLevel === "High") {
    return "border-red-700/70 bg-red-500/10 text-red-300";
  }

  if (riskLevel === "Medium") {
    return "border-amber-700/70 bg-amber-500/10 text-amber-300";
  }

  return "border-emerald-700/70 bg-emerald-500/10 text-emerald-300";
}

function formatTimestamp(timestamp: string): string {
  const parsedDate = new Date(timestamp);
  if (Number.isNaN(parsedDate.getTime())) {
    return timestamp;
  }

  return parsedDate.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function AdminPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [stats, setStats] = useState<AdminStatsResponse>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [logsResponse, statsResponse] = await Promise.all([
          getAdminLogs(),
          getAdminStats(),
        ]);

        if (!isMounted) {
          return;
        }

        setLogs(logsResponse);
        setStats(statsResponse);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Failed to load admin dashboard data.";
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-zinc-900 px-3 py-4 text-zinc-100 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(39,39,42,0.65),transparent_45%)]" />

      <section className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:p-6">
        <header className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              SentryWall
            </p>
            <h1 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
              Manager Security Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Security outcomes and gateway protection metrics.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/70 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
          >
            <Lock className="size-3.5" />
            Employee View
          </Link>
        </header>

        {error && (
          <div className="rounded-lg border border-red-700/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-zinc-800 bg-zinc-900 py-4">
            <CardHeader className="gap-1 px-4">
              <CardDescription className="text-zinc-400">
                Total Requests
              </CardDescription>
              <CardTitle className="text-2xl text-zinc-100">
                {stats.total_requests.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900 py-4">
            <CardHeader className="gap-1 px-4">
              <CardDescription className="text-zinc-400">
                Threats Blocked
              </CardDescription>
              <CardTitle className="text-2xl text-red-400">
                {stats.threats_blocked.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900 py-4">
            <CardHeader className="gap-1 px-4">
              <CardDescription className="text-zinc-400">
                Data Saved
              </CardDescription>
              <CardTitle className="text-2xl text-zinc-100">
                {stats.data_saved_label}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-zinc-800 bg-zinc-900 py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-base text-zinc-100">
              Threats vs Safe Requests (7 Days)
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Gateway trendline across recent activity.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-4">
            <div className="h-[300px]">
              <ClientTrafficChart data={stats.daily_counts} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900 py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-base text-zinc-100">
              Recent Audit Log
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Last 50 inspected events across the secure gateway.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-4">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="px-4 text-zinc-400">Timestamp</TableHead>
                  <TableHead className="text-zinc-400">User</TableHead>
                  <TableHead className="text-zinc-400">PII Type</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-zinc-800">
                    <TableCell colSpan={5} className="px-4 text-zinc-400">
                      Loading audit logs...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow className="border-zinc-800">
                    <TableCell colSpan={5} className="px-4 text-zinc-400">
                      No audit events yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="border-zinc-800 text-zinc-200 hover:bg-zinc-800/25"
                    >
                      <TableCell className="px-4 text-zinc-400">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell className="font-medium text-zinc-200">
                        {log.user_id}
                      </TableCell>
                      <TableCell>{log.pii_detected.replaceAll(",", ", ")}</TableCell>
                      <TableCell
                        className={cn(
                          "font-medium",
                          log.action === "Blocked"
                            ? "text-red-300"
                            : log.action === "Redacted"
                              ? "text-amber-300"
                              : "text-emerald-300"
                        )}
                      >
                        {log.action}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("border", getRiskBadgeClass(log.risk_level))}
                        >
                          {log.risk_level}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
