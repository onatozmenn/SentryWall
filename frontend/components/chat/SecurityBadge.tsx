"use client";

import { Shield } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSecurityTone } from "@/lib/security";
import { cn } from "@/lib/utils";

type SecurityBadgeProps = {
  redactedItems?: string[];
};

const REDACTION_LABELS: Record<string, string> = {
  Email: "Email Removed",
  Phone: "Phone Removed",
  "Credit Card": "Credit Card Removed",
  Payment: "Credit Card Removed",
  TCKN: "TCKN Removed",
  IBAN: "IBAN Removed",
  "API Key": "API Key Removed",
  "IP Address": "IP Address Removed",
  Address: "Address Removed",
};

function formatRedactionLabel(item: string): string {
  return REDACTION_LABELS[item] ?? `${item} Removed`;
}

export function SecurityBadge({ redactedItems = [] }: SecurityBadgeProps) {
  const hasRedactions = redactedItems.length > 0;
  const label = hasRedactions ? `Redacted: ${redactedItems.length}` : "Secure";
  const tone = getSecurityTone(redactedItems);

  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        tone === "high"
          ? "border-red-700/60 bg-red-500/10 text-red-200"
          : tone === "medium"
            ? "border-amber-700/60 bg-amber-500/10 text-amber-200"
            : "border-emerald-700/60 bg-emerald-500/10 text-emerald-200"
      )}
    >
      <Shield className="size-3.5" />
      {label}
    </span>
  );

  if (!hasRedactions) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="border border-zinc-700 bg-zinc-900 text-zinc-100"
      >
        <div className="space-y-1">
          {redactedItems.map((item) => (
            <p key={item} className="text-xs">
              {formatRedactionLabel(item)}
            </p>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
