"use client";

import { useUser } from "@clerk/nextjs";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  getToolName,
  isToolUIPart,
  type UIMessage,
} from "ai";
import { AlertCircle, ArrowUp, Settings2, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

import { CopilotMarkdown } from "@/components/copilot/CopilotMarkdown";
import { ParselAiGlyph } from "@/components/copilot/ParselAiGlyph";
import { ParselAiOnboarding } from "@/components/copilot/ParselAiOnboarding";
import { ParselAiWelcome } from "@/components/copilot/ParselAiWelcome";
import {
  loadParselAiProfile,
  saveParselAiProfile,
  type ParselAiProfile,
} from "@/lib/copilot/parsel-ai-profile";
import { COPILOT_QUICK_PROMPTS } from "@/lib/copilot/quick-prompts";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "ParselAI'ya sorun veya komut yazın...";
const LOADING_PLACEHOLDER = "ParselAI yanıt hazırlıyor...";
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

function ParselAiActivityIndicator() {
  return (
    <div className="flex items-center gap-2.5">
      <ParselAiGlyph size="sm" />
      <span className="text-xs tracking-wide text-muted-foreground">
        Yanıt hazırlanıyor
      </span>
      <span className="flex gap-1" aria-hidden>
        <span className="size-1 animate-pulse rounded-full bg-primary/50" />
        <span className="size-1 animate-pulse rounded-full bg-primary/40 [animation-delay:150ms]" />
        <span className="size-1 animate-pulse rounded-full bg-primary/30 [animation-delay:300ms]" />
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
      <p className="max-w-[85%] rounded-2xl border border-border/60 bg-parsel-elevated px-4 py-2.5 text-right text-[15px] leading-relaxed text-foreground sm:max-w-[75%]">
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

type ParselCopilotPanelContentProps = ParselCopilotPanelProps & {
  userId: string | null;
};

function ParselCopilotPanelContent({
  onClose,
  userId,
}: ParselCopilotPanelContentProps) {
  const initialProfile = loadParselAiProfile(userId);
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState<ParselAiProfile>(initialProfile);
  const [showOnboarding, setShowOnboarding] = useState(
    !initialProfile.onboardingCompleted,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { parselAiProfile: profile },
      }),
    [profile],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

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

  const handleProfileComplete = useCallback(
    (nextProfile: ParselAiProfile) => {
      saveParselAiProfile(nextProfile, userId);
      setProfile(nextProfile);
      setShowOnboarding(false);
    },
    [userId],
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
    if (isLoading || showOnboarding) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [isLoading, showOnboarding]);

  useEffect(() => {
    if (!outputRef.current) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [messages, isLoading, showOnboarding]);

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

  const showWelcome = messages.length === 0 && !isLoading && !showOnboarding;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-2 font-sans backdrop-blur-md sm:p-4 md:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="ParselAI Workspace"
        aria-modal="true"
        className="relative flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border/70 bg-parsel-panel shadow-parsel-lg ring-1 ring-primary/10 sm:h-[90vh] sm:w-[95%]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-t-2 border-primary" aria-hidden />

        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <ParselAiGlyph size="md" />
            <div className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">
                ParselAI
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                Emlak operasyon asistanı
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-foreground"
              aria-label="ParselAI profilini düzenle"
            >
              <Settings2 className="size-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-border hover:bg-parsel-elevated hover:text-foreground"
              aria-label="ParselAI kapat"
            >
              <X className="size-4" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div
          ref={outputRef}
          className="custom-scrollbar flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:px-8 md:py-6"
        >
          {showOnboarding ? (
            <ParselAiOnboarding
              initialProfile={profile}
              onComplete={handleProfileComplete}
              onSkip={() => setShowOnboarding(false)}
            />
          ) : null}

          {showWelcome ? (
            <ParselAiWelcome
              profile={profile}
              disabled={isLoading}
              onPick={(prompt) => void submitText(prompt)}
              onEditProfile={() => setShowOnboarding(true)}
            />
          ) : null}

          <div className="space-y-8 sm:space-y-10">
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
            className="flex shrink-0 items-start gap-3 border-t border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-foreground sm:px-6"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p>{ERROR_BANNER_TEXT}</p>
          </div>
        ) : null}

        <footer className="shrink-0 border-t border-border/60 bg-parsel-panel p-4 sm:p-5">
          <div className="custom-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
            {COPILOT_QUICK_PROMPTS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                disabled={isLoading || showOnboarding}
                onClick={() => void submitText(chip.prompt)}
                className={cn(
                  "shrink-0 rounded-full border border-border/60 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors",
                  "hover:border-primary/25 hover:bg-primary/5 hover:text-foreground",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-parsel-elevated px-3 py-2 transition-colors focus-within:border-primary/30 sm:px-4">
              <input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                disabled={isLoading || showOnboarding}
                placeholder={isLoading ? LOADING_PLACEHOLDER : PLACEHOLDER}
                className="w-full bg-transparent py-3 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="ParselAI mesajı"
                aria-busy={isLoading}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isLoading || showOnboarding || !input.trim()}
                className="shrink-0 rounded-lg bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-30"
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

export function ParselCopilotPanel({ onClose }: ParselCopilotPanelProps) {
  const { user, isLoaded } = useUser();
  const userId = user?.id ?? null;

  if (!isLoaded) return null;

  return (
    <ParselCopilotPanelContent
      key={userId ?? "anonymous"}
      userId={userId}
      onClose={onClose}
    />
  );
}
