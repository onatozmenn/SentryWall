"use client";

import ReactMarkdown, { type Components } from "react-markdown";

import { getSecurityTone } from "@/lib/security";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/stores/chat-store";

import { SecurityBadge } from "./SecurityBadge";

type MessageBubbleProps = {
  message: ChatMessage;
};

const markdownContainerClass =
  "space-y-2 text-sm leading-relaxed text-zinc-100 break-words [&_h1]:mt-4 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-zinc-100 [&_h1:first-child]:mt-0 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-100 [&_h2:first-child]:mt-0 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-100 [&_h3:first-child]:mt-0 [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_strong]:font-bold [&_strong]:text-zinc-100 [&_blockquote]:my-3 [&_blockquote]:border-l [&_blockquote]:border-zinc-700 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-300 [&_hr]:my-3 [&_hr]:border-zinc-800 [&_pre_code]:bg-transparent [&_pre_code]:p-0";

const markdownComponents: Components = {
  a: ({ className, ...props }) => (
    <a
      {...props}
      target="_blank"
      rel="noreferrer noopener"
      className={cn("text-blue-400 underline-offset-4 hover:underline", className)}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      {...props}
      className={cn(
        "my-3 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3",
        className
      )}
    />
  ),
  code: ({ className, ...props }) => {
    const isBlockCode = className?.includes("language-") ?? false;

    return (
      <code
        {...props}
        className={cn(
          isBlockCode
            ? "font-mono text-[0.84em] text-zinc-100"
            : "rounded bg-zinc-800/70 px-1.5 py-0.5 font-mono text-[0.84em] text-zinc-100",
          className
        )}
      />
    );
  },
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const tone = getSecurityTone(message.redactedItems ?? []);
  const timestamp = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <article
        className={cn(
          "min-w-0 max-w-[88%] rounded-xl border px-4 pt-3 pb-3 text-sm leading-relaxed sm:max-w-[72%]",
          isUser
            ? "bg-zinc-800/70 text-zinc-100"
            : "border-zinc-800 bg-zinc-900/80 text-zinc-100",
          isUser ? "min-w-[170px] sm:min-w-[210px]" : "",
          isUser && tone === "high"
            ? "border-red-700/70"
            : isUser && tone === "medium"
              ? "border-amber-700/70"
              : isUser
                ? "border-emerald-700/70"
                : ""
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className={markdownContainerClass}>
            <ReactMarkdown components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-[10px] text-zinc-500">{timestamp}</span>
          <span className="shrink-0">
            <SecurityBadge redactedItems={message.redactedItems} />
          </span>
        </div>
      </article>
    </div>
  );
}
