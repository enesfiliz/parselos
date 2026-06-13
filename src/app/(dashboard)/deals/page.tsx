"use client";

import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckSquare,
  ChevronDown,
  Download,
  History,
  Home,
  Kanban,
  Link2,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Radar,
  Search,
  Send,
  Sparkles,
  Square,
  StickyNote,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { toast } from "sonner";

import {
  addDealNote,
  attachFsboToDeal,
  createDealWithDefaults,
  deleteDeal,
  deleteDealNote,
  getDealNotes,
  getDeals,
  getFsboMatchesForDeal,
  saveDealCard,
  updateDealStage,
} from "@/app/actions/deals";
import { DealAppointmentTimeline } from "@/components/features/deals/DealAppointmentTimeline";
import { DealDocumentsPanel } from "@/components/features/deals/DealDocumentsPanel";
import { DealIntelligenceNote } from "@/components/features/deals/DealIntelligenceNote";
import { DealKanbanCard } from "@/components/features/deals/kanban/DealKanbanCard";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { resolvePropertyType } from "@/lib/deals/deal-display-helpers";
import { formatFsboMatchPercent } from "@/lib/deals/match-score";
import {
  resolveDealLocation,
  type FsboDealMatch,
  type FsboPriceInsightKind,
} from "@/lib/deals/match-fsbo";
import type { Client } from "@/lib/types/client";
import {
  DEAL_STAGES,
  DEFAULT_DEAL_TASKS,
  applyOptimisticDealMove,
  formatCompactTRY,
  formatFullTRY,
  resolveDealBudgetTL,
  taskProgress,
  type DealCardData,
  type DealNoteData,
  type DealStageId,
  type DealTask,
} from "@/lib/types/deal";
import { getInitials } from "@/lib/client-birthday";
import { cn } from "@/lib/utils";

const PANEL_CARD =
  "rounded-2xl border border-border/50 bg-parsel-panel p-4";

const PANEL_CARD_COMPACT =
  "rounded-2xl border border-border/50 bg-parsel-panel p-3";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Not listesini çökmeden güvenli şekilde normalize eder. */
function normalizeDealNotes(value: unknown): DealNoteData[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): DealNoteData | null => {
      if (!isRecord(item)) return null;

      const id = item.id;
      const content = item.content;
      if (typeof id !== "string" || typeof content !== "string") return null;

      const dealId = typeof item.dealId === "string" ? item.dealId : "";
      const rawDate = item.olusturulmaTarihi;
      const olusturulmaTarihi =
        typeof rawDate === "string" && !Number.isNaN(new Date(rawDate).getTime())
          ? rawDate
          : new Date().toISOString();

      return { id, dealId, content, olusturulmaTarihi };
    })
    .filter((note): note is DealNoteData => note !== null);
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

const FEMALE_NAMES = new Set([
  "elif", "ayşe", "selin", "zeynep", "fatma", "merve", "esra", "seda", "ceren",
]);

function salutation(name: string) {
  const first = name.trim().split(/\s+/)[0] ?? name;
  const honorific = FEMALE_NAMES.has(first.toLocaleLowerCase("tr-TR"))
    ? "Hanım"
    : "Bey";
  return `${first} ${honorific}`;
}

function waUrl(phone: string | null, message: string) {
  const digits = phone?.replace(/\D/g, "");
  if (!digits) return null;
  const n = digits.startsWith("90")
    ? digits
    : digits.startsWith("0")
      ? `9${digits}`
      : `90${digits}`;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

function parseBudgetTL(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isNaN(n) ? null : n;
}

function patchDeal(
  deal: DealCardData,
  patch: Partial<DealCardData>,
): DealCardData {
  return { ...deal, ...patch, guncellenmeTarihi: new Date().toISOString() };
}

function createOptimisticDeal(): DealCardData {
  const now = new Date().toISOString();
  const suffix = `${Date.now()}`;

  return {
    id: `optimistic-deal-${suffix}`,
    stage: "LEAD",
    notlar: "Sistem kaydi olusturuluyor...",
    olusturulmaTarihi: now,
    guncellenmeTarihi: now,
    etiket: "Yeni",
    sonIletisim: "Bugun",
    budgetTL: null,
    tasks: DEFAULT_DEAL_TASKS,
    listingUrl: null,
    fsboLeadId: null,
    listingIntel: null,
    buyerMatch: null,
    client: {
      id: `optimistic-client-${suffix}`,
      adSoyad: "Yeni Musteri",
      telefon: null,
      email: null,
      kaynak: "Pipeline",
      butce: null,
      mulkTipi: null,
    },
    property: {
      id: `optimistic-prop-${suffix}`,
      ilanBasligi: "Yeni Portfoy",
      fiyat: null,
      il: "-",
      ilce: "-",
      mahalle: null,
      ada: null,
      parsel: null,
      durum: "SATILIK",
      tur: "YETKILI",
      odaSayisi: null,
      metrekare: null,
    },
  };
}

function normalizeClient(value: unknown): Client | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.adSoyad !== "string" ||
    typeof record.olusturulmaTarihi !== "string" ||
    typeof record.guncellenmeTarihi !== "string"
  ) {
    return null;
  }
  return {
    id: record.id,
    adSoyad: record.adSoyad,
    telefon: typeof record.telefon === "string" ? record.telefon : null,
    email: typeof record.email === "string" ? record.email : null,
    notlar: typeof record.notlar === "string" ? record.notlar : null,
    kaynak: typeof record.kaynak === "string" ? record.kaynak : null,
    birthDate: typeof record.birthDate === "string" ? record.birthDate : null,
    butce: typeof record.butce === "string" ? record.butce : null,
    mulkTipi: typeof record.mulkTipi === "string" ? record.mulkTipi : null,
    olusturulmaTarihi: record.olusturulmaTarihi,
    guncellenmeTarihi: record.guncellenmeTarihi,
  };
}

