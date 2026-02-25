export type SecurityTone = "clean" | "low" | "medium" | "high";

const HIGH_RISK_TYPES = new Set(["API Key", "TCKN", "Credit Card", "Payment"]);
const MEDIUM_RISK_TYPES = new Set(["Email", "Phone", "IBAN", "Address"]);
const LOW_RISK_TYPES = new Set(["IP Address"]);
const BLOCKED_RESPONSE_PREFIX = "request blocked:";

export function hasHighRiskItems(redactedItems: string[] = []): boolean {
  return redactedItems.some((item) => HIGH_RISK_TYPES.has(item));
}

export function isGatewayBlockedResponse(content: string): boolean {
  return content.trim().toLowerCase().startsWith(BLOCKED_RESPONSE_PREFIX);
}

export function getSecurityTone(redactedItems: string[] = []): SecurityTone {
  if (redactedItems.length === 0) {
    return "clean";
  }

  if (hasHighRiskItems(redactedItems)) {
    return "high";
  }

  if (redactedItems.some((item) => MEDIUM_RISK_TYPES.has(item))) {
    return "medium";
  }

  if (redactedItems.some((item) => LOW_RISK_TYPES.has(item))) {
    return "low";
  }

  return "medium";
}
