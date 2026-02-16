"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Lock, Shield } from "lucide-react";

import { ChatInput } from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { useChatStore } from "@/stores/chat-store";

export default function Home() {
  const { messages, isScanning, isTyping, sendMessage } = useChatStore();
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isScanning, isTyping]);

  return (
    <main className="relative min-h-screen bg-zinc-900 px-3 py-4 text-zinc-100 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(39,39,42,0.6),transparent_45%)]" />

      <section className="relative mx-auto flex h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                SentryWall
              </p>
              <h1 className="text-sm font-semibold tracking-tight sm:text-base">
                SentryWall Enterprise Gateway
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1 text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
            >
              <Lock className="size-3.5" />
              Admin View
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/70 px-3 py-1 text-xs text-zinc-300">
              <Lock className="size-3.5" />
              Secure Channel Active
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {messages.length === 0 && !isScanning && !isTyping ? (
            <div className="mx-auto mt-10 max-w-xl rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 text-sm text-zinc-300">
              <p className="font-medium text-zinc-100">AI Privacy Gateway Ready</p>
              <p className="mt-2 text-zinc-400">
                Every message is scanned for sensitive data before processing.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          )}

          {isScanning && (
            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
              <Shield className="size-4 animate-pulse text-amber-300" />
              <span>Scanning for PII...</span>
            </div>
          )}

          {isTyping && (
            <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
              <Lock className="size-4 animate-pulse text-zinc-400" />
              <span>Assistant is preparing a secure response...</span>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <footer className="border-t border-zinc-800 px-4 py-4 sm:px-6">
          <ChatInput onSend={sendMessage} disabled={isScanning || isTyping} />
        </footer>
      </section>
    </main>
  );
}
