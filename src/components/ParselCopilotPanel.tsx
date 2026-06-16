"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  getToolName,
  isToolUIPart,
  type UIMessage,
} from "ai";
import { ArrowUp, Sparkles, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

import { CopilotMarkdown } from "@/components/copilot/CopilotMarkdown";
import { ParselAiGlyph } from "@/components/copilot/ParselAiGlyph";
import { COPILOT_QUICK_PROMPTS } from "@/lib/copilot/quick-prompts";

const PLACEHOLDER = "Komut yazın veya sorunuzu sorun...";
const LOADING_PLACEHOLDER = "Parsel AI verileri analiz ediyor...";
const ERROR_BANNER_TEXT =
  "Bağlantı koptu veya zaman aşımı yaşandı. Lütfen tekrar deneyin.";

const TOOL_STATUS_LABELS: Record<string, string> = {
  getPortfolioSummary: "Portföy özeti",
  manageSubscription: "Abonelik",
  scheduleAppointment: "Randevu",
  generateWhatsAppMessage: "WhatsApp",
  analyzeProperty: "Mülk analizi",
};

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function CopilotEmptyState({
  onPick,
  disabled,
}: {
  onPick: (prompt: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-8 text-center">
      <div className="relative mb-6 flex size-16 items-center justify-center rounded-2xl border border-parsel-gold/30 bg-parsel-gold/10">
        <Sparkles className="size-7 text-parsel-gold" strokeWidth={1.5} />
        <span className="absolute -inset-1 rounded-2xl bg-parsel-gold/10 blur-xl" aria-hidden />
      </div>
      <h2 className="font-outfit text-xl font-semibold text-foreground">
        Parsel AI
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Portföy, ilan, tapu ve randevu süreçleriniz için bağlama duyarlı asistan.
        Aşağıdan bir görev seçin veya doğrudan sorun.
      </p>
      <div className="mt-8 grid w-full gap-2 sm:grid-cols-2">
        {COPILOT_QUICK_PROMPTS.slice(0, 4).map((chip) => (
          <button
            key={chip.label}
            type="button"
            disabled={disabled}
            onClick={() => onPick(chip.prompt)}
            className="rounded-xl border border-border/60 bg-parsel-panel/60 px-4 py-3 text-left text-sm text-foreground/90 transition-colors hover:border-parsel-gold/35 hover:bg-parsel-gold/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="block text-[10px] font-medium uppercase tracking-wider text-parsel-gold/80">
              Öneri
            </span>
            <span className="mt-1 block">{chip.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ParselAiActivityIndicator() {
  return (
    <div className="flex items-center gap-2.5">
      <ParselAiGlyph size="sm" />
      <span className="text-xs tracking-wide text-foreground/35">Yanıt hazırlanıyor</span>
      <span className="flex gap-1" aria-hidden>
        <span className="size-1 animate-pulse rounded-full bg-white/25" />
        <span className="size-1 animate-pulse rounded-full bg-white/20 [animation-delay:150ms]" />
        <span className="size-1 animate-pulse rounded-full bg-white/15 [animation-delay:300ms]" />
      </span>
    </div>
  );
}

function ToolDoneBadge({
  part,
}: {
  part: Extract<UIMessage["parts"][number], { type: string }>;
}) {
  if (!isToolUIPart(part) || part.state !== "output-available") return null;

  const label = TOOL_STATUS_LABELS[getToolName(part)] ?? "Tamamlandı";
  return (
    <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
      {label}
    </span>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[75%] rounded-lg bg-parsel-sunken px-4 py-2.5 text-right text-[15px] leading-relaxed text-foreground/80">
        {text}
      </p>
    </div>
  );
}

function AssistantMessage({
  text,
  toolParts,
}: {
  text: string;
  toolParts: UIMessage["parts"];
}) {
  const doneTools = toolParts.filter(
    (part) => isToolUIPart(part) && part.state === "output-available",
  );

  return (
    <div className="flex w-full items-start gap-3">
      <span className="mt-2 shrink-0">
        <ParselAiGlyph size="sm" />
      </span>
      <div className="min-w-0 w-full flex-1 space-y-2">
        {doneTools.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {doneTools.map((part, index) => (
              <ToolDoneBadge key={index} part={part} />
            ))}
          </div>
        ) : null}
        {text ? <CopilotMarkdown content={text} /> : null}
      </div>
    </div>
  );
}

type ParselCopilotPanelProps = {
  onClose: () => void;
};

export function ParselCopilotPanel({ onClose }: ParselCopilotPanelProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const submitText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setInput("");
      await sendMessage({ text: trimmed });
    },
    [isLoading, sendMessage],
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (isLoading) return;
      setInput(event.target.value);
    },
    [isLoading],
  );

  const handleSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      void submitText(input);
    },
    [input, submitText],
  );

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && !isLoading) {
        event.preventDefault();
        void submitText(input);
      }
    },
    [input, isLoading, submitText],
  );

  useEffect(() => {
    if (isLoading) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (!outputRef.current) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const lastMessage = messages[messages.length - 1];
  const lastMessageHasActiveTools =
    lastMessage?.role === "assistant" &&
    lastMessage.parts.some(
      (part) =>
        isToolUIPart(part) &&
        (part.state === "input-streaming" || part.state === "input-available"),
    );
  const showActivity =
    isLoading &&
    (lastMessageHasActiveTools ||
      !lastMessage ||
      lastMessage.role !== "assistant" ||
      getMessageText(lastMessage).length === 0);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 font-sans backdrop-blur-lg md:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Parsel AI Workspace"
        aria-modal="true"
        className="relative flex h-[90vh] w-[95%] max-w-5xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-parsel-admin shadow-[0_0_80px_rgba(0,0,0,0.8)] ring-1 ring-parsel-gold/20"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-t-2 border-parsel-gold" aria-hidden />

        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/40 px-6 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <ParselAiGlyph size="md" />
            <div className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">
                Parsel AI
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                Operasyon asistanı · bağlama duyarlı
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-white/20 hover:bg-white/5 hover:text-foreground"
            aria-label="Parsel AI kapat"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>

        <div
          ref={outputRef}
          className="custom-scrollbar flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8"
        >
          {messages.length === 0 && !isLoading ? (
            <CopilotEmptyState
              disabled={isLoading}
              onPick={(prompt) => void submitText(prompt)}
            />
          ) : null}

          <div className="space-y-10">
            {messages.map((message) => {
              const text = getMessageText(message);
              const toolParts = message.parts.filter((part) => isToolUIPart(part));

              if (message.role === "user") {
                return <UserMessage key={message.id} text={text} />;
              }

              if (!text && toolParts.length === 0 && isLoading) return null;

              return (
                <AssistantMessage
                  key={message.id}
                  text={text}
                  toolParts={toolParts}
                />
              );
            })}

            {showActivity ? <ParselAiActivityIndicator /> : null}
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="shrink-0 border-t border-amber-500/25 bg-amber-500/[0.08] px-6 py-3 text-sm leading-relaxed text-amber-200/90"
          >
            <span className="mr-2" aria-hidden>
              ⚠️
            </span>
            {ERROR_BANNER_TEXT}
          </div>
        ) : null}

        <footer className="shrink-0 border-t border-border bg-parsel-admin p-5">
          <div className="custom-scrollbar mb-4 flex gap-2 overflow-x-auto">
            {COPILOT_QUICK_PROMPTS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                disabled={isLoading}
                onClick={() => void submitText(chip.prompt)}
                className="shrink-0 cursor-pointer rounded-md border border-border/60 px-2.5 py-1 text-[11px] tracking-wide text-muted-foreground uppercase transition-colors hover:border-white/15 hover:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                {chip.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-parsel-panel px-4 py-2 transition-colors focus-within:border-border">
              <input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                disabled={isLoading}
                placeholder={isLoading ? LOADING_PLACEHOLDER : PLACEHOLDER}
                className="w-full bg-transparent py-3 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Parsel AI mesajı"
                aria-busy={isLoading}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="shrink-0 rounded-lg bg-foreground/10 p-2 text-foreground transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Gönder"
              >
                <ArrowUp className="size-4" strokeWidth={2} />
              </button>
            </div>
          </form>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
