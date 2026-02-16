export type HealthResponse = {
  status: string;
};

export type SecureChatRequest = {
  message: string;
};

export type SecureChatResponse = {
  original_response: string;
  security_report: {
    redacted_items: string[];
  };
};

export type AdminLog = {
  id: number;
  timestamp: string;
  user_id: string;
  content_length: number;
  pii_detected: string;
  risk_level: RiskLevel;
  action: AdminAction;
};

export type RiskLevel = "High" | "Medium" | "Low";

export type AdminAction = "Blocked" | "Redacted" | "Allowed";

export type DailyCount = {
  date: string;
  safeRequests: number;
  threatsBlocked: number;
};

export type AdminStatsResponse = {
  total_requests: number;
  threats_blocked: number;
  data_saved_label: string;
  daily_counts: DailyCount[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  return (await response.json()) as HealthResponse;
}

export async function sendSecureChatMessage(
  message: string
): Promise<SecureChatResponse> {
  const payload: SecureChatRequest = { message };

  const response = await fetch(`${API_BASE_URL}/api/chat/secure`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Secure chat failed with status ${response.status}`);
  }

  return (await response.json()) as SecureChatResponse;
}

export async function getAdminLogs(): Promise<AdminLog[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/logs`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Admin logs request failed with status ${response.status}`);
  }

  return (await response.json()) as AdminLog[];
}

export async function getAdminStats(): Promise<AdminStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Admin stats request failed with status ${response.status}`);
  }

  return (await response.json()) as AdminStatsResponse;
}
