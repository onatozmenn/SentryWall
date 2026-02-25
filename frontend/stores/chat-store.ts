"use client";

import { create } from "zustand";

import { sendSecureChatMessage } from "@/lib/api";
import { hasHighRiskItems, isGatewayBlockedResponse } from "@/lib/security";

export type ChatRole = "user" | "assistant";
export type SecurityStatus = "clean" | "redacted" | "blocked";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  securityStatus: SecurityStatus;
  redactedItems?: string[];
  timestamp: Date;
};

type ChatStore = {
  messages: ChatMessage[];
  isScanning: boolean;
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
};

function createMessageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isScanning: false,
  isTyping: false,
  sendMessage: async (content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    const { isScanning, isTyping } = get();
    if (isScanning || isTyping) {
      return;
    }

    const userMessageId = createMessageId();
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: trimmedContent,
      securityStatus: "clean",
      redactedItems: [],
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isScanning: true,
      isTyping: false,
    }));

    try {
      const response = await sendSecureChatMessage(trimmedContent);
      const redactedItems = response.security_report.redacted_items ?? [];
      const status: SecurityStatus =
        redactedItems.length > 0
          ? hasHighRiskItems(redactedItems)
            ? "blocked"
            : "redacted"
          : "clean";
      const isBlockedResponse =
        status === "blocked" &&
        isGatewayBlockedResponse(response.original_response);

      set((state) => ({
        messages: state.messages.map((message) =>
          message.id === userMessageId
            ? {
                ...message,
                securityStatus: status,
                redactedItems,
              }
            : message
        ),
        isScanning: false,
        isTyping: true,
      }));

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: response.original_response,
        securityStatus: isBlockedResponse ? "blocked" : "clean",
        redactedItems: isBlockedResponse ? redactedItems : [],
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isTyping: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gateway scan failed. Please try again.";

      const assistantErrorMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: `Gateway error: ${errorMessage}. Please retry in a moment.`,
        securityStatus: "clean",
        redactedItems: [],
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, assistantErrorMessage],
        isScanning: false,
        isTyping: false,
      }));
    }
  },
}));
