"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatInputProps = {
  onSend: (content: string) => Promise<void> | void;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, 52), 240);
    textarea.style.height = `${nextHeight}px`;
  }, [content]);

  const canSend = !disabled && !isSubmitting && content.trim().length > 0;

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || disabled || isSubmitting) {
      return;
    }

    const previousContent = content;
    setIsSubmitting(true);
    setContent("");
    try {
      await onSend(trimmed);
    } catch {
      setContent(previousContent);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full rounded-[2rem] border border-zinc-800/90 bg-[linear-gradient(180deg,#22252d_0%,#1b1d24_100%)] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_36px_rgba(0,0,0,0.32)]">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void handleSend();
          }
        }}
        placeholder="Send a message through the secure gateway..."
        rows={1}
        className="no-scrollbar min-h-[52px] max-h-[240px] w-full resize-none overflow-y-auto border-0 bg-transparent px-2 py-1 pr-14 text-[15px] leading-6 text-zinc-100 placeholder:text-zinc-400/70 shadow-none outline-none focus-visible:border-0 focus-visible:ring-0"
        disabled={disabled || isSubmitting}
      />
      <Button
        type="button"
        onClick={() => void handleSend()}
        disabled={!canSend}
        className="absolute top-1/2 right-4 size-9 -translate-y-1/2 rounded-full border border-transparent bg-transparent p-0 text-zinc-300 transition-all hover:border-zinc-600/60 hover:bg-zinc-800/60 hover:text-zinc-100 disabled:border-transparent disabled:bg-transparent disabled:text-zinc-600"
      >
        <Send
          className={cn(
            "size-5 transition-colors",
            canSend ? "text-zinc-100" : "text-zinc-600"
          )}
        />
      </Button>
    </div>
  );
}
