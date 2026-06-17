"use client";

import { Cake, Gift, Mail, Mic, Pencil, Phone, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBirthdayInfo, getInitials } from "@/lib/client-birthday";
import type { Client } from "@/lib/types/client";
import type { VoiceCrmLog } from "@/lib/types/crm";
import { panelCardHover } from "@/lib/glass-panel";
import { cn } from "@/lib/utils";

type ClientProfileCardProps = {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
};

function mulkTipiBadgeClass(mulkTipi: string) {
  const key = mulkTipi.toLowerCase();
  if (key.includes("konut") || key.includes("daire") || key.includes("villa")) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }
  if (key.includes("arsa") || key.includes("tarla")) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-200";
  }
  if (key.includes("ticari") || key.includes("ofis") || key.includes("dükkan")) {
    return "border-sky-500/30 bg-sky-500/10 text-sky-200";
  }
  return "border-parsel-primary/30 bg-parsel-primary/10 text-parsel-primaryHover";
}

export function ClientProfileCard({
  client,
  onEdit,
  onDelete,
}: ClientProfileCardProps) {
  const birthday = client.birthDate ? getBirthdayInfo(client.birthDate) : null;
  const showBirthdayGlow = birthday?.isWithinWeek ?? false;
  const [voiceLogs, setVoiceLogs] = useState<VoiceCrmLog[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/clients/${client.id}/voice-logs`)
      .then((res) => res.json())
      .then((json: { data?: VoiceCrmLog[] }) => {
        if (!cancelled) setVoiceLogs(json.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setVoiceLogs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [client.id]);

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-card p-6",
        panelCardHover,
        showBirthdayGlow &&
          "ring-1 ring-[#B38C56]/60 shadow-[0_0_15px_rgba(179,140,86,0.15)] hover:border-[#B38C56]/40",
      )}
    >
      {birthday ? (
        <div
          className={cn(
            "absolute top-4 right-4 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide",
            birthday.isWithinWeek
              ? "border-[#B38C56]/50 bg-[#B38C56]/10 text-[#e8d4b8]"
              : "border-border/80 bg-border/60 text-muted-foreground",
          )}
          title={
            birthday.isToday
              ? "Bugün doğum günü!"
              : `${birthday.daysUntil} gün sonra — ${birthday.nextBirthdayLabel}`
          }
        >
          {birthday.isWithinWeek ? (
            <Gift className="size-3.5 shrink-0 text-[#C5A36E]" strokeWidth={2} />
          ) : (
            <Cake className="size-3.5 shrink-0" strokeWidth={2} />
          )}
          <span>
            {birthday.isToday
              ? `${birthday.age} yaş · Bugün`
              : `${birthday.age} yaş · ${birthday.nextBirthdayLabel}`}
          </span>
        </div>
      ) : null}

      <div className="flex items-start gap-4 pr-24">
        <div
          className={cn(
            "flex size-14 shrink-0 items-center justify-center rounded-2xl border text-lg font-semibold tracking-tight",
            "border-border/80 bg-gradient-to-br from-zinc-800 to-zinc-900 text-foreground",
            "ring-1 ring-white/5",
          )}
          aria-hidden
        >
          {getInitials(client.adSoyad)}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-outfit truncate text-lg font-semibold tracking-tight text-foreground">
              {client.adSoyad}
            </h2>
            {typeof client.aktifFirsatSayisi === "number" ? (
              <span className="inline-flex shrink-0 items-center rounded-full border border-[#b38c56]/35 bg-parsel-gold/10 px-2 py-0.5 text-[10px] font-semibold text-[#e8d4b8]">
                {client.aktifFirsatSayisi} aktif fırsat
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            {client.telefon ? (
              <span className="inline-flex items-center gap-1.5 truncate">
                <Phone className="size-3 shrink-0" strokeWidth={1.75} />
                {client.telefon}
              </span>
            ) : null}
            {client.email ? (
              <span className="inline-flex items-center gap-1.5 truncate">
                <Mail className="size-3 shrink-0" strokeWidth={1.75} />
                {client.email}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {(client.butce || client.mulkTipi) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {client.butce ? (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                "border-[#C5A36E]/35 bg-[#C5A36E]/10 text-[#e8d4b8]",
              )}
            >
              {client.butce}
            </span>
          ) : null}
          {client.mulkTipi ? (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                mulkTipiBadgeClass(client.mulkTipi),
              )}
            >
              {client.mulkTipi}
            </span>
          ) : null}
        </div>
      )}

      {client.notlar ? (
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {client.notlar}
        </p>
      ) : (
        <p className="mt-4 text-sm italic text-muted-foreground">Not eklenmemiş</p>
      )}

      {client.kaynak ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Kaynak: <span className="font-medium text-foreground">{client.kaynak}</span>
        </p>
      ) : null}

      {voiceLogs.length > 0 ? (
        <div className="mt-4 space-y-2 rounded-xl border border-border/60 bg-parsel-elevated/60 p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Mic className="size-3" />
            Sesli notlar ({voiceLogs.length})
          </p>
          <ul className="space-y-1.5">
            {voiceLogs.slice(0, 3).map((log) => (
              <li key={log.id}>
                <Link
                  href="/sesli-crm"
                  className="block truncate text-xs text-primary hover:underline"
                >
                  {log.parsed_json_data.notlar?.trim() ||
                    log.parsed_json_data.musteri_adi?.trim() ||
                    "Sesli kayıt"}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
        <Badge
          variant="outline"
          className="border-border/80 bg-transparent text-muted-foreground"
        >
          {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(
            new Date(client.olusturulmaTarihi),
          )}
        </Badge>

        <div className="flex gap-1 opacity-80 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(client)}
            aria-label={`${client.adSoyad} düzenle`}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(client)}
            aria-label={`${client.adSoyad} sil`}
            className="text-muted-foreground hover:text-red-400"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