function clientToDealClient(client: Client): DealCardData["client"] {
  return {
    id: client.id,
    adSoyad: client.adSoyad,
    telefon: client.telefon,
    email: client.email,
    kaynak: client.kaynak,
    butce: client.butce,
    mulkTipi: client.mulkTipi,
  };
}

function bindClientPatch(
  deal: DealCardData,
  client: Client,
): Partial<DealCardData> {
  const budgetTL = client.butce ? parseBudgetTL(client.butce) : null;
  return {
    client: clientToDealClient(client),
    budgetTL: budgetTL ?? deal.budgetTL,
  };
}

function resolveSonEtkilesim(deal: DealCardData) {
  if (deal.sonIletisim) return deal.sonIletisim;
  const days = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(deal.guncellenmeTarihi).getTime()) / 86_400_000,
    ),
  );
  if (days === 0) return "Bugün";
  if (days === 1) return "1 gün önce";
  return `${days} gün önce`;
}

void resolveSonEtkilesim;

function formatTimelineDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

type TimelineEvent = {
  date: string;
  label: string;
  dot: string;
  sortAt: number;
};

function buildTimeline(deal: DealCardData, notes: DealNoteData[] = []) {
  const events: TimelineEvent[] = [
    {
      date: formatTimelineDate(deal.olusturulmaTarihi),
      label: "Fırsat oluşturuldu",
      dot: "bg-parsel-gold",
      sortAt: new Date(deal.olusturulmaTarihi).getTime(),
    },
  ];
  if (deal.listingUrl || deal.listingIntel) {
    events.push({
      date: formatTimelineDate(deal.guncellenmeTarihi),
      label: "İlan incelendi",
      dot: "bg-sky-500",
      sortAt: new Date(deal.guncellenmeTarihi).getTime() + 1,
    });
  }
  if (["SHOWING", "OFFER", "WON"].includes(deal.stage)) {
    events.push({
      date: formatTimelineDate(deal.guncellenmeTarihi),
      label: "Yer gösterildi",
      dot: "bg-emerald-500",
      sortAt: new Date(deal.guncellenmeTarihi).getTime() + 2,
    });
  }
  if (deal.stage === "OFFER" || deal.stage === "WON") {
    events.push({
      date: formatTimelineDate(deal.guncellenmeTarihi),
      label: "Teklif sunuldu",
      dot: "bg-violet-500",
      sortAt: new Date(deal.guncellenmeTarihi).getTime() + 3,
    });
  }
  if (deal.stage === "WON") {
    events.push({
      date: formatTimelineDate(deal.guncellenmeTarihi),
      label: "Sözleşme imzalandı",
      dot: "bg-parsel-gold",
      sortAt: new Date(deal.guncellenmeTarihi).getTime() + 4,
    });
  }

  const safeNotes = normalizeDealNotes(notes);
  for (const note of safeNotes) {
    const sortAt = new Date(note.olusturulmaTarihi).getTime();
    if (Number.isNaN(sortAt) || !note.content.trim()) continue;
    events.push({
      date: formatTimelineDate(note.olusturulmaTarihi),
      label: note.content,
      dot: "bg-amber-500",
      sortAt,
    });
  }

  return events
    .sort((a, b) => a.sortAt - b.sortAt)
    .map(({ date, label, dot }) => ({ date, label, dot }));
}

function timelineEventIcon(label: string) {
  const key = label.toLocaleLowerCase("tr-TR");
  if (key.includes("oluşturuldu")) return Home;
  if (key.includes("incelendi") || key.includes("eşleş")) return Link2;
  if (key.includes("göster")) return MapPin;
  if (key.includes("teklif")) return TrendingUp;
  if (key.includes("sözleşme")) return CheckSquare;
  return StickyNote;
}

function platformBrand(source: string) {
  const s = source.toLocaleLowerCase("tr-TR");
  if (s.includes("emlakjet")) {
    return { letter: "E", name: "Emlakjet", box: "bg-red-600 text-foreground" };
  }
  return { letter: "S", name: "Sahibinden", box: "bg-yellow-400 text-black" };
}

function priceInsightBadgeClass(kind: FsboPriceInsightKind) {
  if (kind === "below") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-400/90";
  }
  if (kind === "above") {
    return "border-amber-500/25 bg-amber-500/10 text-amber-300/90";
  }
  return "border-border bg-white/[0.03] text-foreground/45";
}

function formatNoteDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function newTaskId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const STAGE_ID_SET = new Set<DealStageId>(DEAL_STAGES.map((stage) => stage.id));

const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) return pointerHits;
  return rectIntersection(args);
};

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/* ─── Inline Edit ───────────────────────────────────────────────────────── */

function InlineEdit({
  label,
  value,
  accent,
  multiline,
  onSave,
}: {
  label: string;
  value: string;
  accent?: boolean;
  multiline?: boolean;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) queueMicrotask(() => setDraft(value));
  }, [value, editing]);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  function commit() {
    const t = draft.trim();
    if (t !== value) onSave(t);
    setEditing(false);
  }

  if (editing) {
    const cls =
      "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[#b38c56]/40";
    return (
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        {multiline ? (
          <textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            className={cn(cls, "resize-none")}
          />
        ) : (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
            className={cls}
          />
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group w-full rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border/50 hover:bg-foreground/[0.02]"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            "text-sm text-foreground",
            accent && "font-semibold text-parsel-gold",
            !value && "text-muted-foreground",
          )}
        >
          {value || "—"}
        </p>
        <Pencil className="size-3 text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </button>
  );
}

/* ─── Client Picker ─────────────────────────────────────────────────────── */

