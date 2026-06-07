"use client";

import { ChevronDown, Phone, Plus, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_CLIENTS } from "@/lib/data/mock-clients";
import type { Client } from "@/lib/types/client";
import type { DealCardData } from "@/lib/types/deal";
import { cn } from "@/lib/utils";

type ClientComboboxProps = {
  client: DealCardData["client"];
  useMock?: boolean;
  onSelect: (client: DealCardData["client"]) => void;
};

function toDealClient(client: Client): DealCardData["client"] {
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

export function ClientCombobox({
  client,
  useMock = false,
  onSelect,
}: ClientComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (useMock) return;

    fetch("/api/clients")
      .then((res) => res.json())
      .then((json: { data?: unknown[] }) => {
        const fetched = (json.data ?? [])
          .map(normalizeClient)
          .filter((c): c is Client => c !== null);
        if (fetched.length > 0) setClients(fetched);
      })
      .catch(() => setClients(MOCK_CLIENTS));
  }, [useMock]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setCreating(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.adSoyad.toLowerCase().includes(q) ||
        c.telefon?.includes(q) ||
        c.mulkTipi?.toLowerCase().includes(q),
    );
  }, [clients, query]);

  async function handleCreateClient() {
    const adSoyad = newName.trim();
    const telefon = newPhone.trim() || null;
    if (!adSoyad) {
      toast.error("Müşteri adı zorunludur.");
      return;
    }

    if (useMock) {
      const created: Client = {
        id: `mock-client-${Date.now()}`,
        adSoyad,
        telefon,
        email: null,
        notlar: null,
        kaynak: "Manuel",
        birthDate: null,
        butce: null,
        mulkTipi: null,
        olusturulmaTarihi: new Date().toISOString(),
        guncellenmeTarihi: new Date().toISOString(),
      };
      setClients((prev) => [created, ...prev]);
      onSelect(toDealClient(created));
      setCreating(false);
      setOpen(false);
      setNewName("");
      setNewPhone("");
      toast.success("Müşteri oluşturuldu.");
      return;
    }

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adSoyad, telefon, kaynak: "Manuel" }),
      });
      const json = (await res.json()) as { data?: unknown; error?: string };
      if (!res.ok) {
        toast.error(json.error ?? "Müşteri oluşturulamadı.");
        return;
      }
      const created = normalizeClient(json.data);
      if (!created) return;
      setClients((prev) => [created, ...prev]);
      onSelect(toDealClient(created));
      setCreating(false);
      setOpen(false);
      setNewName("");
      setNewPhone("");
      toast.success("Müşteri oluşturuldu.");
    } catch {
      toast.error("Müşteri oluşturulamadı.");
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-parsel-panel p-3.5 text-left transition-colors hover:border-parsel-gold/25"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#b38c56]/20 bg-parsel-gold/10">
          <UserRound className="size-5 text-parsel-gold" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Müşteri
          </p>
          <p className="truncate font-medium text-foreground">{client.adSoyad}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            {client.telefon ? (
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3" />
                {client.telefon}
              </span>
            ) : null}
            {client.kaynak ? (
              <span className="text-muted-foreground">· {client.kaynak}</span>
            ) : null}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="absolute top-[calc(100%+6px)] z-50 w-full overflow-hidden rounded-xl border border-border bg-parsel-sunken shadow-2xl shadow-black/60">
          <div className="border-b border-border/60 p-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Müşteri ara..."
                className="h-8 border-border bg-background pl-8 text-sm"
              />
            </div>
          </div>

          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(toDealClient(c));
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-foreground/[0.04]",
                    c.id === client.id && "bg-parsel-gold/10 text-parsel-gold",
                  )}
                >
                  <UserRound className="size-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.adSoyad}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.telefon ?? "Telefon yok"}
                      {c.mulkTipi ? ` · ${c.mulkTipi}` : ""}
                    </p>
                  </div>
                </button>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                Sonuç bulunamadı
              </li>
            ) : null}
          </ul>

          <div className="border-t border-border/60 p-2">
            {creating ? (
              <div className="space-y-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="h-8 border-border bg-background text-sm"
                />
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Telefon"
                  className="h-8 border-border bg-background text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateClient}
                    className="flex-1 bg-parsel-gold text-[#09090b] hover:bg-[#c9a06a]"
                  >
                    Kaydet
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setCreating(false)}
                  >
                    İptal
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-parsel-gold transition-colors hover:bg-parsel-gold/10"
              >
                <Plus className="size-4" />
                Yeni Müşteri Yarat
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