function ClientPicker({
  selectedClient,
  onSelect,
}: {
  selectedClient: DealCardData["client"];
  onSelect: (client: Client) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((json: { data?: unknown[] }) => {
        const fetched = (json.data ?? [])
          .map(normalizeClient)
          .filter((c): c is Client => c !== null);
        setClients(fetched);
      })
      .catch(() => toast.error("Müşteriler yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.adSoyad.toLocaleLowerCase("tr-TR").includes(q) ||
        c.telefon?.includes(q) ||
        c.mulkTipi?.toLocaleLowerCase("tr-TR").includes(q) ||
        c.kaynak?.toLocaleLowerCase("tr-TR").includes(q),
    );
  }, [clients, query]);

  return (
    <div ref={containerRef} className="relative">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Müşteri Kartı
      </p>
      <div className="flex items-start gap-3">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-zinc-800 to-zinc-900 text-sm font-semibold text-foreground"
          aria-hidden
        >
          {getInitials(selectedClient.adSoyad)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-outfit text-base font-semibold text-foreground">
            {selectedClient.adSoyad}
          </p>
          <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 truncate">
              <Phone className="size-3 shrink-0" strokeWidth={1.75} />
              {selectedClient.telefon ?? "Telefon kayıtlı değil"}
            </span>
            {selectedClient.email ? (
              <span className="flex items-center gap-1.5 truncate">
                <Mail className="size-3 shrink-0" strokeWidth={1.75} />
                {selectedClient.email}
              </span>
            ) : null}
            {selectedClient.kaynak ? (
              <span className="text-[11px] text-muted-foreground">
                Kaynak: {selectedClient.kaynak}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-3 flex w-full items-center justify-between rounded-xl border border-border/50 bg-background px-3 py-2.5 text-left transition-colors hover:border-parsel-gold/30"
      >
        <div className="flex items-center gap-2">
          <Search className="size-3.5 text-parsel-gold" />
          <span className="text-xs font-medium text-foreground/90">
            Müşteri değiştir veya ara
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-20 mt-2 rounded-xl border border-border/50 bg-parsel-panel p-2 shadow-lg">
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Müşteri ara (ad, telefon, lokasyon)..."
              className="w-full rounded-lg border border-border/50 bg-background py-2 pl-8 pr-3 text-sm text-foreground outline-none focus:border-[#b38c56]/40"
            />
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ul className="max-h-48 overflow-y-auto">
              {filtered.length > 0 ? (
                filtered.map((client) => (
                  <li key={client.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(client);
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-foreground/5"
                    >
                      <Phone className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm text-foreground">{client.adSoyad}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {client.telefon ?? "—"}
                          {client.mulkTipi ? ` · ${client.mulkTipi}` : ""}
                        </p>
                        {client.butce ? (
                          <p className="text-[11px] text-parsel-gold">
                            {client.butce}
                          </p>
                        ) : null}
                      </div>
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-2 py-4 text-center text-xs text-muted-foreground">
                  Kayıtlı müşteri bulunamadı.
                </li>
              )}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* ─── Notes Panel ───────────────────────────────────────────────────────── */

function DealNotesPanel({
  notes,
  loading,
  onAdd,
  onDelete,
}: {
  notes: DealNoteData[] | null | undefined;
  loading: boolean;
  onAdd: (content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const safeNotes = useMemo(() => normalizeDealNotes(notes), [notes]);

  async function handleAdd() {
    const content = draft.trim();
    if (!content || saving) return;
    setSaving(true);
    try {
      await onAdd(content);
      setDraft("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={PANEL_CARD_COMPACT}>
      <div className="mb-2 flex items-center gap-2">
        <StickyNote className="size-3.5 text-parsel-gold" strokeWidth={1.5} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Danışman Notları
        </p>
        {safeNotes.length > 0 ? (
          <span className="ml-auto text-[10px] text-muted-foreground">
            {safeNotes.length} kayıt
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      ) : safeNotes.length > 0 ? (
        <ul className="relative max-h-44 space-y-0 overflow-y-auto pl-3 pr-1">
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-1 left-[5px] top-1 w-px bg-foreground/10"
          />
          {safeNotes.map((note) => (
            <li key={note.id} className="group relative flex gap-2.5 pb-2.5 last:pb-0">
              <span
                aria-hidden
                className="relative z-10 mt-2 size-1.5 shrink-0 rounded-full bg-parsel-gold/60"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] text-muted-foreground">
                    {formatNoteDate(note.olusturulmaTarihi)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onDelete(note.id)}
                    className="text-red-400/0 transition-colors group-hover:text-red-400/60"
                    title="Notu sil"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
                <p className="mt-0.5 rounded-xl rounded-tl-sm border border-border/50 bg-background px-2.5 py-1.5 text-xs leading-relaxed text-foreground/80">
                  {note.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-4 text-center text-[11px] text-foreground/25">
          Bu fırsat hakkında henüz not girilmedi.
        </p>
      )}

      <form
        className="mt-2 flex items-center gap-1.5 border-t border-border/50 pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          void handleAdd();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Kısa not yazın..."
          className="h-8 min-w-0 flex-1 rounded-xl border border-border/50 bg-background px-3 text-xs text-foreground/80 outline-none placeholder:text-white/25 focus:border-[#b38c56]/35"
        />
        <button
          type="submit"
          disabled={saving || !draft.trim()}
          aria-label="Not gönder"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-parsel-gold transition-colors hover:border-parsel-gold/30 hover:bg-parsel-gold/10 disabled:opacity-35"
        >
          {saving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Send className="size-3.5" strokeWidth={2} />
          )}
        </button>
      </form>
    </section>
  );
}

/* ─── Tasks Panel ───────────────────────────────────────────────────────── */

function DealTasksPanel({
  tasks,
  onChange,
}: {
  tasks: DealTask[];
  onChange: (tasks: DealTask[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function toggle(id: string) {
    onChange(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      ),
    );
  }

  function remove(id: string) {
    onChange(tasks.filter((t) => t.id !== id));
  }

  function add() {
    const label = draft.trim();
    if (!label) return;
    onChange([...tasks, { id: newTaskId(), label, completed: false }]);
    setDraft("");
  }

  const done = tasks.filter((t) => t.completed).length;

  return (
    <section className={PANEL_CARD}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckSquare className="size-4 text-parsel-gold" strokeWidth={1.5} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Dinamik Görev Checklist
          </p>
        </div>
        {tasks.length > 0 ? (
          <span className="rounded-full border border-border/50 bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            📝 {done}/{tasks.length}
          </span>
        ) : null}
      </div>
      <ul className="space-y-1.5">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-2 rounded-lg border border-border/50 bg-background px-2 py-2"
          >
            <button
              type="button"
              onClick={() => toggle(task.id)}
              className="shrink-0 text-muted-foreground hover:text-parsel-gold"
            >
              {task.completed ? (
                <CheckSquare className="size-4 text-emerald-500" />
              ) : (
                <Square className="size-4" />
              )}
            </button>
            <span
              className={cn(
                "flex-1 text-sm",
                task.completed
                  ? "text-muted-foreground line-through"
                  : "text-foreground",
              )}
            >
              {task.label}
            </span>
            <button
              type="button"
              onClick={() => remove(task.id)}
              className="text-muted-foreground hover:text-red-400"
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          placeholder="Yeni görev..."
          className="flex-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[#b38c56]/40"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg border border-border/50 px-3 py-2 text-xs font-medium text-foreground/90 hover:border-border"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </section>
  );
}

function DraggableKanbanCard({
  deal,
  onOpen,
  onDelete,
  onStageChange,
  enableDrag,
}: {
  deal: DealCardData;
  onOpen: () => void;
  onDelete: () => void;
  onStageChange?: (stage: DealStageId) => void;
  enableDrag: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: deal.id,
      data: { stage: deal.stage },
      disabled: !enableDrag,
    });

  const style: CSSProperties = enableDrag
    ? {
        opacity: isDragging ? 0.12 : 1,
        transform: isDragging ? undefined : CSS.Translate.toString(transform),
        pointerEvents: isDragging ? "none" : undefined,
      }
    : {};

  if (!enableDrag) {
    return (
      <DealKanbanCard
        deal={deal}
        onOpen={onOpen}
        onDelete={onDelete}
        onStageChange={onStageChange}
        showStageSelect
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <DealKanbanCard
        deal={deal}
        onOpen={onOpen}
        onDelete={onDelete}
        isDragging={isDragging}
      />
    </div>
  );
}

function KanbanColumn({
  stageId,
  label,
  deals,
  onOpenDeal,
  onDeleteDeal,
  onStageChange,
  enableDrag,
}: {
  stageId: DealStageId;
  label: string;
  deals: DealCardData[];
  onOpenDeal: (deal: DealCardData) => void;
  onDeleteDeal: (dealId: string) => void;
  onStageChange: (dealId: string, stage: DealStageId) => void;
  enableDrag: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stageId,
    disabled: !enableDrag,
  });
  const vol = deals.reduce((s, d) => s + resolveDealBudgetTL(d), 0);

  return (
    <div className="flex w-[min(82vw,280px)] shrink-0 snap-start flex-col md:w-[min(100%,292px)]">
      <div className="mb-3 px-1">
        <h2 className="text-sm font-semibold text-foreground">{label}</h2>
        <p className="mt-0.5 text-[11px] font-medium text-muted-foreground md:text-[10px]">
          {deals.length} Aktif · {formatCompactTRY(vol)}
        </p>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[120px] flex-1 rounded-2xl border border-border/50 bg-parsel-sunken p-2.5 transition-colors md:min-h-[520px]",
          isOver && "border-border bg-parsel-sunken",
        )}
      >
        <div className="flex flex-col gap-3">
          {deals.length === 0 ? (
            <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">
              Bu aşamada fırsat yok
            </p>
          ) : (
            deals.map((deal) => (
              <DraggableKanbanCard
                key={deal.id}
                deal={deal}
                enableDrag={enableDrag}
                onOpen={() => onOpenDeal(deal)}
                onDelete={() => onDeleteDeal(deal.id)}
                onStageChange={(stage) => onStageChange(deal.id, stage)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */

export default function DealsPage() {
  const [deals, setDeals] = useState<DealCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [isDraggingBoard, setIsDraggingBoard] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [fsboMatches, setFsboMatches] = useState<FsboDealMatch[]>([]);
  const [fsboLoading, setFsboLoading] = useState(false);
  const [notes, setNotes] = useState<DealNoteData[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [creatingDeal, setCreatingDeal] = useState(false);
  const [, setPromotingId] = useState<string | null>(null);
  const dealsRef = useRef(deals);
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    dealsRef.current = deals;
  }, [deals]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    }),
  );

  const commit = useCallback((next: DealCardData[]) => {
    dealsRef.current = next;
    setDeals(next);
  }, []);

  const reloadDeals = useCallback(async () => {
    const result = await getDeals();
    if (result.success) {
      commit(result.data);
      return result.data;
    }
    toast.error(result.error);
    return null;
  }, [commit]);

  useEffect(() => {
    queueMicrotask(() => {
      reloadDeals().finally(() => setLoading(false));
    });
  }, [reloadDeals]);

  const selected = deals.find((d) => d.id === selectedId) ?? null;
  const selectedDealId = selected?.id ?? null;

  const dealsByStage = useMemo(() => {
    const map = Object.fromEntries(
      DEAL_STAGES.map((s) => [s.id, [] as DealCardData[]]),
    ) as Record<DealStageId, DealCardData[]>;
    for (const d of deals) map[d.stage].push(d);
    return map;
  }, [deals]);

  const totalVolume = useMemo(
    () => deals.reduce((s, d) => s + resolveDealBudgetTL(d), 0),
    [deals],
  );

  const activeDeal = activeDealId
    ? (deals.find((d) => d.id === activeDealId) ?? null)
    : null;

  useEffect(() => {
    if (!selectedDealId || !sheetOpen) {
      queueMicrotask(() => {
        setNotes([]);
        setFsboMatches([]);
      });
      return;
    }

    queueMicrotask(() => setFsboLoading(true));
    getFsboMatchesForDeal(selectedDealId)
      .then((res) => {
        if (res.success) {
          setFsboMatches(Array.isArray(res.data) ? res.data : []);
        } else {
          setFsboMatches([]);
          toast.error(res.error);
        }
      })
      .catch(() => {
        setFsboMatches([]);
        toast.error("FSBO eşleşmeleri yüklenemedi.");
      })
      .finally(() => setFsboLoading(false));

    queueMicrotask(() => setNotesLoading(true));
    getDealNotes(selectedDealId)
      .then((res) => {
        if (res.success) {
          setNotes(normalizeDealNotes(res.data));
        } else {
          setNotes([]);
          toast.error(res.error);
        }
      })
      .catch(() => {
        setNotes([]);
        toast.error("Notlar yüklenemedi.");
      })
      .finally(() => setNotesLoading(false));
  }, [selectedDealId, sheetOpen]);

  async function persistDeal(nextDeal: DealCardData) {
    const optimistic = dealsRef.current.map((d) =>
      d.id === nextDeal.id ? nextDeal : d,
    );
    commit(optimistic);

    const result = await saveDealCard(nextDeal);
    if (result.success) {
      commit(
        dealsRef.current.map((d) =>
          d.id === result.data.id ? result.data : d,
        ),
      );
      if (selectedId === result.data.id) {
        setSelectedId(result.data.id);
      }
      return result.data;
    }
    toast.error(result.error);
    await reloadDeals();
    return null;
  }

  function updateDealLocal(id: string, patch: Partial<DealCardData>) {
    const current = dealsRef.current.find((d) => d.id === id);
    if (!current) return;
    void persistDeal(patchDeal(current, patch));
  }

  function openDeal(deal: DealCardData) {
    setSelectedId(deal.id);
    setScrapeUrl(deal.listingUrl ?? "");
    setSheetOpen(true);
  }

  async function handleAddDeal() {
    if (creatingDeal) return;

    const optimisticDeal = createOptimisticDeal();
    setCreatingDeal(true);
    commit([optimisticDeal, ...dealsRef.current]);

    const result = await createDealWithDefaults();
    setCreatingDeal(false);

    if (!result.success) {
      commit(dealsRef.current.filter((deal) => deal.id !== optimisticDeal.id));
      toast.error(result.error);
      return;
    }
    commit(
      dealsRef.current.map((deal) =>
        deal.id === optimisticDeal.id ? result.data : deal,
      ),
    );
    openDeal(result.data);
    toast.success("Yeni fırsat oluşturuldu.");
  }

  async function handleDeleteDeal(dealId: string) {
    const result = await deleteDeal(dealId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    commit(dealsRef.current.filter((d) => d.id !== dealId));
    if (selectedId === dealId) {
      setSheetOpen(false);
      setSelectedId(null);
    }
    toast.success("Fırsat kaldırıldı.");
  }

  function handleDragStart(event: DragStartEvent) {
    setIsDraggingBoard(true);
    setActiveDealId(String(event.active.id));
  }

  function clearDragState() {
    setIsDraggingBoard(false);
    setActiveDealId(null);
  }

  function moveDealToStage(dealId: string, nextStage: DealStageId) {
    const currentDeal = dealsRef.current.find((d) => d.id === dealId);
    if (!currentDeal || currentDeal.stage === nextStage) return;

    const previousStage = currentDeal.stage;
    const nextDeals = applyOptimisticDealMove(dealsRef.current, {
      dealId,
      stage: nextStage,
    });
    commit(nextDeals);

    void (async () => {
      const result = await updateDealStage(dealId, nextStage);
      if (!result.success) {
        toast.error(result.error);
        commit(
          applyOptimisticDealMove(dealsRef.current, {
            dealId,
            stage: previousStage,
          }),
        );
        return;
      }

      commit(
        dealsRef.current.map((d) =>
          d.id === result.data.id ? result.data : d,
        ),
      );
    })();
  }

  function handleDragEnd(event: DragEndEvent) {
    clearDragState();

    const dealId = String(event.active.id);
    const overId = event.over?.id;
    if (!overId) return;

    const nextStage = String(overId) as DealStageId;
    if (!STAGE_ID_SET.has(nextStage)) return;

    moveDealToStage(dealId, nextStage);
  }

  function handleDragCancel() {
    clearDragState();
  }

  function handleMobileStageChange(dealId: string, stage: DealStageId) {
    void moveDealToStage(dealId, stage);
  }

  function handleScrape() {
    if (!selected || !scrapeUrl.trim()) return;
    setScraping(true);
    setTimeout(() => {
      updateDealLocal(selected.id, {
        listingUrl: scrapeUrl.trim(),
        listingIntel: {
          fiyat: formatFullTRY(resolveDealBudgetTL(selected)),
          ilanTarihi: new Intl.DateTimeFormat("tr-TR", {
            dateStyle: "medium",
          }).format(new Date()),
          metrekare: selected.property.metrekare
            ? `${selected.property.metrekare} m²`
            : "—",
          source: scrapeUrl.includes("emlakjet") ? "Emlakjet" : "Sahibinden",
          title: selected.property.ilanBasligi,
          location: resolveDealLocation(selected),
        },
      });
      setScraping(false);
      toast.success("İlan verileri çekildi.");
    }, 1200);
  }

  async function handlePromoteFsbo(leadId: string) {
    setPromotingId(leadId);
    try {
      const res = await fetch(`/api/fsbo-leads/${leadId}/promote`, {
        method: "POST",
      });
      const json = (await res.json()) as {
        error?: string;
        data?: { deal: DealCardData };
      };
      if (!res.ok) {
        toast.error(json.error ?? "Pipeline'a eklenemedi.");
        return;
      }
      await reloadDeals();
      toast.success("FSBO ilanı Potansiyel aşamasına eklendi.");
    } catch {
      toast.error("Pipeline'a eklenirken hata oluştu.");
    } finally {
      setPromotingId(null);
    }
  }

  void handlePromoteFsbo;

  async function handleAttachFsbo(leadId: string) {
    if (!selected) return;
    const result = await attachFsboToDeal(selected.id, leadId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    commit(
      dealsRef.current.map((d) =>
        d.id === result.data.id ? result.data : d,
      ),
    );
    setScrapeUrl(result.data.listingUrl ?? "");
    toast.success("İlan eşleştirildi ve notlara işlendi.");

    const [fsboRes, notesRes] = await Promise.all([
      getFsboMatchesForDeal(selected.id),
      getDealNotes(selected.id),
    ]);
    if (fsboRes.success) setFsboMatches(fsboRes.data);
    if (notesRes.success) setNotes(normalizeDealNotes(notesRes.data));
  }

  async function handleAddNote(content: string) {
    if (!selected) return;
    const result = await addDealNote(selected.id, content);
    if (!result.success || !result.data) {
      toast.error(result.success ? "Not kaydedilemedi." : result.error);
      return;
    }
    const [created] = normalizeDealNotes([result.data]);
    if (!created) {
      toast.error("Not formatı geçersiz.");
      return;
    }
    setNotes((prev) => [created, ...normalizeDealNotes(prev)]);
    toast.success("Not eklendi.");
  }

  async function handleDeleteNote(noteId: string) {
    if (!noteId) return;
    const result = await deleteDealNote(noteId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setNotes((prev) =>
      normalizeDealNotes(prev).filter((n) => n.id !== noteId),
    );
  }

  function handleTasksChange(tasks: DealTask[]) {
    if (!selected) return;
    updateDealLocal(selected.id, { tasks });
  }

  const listingTitle =
    selected?.listingIntel?.title ??
    selected?.property.ilanBasligi ??
    "portföyümüzdeki ilan";
  const portfolioLabel =
    selected?.client.mulkTipi?.trim() || listingTitle;
  const budgetMsg = selected
    ? new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(
        resolveDealBudgetTL(selected),
      )
    : "—";
  const budgetShort = selected
    ? new Intl.NumberFormat("tr-TR", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
      }).format(resolveDealBudgetTL(selected))
    : "—";

  const waTemplates = selected
    ? [
        {
          label: "Sunum Takibi",
          subtitle: `${salutation(selected.client.adSoyad)} merhaba, ilgilendiğiniz ${budgetShort} bütçeli portföy için düşünceleriniz netleşti mi?`,
          msg: `${salutation(selected.client.adSoyad)} merhaba, ilgilendiğiniz ${budgetShort} bütçeli ${portfolioLabel} portföyü için düşünceleriniz netleşti mi?`,
        },
        {
          label: "Fiyat Revizyonu",
          subtitle: `${portfolioLabel} portföyünde fiyat ${budgetMsg} TL seviyesine güncellendi.`,
          msg: `${salutation(selected.client.adSoyad)}, ilgilendiğiniz ${portfolioLabel} portföyünde fiyat ${budgetMsg} TL seviyesine güncellendi. Kaçırmamanızı öneririm.`,
        },
        {
          label: "Evrak İstemi",
          subtitle: "Tapu işlemleri için kimlik fotoğrafı talebi.",
          msg: `${salutation(selected.client.adSoyad)}, tapu işlemleri için kimlik fotoğrafınızı WhatsApp'tan iletebilir misiniz?`,
        },
      ]
    : [];

  const safeNotes = useMemo(() => normalizeDealNotes(notes), [notes]);
  const timeline = selected ? buildTimeline(selected, safeNotes) : [];
  const sheetTasks = selected?.tasks?.length
    ? selected.tasks
    : DEFAULT_DEAL_TASKS;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-parsel-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-4 bg-background md:space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-parsel-gold">
            <Kanban className="size-4" strokeWidth={1.5} />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">
              Fırsat Yönetimi
            </span>
          </div>
          <h1 className="font-outfit text-xl font-semibold tracking-tight text-foreground md:text-2xl lg:text-3xl">
            Fırsat Pipeline
          </h1>
          <p className="mt-1 max-w-xl text-sm font-normal text-muted-foreground">
            Canlı müşteri ve FSBO Radarı entegrasyonu — veritabanından gerçek
            zamanlı pipeline.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={handleAddDeal}
            disabled={creatingDeal}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-parsel-gold px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:brightness-110 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
          >
            {creatingDeal ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2} />
            ) : (
              <Plus className="size-4" strokeWidth={2} />
            )}
            Fırsat Ekle
          </button>

          <div className="inline-flex w-full items-center gap-2 rounded-xl border border-border/50 bg-parsel-panel px-4 py-2.5 sm:w-auto">
            <TrendingUp className="size-4 text-parsel-gold" strokeWidth={1.5} />
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground md:text-[10px]">
                Toplam Hacim
              </p>
              <p className="text-lg font-bold text-parsel-gold md:text-xl">
                {formatFullTRY(totalVolume)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {deals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/50 bg-parsel-panel px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Henüz fırsat yok.{" "}
            <button
              type="button"
              onClick={handleAddDeal}
              className="font-semibold text-parsel-gold hover:underline"
            >
              İlk fırsatı ekleyin
            </button>{" "}
            veya FSBO Radarından pipeline&apos;a gönderin.
          </p>
        </div>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={kanbanCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          className={cn(
            "-mx-3 flex gap-4 overflow-x-auto overscroll-x-contain px-3 pb-3 touch-pan-x md:mx-0 md:px-0 md:pb-2",
            !isDraggingBoard && "snap-x snap-mandatory",
          )}
        >
          {DEAL_STAGES.map((col) => (
            <KanbanColumn
              key={col.id}
              stageId={col.id}
              label={col.label}
              deals={dealsByStage[col.id]}
              enableDrag={!isMobile}
              onOpenDeal={openDeal}
              onDeleteDeal={handleDeleteDeal}
              onStageChange={handleMobileStageChange}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 140, easing: "cubic-bezier(0.18, 0.67, 0.6, 1)" }}>
          {activeDeal ? (
            <div className="w-[280px] cursor-grabbing">
              <DealKanbanCard
                deal={activeDeal}
                onOpen={() => {}}
                onDelete={() => {}}
                isDragging
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          showCloseButton
          className="!left-auto !right-0 h-full w-full overflow-y-auto border-l border-border bg-background p-6 data-open:slide-in-from-right data-closed:slide-out-to-right sm:max-w-[900px]"
        >
          {selected ? (
            <>
              <div className="border-b border-border/50 pb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Fırsat Kontrol Kokpiti
                </p>
                <h2 className="mt-2 font-outfit text-xl font-semibold text-foreground">
                  {selected.client.adSoyad}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {resolveDealLocation(selected)} ·{" "}
                  {formatFullTRY(resolveDealBudgetTL(selected))}
                  {taskProgress(selected)
                    ? ` · 📝 ${taskProgress(selected)!.done}/${taskProgress(selected)!.total} görev`
                    : ""}
                </p>
                <DealIntelligenceNote deal={selected} className="mt-3" />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* ── SOL SÜTUN: Müşteri & İletişim ── */}
                <div className="flex flex-col gap-4 lg:col-span-5">
                  <section className={PANEL_CARD}>
                    <ClientPicker
                      selectedClient={selected.client}
                      onSelect={(client) =>
                        updateDealLocal(
                          selected.id,
                          bindClientPatch(selected, client),
                        )
                      }
                    />
                  </section>

                  <section className={PANEL_CARD}>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      WhatsApp Hızlı Şablonları
                    </p>
                    <div className="flex flex-col gap-2">
                      {waTemplates.map((t) => {
                        const href = waUrl(selected.client.telefon, t.msg);
                        return (
                          <a
                            key={t.label}
                            href={href ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => {
                              if (!href) {
                                e.preventDefault();
                                toast.error("Müşteri telefonu kayıtlı değil.");
                              }
                            }}
                            className={cn(
                              "flex w-full flex-col rounded-xl border border-border/50 bg-background px-4 py-3 transition-colors",
                              href
                                ? "hover:border-[#25D366]/40 hover:bg-[#25D366]/5"
                                : "cursor-not-allowed opacity-50",
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <MessageCircle
                                className="size-4 shrink-0 text-[#25D366]"
                                strokeWidth={2}
                              />
                              <p className="text-sm font-semibold text-foreground">
                                {t.label}
                              </p>
                            </div>
                            <p className="mt-1.5 line-clamp-2 pl-6 text-[11px] leading-relaxed text-muted-foreground">
                              {t.subtitle}
                            </p>
                          </a>
                        );
                      })}
                    </div>
                  </section>

                  <DealTasksPanel
                    tasks={sheetTasks}
                    onChange={handleTasksChange}
                  />

                  <DealAppointmentTimeline dealId={selected.id} />
                </div>

                {/* ── SAĞ SÜTUN: Mülk, İstihbarat & Finans ── */}
                <div className="flex flex-col gap-3 lg:col-span-7">
                  <section className={PANEL_CARD_COMPACT}>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Fırsat / Mülk Künyesi
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <InlineEdit
                        label="Lokasyon"
                        value={resolveDealLocation(selected)}
                        onSave={(v) =>
                          updateDealLocal(selected.id, {
                            client: { ...selected.client, mulkTipi: v },
                            listingIntel: selected.listingIntel
                              ? { ...selected.listingIntel, location: v }
                              : undefined,
                          })
                        }
                      />
                      <InlineEdit
                        label="Aranan Mülk Tipi"
                        value={
                          selected.client.mulkTipi?.trim() ||
                          resolvePropertyType(selected)
                        }
                        onSave={(v) =>
                          updateDealLocal(selected.id, {
                            client: { ...selected.client, mulkTipi: v },
                          })
                        }
                      />
                      <InlineEdit
                        label="Bütçe"
                        accent
                        value={formatFullTRY(resolveDealBudgetTL(selected))}
                        onSave={(v) => {
                          const tl = parseBudgetTL(v);
                          updateDealLocal(selected.id, {
                            budgetTL: tl,
                            client: { ...selected.client, butce: v },
                          });
                        }}
                      />
                      <InlineEdit
                        label="İlan Başlığı"
                        value={selected.property.ilanBasligi}
                        onSave={(v) =>
                          updateDealLocal(selected.id, {
                            property: {
                              ...selected.property,
                              ilanBasligi: v,
                            },
                          })
                        }
                      />
                      <div>
                        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Pipeline Aşaması
                        </p>
                        <select
                          value={selected.stage}
                          onChange={(e) =>
                            updateDealLocal(selected.id, {
                              stage: e.target.value as DealStageId,
                            })
                          }
                          className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[#b38c56]/40"
                        >
                          {DEAL_STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <InlineEdit
                        label="Son Görüşme"
                        value={selected.sonIletisim ?? ""}
                        onSave={(v) =>
                          updateDealLocal(selected.id, {
                            sonIletisim: v || null,
                          })
                        }
                      />
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-border/50 pt-3">
                      <input
                        value={scrapeUrl}
                        onChange={(e) => setScrapeUrl(e.target.value)}
                        placeholder="Sahibinden / Emlakjet ilan linki..."
                        className="h-9 min-w-0 flex-1 rounded-lg border border-border/50 bg-background px-3 text-sm text-foreground outline-none focus:border-[#b38c56]/40"
                      />
                      <button
                        type="button"
                        disabled={scraping || !scrapeUrl.trim()}
                        onClick={handleScrape}
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#b38c56]/30 bg-parsel-gold/10 px-3 text-sm font-medium text-[#d4b07a] transition-colors hover:bg-parsel-gold/15 disabled:opacity-40"
                      >
                        {scraping ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Download className="size-4" />
                        )}
                        {scraping ? "Çekiliyor" : "Çek"}
                      </button>
                    </div>
                  </section>

                  <section className={PANEL_CARD_COMPACT}>
                    <div className="mb-2 flex items-center gap-2">
                      <Radar className="size-3.5 text-parsel-gold" strokeWidth={1.5} />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Yapay Zeka Eşleşmeleri
                      </p>
                      {!fsboLoading && fsboMatches.length > 0 ? (
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          {fsboMatches.length} ilan
                        </span>
                      ) : null}
                    </div>
                    {fsboLoading ? (
                      <div className="flex justify-center py-5">
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : fsboMatches.length > 0 ? (
                      <div className="space-y-1.5">
                        {fsboMatches.map((match) => {
                          const {
                            lead,
                            score,
                            priceInsight,
                            locationLabel,
                            propertyTypeLabel,
                          } = match;
                          const brand = platformBrand(lead.source);
                          const isOpportunity = priceInsight.kind === "below";
                          const matchPercent = formatFsboMatchPercent(score);
                          return (
                            <div
                              key={lead.id}
                              className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-background p-2 transition-all duration-300 hover:border-emerald-500/15"
                            >
                              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border/50">
                                <Image
                                  src={lead.coverImage}
                                  alt={lead.title}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <div className="min-w-0 flex-1 px-1">
                                <p className="truncate text-xs font-medium text-foreground">
                                  {lead.title}
                                </p>
                                <p className="text-[11px] font-semibold text-parsel-gold">
                                  {lead.priceFormatted}
                                </p>
                                <p className="truncate text-[10px] text-muted-foreground">
                                  {locationLabel} · {propertyTypeLabel}
                                </p>
                                <span
                                  className={cn(
                                    "mt-0.5 inline-flex max-w-full truncate rounded-full border px-1.5 py-0.5 text-[9px] font-medium",
                                    priceInsightBadgeClass(priceInsight.kind),
                                  )}
                                >
                                  {priceInsight.label}
                                </span>
                              </div>
                              <div className="flex shrink-0 flex-col items-end gap-1">
                                <p className="flex items-center gap-1 text-[10px] italic tracking-wide text-emerald-400/80">
                                  <Sparkles
                                    className="size-2.5 shrink-0 text-emerald-400/70"
                                    strokeWidth={1.75}
                                  />
                                  %{matchPercent} eşleşme
                                </p>
                                <div className="flex items-center gap-1">
                                  <div
                                    className={cn(
                                      "flex size-6 items-center justify-center rounded-md text-[10px] font-black",
                                      brand.box,
                                    )}
                                    title={brand.name}
                                  >
                                    {brand.letter}
                                  </div>
                                  {isOpportunity ? (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-400">
                                      <span className="relative flex size-1">
                                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                                        <span className="relative inline-flex size-1 rounded-full bg-emerald-500" />
                                      </span>
                                      Kupon
                                    </span>
                                  ) : null}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleAttachFsbo(lead.id)}
                                  className="rounded-lg bg-parsel-gold px-2 py-0.5 text-[10px] font-semibold text-black transition-colors hover:brightness-110"
                                >
                                  Eşleştir
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="rounded-xl border border-dashed border-border/50 px-3 py-4 text-center text-[11px] text-foreground/25">
                        Bütçe ve lokasyon kriterlerine uyan aktif FSBO ilanı
                        bulunamadı.
                      </p>
                    )}
                  </section>

                  <section className={PANEL_CARD_COMPACT}>
                    <div className="mb-2 flex items-center gap-2">
                      <History
                        className="size-4 text-parsel-gold"
                        strokeWidth={1.5}
                      />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Tarih Damgalı Zaman Tüneli
                      </p>
                    </div>
                    {timeline.length > 0 ? (
                      <ol className="relative max-h-36 space-y-0 overflow-y-auto pl-1">
                        {timeline.map((event, i) => {
                          const Icon = timelineEventIcon(event.label);
                          return (
                            <li
                              key={`${event.label}-${i}`}
                              className="relative flex gap-2.5 pb-3 last:pb-0"
                            >
                              {i < timeline.length - 1 ? (
                                <span className="absolute left-[11px] top-6 h-[calc(100%-8px)] w-px bg-foreground/10" />
                              ) : null}
                              <span
                                className={cn(
                                  "relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-background",
                                )}
                              >
                                <Icon
                                  className={cn(
                                    "size-3",
                                    event.dot.includes("amber")
                                      ? "text-amber-400"
                                      : event.dot.includes("emerald")
                                        ? "text-emerald-400"
                                        : event.dot.includes("sky")
                                          ? "text-sky-400"
                                          : event.dot.includes("violet")
                                            ? "text-violet-400"
                                            : "text-parsel-gold",
                                  )}
                                  strokeWidth={1.75}
                                />
                              </span>
                              <div className="min-w-0 pt-0.5">
                                <p className="font-mono text-[10px] text-muted-foreground">
                                  {event.date}
                                </p>
                                <p className="mt-0.5 text-xs leading-relaxed text-foreground/75">
                                  {event.label}
                                </p>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    ) : (
                      <p className="py-3 text-center text-[11px] text-foreground/25">
                        Henüz aktivite kaydı yok.
                      </p>
                    )}
                  </section>

                  <DealNotesPanel
                    notes={safeNotes}
                    loading={notesLoading}
                    onAdd={handleAddNote}
                    onDelete={handleDeleteNote}
                  />

                  <DealDocumentsPanel dealId={selected.id} />
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
